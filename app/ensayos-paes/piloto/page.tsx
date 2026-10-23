"use client";
import { useState } from "react";
import Link from "next/link";

type PilotResponse = {
  error?: string;
  jobId?: string;
  completed?: number;
  total?: number;
  status?: string;
  count?: number;
  warnings?: string[];
  exam?: { texts?: Array<{id:string;body:string}>; items?: Array<{id:string;stem:string;options:string[];correctIndex:number;rationale:string}> };
  studentHtml?: string;
  teacherHtml?: string;
};
function openPrint(html?: string) {
  if (!html) return;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export default function PaesPilot() {
  const [difficulty, setDifficulty] = useState("Media");
  const [questionCount, setQuestionCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<PilotResponse | null>(null);
  const run = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);
    try {
      let currentJobId = questionCount === "65" ? jobId : null;
      // Cada solicitud genera un grupo y guarda el progreso en PostgreSQL.
      // Si hay un error, se puede reintentar desde el último grupo validado.
      for (let step = 0; step < (questionCount === "65" ? 31 : 1); step++) {
        const response = await fetch(questionCount === "65" ? "/api/paes/lectora/full-pilot" : "/api/paes/lectora/pilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty, ...(currentJobId ? { jobId: currentJobId } : {}) }),
          cache: "no-store",
        });
        const data = await response.json() as PilotResponse;
        if (data.jobId && questionCount === "65") {
          currentJobId = data.jobId;
          setJobId(data.jobId);
        }
        if (typeof data.completed === "number") setProgress(data.completed);
        if (!response.ok) {
          setResult({ error: data.error || "No se pudo completar el grupo." });
          return;
        }
        if (data.status === "COMPLETED" || questionCount === "10") {
          setResult(data);
          if (questionCount === "65") { setJobId(null); setProgress(30); }
          return;
        }
      }
      setResult({ error: "El proceso requiere continuación. Presiona generar nuevamente." });
    } catch {
      setResult({ error: "Se interrumpió la conexión. Presiona generar nuevamente para reanudar." });
    } finally {
      setLoading(false);
    }
  };
  return <main style={{fontFamily:"Arial,sans-serif",minHeight:"100vh",background:"#f5f7fb",padding:"clamp(16px,3vw,36px)",color:"#17233c",width:"100%",boxSizing:"border-box"}}>
    <div style={{maxWidth:1600,width:"100%",margin:"auto"}}>
      <Link href="/ensayos-paes" style={{color:"#0d9488"}}>← Volver a PAES</Link>
      <h1>Prueba privada PAES IA</h1>
      <p>Acceso restringido al equipo de validación. No corresponde a una prueba oficial DEMRE.</p>
      <section style={{background:"white",padding:"clamp(18px,2vw,30px)",borderRadius:16,display:"grid",gap:14,gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",alignItems:"end"}}>
        <label>Cantidad de preguntas<select value={questionCount} onChange={e=>{setQuestionCount(e.target.value);setJobId(null);setProgress(0);}} style={{display:"block",padding:12,marginTop:6,width:"100%",boxSizing:"border-box",minHeight:46}}><option value="10">10 preguntas · piloto validado</option><option value="65">65 preguntas · prueba interna experimental</option></select></label>
        <label>Dificultad<select value={difficulty} onChange={e=>{setDifficulty(e.target.value);setJobId(null);setProgress(0);}} style={{display:"block",padding:12,marginTop:6}}>{["Baja","Media","Alta","Mixta"].map(x=><option key={x}>{x}</option>)}</select></label>
        <button onClick={run} disabled={loading} style={{padding:14,border:0,borderRadius:10,minHeight:48,color:"white",background:loading?"#94a3b8":"#0d9488",cursor:"pointer"}}>{loading && questionCount === "65" ? `Generando grupo ${Math.min(progress+1,30)} de 30…` : loading ? "Generando y validando…" : jobId ? `Reanudar generación (${progress}/30 grupos)` : `Generar prueba privada de ${questionCount} preguntas`}</button>
        {questionCount === "65" && <p role="status">Progreso: {progress} de 30 grupos validados · {Math.round(progress/30*100)}%</p>}
        <small style={{gridColumn:"1 / -1"}}>Inicia sesión en EducAntay para generar ensayos. El acceso se controla en el servidor.</small>
      </section>
      {result?.error && <p role="alert" style={{color:"#b91c1c"}}>{result.error}</p>}
      {result?.exam && <section style={{marginTop:24,background:"white",padding:"clamp(18px,2vw,30px)",borderRadius:16}}>
        <h2>Resultado: {result.count} preguntas</h2>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <button onClick={()=>openPrint(result.studentHtml)}>Abrir versión estudiante</button>
          <button onClick={()=>openPrint(result.teacherHtml)}>Abrir versión profesor</button>
        </div>
        {result.warnings?.map((w,i)=><p key={i} style={{color:"#92400e"}}>{w}</p>)}
        <h3>Textos del ensayo</h3>
        {result.exam.texts?.map((t,i)=><article key={t.id||i} style={{whiteSpace:"pre-wrap",padding:"12px 0",borderTop:"1px solid #e2e8f0"}}><strong>Texto {i+1}</strong><p>{t.body}</p></article>)}
        <h3>Preguntas y pautas de corrección</h3>
        {result.exam.items?.map((q,i)=><article key={q.id||i} style={{borderTop:"1px solid #e2e8f0",marginTop:18,paddingTop:14}}>
          <strong>{i+1}. {q.stem}</strong>
          <ol type="A">{q.options.map((o,j)=><li key={j}>{o}</li>)}</ol>
          <p><strong>Clave:</strong> {String.fromCharCode(65+q.correctIndex)}. <strong>Fundamento:</strong> {q.rationale}</p>
        </article>)}
      </section>}
    </div>
  </main>;
}
