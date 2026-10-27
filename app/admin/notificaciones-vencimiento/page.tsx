"use client";
import {useState} from "react";

type Result={dryRun:boolean;expired:number;excluded:number;already:number;eligible:number;sent:number;failed:number;limitPerRun:number;error?:string;note?:string};
const card:React.CSSProperties={background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:20,boxShadow:"0 3px 12px rgba(15,23,42,.04)"};
const button:React.CSSProperties={border:0,borderRadius:10,padding:"12px 18px",fontSize:14,fontWeight:700,cursor:"pointer",minHeight:46};
export default function TrialNotices(){
 const [preview,setPreview]=useState<Result|null>(null);
 const [outcome,setOutcome]=useState<Result|null>(null);
 const [busy,setBusy]=useState<"preview"|"send"|null>(null);
 const [error,setError]=useState("");
 async function request(send:boolean):Promise<Result>{
  const r=await fetch("/api/admin/notificaciones-vencimiento",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({confirm:send?"ENVIAR_NOTIFICACIONES_VENCIMIENTO":"PREVIEW"})});
  const j=await r.json();if(!r.ok)throw Error(j.error||"No se pudo ejecutar");return j;
 }
 async function run(send:boolean){
  if(send&&(!preview||preview.eligible===0))return;
  if(send&&!window.confirm(`Se enviarán hasta ${Math.min(preview!.eligible,50)} notificaciones informativas. Los contactos excluidos no recibirán mensajes. ¿Confirmar envío real?`))return;
  setBusy(send?"send":"preview");setError("");
  try{
   if(send){const result=await request(true);setOutcome(result);setPreview(await request(false))}
   else{setPreview(await request(false))}
  }catch(e){setError(e instanceof Error?e.message:String(e))}
  finally{setBusy(null)}
 }
 const metrics=[{name:"Pruebas vencidas",value:preview?.expired,accent:"#0f172a"},{name:"Excluidos",value:preview?.excluded,accent:"#b45309"},{name:"Ya procesados",value:preview?.already,accent:"#475569"},{name:"Pendientes",value:preview?.eligible,accent:"#0369a1"}];
 return <main style={{minHeight:"100vh",background:"#f4f7fb",padding:"clamp(16px,3vw,36px)",color:"#17243b",fontFamily:"inherit"}}>
  <div style={{maxWidth:1050,margin:"0 auto",display:"grid",gap:22}}>
   <nav><a href="/admin/campanas" style={{color:"#0369a1",fontWeight:600,textDecoration:"none"}}>← Volver a campañas</a></nav>
   <header style={{background:"linear-gradient(115deg,#0b2d4a,#116b86)",borderRadius:20,padding:"clamp(22px,4vw,34px)",color:"white"}}>
    <div style={{fontSize:12,letterSpacing:1.6,fontWeight:800,opacity:.85}}>EDUCANTAY · SUPERADMIN</div>
    <h1 style={{fontSize:"clamp(24px,3.5vw,34px)",lineHeight:1.2,margin:"12px 0"}}>Centro de notificaciones</h1>
    <p style={{maxWidth:720,margin:0,lineHeight:1.65,opacity:.95}}>Gestiona los avisos informativos de vencimiento de pruebas gratuitas. Sin ofertas comerciales, con exclusiones y protección contra envíos duplicados.</p>
   </header>
   <section aria-label="Resumen de destinatarios">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
     <h2 style={{fontSize:19,margin:0}}>Resumen de destinatarios</h2>
     <span style={{fontSize:13,color:"#64748b"}}>{preview?"Datos actualizados tras la última consulta":"Pendiente de comprobación"}</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12}}>
     {metrics.map(m=><article key={m.name} style={card}><div style={{fontSize:13,color:"#64748b",marginBottom:12}}>{m.name}</div><div style={{fontSize:34,fontWeight:800,color:m.accent,fontVariantNumeric:"tabular-nums"}}>{m.value??"—"}</div></article>)}
    </div>
   </section>
   <section style={card}>
    <h2 style={{fontSize:19,margin:"0 0 8px"}}>Preparar y enviar</h2>
    <p style={{color:"#526174",lineHeight:1.6,margin:"0 0 20px"}}>Primero comprueba los destinatarios. Después podrás confirmar el envío real de un máximo de 50 mensajes por ejecución.</p>
    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
     <button type="button" style={{...button,background:"#e2f2f6",color:"#07516a",opacity:busy?.6:1}} disabled={!!busy} onClick={()=>run(false)}>{busy==="preview"?"Comprobando…":"↻ Comprobar destinatarios"}</button>
     <button type="button" style={{...button,background:"#0b7292",color:"#fff",opacity:busy||!preview||preview.eligible===0?.5:1,cursor:busy||!preview||preview.eligible===0?"not-allowed":"pointer"}} disabled={!!busy||!preview||preview.eligible===0} onClick={()=>run(true)}>{busy==="send"?"Enviando…":`Enviar ahora${preview?.eligible?" · hasta "+Math.min(preview.eligible,50):""}`}</button>
    </div>
    {preview?.eligible===0&&<p style={{color:"#166534",marginBottom:0}}>No hay destinatarios pendientes de notificación.</p>}
    {error&&<p role="alert" style={{color:"#b91c1c",fontWeight:600,marginBottom:0}}>Error: {error}</p>}
   </section>
   {outcome&&<section aria-live="polite" style={{...card,borderLeft:"5px solid "+(outcome.failed?"#d97706":"#16a34a")}}>
    <h2 style={{fontSize:19,margin:"0 0 14px"}}>Resultado del último envío</h2>
    <div style={{display:"flex",gap:28,flexWrap:"wrap"}}>
     <div><div style={{fontSize:30,fontWeight:800,color:"#15803d"}}>{outcome.sent}</div><span>Enviados al proveedor</span></div>
     <div><div style={{fontSize:30,fontWeight:800,color:outcome.failed?"#b91c1c":"#64748b"}}>{outcome.failed}</div><span>Fallidos</span></div>
    </div>
    <p style={{color:"#64748b",fontSize:13,marginBottom:0}}>El estado «enviado» no confirma la entrega en bandeja de entrada. Revisa Resend para comprobarla.</p>
    {outcome.failed>0&&<p style={{color:"#b45309"}}>Revisa los registros antes de reintentar: los intentos fallidos quedan reservados para prevenir duplicados.</p>}
   </section>}
   <section style={{...card,background:"#f8fafc"}}>
    <h2 style={{fontSize:17,margin:"0 0 8px"}}>Controles de seguridad</h2>
    <p style={{fontSize:14,color:"#526174",lineHeight:1.7,margin:0}}>Solo cuentas individuales con prueba vencida · Contactos excluidos bloqueados · Una notificación por vencimiento · Máximo 50 por ejecución · Envío real únicamente con confirmación.</p>
   </section>
  </div>
 </main>
}
