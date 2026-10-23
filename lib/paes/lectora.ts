/**
 * Reglas estructurales del piloto PAES Competencia Lectora.
 * Las distribuciones por habilidad y género NO se inventan:
 * deben provenir de una matriz DEMRE versionada y revisada.
 */
export const LECTORA_CONFIG = {
  totalQuestions: 65,
  scoredQuestions: 60,
  durationMinutes: 150,
  optionLabels: ["A", "B", "C", "D"] as const,
  skills: ["Localizar", "Interpretar", "Evaluar"] as const,
  genres: ["Literario", "No literario"] as const,
} as const;

export type LectoraSkill = (typeof LECTORA_CONFIG.skills)[number];
export type LectoraGenre = (typeof LECTORA_CONFIG.genres)[number];
export type LectoraItem = {
  id: string;
  textId: string;
  skill: LectoraSkill;
  genre: LectoraGenre;
  stem: string;
  options: [string, string, string, string];
  correctIndex: number;
  rationale: string;
  evidence: string;
};

export type LectoraText = {
  id: string;
  body: string;
  genre: LectoraGenre;
  sourceAttribution: string;
};

export type LectoraExam = {
  texts: LectoraText[];
  items: LectoraItem[];
  /** Matriz aprobada por revisión pedagógica, no inferida por IA */
  specificationVersion?: string;
};

export function validateLectoraExam(exam: LectoraExam, fullExam = true): string[] {
  const errors: string[] = [];
  if (!exam || typeof exam !== "object" || !Array.isArray(exam.items) || !Array.isArray(exam.texts))
    return ["La estructura del ensayo es inválida: faltan textos o preguntas."];
  if (fullExam && exam.items.length !== LECTORA_CONFIG.totalQuestions)
    errors.push(`Ensayo completo: se requieren ${LECTORA_CONFIG.totalQuestions} preguntas.`);
  if (!fullExam && (exam.items.length < 1 || exam.items.length > LECTORA_CONFIG.totalQuestions))
    errors.push("Cantidad de preguntas fuera de rango.");
  if (typeof exam.specificationVersion !== "string" || !exam.specificationVersion.trim())
    errors.push("Falta la versión de la matriz de especificaciones revisada.");
  const textMap = new Map(exam.texts.filter(t => t && typeof t.id === "string").map(t => [t.id, t]));
  if (textMap.size !== exam.texts.length) errors.push("Hay textos con identificadores repetidos.");
  for (const t of exam.texts) {
    if (!t || typeof t !== "object" || typeof t.id !== "string" || typeof t.body !== "string" ||
        typeof t.sourceAttribution !== "string" || !LECTORA_CONFIG.genres.includes(t.genre)) {
      errors.push("Texto con estructura o género inválido.");
      continue;
    }
    if (!t.body?.trim()) errors.push(`Texto ${t.id}: contenido vacío.`);
    if (!t.sourceAttribution?.trim()) errors.push(`Texto ${t.id}: falta procedencia o atribución.`);
  }
  const ids = new Set<string>();
  for (const [i, item] of exam.items.entries()) {
    const prefix = `Ítem ${i + 1}`;
    if (!item || typeof item !== "object" || typeof item.id !== "string" ||
        typeof item.textId !== "string" || typeof item.stem !== "string" ||
        typeof item.rationale !== "string" || typeof item.evidence !== "string") {
      errors.push(`${prefix}: estructura inválida.`);
      continue;
    }
    if (!item.id?.trim() || ids.has(item.id)) errors.push(`${prefix}: identificador vacío o duplicado.`);
    ids.add(item.id);
    const text = textMap.get(item.textId);
    if (!text) errors.push(`${prefix}: no existe el texto asociado.`);
    else if (text.genre !== item.genre) errors.push(`${prefix}: género inconsistente con el texto.`);
    if (!LECTORA_CONFIG.skills.includes(item.skill)) errors.push(`${prefix}: habilidad inválida.`);
    if (!LECTORA_CONFIG.genres.includes(item.genre)) errors.push(`${prefix}: género inválido.`);
    if (!item.stem?.trim()) errors.push(`${prefix}: enunciado vacío.`);
    if (!Array.isArray(item.options) || item.options.length !== 4 ||
        item.options.some(option => typeof option !== "string" || !option.trim()))
      errors.push(`${prefix}: se requieren cuatro alternativas no vacías.`);
    else if (new Set(item.options.map(x => x.trim().toLowerCase())).size !== 4)
      errors.push(`${prefix}: alternativas duplicadas.`);
    if (!Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex > 3)
      errors.push(`${prefix}: clave incorrecta; debe ser A-D.`);
    if (!item.rationale?.trim()) errors.push(`${prefix}: falta justificación.`);
    if (!item.evidence?.trim()) errors.push(`${prefix}: falta evidencia textual.`);
  }
  return errors;
}
