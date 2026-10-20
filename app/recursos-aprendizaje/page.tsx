"use client";
import { useMemo, useState } from "react";

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
  const [difficulty, setDifficulty] = useState("Intermedio");
  const [quantity, setQuantity] = useState(10);
  const [oa, setOa] = useState("");
  const [mode, setMode] = useState("Práctica");
  const selected = useMemo(() => modules.find(m => m.id === moduleId)!, [moduleId]);
  return <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px", fontFamily: "system-ui, sans-serif", color: "#15324b" }}>
    <a href="/" style={{ color: "#007e90" }}>← Volver a EducAntay</a>
    <h1>Recursos de Aprendizaje IA</h1>
    <p>Configura materiales pedagógicos para 2° y 4° básico. Esta sección está en preparación y todavía no genera ni guarda recursos.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
      {modules.map(m => <button key={m.id} onClick={() => setModuleId(m.id)} aria-pressed={moduleId === m.id} style={{ textAlign: "left", border: moduleId === m.id ? "2px solid #00a6a6" : "1px solid #d6e1e7", background: moduleId === m.id ? "#eaf8f8" : "white", borderRadius: 14, padding: 18, cursor: "pointer", color: "inherit" }}>
        <strong>{m.title}</strong><div style={{ marginTop: 8 }}>{m.grade}</div><small>{m.description}</small>
      </button>)}
    </div>
    <section style={{ marginTop: 28, padding: 22, border: "1px solid #d6e1e7", borderRadius: 14 }}>
      <h2>Configuración: {selected.title}</h2>
      <p>Nivel: {selected.grade}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
        <label>Objetivo de Aprendizaje (OA)<input value={oa} onChange={e => setOa(e.target.value)} placeholder="Código o descripción del OA" style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }}/></label>
        <label>Dificultad<select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ display: "block", width: "100%", padding: 10 }}><option>Inicial</option><option>Intermedio</option><option>Avanzado</option></select></label>
        <label>Cantidad de actividades o preguntas<input type="number" min={1} max={40} value={quantity} onChange={e => setQuantity(Math.max(1,Math.min(40,Number(e.target.value)||1)))} style={{ display: "block", width: "100%", padding: 10, boxSizing: "border-box" }}/></label>
        {moduleId.startsWith("simce") && <label>Modalidad<select value={mode} onChange={e => setMode(e.target.value)} style={{ display: "block", width: "100%", padding: 10 }}><option>Diagnóstico</option><option>Práctica</option><option>Simulacro</option></select></label>}
      </div>
      <p style={{ marginTop: 20, background: "#f2f6f8", padding: 14, borderRadius: 10 }}><strong>Vista previa de configuración:</strong> {selected.grade} · {difficulty} · {quantity} actividades{oa ? ` · OA: ${oa}` : ""}{moduleId.startsWith("simce") ? ` · ${mode}` : ""}.</p>
      <button type="button" disabled style={{ padding: "12px 20px", borderRadius: 10 }}>Generar con IA — próximamente</button>
      <p><small>Los ensayos tipo SIMCE serán originales y no oficiales. La publicación, exportación y registro de resultados se habilitarán tras la integración con autenticación, IA y Mi Carpeta.</small></p>
    </section>
  </main>;
}
