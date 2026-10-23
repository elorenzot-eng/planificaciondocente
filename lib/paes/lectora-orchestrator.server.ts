import type { LectoraExam } from "./lectora";
import { reviewLectoraExam, type ReviewedLectoraMatrix } from "./lectora-review";
import { planLectoraBatches } from "./lectora-batches";
import { generateReviewedLectoraDraft } from "./lectora-openai.server";
import type { LectoraGenerationRequest } from "./lectora-generator";

export type LectoraProgress = { completed: number; total: number };

/**
 * Generación secuencial con validación de cada lote y del examen final.
 * Invocar sólo desde un proceso de trabajo autenticado y sujeto a cuota.
 * Para 65 preguntas se recomienda una cola persistente, NO un request HTTP.
 */
export async function generateCompleteLectoraExam(
  request: LectoraGenerationRequest,
  onProgress?: (progress: LectoraProgress) => Promise<void> | void,
): Promise<{ exam: LectoraExam; warnings: string[] }> {
  const batches = planLectoraBatches(request.matrix);
  const exam: LectoraExam = {
    specificationVersion: request.matrix.version, texts: [], items: [],
  };
  const seenTexts = new Set<string>();
  const seenItems = new Set<string>();
  const seenTextBodies = new Set<string>();
  const seenStems = new Set<string>();
  for (const [index, batch] of batches.entries()) {
    const matrix: ReviewedLectoraMatrix = {
      ...request.matrix,
      questionCount: batch.questionCount,
      bySkill: batch.bySkill,
      byGenre: batch.byGenre,
    };
    const result = await generateReviewedLectoraDraft({ ...request, matrix });
    const prefix = `B${index + 1}-`;
    const idMap = new Map<string,string>();
    for (const text of result.exam.texts) {
      if (idMap.has(text.id)) throw new Error("ID de texto duplicado dentro del lote.");
      const newId = prefix + text.id;
      if (seenTexts.has(newId)) throw new Error("ID de texto duplicado entre lotes.");
      const normalizedBody = text.body.trim().replace(/\\s+/g, " ").toLowerCase();
      if (seenTextBodies.has(normalizedBody))
        throw new Error("Texto duplicado entre lotes.");
      seenTextBodies.add(normalizedBody);
      seenTexts.add(newId);
      idMap.set(text.id,newId);
      exam.texts.push({ ...text, id: newId });
    }
    for (const item of result.exam.items) {
      const newId = prefix + item.id;
      if (seenItems.has(newId)) throw new Error("ID de pregunta duplicado entre lotes.");
      const normalizedStem = item.stem.trim().replace(/\\s+/g, " ").toLowerCase();
      if (seenStems.has(normalizedStem))
        throw new Error("Enunciado duplicado entre lotes.");
      seenStems.add(normalizedStem);
      seenItems.add(newId);
      exam.items.push({ ...item, id: newId, textId: idMap.get(item.textId) ?? "" });
    }
    await onProgress?.({ completed: index + 1, total: batches.length });
  }
  const review = reviewLectoraExam(exam, request.matrix);
  if (!review.valid) throw new Error("Ensayo final rechazado: " + review.errors.join(" | "));
  return { exam, warnings: review.warnings };
}
