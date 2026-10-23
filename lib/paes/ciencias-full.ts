import {SCIENCE_SKILLS,SCIENCE_SUBJECTS,type ScienceExam,type ScienceItem,type ScienceSection,type ScienceSkill,type ScienceSubject} from "./ciencias";

/** Matriz interna de desarrollo: debe contrastarse con el temario y modelo DEMRE vigente. */
export const SCIENCE_FULL_CONFIG={version:"educantay-paes-ciencias-80-v1",totalQuestions:80,commonQuestions:54,electiveQuestions:26} as const;
export type SciencePlanEntry={section:ScienceSection;subject:ScienceSubject;skill:ScienceSkill};
export function buildScienceFullPlan(elective:ScienceSubject):SciencePlanEntry[]{
 if(!SCIENCE_SUBJECTS.includes(elective))throw new Error("Mención inválida.");
 const common=Array.from({length:SCIENCE_FULL_CONFIG.commonQuestions},(_,i)=>({
  section:"Común" as const,subject:SCIENCE_SUBJECTS[i%SCIENCE_SUBJECTS.length],
  skill:SCIENCE_SKILLS[Math.floor(i/3)%SCIENCE_SKILLS.length]
 }));
 const specific=Array.from({length:SCIENCE_FULL_CONFIG.electiveQuestions},(_,i)=>({
  section:"Electivo" as const,subject:elective,skill:SCIENCE_SKILLS[i%SCIENCE_SKILLS.length]
 }));
 return [...common,...specific];
}
export function validateScienceFull(exam:ScienceExam):string[]{
 if(!exam||exam.version!==SCIENCE_FULL_CONFIG.version||!SCIENCE_SUBJECTS.includes(exam.elective)||!Array.isArray(exam.items)||exam.items.length!==SCIENCE_FULL_CONFIG.totalQuestions)return ["Configuración del ensayo completo inválida."];
 const plan=buildScienceFullPlan(exam.elective),errors:string[]=[];
 for(let i=0;i<plan.length;i++){
  const q:ScienceItem=exam.items[i],p=plan[i];
  if(!q||q.id!==`CIE-${i+1}`||q.section!==p.section||q.subject!==p.subject||q.skill!==p.skill)errors.push(`Pregunta ${i+1}: clasificación incorrecta.`);
  if(typeof q?.stem!=="string"||!q.stem.trim()||typeof q?.solution!=="string"||!q.solution.trim()||typeof q?.verification!=="string"||!q.verification.trim())errors.push(`Pregunta ${i+1}: contenido incompleto.`);
  if(!Array.isArray(q?.options)||q.options.length!==4||q.options.some(x=>typeof x!=="string"||!x.trim())||new Set(q.options.map(x=>x.trim().toLowerCase())).size!==4||!Number.isInteger(q?.correctIndex)||q.correctIndex<0||q.correctIndex>3)errors.push(`Pregunta ${i+1}: alternativas inválidas.`);
 }
 return errors;
}
