/** Estructura de trabajo para PAES Competencia Matemática M1.
 * Piloto interno; las cantidades no representan especificaciones DEMRE.
 */
export const M1_SKILLS = ["Resolver problemas", "Modelar", "Representar", "Argumentar"] as const;
export const M1_AREAS = ["Números", "Álgebra y funciones", "Geometría", "Probabilidad y estadística"] as const;
export type M1Skill = typeof M1_SKILLS[number];
export type M1Area = typeof M1_AREAS[number];
export type M1Item = {
  id: string; area: M1Area; skill: M1Skill; stem: string;
  options: [string,string,string,string]; correctIndex: number;
  solution: string; verification: string;
};
export type M1Exam = { version: string; items: M1Item[] };
export const M1_PILOT_MATRIX = {
  version: "educantay-paes-m1-piloto-10-v1",
  byArea: { "Números": 3, "Álgebra y funciones": 3, "Geometría": 2, "Probabilidad y estadística": 2 },
  bySkill: { "Resolver problemas": 4, "Modelar": 2, "Representar": 2, "Argumentar": 2 },
};
export function validateM1(exam: M1Exam): string[] {
  const errors: string[] = [];
  if (!exam || exam.version !== M1_PILOT_MATRIX.version || !Array.isArray(exam.items) || exam.items.length !== 10)
    return ["El ensayo no contiene los 10 ítems y versión esperados."];
  const ids = new Set<string>();
  for (const [i,q] of exam.items.entries()) {
    if (!q || !q.id || ids.has(q.id)) errors.push(`Pregunta ${i+1}: identificador inválido o duplicado.`);
    if (q?.id) ids.add(q.id);
    if (!M1_AREAS.includes(q?.area) || !M1_SKILLS.includes(q?.skill))
      errors.push(`Pregunta ${i+1}: área o habilidad inválida.`);
    if (!q?.stem?.trim() || !q?.solution?.trim() || !q?.verification?.trim())
      errors.push(`Pregunta ${i+1}: faltan enunciado, desarrollo o verificación.`);
    if (!Array.isArray(q?.options) || q.options.length !== 4 || q.options.some(x=>typeof x !== "string" || !x.trim()) ||
      new Set(q.options.map(x=>x.trim().toLowerCase())).size !== 4)
      errors.push(`Pregunta ${i+1}: alternativas inválidas.`);
    if (!Number.isInteger(q?.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3)
      errors.push(`Pregunta ${i+1}: clave inválida.`);
  }
  for (const area of M1_AREAS) if (exam.items.filter(q=>q.area===area).length !== M1_PILOT_MATRIX.byArea[area])
    errors.push(`Área ${area}: distribución incorrecta.`);
  for (const skill of M1_SKILLS) if (exam.items.filter(q=>q.skill===skill).length !== M1_PILOT_MATRIX.bySkill[skill])
    errors.push(`Habilidad ${skill}: distribución incorrecta.`);
  return errors;
}
