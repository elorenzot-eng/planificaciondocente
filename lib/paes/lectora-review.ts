import {
  LECTORA_CONFIG,
  validateLectoraExam,
  type LectoraExam,
  type LectoraGenre,
  type LectoraSkill,
} from "./lectora";

/**
 * Matriz de trabajo versionada. Los conteos deben ser cargados desde una
 * especificación revisada; no se generan ni se infieren por el modelo.
 * La matriz no representa por sí sola una distribución oficial DEMRE.
 */
export type ReviewedLectoraMatrix = {
  version: string;
  reviewedBy: string;
  reviewedAt: string; // YYYY-MM-DD
  sourceReference: string; // documento, año y sección revisados
  questionCount: number;
  bySkill: Record<LectoraSkill, number>;
  byGenre: Record<LectoraGenre, number>;
};

export type ExamReview = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    questions: number;
    texts: number;
    bySkill: Record<LectoraSkill, number>;
    byGenre: Record<LectoraGenre, number>;
  };
};

const skillNames = LECTORA_CONFIG.skills;
const genreNames = LECTORA_CONFIG.genres;

function counts<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map(k => [k, 0])) as Record<T, number>;
}
function isNonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
function sum<T extends string>(record: Record<T, number>, keys: readonly T[]) {
  return keys.reduce((acc, key) => acc + record[key], 0);
}

export function reviewLectoraExam(
  exam: LectoraExam,
  matrix: ReviewedLectoraMatrix,
): ExamReview {
  const errors = validateLectoraExam(exam, matrix?.questionCount === LECTORA_CONFIG.totalQuestions);
  const safeItems = Array.isArray(exam?.items) ? exam.items : [];
  const safeTexts = Array.isArray(exam?.texts) ? exam.texts : [];
  if (!matrix || typeof matrix !== "object")
    throw new Error("Se requiere una matriz de revisión válida.");
  const warnings: string[] = [];
  const bySkill = counts(skillNames);
  const byGenre = counts(genreNames);

  if (!matrix.version?.trim() || !matrix.reviewedBy?.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(matrix.reviewedAt ?? "") ||
      !matrix.sourceReference?.trim()) {
    errors.push("Matriz sin versión, revisión responsable, fecha o referencia documental.");
  }
  if (exam?.specificationVersion !== matrix.version)
    errors.push("La versión del ensayo no coincide con la matriz revisada.");
  if (!isNonnegativeInteger(matrix.questionCount) ||
      matrix.questionCount < 1 ||
      matrix.questionCount > LECTORA_CONFIG.totalQuestions)
    errors.push("La matriz indica una cantidad de preguntas inválida.");
  if (safeItems.length !== matrix.questionCount)
    errors.push("La cantidad de ítems no coincide con la matriz.");

  for (const item of safeItems) {
    if (!item || typeof item !== "object") continue;
    if (skillNames.includes(item.skill)) bySkill[item.skill]++;
    if (genreNames.includes(item.genre)) byGenre[item.genre]++;
  }
  for (const key of skillNames) {
    const expected = matrix.bySkill?.[key];
    if (!isNonnegativeInteger(expected)) errors.push(`Matriz: cantidad inválida para ${key}.`);
    else if (bySkill[key] !== expected)
      errors.push(`Habilidad ${key}: se esperaban ${expected} ítems y hay ${bySkill[key]}.`);
  }
  for (const key of genreNames) {
    const expected = matrix.byGenre?.[key];
    if (!isNonnegativeInteger(expected)) errors.push(`Matriz: cantidad inválida para ${key}.`);
    else if (byGenre[key] !== expected)
      errors.push(`Género ${key}: se esperaban ${expected} ítems y hay ${byGenre[key]}.`);
  }
  if (matrix.bySkill && skillNames.every(k => isNonnegativeInteger(matrix.bySkill[k])) &&
      sum(matrix.bySkill, skillNames) !== matrix.questionCount)
    errors.push("La distribución de habilidades no suma el total de preguntas.");
  if (matrix.byGenre && genreNames.every(k => isNonnegativeInteger(matrix.byGenre[k])) &&
      sum(matrix.byGenre, genreNames) !== matrix.questionCount)
    errors.push("La distribución de géneros no suma el total de preguntas.");

  if (!errors.length) warnings.push(
    "Validación estructural aprobada. Pendiente revisión humana de fidelidad textual, pertinencia, " +
    "distractores, derechos de uso de textos y correspondencia con el temario oficial."
  );
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: { questions: safeItems.length, texts: safeTexts.length, bySkill, byGenre },
  };
}
