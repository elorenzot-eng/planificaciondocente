"use client";
import {useState} from "react";
type Result={dryRun:boolean;expired:number;excluded:number;already:number;eligible:number;sent:number;failed:number;limitPerRun:number;error?:string};
export default function TrialNotices(){
 const [data,setData]=useState<Result|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function run(send:boolean){
  if(send&&!window.confirm("¿Enviar ahora hasta 25 notificaciones informativas de prueba vencida a usuarios no excluidos? Esta acción es real y no se puede deshacer."))return;
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/admin/notificaciones-vencimiento",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({confirm:send?"ENVIAR_NOTIFICACIONES_VENCIMIENTO":"PREVIEW"})});
   const j=await r.json();
   if(!r.ok)throw Error(j.error||"No se pudo ejecutar");
   setData(j);
  }catch(e){setError(String(e))}finally{setBusy(false)}
 }
 return <main style={{maxWidth:760,margin:"auto",padding:24}}>
  <a href="/admin/campanas">← Campañas</a>
  <h1>Notificaciones de vencimiento de prueba</h1>
  <p>Comunicación de servicio, sin ofertas ni publicidad. Se excluyen contactos bloqueados. Máximo 25 envíos por ejecución, con reserva de envío para evitar duplicados.</p>
  <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
   <button disabled={busy} onClick={()=>run(false)}>Comprobar destinatarios (sin enviar)</button>
   <button disabled={busy||!data||data.eligible===0} onClick={()=>run(true)}>Enviar notificaciones ahora</button>
  </div>
  {error&&<p role="alert">{error}</p>}
  {data&&<section aria-live="polite" style={{border:"1px solid #ccc",padding:16,borderRadius:12,marginTop:16}}>
   <p>Modo: {data.dryRun?"Comprobación sin envío":"Ejecución real"}</p>
   <p>Pruebas vencidas: {data.expired} · Excluidos: {data.excluded} · Ya procesados: {data.already}</p>
   <p>Elegibles: {data.eligible} · Enviados: {data.sent} · Fallidos: {data.failed}</p>
   {data.failed>0&&<p>Revisar registros antes de reintentar. Los envíos fallidos quedan reservados para evitar duplicados.</p>}
  </section>}
 </main>
}
