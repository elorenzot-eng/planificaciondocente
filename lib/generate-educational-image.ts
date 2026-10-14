export async function generateEducationalImage(prompt:string, timeoutMs=20000){
 if(!process.env.OPENAI_API_KEY)return null;
 try {const r=await fetch("https://api.openai.com/v1/images/generations",{
  method:"POST",
  signal:AbortSignal.timeout(timeoutMs),
  headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
  body:JSON.stringify({
   model:process.env.OPENAI_IMAGE_MODEL||"gpt-image-2",
   prompt:`Ilustración educativa clara, didáctica, inclusiva y apropiada para estudiantes. Sin logotipos, sin marcas de agua y evitando texto dentro de la imagen salvo que sea indispensable. ${prompt}`,
   size:"1024x1024",
   quality:"low",
   output_format:"webp"
  })
 });
 const x=await r.json();
 if(!r.ok){console.error("[educational-image]",{status:r.status,error:x?.error});return null}
 const b64=x?.data?.[0]?.b64_json;
 return b64?`data:image/webp;base64,${b64}`:x?.data?.[0]?.url||null;
 }catch(e){console.warn("[educational-image] timeout or network failure",e instanceof Error?e.name:"unknown");return null;}
}
