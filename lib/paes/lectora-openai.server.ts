import { buildLectoraPrompt, parseAndReviewLectoraResponse, planLectoraBatches, assembleLectoraBatches, type LectoraGenerationRequest } from "./lectora-generator";
import type { LectoraExam } from "./lectora";
import type { ReviewedLectoraMatrix } from "./lectora-review";

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
    if (!parts[i] || parts[i].items.length !== batches[i].questionCount ||
        parts[i].specificationVersion !== batches[i].version)
      throw new Error("Bloque persistido incompatible con la matriz.");
  }
  for (let i = initial.nextPart; i < batches.length; i++) {
    const result = await generate({ matrix: batches[i], difficulty: request.difficulty });
    if (result.exam.items.length !== batches[i].questionCount)
      throw new Error("Bloque generado incompleto.");
    const next = { nextPart: i + 1, parts: [...parts, result.exam] };
    if (!await store.commit(i, next))
      throw new Error("Conflicto de actualización del trabajo PAES.");
    parts.push(result.exam);
  }
  return assembleLectoraBatches(parts, request.matrix);
}
