export const SCIENCE_SUBJECTS = ["Biología","Física","Química"] as const;
export type ScienceSubject = typeof SCIENCE_SUBJECTS[number];
export type ScienceSection = "Común"|"Electivo";
export type ScienceSkill = "Observar y plantear preguntas"|"Planificar y conducir una investigación"|"Procesar y analizar la evidencia"|"Evaluar"|"Comunicar";
export const SCIENCE_SKILLS:ScienceSkill[]=["Observar y plantear preguntas","Planificar y conducir una investigación","Procesar y analizar la evidencia","Evaluar","Comunicar"];
export type ScienceItem={id:string;section:ScienceSection;subject:ScienceSubject;skill:ScienceSkill;stem:string;options:string[];correctIndex:number;solution:string;verification:string};
export type ScienceExam={version:string;elective:ScienceSubject;items:ScienceItem[]};
/** Propuesta interna de práctica; la distribución definitiva debe cotejarse con el temario DEMRE vigente. */
export const SCIENCE_PRACTICE_CONFIG={version:"educantay-paes-ciencias-piloto-v1",totalQuestions:12,commonQuestions:6,electiveQuestions:6} as const;
export function buildSciencePracticePlan(elective:ScienceSubject):Array<{section:ScienceSection;subject:ScienceSubject;skill:ScienceSkill}>{
 const common=SCIENCE_SUBJECTS.flatMap(subject=>[0,1].map((_,i)=>({section:"Común" as const,subject,skill:SCIENCE_SKILLS[(SCIENCE_SUBJECTS.indexOf(subject)*2+i)%SCIENCE_SKILLS.length]})));
 const electivePlan=Array.from({length:6},(_,i)=>({section:"Electivo" as const,subject:elective,skill:SCIENCE_SKILLS[i%SCIENCE_SKILLS.length]}));
 return [...common,...electivePlan];
}
export function validateSciencePractice(exam:ScienceExam):string[]{
 const errors:string[]=[];
 if(exam.version!==SCIENCE_PRACTICE_CONFIG.version||!SCIENCE_SUBJECTS.includes(exam.elective)||exam.items?.length!==12)return ["Configuración del ensayo de Ciencias inválida."];
 const plan=buildSciencePracticePlan(exam.elective);
 for(let i=0;i<plan.length;i++){
  const q=exam.items[i],p=plan[i];
  if(!q||q.id!==`CIE-${i+1}`||q.section!==p.section||q.subject!==p.subject||q.skill!==p.skill)errors.push(`Pregunta ${i+1}: clasificación incorrecta.`);
  if(typeof q?.stem!=="string"||!q.stem.trim()||typeof q?.solution!=="string"||!q.solution.trim()||typeof q?.verification!=="string"||!q.verification.trim())errors.push(`Pregunta ${i+1}: texto incompleto.`);
  if(!Array.isArray(q?.options)||q.options.length!==4||q.options.some(x=>typeof x!=="string"||!x.trim())||new Set(q.options.map(x=>x.trim().toLowerCase())).size!==4||!Number.isInteger(q?.correctIndex)||q.correctIndex<0||q.correctIndex>3)errors.push(`Pregunta ${i+1}: alternativas incorrectas.`);
 }
 return errors;
}
