"use client";
import {useState} from "react";
import Link from "next/link";
type Result={error?:string;jobId?:string;status?:string;completed?:number;total?:number;exam?:{items:Array<{id:string;stem:string;options:string[];correctIndex:number;solution:string;verification:string}>};studentHtml?:string;teacherHtml?:string};
function print(html?:string){if(!html)return;const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}
export default function M1Pilot(){
 const [token,setToken]=useState(""),[difficulty,setDifficulty]=useState("Media"),[jobId,setJobId]=useState<string|null>(null),[progress,setProgress]=useState(0),[busy,setBusy]=useState(false),[result,setResult]=useState<Result|null>(null);
 async function run(){
  if(!token||busy)return;setBusy(true);setResult(null);let current=jobId;
  try{
   for(let i=0;i<66;i++){
    const response=await fetch("/api/paes/m1/full-pilot",{method:"POST",headers:{"Content-Type":"application/json","x-paes-pilot-token":token},body:JSON.stringify({difficulty,...(current?{jobId:current}:{})}),cache:"no-store"});
    const data=await response.json() as Result;
    if(data.jobId){current=data.jobId;setJobId(current);}
    if(typeof data.completed==="number")setProgress(data.completed);
    if(!response.ok){setResult({error:data.error||"No se pudo continuar."});return;}
    if(data.status==="COMPLETED"){setResult(data);setJobId(null);setProgress(65);return;}
   }
   setResult({error:"Presiona continuar para completar el proceso."});
  }catch{setResult({error:"Se interrumpió la conexión. Presiona reanudar para continuar."});}
  finally{setBusy(false);}
 }
 return <main style={{minHeight:"100vh",background:"#f5f7fb",fontFamily:"Arial,sans-serif",color:"#17233c",padding:"clamp(16px,3vw,36px)"}}><div style={{maxWidth:1600,margin:"auto"}}>
 <Link href="/ensayos-paes">← Volver a PAES</Link><h1>PAES Matemática M1 · 65 preguntas</h1><p>Generación experimental restringida. 140 minutos · 60 preguntas consideradas para puntaje en la PAES oficial. No es material oficial DEMRE.</p>
 <section style={{background:"white",borderRadius:16,padding:24,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:16,alignItems:"end"}}>
 <label>Token privado<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} style={{display:"block",width:"100%",boxSizing:"border-box",padding:12,marginTop:8}}/></label>
 <label>Dificultad<select value={difficulty} onChange={e=>{setDifficulty(e.target.value);setJobId(null);setProgress(0);setResult(null);}} style={{display:"block",width:"100%",padding:12,marginTop:8}}>{["Baja","Media","Alta","Mixta"].map(x=><option key={x}>{x}</option>)}</select></label>
 <button disabled={!token||busy} onClick={run} style={{background:"#0d9488",color:"white",padding:14,border:0,borderRadius:10,cursor:"pointer"}}>{busy?`Generando pregunta ${Math.min(progress+1,65)} de 65…`:jobId?`Reanudar desde ${progress}/65`:"Generar ensayo completo M1"}</button>
 <p role="status">Avance: {progress}/65 · {Math.round(progress/65*100)}%</p>
 </section>{result?.error&&<p role="alert" style={{color:"#b91c1c"}}>{result.error}</p>}
 {result?.exam&&<section style={{background:"white",padding:24,borderRadius:16,marginTop:24}}><h2>Ensayo generado: {result.exam.items.length} preguntas</h2><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><button onClick={()=>print(result.studentHtml)}>Abrir prueba estudiante · imprimir PDF</button><button onClick={()=>print(result.teacherHtml)}>Abrir solucionario docente · imprimir PDF</button></div>{result.exam.items.map((q,i)=><article key={q.id} style={{borderTop:"1px solid #ddd",padding:"16px 0"}}><strong>{i+1}. {q.stem}</strong><ol type="A">{q.options.map((o,j)=><li key={j}>{o}</li>)}</ol><p><strong>Clave:</strong> {"ABCD"[q.correctIndex]} · {q.solution}</p></article>)}</section>}
 </div></main>;
}
