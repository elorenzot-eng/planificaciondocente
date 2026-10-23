import type { LectoraExam, LectoraGenre, LectoraSkill } from "./lectora";
import type { ReviewedLectoraMatrix } from "./lectora-review";
import { reviewLectoraExam } from "./lectora-review";
import { generateReviewedLectoraDraft } from "./lectora-openai.server";
import type { LectoraGenerationRequest } from "./lectora-generator";

/** Matriz experimental, no oficial DEMRE. */
export const INTERNAL_65_MATRIX: ReviewedLectoraMatrix = {
  version: "educantay-paes-lectora-65-interno-v1",
  reviewedBy: "Configuración técnica preliminar EducAntay",
  reviewedAt: "2026-10-23",
  sourceReference: "Distribución experimental para integración; pendiente revisión pedagógica",
  questionCount: 65,
  bySkill: { Localizar: 10, Interpretar: 40, Evaluar: 15 },
  byGenre: { Literario: 35, "No literario": 30 },
};

/** Cada bloque de 13 se compone de seis grupos de habilidad y género fijos. */
export const PARTS: ReadonlyArray<{ skill: LectoraSkill; genre: LectoraGenre; count: number }> = [
  { skill: "Localizar", genre: "Literario", count: 1 },
  { skill: "Interpretar", genre: "Literario", count: 4 },
  { skill: "Evaluar", genre: "Literario", count: 2 },
  { skill: "Localizar", genre: "No literario", count: 1 },
  { skill: "Interpretar", genre: "No literario", count: 4 },
  { skill: "Evaluar", genre: "No literario", count: 1 },
];

export async function generateInternal65Draft(
  difficulty: LectoraGenerationRequest["difficulty"],
  onProgress?: (finishedBatches: number) => void,
): Promise<{ exam: LectoraExam; warnings: string[] }> {
  const texts: LectoraExam["texts"] = [];
  const items: LectoraExam["items"] = [];
  const warnings: string[] = [];
  for (let batch = 0; batch < 5; batch++) {
    for (let part = 0; part < PARTS.length; part++) {
      const { skill, genre, count } = PARTS[part];
      const matrix: ReviewedLectoraMatrix = {
        ...INTERNAL_65_MATRIX,
        version: `${INTERNAL_65_MATRIX.version}-lote-${batch + 1}-grupo-${part + 1}`,
        questionCount: count,
        bySkill: {
          Localizar: skill === "Localizar" ? count : 0,
          Interpretar: skill === "Interpretar" ? count : 0,
          Evaluar: skill === "Evaluar" ? count : 0,
        },
        byGenre: {
          Literario: genre === "Literario" ? count : 0,
          "No literario": genre === "No literario" ? count : 0,
        },
      };
      let result: Awaited<ReturnType<typeof generateReviewedLectoraDraft>> | undefined;
      let lastError: unknown;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          result = await generateReviewedLectoraDraft({ matrix, difficulty });
          break;
        } catch (error) {
          lastError = error;
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`[PAES65] Lote ${batch + 1}, grupo ${part + 1}, intento ${attempt}: ${message.slice(0, 500)}`);
          if (!message.startsWith("Ensayo rechazado:")) break;
        }
      }
      if (!result) throw lastError instanceof Error ? lastError : new Error("Grupo no generado.");
      const prefix = `L${batch + 1}G${part + 1}-`;
      const ids = new Map(result.exam.texts.map((t, index) => [t.id, `${prefix}T${index + 1}`]));
      texts.push(...result.exam.texts.map(t => ({ ...t, id: ids.get(t.id)! })));
      items.push(...result.exam.items.map((item, index) => ({
        ...item, id: `${prefix}P${index + 1}`, textId: ids.get(item.textId)!,
      })));
      warnings.push(...result.warnings.map(w => `Lote ${batch + 1}, grupo ${part + 1}: ${w}`));
    }
    onProgress?.(batch + 1);
    console.info(`[PAES65] Bloque ${batch + 1}/5 completado`);
  }
  const exam: LectoraExam = { specificationVersion: INTERNAL_65_MATRIX.version, texts, items };
  const review = reviewLectoraExam(exam, INTERNAL_65_MATRIX);
  if (!review.valid) throw new Error(`Ensayo completo rechazado: ${review.errors.join(" | ")}`);
  return { exam, warnings: [...warnings, ...review.warnings] };
}

/** Genera solo un grupo por solicitud; el controlador persiste el resultado. */
export async function generateInternal65Part(
  partIndex: number,
  difficulty: LectoraGenerationRequest["difficulty"],
): Promise<{ texts: LectoraExam["texts"]; items: LectoraExam["items"] }> {
  if (!Number.isInteger(partIndex) || partIndex < 0 || partIndex >= 30)
    throw new Error("Índice de grupo inválido.");
  const batch = Math.floor(partIndex / PARTS.length);
  const part = partIndex % PARTS.length;
  const { skill, genre, count } = PARTS[part];
  const matrix: ReviewedLectoraMatrix = {
    ...INTERNAL_65_MATRIX,
    version: `${INTERNAL_65_MATRIX.version}-lote-${batch + 1}-grupo-${part + 1}`,
    questionCount: count,
    bySkill: {
      Localizar: skill === "Localizar" ? count : 0,
      Interpretar: skill === "Interpretar" ? count : 0,
      Evaluar: skill === "Evaluar" ? count : 0,
    },
    byGenre: {
      Literario: genre === "Literario" ? count : 0,
      "No literario": genre === "No literario" ? count : 0,
    },
  };
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { exam } = await generateReviewedLectoraDraft({ matrix, difficulty });
      const prefix = `L${batch + 1}G${part + 1}-`;
      const ids = new Map(exam.texts.map((t, i) => [t.id, `${prefix}T${i + 1}`]));
      return {
        texts: exam.texts.map(t => ({ ...t, id: ids.get(t.id)! })),
        items: exam.items.map((item, i) => ({
          ...item, id: `${prefix}P${i + 1}`, textId: ids.get(item.textId)!,
        })),
      };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[PAES65] Grupo ${partIndex + 1}, intento ${attempt}: ${message.slice(0, 400)}`);
      if (!message.startsWith("Ensayo rechazado:")) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Grupo no generado.");
}
