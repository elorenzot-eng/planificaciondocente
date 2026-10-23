import type { LectoraExam } from "./lectora";
import type { ReviewedLectoraMatrix } from "./lectora-review";
import { reviewLectoraExam } from "./lectora-review";
import { generateReviewedLectoraDraft } from "./lectora-openai.server";
import type { LectoraGenerationRequest } from "./lectora-generator";

/**
 * Borrador interno de 65 preguntas, en cinco lotes de 13.
 * La distribución es EXPERIMENTAL y NO representa la tabla oficial DEMRE.
 * No conectar a un botón público sin autenticación, cuota distribuida y
 * aprobación pedagógica de la matriz completa.
 */
export const INTERNAL_65_MATRIX: ReviewedLectoraMatrix = {
  version: "educantay-paes-lectora-65-interno-v1",
  reviewedBy: "Configuración técnica preliminar EducAntay",
  reviewedAt: "2026-10-23",
  sourceReference: "Distribución experimental para integración; pendiente revisión pedagógica",
  questionCount: 65,
  bySkill: { Localizar: 10, Interpretar: 40, Evaluar: 15 },
  byGenre: { Literario: 35, "No literario": 30 },
};

const BATCHES = 5;
const PER_BATCH = 13;

/**
 * Cada lote se valida por separado. Solo se entrega un ensayo cuando los
 * cinco lotes y la composición final pasan todas las validaciones.
 * No persiste respuestas parciales ni genera PDF si falla algún lote.
 */
export async function generateInternal65Draft(
  difficulty: LectoraGenerationRequest["difficulty"],
  onProgress?: (finishedBatches: number) => void,
): Promise<{ exam: LectoraExam; warnings: string[] }> {
  const texts: LectoraExam["texts"] = [];
  const items: LectoraExam["items"] = [];
  const warnings: string[] = [];
  for (let batch = 0; batch < BATCHES; batch++) {
    const batchMatrix: ReviewedLectoraMatrix = {
      ...INTERNAL_65_MATRIX,
      version: `${INTERNAL_65_MATRIX.version}-lote-${batch + 1}`,
      questionCount: PER_BATCH,
      bySkill: { Localizar: 2, Interpretar: 8, Evaluar: 3 },
      byGenre: { Literario: 7, "No literario": 6 },
    };
    // Un error aislado de distribución no debe invalidar todo el ensayo.
    // Cada intento se vuelve a validar íntegramente; nunca se alteran las
    // etiquetas de habilidades ni las claves para forzar el conteo.
    let result: Awaited<ReturnType<typeof generateReviewedLectoraDraft>> | undefined;
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await generateReviewedLectoraDraft({ matrix: batchMatrix, difficulty });
        break;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[PAES65] Lote ${batch + 1}, intento ${attempt}: ${message.slice(0, 500)}`);
        if (!message.startsWith("Ensayo rechazado:") || attempt === 3) break;
      }
    }
    if (!result) throw lastError instanceof Error ? lastError : new Error("No se completó el lote.");
    const prefix = `L${batch + 1}-`;
    const textIds = new Map(result.exam.texts.map((t, index) => [t.id, `${prefix}T${index + 1}`]));
    texts.push(...result.exam.texts.map(t => ({ ...t, id: textIds.get(t.id)! })));
    items.push(...result.exam.items.map((item, index) => ({
      ...item,
      id: `${prefix}P${index + 1}`,
      textId: textIds.get(item.textId)!,
    })));
    warnings.push(...result.warnings.map(w => `Lote ${batch + 1}: ${w}`));
    onProgress?.(batch + 1);
  }
  const exam: LectoraExam = {
    specificationVersion: INTERNAL_65_MATRIX.version,
    texts,
    items,
  };
  const review = reviewLectoraExam(exam, INTERNAL_65_MATRIX);
  if (!review.valid) throw new Error(`Ensayo completo rechazado: ${review.errors.join(" | ")}`);
  return { exam, warnings: [...warnings, ...review.warnings] };
}
