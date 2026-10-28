import type { LectoraExam, LectoraGenre, LectoraSkill } from "./lectora";
import { reviewLectoraExam, type ReviewedLectoraMatrix } from "./lectora-review";

export type LectoraGenerationRequest = {
  matrix: ReviewedLectoraMatrix;
  difficulty: "Baja" | "Media" | "Alta" | "Mixta";
};

/**
 * Prepara instrucciones para un proveedor IA. No llama servicios externos,
 * no expone claves y no publica contenido sin revisión.
 */
export function buildLectoraPrompt(request: LectoraGenerationRequest): string {
  const { matrix, difficulty } = request;
  if (!matrix.version?.trim() || !matrix.sourceReference?.trim() ||
      !matrix.reviewedBy?.trim() || !matrix.reviewedAt?.trim())
    throw new Error("La matriz debe estar documentada y revisada antes de generar.");
  const skills: LectoraSkill[] = ["Localizar", "Interpretar", "Evaluar"];
  const genres: LectoraGenre[] = ["Literario", "No literario"];
  const validCount = (n: unknown) => Number.isInteger(n) && typeof n === "number" && n >= 0;
  if (!validCount(matrix.questionCount) || matrix.questionCount < 1 || matrix.questionCount > 65 ||
      skills.some(s => !validCount(matrix.bySkill?.[s])) ||
      genres.some(g => !validCount(matrix.byGenre?.[g])) ||
      skills.reduce((n,s) => n + matrix.bySkill[s], 0) !== matrix.questionCount ||
      genres.reduce((n,g) => n + matrix.byGenre[g], 0) !== matrix.questionCount)
    throw new Error("La matriz tiene conteos inválidos o distribuciones inconsistentes.");
  return [
    "Eres un equipo de redacción y revisión de ítems de práctica PAES Competencia Lectora.",
    "Genera MATERIAL ORIGINAL de práctica; no copies textos ni preguntas oficiales o protegidos.",
    "No afirmes que este material es una prueba oficial DEMRE.",
    "Devuelve exclusivamente JSON válido, sin markdown, con forma:",
    '{"specificationVersion":"...","texts":[{"id":"...","body":"...","genre":"Literario|No literario","sourceAttribution":"Texto original generado para EducAntay"}],"items":[{"id":"...","textId":"...","skill":"Localizar|Interpretar|Evaluar","genre":"Literario|No literario","stem":"...","options":["...","...","...","..."],"correctIndex":0,"rationale":"...","evidence":"..."}]}',
    `Versión de matriz: ${matrix.version}.`,
    `Referencia revisada: ${matrix.sourceReference}.`,
    `Cantidad exacta: ${matrix.questionCount} preguntas; dificultad: ${difficulty}.`,
    `Distribución exacta por habilidad: ${JSON.stringify(matrix.bySkill)}.`,
    `Distribución exacta por género: ${JSON.stringify(matrix.byGenre)}.`,
    "Cada pregunta debe referirse a un texto existente; cuatro alternativas distintas A-D y una única clave.",
    "La evidencia debe identificar un fragmento o idea verificable del texto.",
    "La justificación debe demostrar la clave y descartar los distractores.",
    "Evita ambigüedad, dobles negaciones innecesarias y pistas por longitud de alternativas.",
    "No inventes citas bibliográficas ni atribuyas textos a autores reales.",
    "No agregues campos que afirmen cuáles preguntas son puntuables: ese dato no se puede inferir.",
  ].join("\n");
}

export function parseAndReviewLectoraResponse(
  raw: string,
  matrix: ReviewedLectoraMatrix,
): { exam: LectoraExam; warnings: string[] } {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { throw new Error("La IA no devolvió JSON válido."); }
  if (!parsed || typeof parsed !== "object" ||
      !Array.isArray((parsed as LectoraExam).texts) ||
      !Array.isArray((parsed as LectoraExam).items))
    throw new Error("La IA devolvió una estructura de ensayo inválida.");
  const exam = parsed as LectoraExam;
  const review = reviewLectoraExam(exam, matrix);
  if (!review.valid) throw new Error("Ensayo rechazado: " + review.errors.join(" | "));
  return { exam, warnings: review.warnings };
}


/**
 * Planificación determinista de bloques para un ensayo de 65 preguntas.
 * Requiere una matriz previamente revisada; no infiere porcentajes oficiales.
 * Esta función no ejecuta solicitudes a OpenAI ni habilita el examen completo.
 */
export function planLectoraBatches(
  matrix: ReviewedLectoraMatrix,
  batchSize = 10,
): ReviewedLectoraMatrix[] {
  if (matrix.questionCount !== 65 || !Number.isInteger(batchSize) || batchSize < 1 || batchSize > 10)
    throw new Error("Se requieren 65 preguntas y bloques de 1 a 10 ítems.");
  const skills: LectoraSkill[] = ["Localizar", "Interpretar", "Evaluar"];
  const genres: LectoraGenre[] = ["Literario", "No literario"];
  const valid = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;
  if (!matrix.version?.trim() || !matrix.reviewedBy?.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(matrix.reviewedAt ?? "") ||
      !matrix.sourceReference?.trim() ||
      skills.some(k => !valid(matrix.bySkill?.[k])) ||
      genres.some(k => !valid(matrix.byGenre?.[k])) ||
      skills.reduce((s,k) => s + matrix.bySkill[k], 0) !== 65 ||
      genres.reduce((s,k) => s + matrix.byGenre[k], 0) !== 65)
    throw new Error("La matriz de 65 preguntas no está revisada o tiene conteos inconsistentes.");

  const remainingSkill = { ...matrix.bySkill };
  const remainingGenre = { ...matrix.byGenre };
  const take = <K extends string>(keys: readonly K[], remaining: Record<K, number>, count: number): Record<K, number> => {
    const result = {} as Record<K, number>;
    let slots = count;
    for (const key of keys) {
      const amount = Math.min(slots, remaining[key]);
      result[key] = amount;
      remaining[key] -= amount;
      slots -= amount;
    }
    if (slots !== 0) throw new Error("No hay suficientes ítems para completar el bloque.");
    return result;
  };
  const batches: ReviewedLectoraMatrix[] = [];
  for (let offset = 0; offset < 65; offset += batchSize) {
    const count = Math.min(batchSize, 65 - offset);
    batches.push({
      ...matrix,
      questionCount: count,
      bySkill: take(skills, remainingSkill, count),
      byGenre: take(genres, remainingGenre, count),
    });
  }
  return batches;
}
