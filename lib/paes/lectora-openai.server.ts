import "server-only";
import { buildLectoraPrompt, parseAndReviewLectoraResponse, type LectoraGenerationRequest } from "./lectora-generator";
import type { LectoraExam } from "./lectora";

/**
 * Servicio de generación para ser llamado EXCLUSIVAMENTE desde un endpoint
 * autenticado con control de cuota. No exponer como ruta pública directa.
 * OPENAI_API_KEY se consulta sólo en servidor.
 */
export async function generateReviewedLectoraDraft(
  request: LectoraGenerationRequest,
): Promise<{ exam: LectoraExam; warnings: string[] }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Falta configurar OPENAI_API_KEY en el servidor.");
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
      throw new Error(`No fue posible generar el ensayo (servicio IA: ${response.status}).`);
    }
    const payload: unknown = await response.json();
    const raw = (payload as {
      choices?: Array<{ message?: { content?: string | null } }>
    }).choices?.[0]?.message?.content;
    if (!raw) throw new Error("El proveedor IA no devolvió contenido.");
    return parseAndReviewLectoraResponse(raw, request.matrix);
  } finally {
    clearTimeout(timeout);
  }
}
