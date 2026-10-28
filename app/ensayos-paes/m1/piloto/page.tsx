"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Result={error?:string;jobId?:string;status?:string;completed?:number;total?:number;exam?:{items:Array<{id:string;stem:string;options:string[];correctIndex:number;solution:string;verification:string}>};studentHtml?:string;teacherHtml?:string};
function print(html?:string){if(!html)return;const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}
export default function M1Pilot(){
 const [saveMessage,setSaveMessage]=useState(""),[difficulty,setDifficulty]=useState("Media"),[jobId,setJobId]=useState<string|null>(null),[progress,setProgress]=useState(0),[busy,setBusy]=useState(false),[result,setResult]=useState<Result|null>(null);
 const storageKey="educantay-paes-m1-"+difficulty;
 useEffect(()=>{try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||"null");if(saved?.jobId&&Number.isInteger(saved.progress)&&saved.progress>=0&&saved.progress<=65){setJobId(saved.jobId);setProgress(saved.progress);}}catch{}},[storageKey]);
 async function run(){
  if(busy)return;setBusy(true);setResult(null);setSaveMessage("");let current=jobId;
  try{
   for(let i=0,retries=0;i<66;i++){
    const response=await fetch("/api/paes/m1/full-pilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({difficulty,...(current?{jobId:current}:{})}),cache:"no-store"});
    const data=await response.json().catch(()=>({})) as Result;
    if(response.status===409||response.status===429||response.status>=500){
     if(current && retries<3){retries++;setSaveMessage("Recuperando conexión. El avance se conserva…");await new Promise(resolve=>setTimeout(resolve,5000));i--;continue;}
     setResult({error:response.status===409?"La pregunta sigue en proceso. Si el servicio se reinició, espera unos minutos y presiona Reanudar; las preguntas anteriores se conservan.":"El servicio se interrumpió. Presiona Reanudar para continuar desde el avance guardado."});return;
    }
    retries=0;
    if(data.jobId){current=data.jobId;setJobId(current);}
    if(typeof data.completed==="number"){setProgress(data.completed);if(current)try{sessionStorage.setItem(storageKey,JSON.stringify({jobId:current,progress:data.completed}));}catch{}}
    if(!response.ok){setResult({error:data.error||"No se pudo continuar."});return;}
    if(data.status==="COMPLETED"){if(data.jobId){try{const saved=await fetch("/api/paes/saved",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jobId:data.jobId})});setSaveMessage(saved.ok?"Ensayo guardado automáticamente en Mi carpeta.":"No se pudo guardar automáticamente; utiliza el botón Guardar.");}catch{setSaveMessage("No se pudo guardar automáticamente; utiliza el botón Guardar.");}}setResult(data);setJobId(null);setProgress(65);try{sessionStorage.removeItem(storageKey);}catch{}return;}
   }
   setResult({error:"Presiona continuar para completar el proceso."});
  }catch{setResult({error:"Se interrumpió la conexión. Presiona reanudar para continuar."});}
  finally{setBusy(false);}
 }
 return <main style={{display:"block",width:"100%",minWidth:0,boxSizing:"border-box",minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,sans-serif",color:"#17233c",padding:"clamp(16px,3vw,36px)"}}><div style={{width:"100%",minWidth:0,margin:"auto"}}>
 <Link href="/ensayos-paes">← Volver a PAES</Link><h1>PAES Matemática M1 IA · 65 preguntas</h1><p>140 minutos · 60 preguntas consideradas para puntaje en la PAES oficial. No es material oficial DEMRE.</p>
 <section style={{background:"white",borderRadius:16,padding:"clamp(18px,3vw,28px)",display:"grid",gridTemplateColumns:"1fr",gap:18,alignItems:"stretch",border:"1px solid #dce3ed",marginTop:22}}>
 <label>Dificultad<select disabled={busy} value={difficulty} onChange={e=>{setDifficulty(e.target.value);setJobId(null);setProgress(0);setResult(null);}} style={{display:"block",width:"100%",boxSizing:"border-box",padding:12,marginTop:8,minHeight:48}}>{["Baja","Media","Alta","Mixta"].map(x=><option key={x}>{x}</option>)}</select></label>
 <button disabled={busy} onClick={run} style={{background:"#0d9488",color:"white",padding:14,border:0,borderRadius:10,minHeight:48,width:"100%",cursor:"pointer"}}>{busy?`Generando pregunta ${Math.min(progress+1,65)} de 65…`:jobId?`Reanudar desde ${progress}/65`:"Generar ensayo completo M1"}</button>
 <p role="status" style={{margin:0,alignSelf:"start",textAlign:"left"}}>Avance: {progress}/65 · {Math.round(progress/65*100)}%</p><div role="progressbar" aria-label="Progreso de generación PAES" aria-valuemin={0} aria-valuemax={65} aria-valuenow={Math.min(progress,65)} style={{height:12,width:"100%",maxWidth:560,background:"#e2e8f0",borderRadius:999,overflow:"hidden",marginTop:8}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,Math.round(progress/65*100)))}%`,background:"#0B9DAD",borderRadius:999,transition:"width .25s ease"}}/></div>
 </section>{busy&&saveMessage&&<p role="status">{saveMessage}</p>}{result?.error&&<p role="alert" style={{color:"#b91c1c"}}>{result.error}</p>}
 {result?.exam&&<section style={{background:"white",padding:24,borderRadius:16,marginTop:24}}><h2>Ensayo generado: {result.exam.items.length} preguntas</h2><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><button onClick={()=>print(result.studentHtml)}>Abrir prueba estudiante · imprimir PDF</button><button onClick={()=>print(result.teacherHtml)}>Abrir solucionario docente · imprimir PDF</button><button disabled={!result.jobId} onClick={async()=>{if(!result.jobId)return;setSaveMessage("Guardando…");try{const response=await fetch("/api/paes/saved",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jobId:result.jobId})});const data=await response.json();setSaveMessage(response.ok?"Ensayo guardado en Mi carpeta.":data.error||"No se pudo guardar.");}catch{setSaveMessage("Error al guardar.");}}}>Guardar en Mi carpeta</button><Link href="/ensayos-paes/carpeta">Ver Mi carpeta PAES</Link></div>{saveMessage&&<p role="status">{saveMessage}</p>}{result.exam.items.map((q,i)=><article key={q.id} style={{borderTop:"1px solid #ddd",padding:"16px 0"}}><strong>{i+1}. {q.stem}</strong><ol type="A">{q.options.map((o,j)=><li key={j}>{o}</li>)}</ol><p><strong>Clave:</strong> {"ABCD"[q.correctIndex]} · {q.solution}</p></article>)}</section>}
 </div></main>;
}
