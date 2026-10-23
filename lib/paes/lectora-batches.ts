import type { LectoraGenre, LectoraSkill } from "./lectora";
import type { ReviewedLectoraMatrix } from "./lectora-review";

export type LectoraBatch = {
  index: number;
  questionCount: number;
  bySkill: Record<LectoraSkill, number>;
  byGenre: Record<LectoraGenre, number>;
};

/**
 * Distribuye exactamente los cupos revisados en lotes pequeños.
 * No inventa proporciones ni cambia el total aprobado.
 * El cruce habilidad × género no viene definido por los marginales:
 * se utiliza únicamente para organizar la generación, no como
 * supuesta distribución oficial DEMRE.
 */
export function planLectoraBatches(
  matrix: ReviewedLectoraMatrix,
  maxBatchSize = 5,
): LectoraBatch[] {
  if (!Number.isInteger(maxBatchSize) || maxBatchSize < 1 || maxBatchSize > 10)
    throw new Error("El tamaño de lote debe estar entre 1 y 10.");
  const skills: LectoraSkill[] = ["Localizar", "Interpretar", "Evaluar"];
  const genres: LectoraGenre[] = ["Literario", "No literario"];
  const valid = (n: unknown): n is number =>
    typeof n === "number" && Number.isInteger(n) && n >= 0;
  if (!valid(matrix.questionCount) || matrix.questionCount < 1 || matrix.questionCount > 65 ||
      skills.some(k => !valid(matrix.bySkill?.[k])) ||
      genres.some(k => !valid(matrix.byGenre?.[k])) ||
      skills.reduce((s,k) => s + matrix.bySkill[k],0) !== matrix.questionCount ||
      genres.reduce((s,k) => s + matrix.byGenre[k],0) !== matrix.questionCount)
    throw new Error("La matriz tiene distribuciones inválidas.");
  const skillRemaining = { ...matrix.bySkill };
  const genreRemaining = { ...matrix.byGenre };
  const batches: LectoraBatch[] = [];
  let remaining = matrix.questionCount;
  while (remaining > 0) {
    const size = Math.min(remaining, maxBatchSize);
    const bySkill: Record<LectoraSkill,number> = { Localizar:0, Interpretar:0, Evaluar:0 };
    const byGenre: Record<LectoraGenre,number> = { Literario:0, "No literario":0 };
    for (let i=0; i<size; i++) {
      const skill = skills.reduce((a,b) => skillRemaining[b] > skillRemaining[a] ? b : a);
      const genre = genres.reduce((a,b) => genreRemaining[b] > genreRemaining[a] ? b : a);
      if (skillRemaining[skill] <= 0 || genreRemaining[genre] <= 0)
        throw new Error("No fue posible distribuir la matriz.");
      bySkill[skill]++; byGenre[genre]++;
      skillRemaining[skill]--; genreRemaining[genre]--;
    }
    batches.push({index:batches.length+1,questionCount:size,bySkill,byGenre});
    remaining -= size;
  }
  return batches;
}
