"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Electivo="Biología"|"Física"|"Química";
type Result={error?:string;jobId?:string;status?:string;completed?:number;exam?:{items:Array<{id:string;stem:string;options:string[];correctIndex:number;solution:string}>};studentHtml?:string;teacherHtml?:string};
const subjects:Electivo[]=["Biología","Física","Química"];
function print(html?:string){if(!html)return;const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}
export default function CienciasPaes(){
 const [elective,setElective]=useState<Electivo>("Biología"),[difficulty,setDifficulty]=useState("Media"),[jobId,setJobId]=useState<string|null>(null),[progress,setProgress]=useState(0),[busy,setBusy]=useState(false),[result,setResult]=useState<Result|null>(null);
 const storageKey=`educantay-paes-ciencias-${elective}-${difficulty}`;
 useEffect(()=>{try{const saved=window.localStorage.getItem(storageKey);if(saved){const data=JSON.parse(saved) as {jobId:string;progress:number};if(data.jobId&&Number.isInteger(data.progress)&&data.progress>=0&&data.progress<12){setJobId(data.jobId);setProgress(data.progress);}}}catch{/* La generación puede iniciarse de nuevo. */}},[storageKey]);
 function reset(){try{window.localStorage.removeItem(storageKey);}catch{/* Almacenamiento no disponible. */}setJobId(null);setProgress(0);setResult(null);}
 async function generate(){
  if(busy)return;setBusy(true);setResult(null);let current=jobId;
  try{
   for(let i=0;i<14;i++){
    const response=await fetch("/api/paes/ciencias/pilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({elective,difficulty,...(current?{jobId:current}:{})}),cache:"no-store"});
    const data=await response.json() as Result;
    if(data.jobId){current=data.jobId;setJobId(current);try{window.localStorage.setItem(storageKey,JSON.stringify({jobId:current,progress:typeof data.completed==="number"?data.completed:progress}));}catch{/* Continuar sin persistencia local. */}}
    if(typeof data.completed==="number")setProgress(data.completed);
    if(!response.ok){setResult({error:data.error||"No se pudo continuar."});return;}
    if(data.status==="COMPLETED"){setResult(data);setJobId(null);setProgress(12);try{window.localStorage.removeItem(storageKey);}catch{/* Sin almacenamiento. */}return;}
   }
   setResult({error:"Presiona reanudar para continuar."});
  }catch{setResult({error:"Conexión interrumpida. Puedes reanudar."});}finally{setBusy(false);}
 }
 return <main style={{minHeight:"100vh",background:"#f5f7fb",padding:"clamp(16px,4vw,48px)",fontFamily:"Arial,sans-serif",color:"#17233c"}}><div style={{maxWidth:1100,margin:"auto"}}>
 <Link href="/ensayos-paes" style={{color:"#15803d",fontWeight:700,textDecoration:"none"}}>← Volver a Ensayos PAES</Link>
 <h1 style={{marginTop:28}}>PAES Ciencias IA</h1><p>Piloto de 12 preguntas: seis del módulo común y seis del electivo. Matriz experimental de EducAntay, no oficial DEMRE.</p>
 <section style={{background:"white",border:"1px solid #dce3ed",borderRadius:16,padding:24,marginTop:22}}>
 <h2 style={{marginTop:0}}>Selecciona la prueba de Ciencias</h2><p>La PAES de Ciencias combina un módulo común de Biología, Física y Química con un módulo electivo de la disciplina que elijas.</p><div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{subjects.map(s=><button key={s} onClick={()=>{setElective(s);reset();}} aria-pressed={elective===s} disabled={busy} style={{padding:"13px 20px",borderRadius:10,border:elective===s?"2px solid #15803d":"1px solid #cbd5e1",background:elective===s?"#ecfdf3":"white",fontWeight:700,cursor:"pointer"}}>{s}</button>)}</div>
 <p style={{marginTop:14,color:"#475569"}}><b>Prueba seleccionada:</b> Ciencias · Módulo común + electivo de {elective}</p><label style={{display:"block",marginTop:20}}>Dificultad<select value={difficulty} disabled={busy} onChange={e=>{setDifficulty(e.target.value);reset();}} style={{display:"block",padding:12,marginTop:8,minWidth:200}}>{["Baja","Media","Alta","Mixta"].map(x=><option key={x}>{x}</option>)}</select></label>
 <button disabled={busy} onClick={generate} style={{marginTop:20,padding:"14px 20px",border:0,borderRadius:10,background:"#15803d",color:"white",fontWeight:700,cursor:"pointer"}}>{busy?`Generando ${Math.min(progress+1,12)}/12…`:jobId?`Reanudar desde ${progress}/12`:"Generar piloto Ciencias IA"}</button>
 <p role="status">Avance: {progress}/12 · {Math.round(progress/12*100)}%</p>
 {result?.error&&<p role="alert" style={{color:"#b91c1c"}}>{result.error}</p>}
 </section>
 {result?.exam&&<section style={{background:"white",padding:24,borderRadius:16,marginTop:24}}><h2>Ensayo generado: {result.exam.items.length} preguntas</h2><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><button onClick={()=>print(result.studentHtml)}>Prueba estudiante · PDF</button><button onClick={()=>print(result.teacherHtml)}>Solucionario docente · PDF</button></div>{result.exam.items.map((q,i)=><article key={q.id} style={{borderTop:"1px solid #ddd",padding:"16px 0"}}><strong>{i+1}. {q.stem}</strong><ol type="A">{q.options.map((o,j)=><li key={j}>{o}</li>)}</ol><p><b>Clave:</b> {"ABCD"[q.correctIndex]} · {q.solution}</p></article>)}</section>}
 </div></main>;
}
