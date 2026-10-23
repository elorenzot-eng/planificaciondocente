import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
export const runtime="nodejs";
const greeting="¡Hola! Soy Yanay. Qué alegría saludarte. Soy tu compañera virtual de EducAntay. Estoy aquí para ayudarte a preparar tus clases, crear evaluaciones y resolver tus dudas. ¿Por dónde comenzamos?";
export async function POST(request:Request){
 try{
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Inicia sesión para probar la voz."},{status:401});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:"Voz neuronal no configurada."},{status:503});
  const body=await request.json().catch(()=>({}));
  const text=body.preview===true?greeting:typeof body.text==="string"?body.text.trim():"";
  if(!text||text.length>1500)return NextResponse.json({error:"Texto inválido."},{status:400});
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
  let result:Response;
  try{result=await fetch("https://api.openai.com/v1/audio/speech",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"gpt-4o-mini-tts",voice:"shimmer",input:text,response_format:"mp3",instructions:"Habla en español de Chile, con voz femenina, dulce, cálida, cercana, natural y expresiva. Usa un acento chileno sutil, pausas humanas y ritmo tranquilo. Evita sonar robótica o exagerar el acento."}),signal:controller.signal,cache:"no-store"})}finally{clearTimeout(timer)}
  if(!result.ok)return NextResponse.json({error:"No se pudo generar la muestra de voz."},{status:502});
  const bytes=await result.arrayBuffer();
  return new Response(bytes,{headers:{"Content-Type":"audio/mpeg","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }catch{return NextResponse.json({error:"No se pudo reproducir la voz."},{status:500})}
}
