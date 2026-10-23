import { M2_AREAS, M2_SKILLS, type M2Item } from "./m2";
import { buildM2FullPlan } from "./m2-full";
type Difficulty="Baja"|"Media"|"Alta"|"Mixta";
export async function generateM2Item(index:number,difficulty:Difficulty):Promise<M2Item>{
  const plan=buildM2FullPlan();
  if(!Number.isInteger(index)||index<0||index>=plan.length)throw new Error("Índice M2 inválido.");
  const key=process.env.OPENAI_API_KEY;
  if(!key)throw new Error("OPENAI_API_KEY no configurada.");
  const target=plan[index];
  const prompt=`Crea EXACTAMENTE UNA pregunta ORIGINAL de práctica PAES Matemática M2 para Chile. Índice ${index+1}/55. Eje obligatorio: ${target.area}. Habilidad obligatoria: ${target.skill}. Dificultad: ${difficulty}. Responde exclusivamente JSON: {"stem":"...","options":["...","...","...","..."],"correctIndex":0,"solution":"...","verification":"..."}.
Contenidos M2 de profundización: funciones exponenciales, logarítmicas y trigonométricas, sistemas de ecuaciones, vectores, circunferencia, combinatoria, probabilidad condicional y distribuciones de probabilidad; ajusta el contenido al eje. Requisitos: enunciado autosuficiente, sin imágenes externas, cuatro alternativas únicas A-D, una sola correcta, solución matemática paso a paso, verificación INDEPENDIENTE sustituyendo o calculando por otra vía. No inventes aprobación DEMRE. Usa notación textual clara. Evita preguntas ambiguas y evita repetir ejercicios estándar.`;
  let last:unknown;
  for(let attempt=0;attempt<3;attempt++){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),90000);
    try{
      const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.PAES_OPENAI_MODEL||"gpt-4.1-mini",temperature:0.35,response_format:{type:"json_object"},messages:[{role:"system",content:"Eres especialista en matemática escolar chilena. Entrega JSON válido y comprueba la solución antes de responder."},{role:"user",content:prompt}]}),signal:controller.signal,cache:"no-store"});
      if(!response.ok)throw new Error(`Servicio IA: ${response.status}`);
      const payload=await response.json();
      const parsed=JSON.parse(payload.choices?.[0]?.message?.content||"null");
      const item:M2Item={id:`M2-${index+1}`,area:target.area,skill:target.skill,stem:parsed?.stem,options:parsed?.options,correctIndex:parsed?.correctIndex,solution:parsed?.solution,verification:parsed?.verification};
      if(!M2_AREAS.includes(item.area)||!M2_SKILLS.includes(item.skill)||typeof item.stem!=="string"||!item.stem.trim()||!Array.isArray(item.options)||item.options.length!==4||item.options.some(x=>typeof x!=="string"||!x.trim())||new Set(item.options.map(x=>x.trim().toLowerCase())).size!==4||!Number.isInteger(item.correctIndex)||item.correctIndex<0||item.correctIndex>3||typeof item.solution!=="string"||!item.solution.trim()||typeof item.verification!=="string"||!item.verification.trim())throw new Error("Pregunta M2 no superó la validación estructural.");
      return item;
    }catch(e){last=e;console.warn("[PAES-M2] Ítem",index+1,"intento",attempt+1,e instanceof Error?e.message.slice(0,200):"Error");}
    finally{clearTimeout(timer);}
  }
  throw last instanceof Error?last:new Error("No se pudo generar el ítem M2.");
}
