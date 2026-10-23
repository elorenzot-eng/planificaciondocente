import {buildHistoryPlan,HISTORY_SKILLS,type HistoryItem} from "./historia";
type Difficulty="Baja"|"Media"|"Alta"|"Mixta";
export async function generateHistoryItem(index:number,difficulty:Difficulty):Promise<HistoryItem>{
 const plan=buildHistoryPlan();if(!Number.isInteger(index)||index<0||index>=plan.length)throw Error("Índice inválido.");
 const key=process.env.OPENAI_API_KEY;if(!key)throw Error("OPENAI_API_KEY no configurada.");
 const target=plan[index];
 const prompt=`Crea UNA pregunta ORIGINAL tipo PAES Historia y Ciencias Sociales de Chile, número ${index+1} de 65. Eje: ${target.axis}; habilidad: ${target.skill}; dificultad: ${difficulty}. Usa hechos históricos verificables, pluralidad de perspectivas y razonamiento, sin sesgo político. Si utilizas una fuente, redacta un extracto original o paráfrasis identificada; no inventes citas históricas ni atribuciones. La pregunta debe ser autosuficiente, sin imágenes externas, con cuatro alternativas distintas y una sola correcta. Devuelve SOLO JSON {"stem":"...","source":"...","options":["...","...","...","..."],"correctIndex":0,"solution":"...","verification":"..."}. En source usa cadena vacía si no aplica. Incluye una explicación razonada y verificación factual. No presentar como prueba oficial DEMRE.`;
 let last:unknown;
 for(let attempt=0;attempt<3;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
  try{
   const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.PAES_OPENAI_MODEL||"gpt-4.1-mini",temperature:0.3,response_format:{type:"json_object"},messages:[{role:"system",content:"Eres especialista en Historia, Formación Ciudadana y Economía de Chile. Asegura exactitud y neutralidad académica."},{role:"user",content:prompt}]}),signal:controller.signal,cache:"no-store"});
   if(!response.ok)throw Error(`Servicio IA: ${response.status}`);
   const payload=await response.json(),p=JSON.parse(payload.choices?.[0]?.message?.content||"null");
   const item:HistoryItem={id:`HIS-${index+1}`,axis:target.axis,skill:target.skill,stem:p?.stem,source:typeof p?.source==="string"?p.source:"",options:p?.options,correctIndex:p?.correctIndex,solution:p?.solution,verification:p?.verification};
   if(!HISTORY_SKILLS.includes(item.skill)||typeof item.stem!=="string"||!item.stem.trim()||!Array.isArray(item.options)||item.options.length!==4||item.options.some(x=>typeof x!=="string"||!x.trim())||new Set(item.options.map(x=>x.trim().toLowerCase())).size!==4||!Number.isInteger(item.correctIndex)||item.correctIndex<0||item.correctIndex>3||typeof item.solution!=="string"||!item.solution.trim()||typeof item.verification!=="string"||!item.verification.trim())throw Error("Ítem inválido.");
   return item;
  }catch(e){last=e;console.warn("[PAES-HISTORIA]",index+1,attempt+1,e instanceof Error?e.message.slice(0,180):"Error");}finally{clearTimeout(timer);}
 }
 throw last instanceof Error?last:Error("No se pudo generar la pregunta.");
}
