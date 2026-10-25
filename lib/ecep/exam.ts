import type {Topic} from "../ecep-topics";
export const ECEP_DIFFICULTIES=["Baja","Media","Alta","Mixta"] as const;
export type Difficulty=typeof ECEP_DIFFICULTIES[number];
export type EcepConfig={specialtyKey:string;quantity:number;difficulty:Difficulty;domain:number};
export type PlannedItem={number:number;referenceId:string;domain:string;subdomain:string;indicator:string;dimension:"Disciplinar"|"Pedagógico";difficulty:Exclude<Difficulty,"Mixta">};
export type EcepQuestion=PlannedItem&{stem:string;options:string[];correctIndex:number;explanation:string;rationales:string[]};
export const topicKey=(topic:Topic)=>topic.nivel+"::"+topic.especialidad;
export function buildEcepPlan(topic:Topic,config:EcepConfig):PlannedItem[]{
 if(![10,30,60].includes(config.quantity)||!ECEP_DIFFICULTIES.includes(config.difficulty)||!Number.isInteger(config.domain)||config.domain< -1||config.domain>=topic.dominios.length)throw Error("Configuración ECEP inválida.");
 const domains=topic.dominios.map((d,di)=>({d,di,subs:d.subdominios.map((s,si)=>({s,si,indicators:s.indicadores.map((text,ii)=>({text,ii})).filter(x=>x.text.trim())})).filter(s=>s.indicators.length)})).filter(d=>d.subs.length&&(config.domain===-1||config.domain===d.di));
 if(!domains.length)throw Error("El dominio seleccionado no tiene indicadores cargados.");
 const mixed=["Baja","Media","Alta","Media","Baja","Alta","Media","Baja","Media","Alta"] as const;
 return Array.from({length:config.quantity},(_,i):PlannedItem=>{
  const domain=domains[i%domains.length],turn=Math.floor(i/domains.length),sub=domain.subs[turn%domain.subs.length],indicator=sub.indicators[Math.floor(turn/domain.subs.length)%sub.indicators.length];
  return {number:i+1,referenceId:domain.di+"."+sub.si+"."+indicator.ii,domain:domain.d.nombre,subdomain:sub.s.codigo+" · "+sub.s.nombre,indicator:indicator.text,dimension:i%2===0?"Disciplinar":"Pedagógico",difficulty:config.difficulty==="Mixta"?mixed[i%10]:config.difficulty};
 });
}
const normalized=(s:string)=>s.trim().replace(/\s+/g," ").toLocaleLowerCase("es");
export function validateEcepBatch(input:unknown,plan:PlannedItem[],previous:EcepQuestion[]=[]):EcepQuestion[]{
 if(!input||typeof input!=="object"||!Array.isArray((input as {items?:unknown}).items))throw Error("Respuesta IA sin preguntas.");
 const items=(input as {items:unknown[]}).items;
 if(items.length!==plan.length)throw Error("Cantidad de preguntas incorrecta.");
 const seen=new Set(previous.map(q=>normalized(q.stem)));
 return items.map((value,i)=>{
  if(!value||typeof value!=="object")throw Error("Pregunta inválida.");
  const q=value as Record<string,unknown>,target=plan[i];
  if(q.number!==target.number||q.referenceId!==target.referenceId||q.difficulty!==target.difficulty||q.dimension!==target.dimension)throw Error("Pregunta fuera de su indicador o dificultad.");
  if(typeof q.stem!=="string"||q.stem.trim().length<25||seen.has(normalized(q.stem)))throw Error("Enunciado vacío, demasiado breve o repetido.");
  if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(o=>typeof o!=="string"||!o.trim()))throw Error("Se requieren cuatro alternativas.");
  const options=(q.options as string[]).map(o=>o.trim().replace(/^[A-D][).:]\s*/i,""));
  if(options.some(o=>!o)||new Set(options.map(normalized)).size!==4)throw Error("Alternativas repetidas o vacías.");
  if(!Number.isInteger(q.correctIndex)||Number(q.correctIndex)<0||Number(q.correctIndex)>3)throw Error("Clave inválida.");
  if(typeof q.explanation!=="string"||q.explanation.trim().length<25)throw Error("Falta fundamento de la respuesta.");
  if(!Array.isArray(q.rationales)||q.rationales.length!==4||q.rationales.some(r=>typeof r!=="string"||r.trim().length<10))throw Error("Falta justificación de alternativas.");
  seen.add(normalized(q.stem));
  return {...target,stem:q.stem.trim(),options,correctIndex:Number(q.correctIndex),explanation:q.explanation.trim(),rationales:q.rationales as string[]};
 });
}
export function validateCompletedEcep(items:unknown,plan:PlannedItem[]):EcepQuestion[]{
 return validateEcepBatch({items},plan);
}
