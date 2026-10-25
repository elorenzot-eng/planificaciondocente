import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
export const runtime="nodejs";
const greeting="Soy Yanay. Mi nombre viene del quechua y significa morenita o amada. Soy una mujer proveniente de la cultura lican antay, y estoy acá para guiarte y acompañarte en EducAntay. Si tienes alguna duda, háblame y te responderé.";
const previewRequests=new Map<string,{count:number;until:number}>();
export async function POST(request:Request){
 try{
  const body=await request.json().catch(()=>({}));
  const preview=body.preview===true;
  const session=await getSession();
  const demo=preview;
  // Visitors may hear short commercial answers, with a strict per-IP quota.
  if(!session){
   const ip=(request.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
   const now=Date.now();const prev=previewRequests.get(ip);
   if(prev&&prev.until>now&&prev.count>=6)return NextResponse.json({error:"Límite de muestras alcanzado. Intenta nuevamente en unos minutos."},{status:429});
   previewRequests.set(ip,prev&&prev.until>now?{count:prev.count+1,until:prev.until}:{count:1,until:now+600000});
   if(previewRequests.size>1000)for(const [k,v] of previewRequests)if(v.until<=now)previewRequests.delete(k);
  }
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:"Voz neuronal no configurada."},{status:503});
  const text=preview?greeting:typeof body.text==="string"?body.text.trim():"";
  if(!session&&!preview&&text.length>450)return NextResponse.json({error:"Respuesta demasiado larga para audio público."},{status:400});
  if(!text||text.length>1500)return NextResponse.json({error:"Texto inválido."},{status:400});
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
  let result:Response;
  try{result=await fetch("https://api.openai.com/v1/audio/speech",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"gpt-4o-mini-tts",voice:"coral",input:text,response_format:"mp3",speed:1.15,instructions:"Habla en español de Chile con una voz femenina de adulta joven, de registro claramente agudo, fino y ligero. El timbre debe ser muy dulce, suave, aterciopelado y meloso, con calidez afectuosa y una sonrisa audible. Habla como una compañera cercana: juvenil, amable, espontánea y expresiva. Usa una melodía conversacional fluida, pequeñas variaciones de entonación y finales de frase suaves; enlaza las palabras con delicadeza, sin cortes secos ni tono de lectura. Mantén energía serena, dicción clara y un ritmo ágil pero relajado, dejando pequeñas pausas para transmitir cercanía. Usa un acento chileno sutil. Evita una voz grave, áspera, seca, monótona, autoritaria o robótica. Conserva una voz adulta y natural, sin sonar infantil, chillona, estridente, susurrada ni exageradamente actuada."}),signal:controller.signal,cache:"no-store"})}finally{clearTimeout(timer)}
  if(!result.ok)return NextResponse.json({error:"No se pudo generar la muestra de voz."},{status:502});
  const bytes=await result.arrayBuffer();
  return new Response(bytes,{headers:{"Content-Type":"audio/mpeg","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }catch{return NextResponse.json({error:"No se pudo reproducir la voz."},{status:500})}
}
