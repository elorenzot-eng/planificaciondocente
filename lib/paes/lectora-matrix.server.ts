import type { ReviewedLectoraMatrix } from "./lectora-review";
import { LECTORA_CONFIG } from "./lectora";

/**
 * La matriz se instala únicamente mediante una variable del servidor.
 * Nunca se acepta una matriz enviada por el navegador o generada por IA.
 */
export function loadApprovedLectoraMatrix(): ReviewedLectoraMatrix {
  const raw = process.env.PAES_LECTORA_APPROVED_MATRIX_JSON;
  if (!raw) throw new Error("Matriz PAES Lectora pendiente de aprobación y configuración.");
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { throw new Error("La matriz PAES configurada no es JSON válido."); }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Formato inválido de matriz PAES.");
  const matrix = value as ReviewedLectoraMatrix;
  const keys = ["Localizar", "Interpretar", "Evaluar"] as const;
  const genres = ["Literario", "No literario"] as const;
  const valid = (n: unknown): n is number =>
    typeof n === "number" && Number.isInteger(n) && n >= 0;
  if (!matrix.version?.trim() || !matrix.reviewedBy?.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(matrix.reviewedAt ?? "") ||
      !matrix.sourceReference?.trim() ||
      !valid(matrix.questionCount) ||
      matrix.questionCount !== LECTORA_CONFIG.totalQuestions ||
      keys.some(k => !valid(matrix.bySkill?.[k])) ||
      genres.some(g => !valid(matrix.byGenre?.[g])) ||
      keys.reduce((sum,k) => sum + matrix.bySkill[k],0) !== matrix.questionCount ||
      genres.reduce((sum,g) => sum + matrix.byGenre[g],0) !== matrix.questionCount)
    throw new Error("Matriz PAES no válida: revisar fuente, versión y distribuciones.");
  return matrix;
}
