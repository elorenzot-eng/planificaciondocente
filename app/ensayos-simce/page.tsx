"use client";
import { useState } from "react";

const grades = [
  { label: "2° básico", value: "2", description: "Ensayos de lectura y matemática adaptados al nivel" },
  { label: "4° básico", value: "4", description: "Ensayos tipo SIMCE de lectura y matemática" },
];
export default function EnsayosSimcePage() {
  const [grade, setGrade] = useState<string | null>(null);
  return <main style={{maxWidth:1040,margin:"0 auto",padding:"32px 20px",fontFamily:"system-ui,sans-serif",color:"#15324b"}}>
    <a href="/" style={{color:"#007e90"}}>← Volver al Centro de Mando</a>
    <h1>Ensayos SIMCE</h1>
    <p>Selecciona el nivel y luego la asignatura. Los ensayos son materiales originales de práctica, no instrumentos oficiales de la Agencia de Calidad de la Educación.</p>
    <nav aria-label="Carpetas por nivel" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16,marginTop:28}}>
      {grades.map(g=><button type="button" key={g.value} onClick={()=>setGrade(g.value)} aria-expanded={grade===g.value} style={{textAlign:"left",border:grade===g.value?"2px solid #00a6a6":"1px solid #cbdde5",borderRadius:16,padding:22,background:grade===g.value?"#e9f8f8":"white",color:"inherit",cursor:"pointer"}}>
        <span aria-hidden="true" style={{fontSize:32}}>📁</span><h2>{g.label}</h2><p>{g.description}</p>
      </button>)}
    </nav>
    {grade && <section style={{marginTop:26}}><h2>📂 {grade}° básico — Asignaturas</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16}}>
        <a href={`/recursos-aprendizaje?modulo=simce-matematica&nivel=${grade}`} style={{border:"1px solid #cbdde5",borderRadius:14,padding:22,textDecoration:"none",color:"inherit",background:"#fff"}}><span style={{fontSize:28}}>📘</span><h3>Matemática</h3><p>Generar ensayo, editar preguntas y guardar.</p><strong style={{color:"#007e90"}}>Abrir →</strong></a>
        <a href={`/recursos-aprendizaje?modulo=simce-lectura&nivel=${grade}`} style={{border:"1px solid #cbdde5",borderRadius:14,padding:22,textDecoration:"none",color:"inherit",background:"#fff"}}><span style={{fontSize:28}}>📗</span><h3>Lectura</h3><p>Generar ensayo, editar preguntas y guardar.</p><strong style={{color:"#007e90"}}>Abrir →</strong></a>
      </div>
    </section>}
  </main>;
}
