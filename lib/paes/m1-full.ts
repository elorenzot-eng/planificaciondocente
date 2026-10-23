import { M1_AREAS, M1_SKILLS, type M1Exam, type M1Area, type M1Skill } from "./m1";

/** PAES M1: 65 preguntas, 60 consideradas para puntaje, 140 minutos.
 * La asignación de ítems no puntuables corresponde al DEMRE y no se infiere aquí.
 * Matriz interna experimental, NO una tabla de especificaciones oficial.
 */
export const M1_FULL_CONFIG = {
  version: "educantay-paes-m1-65-interno-v1",
  totalQuestions: 65,
  scoredQuestions: 60,
  durationMinutes: 140,
  byArea: { "Números": 17, "Álgebra y funciones": 18, "Geometría": 15, "Probabilidad y estadística": 15 } as Record<M1Area,number>,
  bySkill: { "Resolver problemas": 25, "Modelar": 15, "Representar": 15, "Argumentar": 10 } as Record<M1Skill,number>,
} as const;

export type M1FullExam = Omit<M1Exam,"version"> & { version: string };
export function validateM1Full(exam:M1FullExam):string[] {
  const errors:string[]=[];
  if(!exam || exam.version!==M1_FULL_CONFIG.version || !Array.isArray(exam.items) || exam.items.length!==65)
    return ["El ensayo no contiene 65 preguntas o la versión esperada."];
  const ids=new Set<string>();
  for(const [i,q] of exam.items.entries()){
    if(!q || !q.id || ids.has(q.id)) errors.push(`Pregunta ${i+1}: identificador inválido o duplicado.`);
    if(q?.id)ids.add(q.id);
    if(!M1_AREAS.includes(q?.area)||!M1_SKILLS.includes(q?.skill))errors.push(`Pregunta ${i+1}: eje o habilidad inválida.`);
    if(!q?.stem?.trim()||!q?.solution?.trim()||!q?.verification?.trim())errors.push(`Pregunta ${i+1}: faltan enunciado, solución o verificación.`);
    if(!Array.isArray(q?.options)||q.options.length!==4||q.options.some(x=>typeof x!=="string"||!x.trim())||new Set(q.options.map(x=>x.trim().toLowerCase())).size!==4)
      errors.push(`Pregunta ${i+1}: alternativas inválidas.`);
    if(!Number.isInteger(q?.correctIndex)||q.correctIndex<0||q.correctIndex>3)errors.push(`Pregunta ${i+1}: clave inválida.`);
  }
  for(const area of M1_AREAS)if(exam.items.filter(q=>q.area===area).length!==M1_FULL_CONFIG.byArea[area])errors.push(`Eje ${area}: distribución incorrecta.`);
  for(const skill of M1_SKILLS)if(exam.items.filter(q=>q.skill===skill).length!==M1_FULL_CONFIG.bySkill[skill])errors.push(`Habilidad ${skill}: distribución incorrecta.`);
  return errors;
}

/** Plan determinista por eje y habilidad: evita depender del reparto aleatorio de IA. */
export function buildM1FullPlan():Array<{area:M1Area;skill:M1Skill}>{
  const remainingArea={...M1_FULL_CONFIG.byArea};
  const remainingSkill={...M1_FULL_CONFIG.bySkill};
  const plan:Array<{area:M1Area;skill:M1Skill}>=[];
  for(let i=0;i<65;i++){
    const area=M1_AREAS.reduce((a,b)=>remainingArea[a]>=remainingArea[b]?a:b);
    const skill=M1_SKILLS.reduce((a,b)=>remainingSkill[a]>=remainingSkill[b]?a:b);
    plan.push({area,skill});
    remainingArea[area]--;
    remainingSkill[skill]--;
  }
  return plan;
}
