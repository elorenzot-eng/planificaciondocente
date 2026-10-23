import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
export const runtime="nodejs";
const greeting="¡Hola! Soy Yanay. Qué alegría saludarte. Soy tu compañera virtual de EducAntay. Estoy aquí para ayudarte a preparar tus clases, crear evaluaciones y resolver tus dudas. ¿Por dónde comenzamos?";
const previewRequests=new Map<string,{count:number;until:number}>();
export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const preview=body.preview===true;
  const session=await getSession();
  const demo=process.env.RAILWAY_ENVIRONMENT_NAME==="testing" && preview;
  if(!session&&!demo)return NextResponse.json({error:"Inicia sesión para utilizar la voz neuronal."},{status:401});
  if(!session&&demo){
   const ip=(request.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
   const now=Date.now();const prev=previewRequests.get(ip);
   if(prev&&prev.until>now&&prev.count>=3)return NextResponse.json({error:"Límite de muestras alcanzado. Intenta nuevamente en unos minutos."},{status:429});
   previewRequests.set(ip,prev&&prev.until>now?{count:prev.count+1,until:prev.until}:{count:1,until:now+600000});
   if(previewRequests.size>1000)for(const [k,v] of previewRequests)if(v.until<=now)previewRequests.delete(k);
  }
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:"Voz neuronal no configurada."},{status:503});
  const text=preview?greeting:typeof body.text==="string"?body.text.trim():"";
  if(!text||text.length>1500)return NextResponse.json({error:"Texto inválido."},{status:400});
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
  let result:Response;
  try{result=await fetch("https://api.openai.com/v1/audio/speech",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"gpt-4o-mini-tts",voice:"shimmer",input:text,response_format:"mp3",speed:1.15,instructions:"Habla en español de Chile, con voz femenina adulta, un poco más aguda y fina, de timbre ligero, suave, dulce, cálido, cercano, natural y expresivo. Eleva ligeramente el tono respecto de una voz femenina media, manteniendo una dicción clara y cómoda. Conserva una entonación adulta; evita una voz infantil, chillona, estridente o artificial. Usa un acento chileno sutil, pausas naturales y ritmo ágil, ligeramente más rápido que una conversación habitual. Evita sonar robótica o exagerar el acento."}),signal:controller.signal,cache:"no-store"})}finally{clearTimeout(timer)}
  if(!result.ok)return NextResponse.json({error:"No se pudo generar la muestra de voz."},{status:502});
  const bytes=await result.arrayBuffer();
  return new Response(bytes,{headers:{"Content-Type":"audio/mpeg","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }catch{return NextResponse.json({error:"No se pudo reproducir la voz."},{status:500})}
}
