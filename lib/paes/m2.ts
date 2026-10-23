/** Estructura de trabajo para PAES Competencia Matemática M2.
 * Piloto interno; las cantidades no representan especificaciones DEMRE.
 */
export const M2_SKILLS = ["Resolver problemas", "Modelar", "Representar", "Argumentar"] as const;
export const M2_AREAS = ["Álgebra y funciones", "Geometría", "Probabilidad y estadística"] as const;
export type M2Skill = typeof M2_SKILLS[number];
export type M2Area = typeof M2_AREAS[number];
export type M2Item = {
  id: string; area: M2Area; skill: M2Skill; stem: string;
  options: [string,string,string,string]; correctIndex: number;
  solution: string; verification: string;
};
export type M2Exam = { version: string; items: M2Item[] };
export const M2_PILOT_MATRIX = {
  version: "educantay-paes-m2-piloto-10-v1",
  byArea: { "Álgebra y funciones": 4, "Geometría": 3, "Probabilidad y estadística": 3 },
  bySkill: { "Resolver problemas": 4, "Modelar": 2, "Representar": 2, "Argumentar": 2 },
};
export function validateM2(exam: M2Exam): string[] {
  const errors: string[] = [];
  if (!exam || exam.version !== M2_PILOT_MATRIX.version || !Array.isArray(exam.items) || exam.items.length !== 10)
    return ["El ensayo no contiene los 10 ítems y versión esperados."];
  const ids = new Set<string>();
  for (const [i,q] of exam.items.entries()) {
    if (!q || !q.id || ids.has(q.id)) errors.push(`Pregunta ${i+1}: identificador inválido o duplicado.`);
    if (q?.id) ids.add(q.id);
    if (!M2_AREAS.includes(q?.area) || !M2_SKILLS.includes(q?.skill))
      errors.push(`Pregunta ${i+1}: área o habilidad inválida.`);
    if (!q?.stem?.trim() || !q?.solution?.trim() || !q?.verification?.trim())
      errors.push(`Pregunta ${i+1}: faltan enunciado, desarrollo o verificación.`);
    if (!Array.isArray(q?.options) || q.options.length !== 4 || q.options.some(x=>typeof x !== "string" || !x.trim()) ||
      new Set(q.options.map(x=>x.trim().toLowerCase())).size !== 4)
      errors.push(`Pregunta ${i+1}: alternativas inválidas.`);
    if (!Number.isInteger(q?.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3)
      errors.push(`Pregunta ${i+1}: clave inválida.`);
  }
  for (const area of M2_AREAS) if (exam.items.filter(q=>q.area===area).length !== M2_PILOT_MATRIX.byArea[area])
    errors.push(`Área ${area}: distribución incorrecta.`);
  for (const skill of M2_SKILLS) if (exam.items.filter(q=>q.skill===skill).length !== M2_PILOT_MATRIX.bySkill[skill])
    errors.push(`Habilidad ${skill}: distribución incorrecta.`);
  return errors;
}
