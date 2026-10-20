"use client";
import { useEffect, useMemo, useState } from "react";

type ModuleKey = "precursores" | "cuadernillos" | "simce-lectura" | "simce-matematica" | "fluidez";
const modules: { id: ModuleKey; title: string; grade: string; description: string }[] = [
  { id: "precursores", title: "Precursores de la lectura", grade: "2° básico", description: "Conciencia fonológica, decodificación y vocabulario" },
  { id: "cuadernillos", title: "Cuadernillos de comprensión lectora", grade: "2° básico", description: "Textos originales y preguntas por habilidad" },
  { id: "simce-lectura", title: "Ensayos tipo SIMCE — Lectura", grade: "4° básico", description: "Diagnóstico, práctica y simulacro" },
  { id: "simce-matematica", title: "Ensayos tipo SIMCE — Matemática", grade: "4° básico", description: "Problemas por eje curricular" },
  { id: "fluidez", title: "Fluidez lectora", grade: "2° básico", description: "Registro docente de precisión y progreso" },
];
export default function RecursosAprendizajePage() {
  const [moduleId, setModuleId] = useState<ModuleKey>("precursores");
  const [grade, setGrade] = useState("4");
  useEffect(() => { const q = new URLSearchParams(window.location.search); const m=q.get("modulo"); const g=q.get("nivel"); if (m && modules.some(x=>x.id===m)) setModuleId(m as ModuleKey); if(g==="2"||g==="4") setGrade(g); }, []);
  const [difficulty, setDifficulty] = useState("Intermedio");
  const [quantity, setQuantity] = useState(10);
  const [oa, setOa] = useState("");
  const [mode, setMode] = useState("Práctica");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [resource, setResource] = useState<any>(null);
  const [resourceId, setResourceId] = useState<string | null>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [printTeacher, setPrintTeacher] = useState(false);
  async function loadSaved() {
    setError("");
    try {
      const response = await fetch("/api/recursos-aprendizaje", {cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudieron cargar los recursos");
      setSaved(data.resources || []); setShowSaved(true);
    } catch(e) { setError(e instanceof Error ? e.message : "Error de consulta"); }
  }
  function editActivity(index:number, field:string, value:string) {
    setResource((current:any) => ({...current,activities:current.activities.map((a:any,i:number)=>i===index?{...a,[field]:value}:a)}));
    setSavedMessage("");
  }
  function printVersion(teacher:boolean) {
    setPrintTeacher(teacher);
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }
  async function saveResource() {
    if (!resource) return;
    setSaving(true); setError(""); setSavedMessage("");
    try {
      const response = await fetch("/api/recursos-aprendizaje", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:resourceId,moduleId,grade,content:resource})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible guardar");
      if (data.resource?.id) setResourceId(data.resource.id);
      setSavedMessage("Borrador guardado correctamente.");
      if (showSaved) await loadSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Error al guardar"); }
    finally { setSaving(false); }
  }
  async function generate() {
    setLoading(true); setError(""); setSavedMessage(""); setResource(null); setResourceId(null);
    try {
      const response = await fetch("/api/recursos-aprendizaje/generar", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({moduleId,grade,difficulty,quantity,oa,mode}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error de generación");
      setResource(data.resource);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo generar"); }
    finally { setLoading(false); }
  }
  const selected = useMemo(() => modules.find(m => m.id === moduleId)!, [moduleId]);
  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", fontFamily: "system-ui, sans-serif", color: "#15324b" }}>
    <a className="no-print" href="/" style={{ color: "#007e90" }}>← Volver a EducAntay</a>
    <style>{`@media print { .no-print { display:none !important; } main { max-width:none !important; padding:0 !important; } .print-content { border:none !important; margin:0 !important; padding:0 !important; } .print-answers { display:${printTeacher ? "block" : "none"} !important; } .print-answers details { display:block; } .print-answers summary { display:none; } .print-answers details > * { display:block; } }`}</style>
    <h1 className="no-print">Recursos de Aprendizaje IA</h1>
    <p className="no-print">Configura, revisa y guarda recursos de aprendizaje. Puedes imprimir versiones para estudiantes y docentes.</p>
    <div className="no-print"><button type="button" onClick={loadSaved}>Ver mis recursos guardados</button>
      {showSaved && <section aria-label="Mis recursos guardados"><h2>Mis recursos guardados</h2>
        {saved.length===0 && <p>No hay recursos guardados.</p>}
        {saved.map(item => <button key={item.id} type="button" onClick={() => {setResource(item.content);setResourceId(item.id);setModuleId(item.moduleId);setGrade(item.grade==="2° básico"?"2":"4");setSavedMessage("");}} style={{display:"block",margin:"8px 0",padding:10}}>{item.title} · {item.grade}</button>)}
      </section>}
    </div>
    <div className="no-print" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
      {modules.map(m => <button key={m.id} onClick={() => setModuleId(m.id)} aria-pressed={moduleId === m.id} style={{ textAlign: "left", border: moduleId === m.id ? "2px solid #00a6a6" : "1px solid #d6e1e7", background: moduleId === m.id ? "#eaf8f8" : "white", borderRadius: 14, padding: 18, cursor: "pointer", color: "inherit" }}>
        <strong>{m.title}</strong><div style={{ marginTop: 8 }}>{m.grade}</div><small>{m.description}</small>
      </button>)}
    </div>
    <section className="print-content" style={{ marginTop: 28, padding: 22, border: "1px solid #d6e1e7", borderRadius: 14 }}>
      <h2 className="no-print">Configuración: {selected.title}</h2>
      <p className="no-print">Nivel: {moduleId.startsWith("simce") ? `${grade}° básico` : selected.grade}</p>
      {moduleId.startsWith("simce") && <div className="no-print"><label>Nivel <select value={grade} onChange={e=>setGrade(e.target.value)}><option value="2">2° básico</option><option value="4">4° básico</option></select></label></div>}
      <div className="no-print" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
        <label>Objetivo de Aprendizaje (OA)<input value={oa} onChange={e => setOa(e.target.value)} placeholder="Código o descripción del OA" style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }}/></label>
        <label>Dificultad<select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ display: "block", width: "100%", padding: 10 }}><option>Inicial</option><option>Intermedio</option><option>Avanzado</option></select></label>
        <label>Cantidad de actividades o preguntas<input type="number" min={1} max={40} value={quantity} onChange={e => setQuantity(Math.max(1,Math.min(40,Number(e.target.value)||1)))} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }}/></label>
        {moduleId.startsWith("simce") && <label>Modalidad<select value={mode} onChange={e => setMode(e.target.value)} style={{ display: "block", width: "100%", padding: 10 }}><option>Diagnóstico</option><option>Práctica</option><option>Simulacro</option></select></label>}
      </div>
      <p className="no-print" style={{ marginTop: 20, background: "#f2f6f8", padding: 14, borderRadius: 10 }}><strong>Vista previa de configuración:</strong> {selected.grade} · {difficulty} · {quantity} actividades{oa ? ` · OA: ${oa}` : ""}{moduleId.startsWith("simce") ? ` · ${mode}` : ""}.</p>
      <span className="no-print"><button type="button" disabled={loading} onClick={generate} style={{ padding: "12px 20px", borderRadius: 10, cursor: loading ? "wait" : "pointer" }}>{loading ? "Generando recurso IA…" : "Generar con IA"}</button></span>
      {error && <p role="alert" style={{ color: "#ad2828" }}>{error}</p>}
      {resource && <article className="print-content" style={{ marginTop: 20, padding: 18, border: "1px solid #d6e1e7", borderRadius: 12 }}>
        <h3>{resource.title}</h3><p>{resource.introduction}</p>
        <div className="no-print"><label>Título editable <input value={resource.title || ""} onChange={e=>{setResource({...resource,title:e.target.value});setSavedMessage("");}} /></label></div>
        {resource.activities?.map((a:any, i:number) => <section key={i} style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
          <h4>Actividad {i+1}: {a.skill}</h4><p>{a.stimulus}</p><p><strong>{a.question}</strong></p>
          <div className="no-print"><label>Editar pregunta <textarea value={a.question || ""} onChange={e=>editActivity(i,"question",e.target.value)} /></label></div>
          {a.options?.length > 0 && <ol type="A">{a.options.map((option:string,j:number)=><li key={j}>{option}</li>)}</ol>}
          <div className="print-answers"><details open><summary>Respuesta y orientación docente</summary><p>{a.correctAnswer}</p><p>{a.explanation}</p></details></div>
        </section>)}
        <div className="print-answers"><p>{resource.teacherNotes}</p></div>
        <div className="no-print"><button type="button" disabled={saving} onClick={saveResource}>{saving ? "Guardando…" : "Guardar borrador"}</button>{" "}
        <button type="button" onClick={() => printVersion(false)}>Imprimir estudiante / guardar PDF</button>{" "}
        <button type="button" onClick={() => printVersion(true)}>Imprimir profesor / guardar PDF</button>
        {savedMessage && <p role="status">{savedMessage}</p>}</div>
      </article>}
      <p className="no-print"><small>Los ensayos tipo SIMCE son originales y no oficiales. La exportación PDF se realiza mediante la opción «Guardar como PDF» del navegador. Los resultados por estudiante aún no están disponibles.</small></p>
    </section>
  </main>;
}
