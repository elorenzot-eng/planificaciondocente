"use client";
import { useState } from "react";
import Link from "next/link";

type PilotResponse = {
  error?: string;
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
  const [token, setToken] = useState("");
  const [difficulty, setDifficulty] = useState("Media");
  const [questionCount, setQuestionCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PilotResponse | null>(null);
  const run = async () => {
    if (!token || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(questionCount === "65" ? "/api/paes/lectora/full-pilot" : "/api/paes/lectora/pilot", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-paes-pilot-token": token },
        body: JSON.stringify({ difficulty }),
        cache: "no-store",
      });
      const data = await response.json() as PilotResponse;
      setResult(response.ok ? data : { error: data.error || "No se pudo ejecutar el piloto." });
    } catch {
      setResult({ error: "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };
  return <main style={{fontFamily:"Arial,sans-serif",minHeight:"100vh",background:"#f5f7fb",padding:"clamp(16px,4vw,40px)",color:"#17233c"}}>
    <div style={{maxWidth:920,margin:"auto"}}>
      <Link href="/ensayos-paes" style={{color:"#0d9488"}}>← Volver a PAES</Link>
      <h1>Prueba privada PAES IA</h1>
      <p>Acceso restringido al equipo de validación. No corresponde a una prueba oficial DEMRE.</p>
      <section style={{background:"white",padding:24,borderRadius:16,display:"grid",gap:14}}>
        <label>Token privado de acceso<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} style={{display:"block",padding:12,width:"100%",boxSizing:"border-box",marginTop:6}} /></label>
        <label>Cantidad de preguntas<select value={questionCount} onChange={e=>setQuestionCount(e.target.value)} style={{display:"block",padding:12,marginTop:6}}><option value="10">10 preguntas · piloto validado</option><option value="65">65 preguntas · prueba interna experimental</option></select></label>
        <label>Dificultad<select value={difficulty} onChange={e=>setDifficulty(e.target.value)} style={{display:"block",padding:12,marginTop:6}}>{["Baja","Media","Alta","Mixta"].map(x=><option key={x}>{x}</option>)}</select></label>
        <button onClick={run} disabled={!token || loading} style={{padding:14,border:0,borderRadius:10,color:"white",background:!token||loading?"#94a3b8":"#0d9488",cursor:"pointer"}}>{loading?"Generando y validando…":`Generar prueba privada de ${questionCount} preguntas`}</button>
        <small>El token se utiliza solamente para esta solicitud; no se guarda en el navegador. La generación de 65 preguntas puede superar el tiempo máximo de respuesta de Railway. En ese caso, no se entregará un ensayo parcial. Si la solicitud falla, el sistema mostrará el error sin revelar credenciales.</small>
      </section>
      {result?.error && <p role="alert" style={{color:"#b91c1c"}}>{result.error}</p>}
      {result?.exam && <section style={{marginTop:24,background:"white",padding:24,borderRadius:16}}>
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
