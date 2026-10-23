import { M2_AREAS, M2_SKILLS, type M2Exam, type M2Area, type M2Skill } from "./m2";

/** PAES M2: 55 preguntas, 50 consideradas para puntaje, 140 minutos.
 * La asignación de ítems no puntuables corresponde al DEMRE y no se infiere aquí.
 * Matriz interna experimental, NO una tabla de especificaciones oficial.
 */
export const M2_FULL_CONFIG = {
  version: "educantay-paes-m2-55-interno-v1",
  totalQuestions: 55,
  scoredQuestions: 50,
  durationMinutes: 140,
  byArea: { "Álgebra y funciones": 22, "Geometría": 17, "Probabilidad y estadística": 16 } as Record<M2Area,number>,
  bySkill: { "Resolver problemas": 20, "Modelar": 13, "Representar": 12, "Argumentar": 10 } as Record<M2Skill,number>,
} as const;

export type M2FullExam = Omit<M2Exam,"version"> & { version: string };
export function validateM2Full(exam:M2FullExam):string[] {
  const errors:string[]=[];
  if(!exam || exam.version!==M2_FULL_CONFIG.version || !Array.isArray(exam.items) || exam.items.length!==55)
    return ["El ensayo no contiene 55 preguntas o la versión esperada."];
  const ids=new Set<string>();
  for(const [i,q] of exam.items.entries()){
    if(!q || !q.id || ids.has(q.id)) errors.push(`Pregunta ${i+1}: identificador inválido o duplicado.`);
    if(q?.id)ids.add(q.id);
    if(!M2_AREAS.includes(q?.area)||!M2_SKILLS.includes(q?.skill))errors.push(`Pregunta ${i+1}: eje o habilidad inválida.`);
    if(!q?.stem?.trim()||!q?.solution?.trim()||!q?.verification?.trim())errors.push(`Pregunta ${i+1}: faltan enunciado, solución o verificación.`);
    if(!Array.isArray(q?.options)||q.options.length!==4||q.options.some(x=>typeof x!=="string"||!x.trim())||new Set(q.options.map(x=>x.trim().toLowerCase())).size!==4)
      errors.push(`Pregunta ${i+1}: alternativas inválidas.`);
    if(!Number.isInteger(q?.correctIndex)||q.correctIndex<0||q.correctIndex>3)errors.push(`Pregunta ${i+1}: clave inválida.`);
  }
  for(const area of M2_AREAS)if(exam.items.filter(q=>q.area===area).length!==M2_FULL_CONFIG.byArea[area])errors.push(`Eje ${area}: distribución incorrecta.`);
  for(const skill of M2_SKILLS)if(exam.items.filter(q=>q.skill===skill).length!==M2_FULL_CONFIG.bySkill[skill])errors.push(`Habilidad ${skill}: distribución incorrecta.`);
  return errors;
}

/** Plan determinista por eje y habilidad: evita depender del reparto aleatorio de IA. */
export function buildM2FullPlan():Array<{area:M2Area;skill:M2Skill}>{
  const remainingArea={...M2_FULL_CONFIG.byArea};
  const remainingSkill={...M2_FULL_CONFIG.bySkill};
  const plan:Array<{area:M2Area;skill:M2Skill}>=[];
  for(let i=0;i<55;i++){
    const area=M2_AREAS.reduce((a,b)=>remainingArea[a]>=remainingArea[b]?a:b);
    const skill=M2_SKILLS.reduce((a,b)=>remainingSkill[a]>=remainingSkill[b]?a:b);
    plan.push({area,skill});
    remainingArea[area]--;
    remainingSkill[skill]--;
  }
  return plan;
}
