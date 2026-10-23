"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Result={error?:string;jobId?:string;status?:string;completed?:number;exam?:{items:Array<{id:string;stem:string;source?:string;options:string[];correctIndex:number;solution:string}>};studentHtml?:string;teacherHtml?:string};
const total=65;
function print(html?:string){if(!html)return;const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}
export default function HistoriaPaes(){
 const [difficulty,setDifficulty]=useState("Media"),[jobId,setJobId]=useState<string|null>(null),[progress,setProgress]=useState(0),[busy,setBusy]=useState(false),[result,setResult]=useState<Result|null>(null),[saveMessage,setSaveMessage]=useState("");
 const storageKey=`educantay-paes-historia-65-${difficulty}`;
 useEffect(()=>{setJobId(null);setProgress(0);setResult(null);try{const saved=window.localStorage.getItem(storageKey);if(saved){const data=JSON.parse(saved) as {jobId:string;progress:number};if(data.jobId&&Number.isInteger(data.progress)&&data.progress>=0&&data.progress<total){setJobId(data.jobId);setProgress(data.progress);}}}catch{/* Sin almacenamiento local. */}},[storageKey]);
 async function generate(){
  if(busy)return;setBusy(true);setResult(null);setSaveMessage("");let current=jobId;
  try{
   for(let i=0;i<total+2;i++){
    const response=await fetch("/api/paes/historia",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({difficulty,...(current?{jobId:current}:{})}),cache:"no-store"});
    const data=await response.json() as Result;
    if(data.jobId){current=data.jobId;setJobId(current);try{window.localStorage.setItem(storageKey,JSON.stringify({jobId:current,progress:typeof data.completed==="number"?data.completed:progress}));}catch{/* Continuar sin persistencia local. */}}
    if(typeof data.completed==="number")setProgress(data.completed);
    if(!response.ok){setResult({error:data.error||"No se pudo continuar."});return;}
    if(data.status==="COMPLETED"){
     setResult(data);setJobId(null);setProgress(total);try{window.localStorage.removeItem(storageKey);}catch{/* Sin almacenamiento. */}
     if(data.jobId){try{const saved=await fetch("/api/paes/saved",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jobId:data.jobId})});setSaveMessage(saved.ok?"Ensayo guardado automáticamente en Mi carpeta.":"No se pudo guardar automáticamente; utiliza Guardar.");}catch{setSaveMessage("No se pudo guardar automáticamente; utiliza Guardar.");}}
     return;
    }
   }
   setResult({error:"Se alcanzó el límite de solicitudes. Presiona reanudar para continuar."});
  }catch{setResult({error:"Conexión interrumpida. Puedes reanudar."});}finally{setBusy(false);}
 }
 return <main style={{minHeight:"100vh",background:"#f5f7fb",padding:"clamp(16px,4vw,48px)",fontFamily:"Arial,sans-serif",color:"#17233c"}}><div style={{maxWidth:1100,margin:"auto"}}>
 <Link href="/ensayos-paes" style={{color:"#c2410c",fontWeight:700,textDecoration:"none"}}>← Volver a Ensayos PAES</Link>
 <h1 style={{marginTop:28}}>PAES Historia y Ciencias Sociales IA</h1><p>Ensayo completo de 65 preguntas. Matriz interna experimental de EducAntay, no oficial DEMRE.</p>
 <section style={{background:"white",border:"1px solid #dce3ed",borderRadius:16,padding:24,marginTop:22}}>
 <h2 style={{marginTop:0}}>Configurar ensayo de Historia</h2><p>Ejes: Historia, Formación Ciudadana y Sistema Económico. Preguntas con análisis de fuentes, interpretación y pensamiento crítico.</p>
 <label>Dificultad<select value={difficulty} disabled={busy} onChange={e=>setDifficulty(e.target.value)} style={{display:"block",padding:12,marginTop:8,minWidth:200}}>{["Baja","Media","Alta","Mixta"].map(x=><option key={x}>{x}</option>)}</select></label>
 <button disabled={busy} onClick={generate} style={{marginTop:20,padding:"14px 20px",border:0,borderRadius:10,background:"#ea580c",color:"white",fontWeight:700,cursor:"pointer"}}>{busy?`Generando ${Math.min(progress+1,total)}/${total}…`:jobId?`Reanudar desde ${progress}/${total}`:"Generar ensayo completo Historia IA"}</button>
 <p role="status">Avance: {progress}/{total} · {Math.round(progress/total*100)}%</p>{result?.error&&<p role="alert" style={{color:"#b91c1c"}}>{result.error}</p>}
 </section>
 {result?.exam&&<section style={{background:"white",padding:24,borderRadius:16,marginTop:24}}><h2>Ensayo generado: {result.exam.items.length} preguntas</h2><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><button onClick={()=>print(result.studentHtml)}>Prueba estudiante · PDF</button><button onClick={()=>print(result.teacherHtml)}>Solucionario docente · PDF</button><button disabled={!result.jobId} onClick={async()=>{if(!result.jobId)return;setSaveMessage("Guardando…");try{const response=await fetch("/api/paes/saved",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jobId:result.jobId})});const data=await response.json();setSaveMessage(response.ok?"Ensayo guardado en Mi carpeta.":data.error||"No se pudo guardar.");}catch{setSaveMessage("No se pudo guardar.");}}}>Guardar en Mi carpeta</button><Link href="/ensayos-paes/carpeta">Ver Mi carpeta PAES</Link></div>{saveMessage&&<p role="status">{saveMessage}</p>}{result.exam.items.map((q,i)=><article key={q.id} style={{borderTop:"1px solid #ddd",padding:"16px 0"}}><strong>{i+1}. {q.stem}</strong>{q.source&&<blockquote>{q.source}</blockquote>}<ol type="A">{q.options.map((o,j)=><li key={j}>{o}</li>)}</ol><p><b>Clave:</b> {"ABCD"[q.correctIndex]} · {q.solution}</p></article>)}</section>}
 </div></main>;
}
