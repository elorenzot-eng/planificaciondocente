import {buildSciencePracticePlan,type ScienceItem,type ScienceSubject,SCIENCE_SKILLS,SCIENCE_SUBJECTS} from "./ciencias";
import {buildScienceFullPlan} from "./ciencias-full";
type Difficulty="Baja"|"Media"|"Alta"|"Mixta";
export async function generateScienceItem(index:number,elective:ScienceSubject,difficulty:Difficulty,full=false):Promise<ScienceItem>{
 if(!SCIENCE_SUBJECTS.includes(elective)||!Number.isInteger(index)||index<0||index>=(full?80:12))throw new Error("Configuración inválida.");
 const target=(full?buildScienceFullPlan(elective):buildSciencePracticePlan(elective))[index],key=process.env.OPENAI_API_KEY;
 if(!key)throw new Error("OPENAI_API_KEY no configurada.");
 const prompt=`Crea UNA pregunta ORIGINAL de práctica PAES Ciencias para Chile, número ${index+1} de ${full?80:12}. Módulo: ${target.section}; disciplina: ${target.subject}; habilidad: ${target.skill}; dificultad: ${difficulty}. Contenido de enseñanza media científicamente correcto, enunciado autosuficiente, sin imágenes externas. Para el módulo común, evalúa conocimientos transversales y habilidades de investigación científica; para el electivo, profundiza la disciplina. Responde SOLO JSON: {"stem":"...","options":["...","...","...","..."],"correctIndex":0,"solution":"...","verification":"..."}. Cuatro alternativas diferentes, una correcta, explicación razonada y comprobación independiente. No afirmar que es material oficial DEMRE.`;
 let last:unknown;
 for(let attempt=0;attempt<3;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  try{
   const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.PAES_OPENAI_MODEL||"gpt-4.1-mini",temperature:0.3,response_format:{type:"json_object"},messages:[{role:"system",content:"Eres especialista en didáctica de ciencias y evaluación escolar chilena. Verifica que la respuesta sea científicamente correcta."},{role:"user",content:prompt}]}),signal:controller.signal,cache:"no-store"});
   if(!response.ok)throw new Error(`Servicio IA: ${response.status}`);
   const payload=await response.json(),p=JSON.parse(payload.choices?.[0]?.message?.content||"null");
   const item:ScienceItem={id:`CIE-${index+1}`,section:target.section,subject:target.subject,skill:target.skill,stem:p?.stem,options:p?.options,correctIndex:p?.correctIndex,solution:p?.solution,verification:p?.verification};
   if(!SCIENCE_SKILLS.includes(item.skill)||typeof item.stem!=="string"||!item.stem.trim()||!Array.isArray(item.options)||item.options.length!==4||item.options.some(x=>typeof x!=="string"||!x.trim())||new Set(item.options.map(x=>x.trim().toLowerCase())).size!==4||!Number.isInteger(item.correctIndex)||item.correctIndex<0||item.correctIndex>3||typeof item.solution!=="string"||!item.solution.trim()||typeof item.verification!=="string"||!item.verification.trim())throw new Error("Ítem inválido.");
   return item;
  }catch(e){last=e;console.warn("[PAES-CIENCIAS]",index+1,attempt+1,e instanceof Error?e.message.slice(0,180):"Error");}finally{clearTimeout(timer);}
 }
 throw last instanceof Error?last:new Error("No se pudo generar la pregunta.");
}
