import { buildLectoraPrompt, parseAndReviewLectoraResponse, planLectoraBatches, assembleLectoraBatches, type LectoraGenerationRequest } from "./lectora-generator";
import type { LectoraExam } from "./lectora";
import { reviewLectoraExam, type ReviewedLectoraMatrix } from "./lectora-review";
import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";

/**
 * Servicio de generación para ser llamado EXCLUSIVAMENTE desde un endpoint
 * autenticado con control de cuota. No exponer como ruta pública directa.
 * OPENAI_API_KEY se consulta sólo en servidor.
 */
export class LectoraGenerationError extends Error {
  constructor(public readonly code: "MISSING_KEY" | "PROVIDER_HTTP" | "EMPTY_RESPONSE" | "REVIEW_REJECTED" | "NETWORK_OR_TIMEOUT", public readonly providerStatus?: number) {
    super("La generación PAES IA no se completó.");
    this.name = "LectoraGenerationError";
  }
}

export async function generateReviewedLectoraDraft(
  request: LectoraGenerationRequest,
): Promise<{ exam: LectoraExam; warnings: string[] }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new LectoraGenerationError("MISSING_KEY");
  const prompt = buildLectoraPrompt(request);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.PAES_OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Generas material de práctica original, riguroso y estructurado en JSON. Nunca afirmes aprobación oficial DEMRE." },
          { role: "user", content: prompt },
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      // No incluir claves, cuerpo del proveedor ni información sensible.
      throw new LectoraGenerationError("PROVIDER_HTTP", response.status);
    }
    const payload: unknown = await response.json();
    const raw = (payload as {
      choices?: Array<{ message?: { content?: string | null } }>
    }).choices?.[0]?.message?.content;
    if (!raw) throw new LectoraGenerationError("EMPTY_RESPONSE");
    try { return parseAndReviewLectoraResponse(raw, request.matrix); }
    catch { throw new LectoraGenerationError("REVIEW_REJECTED"); }
  } catch (error) {
    if (error instanceof LectoraGenerationError) throw error;
    throw new LectoraGenerationError("NETWORK_OR_TIMEOUT");
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Orquestador de servidor: genera siete bloques y valida el examen final.
 * No es un endpoint público. El llamador debe gestionar sesión, cuota,
 * persistencia, cancelación y límites de tiempo de la infraestructura.
 */
export async function generateCompleteLectoraDraft(
  request: { matrix: ReviewedLectoraMatrix; difficulty: LectoraGenerationRequest["difficulty"] },
  generate: (batch: LectoraGenerationRequest) => Promise<{ exam: LectoraExam; warnings: string[] }> =
    generateReviewedLectoraDraft,
): Promise<{ exam: LectoraExam; warnings: string[] }> {
  const batches = planLectoraBatches(request.matrix);
  const parts: LectoraExam[] = [];
  const warnings: string[] = [];
  for (const matrix of batches) {
    const result = await generate({ matrix, difficulty: request.difficulty });
    parts.push(result.exam);
    warnings.push(...result.warnings);
  }
  const assembled = assembleLectoraBatches(parts, request.matrix);
  return { exam: assembled.exam, warnings: [...warnings, ...assembled.warnings] };
}

/** Punto de control persistible: el adaptador DB debe implementar CAS y propiedad del trabajo. */
export type LectoraCheckpoint = {
  nextPart: number;
  parts: LectoraExam[];
};
export type LectoraCheckpointStore = {
  load: () => Promise<LectoraCheckpoint>;
  /** Debe persistir atómicamente solo si nextPart sigue siendo expectedPart. */
  commit: (expectedPart: number, next: LectoraCheckpoint) => Promise<boolean>;
};

/**
 * Reanuda a partir del último bloque confirmado.
 * Requiere bloqueo distribuido / compare-and-swap en el almacén suministrado.
 * No hace cargos de cuota ni escribe SavedPaesExam: responsabilidad del llamador.
 */
export async function resumeCompleteLectoraDraft(
  request: { matrix: ReviewedLectoraMatrix; difficulty: LectoraGenerationRequest["difficulty"] },
  store: LectoraCheckpointStore,
  generate: (batch: LectoraGenerationRequest) => Promise<{ exam: LectoraExam; warnings: string[] }> =
    generateReviewedLectoraDraft,
): Promise<{ exam: LectoraExam; warnings: string[] }> {
  const batches = planLectoraBatches(request.matrix);
  const initial = await store.load();
  if (!Number.isInteger(initial.nextPart) || initial.nextPart < 0 ||
      initial.nextPart > batches.length || initial.parts.length !== initial.nextPart)
    throw new Error("Punto de control PAES inconsistente.");
  const parts = [...initial.parts];
  for (let i = 0; i < parts.length; i++) {
    // El ensamblador final volverá a verificar todos los bloques.
    if (!parts[i] || !reviewLectoraExam(parts[i], batches[i]).valid)
      throw new Error("Bloque persistido incompatible con la matriz.");
  }
  for (let i = initial.nextPart; i < batches.length; i++) {
    const result = await generate({ matrix: batches[i], difficulty: request.difficulty });
    if (!reviewLectoraExam(result.exam, batches[i]).valid)
      throw new Error("Bloque generado inválido.");
    const next = { nextPart: i + 1, parts: [...parts, result.exam] };
    if (!await store.commit(i, next))
      throw new Error("Conflicto de actualización del trabajo PAES.");
    parts.push(result.exam);
  }
  return assembleLectoraBatches(parts, request.matrix);
}

/**
 * Adaptador Prisma para PaesInternalJob. El usuario autenticado debe coincidir
 * con userId; no expone acceso a trabajos ajenos.
 * El CAS se basa en nextPart y evita duplicar commits de un mismo bloque.
 */
export function createPrismaLectoraCheckpointStore(jobId: string, userId: string, leaseToken: string): LectoraCheckpointStore {
  if (!jobId || !userId || !leaseToken) throw new Error("Trabajo, usuario y lease requeridos.");
  return {
    async load() {
      const job = await prisma.paesInternalJob.findFirst({
        where: { id: jobId, userId, leaseToken, leaseExpiresAt: { gt: new Date() } },
        select: { nextPart: true, texts: true, items: true, status: true },
      });
      if (!job || !["PENDING", "RUNNING", "RETRY"].includes(job.status))
        throw new Error("Trabajo PAES no disponible para reanudación.");
      // En trabajos Lectora65, texts almacena el arreglo de bloques completos.
      const parts = job.texts;
      if (!Array.isArray(parts)) throw new Error("Bloques persistidos inválidos.");
      return { nextPart: job.nextPart, parts: parts as unknown as LectoraExam[] };
    },
    async commit(expectedPart, next) {
      if (next.nextPart !== expectedPart + 1 || next.parts.length !== next.nextPart)
        throw new Error("Transición de progreso PAES inválida.");
      const updated = await prisma.paesInternalJob.updateMany({
        where: { id: jobId, userId, leaseToken, leaseExpiresAt: { gt: new Date() }, nextPart: expectedPart, status: "RUNNING" },
        data: {
          nextPart: next.nextPart,
          texts: next.parts as unknown as Prisma.InputJsonValue,
          status: "RUNNING",
          error: null,
        },
      });
      return updated.count === 1;
    },
  };
}

/**
 * Lease distribuido de un trabajo PAES: una sola ejecución propietaria
 * durante TTL; las ejecuciones largas deben renovar el lease antes de vencer.
 */
export async function acquireLectoraJobLease(jobId: string, userId: string, ttlSeconds = 180):
  Promise<string | null> {
  if (!jobId || !userId || !Number.isInteger(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > 600)
    throw new Error("Parámetros de lease inválidos.");
  const token = randomUUID();
  const now = new Date();
  const updated = await prisma.paesInternalJob.updateMany({
    where: {
      id: jobId, userId, status: { in: ["PENDING", "RUNNING", "RETRY"] },
      OR: [{ leaseToken: null }, { leaseExpiresAt: { lt: now } }],
    },
    data: {
      leaseToken: token, leaseExpiresAt: new Date(now.getTime() + ttlSeconds * 1000),
      status: "RUNNING",
    },
  });
  return updated.count === 1 ? token : null;
}

export async function renewLectoraJobLease(jobId: string, userId: string, token: string,
  ttlSeconds = 180): Promise<boolean> {
  if (!token || !Number.isInteger(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > 600)
    throw new Error("Parámetros de renovación inválidos.");
  const now = new Date();
  const updated = await prisma.paesInternalJob.updateMany({
    where: { id: jobId, userId, leaseToken: token, leaseExpiresAt: { gt: now }, status: "RUNNING" },
    data: { leaseExpiresAt: new Date(now.getTime() + ttlSeconds * 1000) },
  });
  return updated.count === 1;
}

export async function releaseLectoraJobLease(jobId: string, userId: string, token: string):
  Promise<boolean> {
  if (!token) return false;
  const updated = await prisma.paesInternalJob.updateMany({
    where: { id: jobId, userId, leaseToken: token },
    data: { leaseToken: null, leaseExpiresAt: null },
  });
  return updated.count === 1;
}
