export const HISTORY_CONFIG={version:"educantay-paes-historia-65-v1",totalQuestions:65} as const;
export const HISTORY_AXES=["Historia: Mundo, América y Chile","Formación ciudadana","Sistema económico"] as const;
export const HISTORY_SKILLS=["Pensamiento temporal y espacial","Análisis de fuentes de información","Pensamiento crítico"] as const;
export type HistoryAxis=typeof HISTORY_AXES[number];
export type HistorySkill=typeof HISTORY_SKILLS[number];
export type HistoryItem={id:string;axis:HistoryAxis;skill:HistorySkill;stem:string;source?:string;options:string[];correctIndex:number;solution:string;verification:string};
export type HistoryExam={version:string;items:HistoryItem[]};
/** Distribución interna experimental, pendiente de contraste con el temario DEMRE vigente. */
export function buildHistoryPlan():Array<{axis:HistoryAxis;skill:HistorySkill}>{
 const counts=[35,20,10];
 return HISTORY_AXES.flatMap((axis,axisIndex)=>Array.from({length:counts[axisIndex]},(_,i)=>({axis,skill:HISTORY_SKILLS[(i+axisIndex)%HISTORY_SKILLS.length]})));
}
export function validateHistoryExam(exam:HistoryExam):string[]{
 if(!exam||exam.version!==HISTORY_CONFIG.version||!Array.isArray(exam.items)||exam.items.length!==HISTORY_CONFIG.totalQuestions)return ["Ensayo de Historia incompleto o versión inválida."];
 const plan=buildHistoryPlan(),errors:string[]=[];
 for(let i=0;i<plan.length;i++){
  const q=exam.items[i],p=plan[i];
  if(!q||q.id!==`HIS-${i+1}`||q.axis!==p.axis||q.skill!==p.skill)errors.push(`Pregunta ${i+1}: eje o habilidad incorrecta.`);
  if(typeof q?.stem!=="string"||!q.stem.trim()||typeof q?.solution!=="string"||!q.solution.trim()||typeof q?.verification!=="string"||!q.verification.trim())errors.push(`Pregunta ${i+1}: contenido incompleto.`);
  if(!Array.isArray(q?.options)||q.options.length!==4||q.options.some(x=>typeof x!=="string"||!x.trim())||new Set(q.options.map(x=>x.trim().toLowerCase())).size!==4||!Number.isInteger(q?.correctIndex)||q.correctIndex<0||q.correctIndex>3)errors.push(`Pregunta ${i+1}: alternativas inválidas.`);
 }
 return errors;
}
