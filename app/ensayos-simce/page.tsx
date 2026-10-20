"use client";
import { useState } from "react";

const secondGrade = [
  { title: "Precursores de la lectura", description: "Conciencia fonológica, sonidos, sílabas, decodificación y vocabulario.", module: "precursores", icon: "🔤" },
  { title: "Cuadernillos de comprensión lectora", description: "Textos originales, actividades secuenciadas y preguntas de comprensión.", module: "cuadernillos", icon: "📖" },
  { title: "Fluidez lectora", description: "Lecturas graduadas, precisión, ritmo y seguimiento docente.", module: "fluidez", icon: "📚" },
];
const fourthGrade = [
  { title: "Matemática", description: "Ensayos tipo SIMCE de matemática para 4° básico.", module: "simce-matematica", icon: "📘" },
  { title: "Lectura", description: "Ensayos tipo SIMCE de lectura para 4° básico.", module: "simce-lectura", icon: "📗" },
];
export default function EnsayosSimcePage() {
  const [grade, setGrade] = useState<"2"|"4"|null>(null);
  const items = grade === "2" ? secondGrade : fourthGrade;
  return <main style={{maxWidth:1040,margin:"0 auto",padding:"32px 20px",fontFamily:"system-ui,sans-serif",color:"#15324b"}}>
    <a href="/" style={{color:"#007e90"}}>← Volver al Centro de Mando</a>
    <h1>Ensayos SIMCE y Lectura</h1>
    <p>Selecciona el nivel para acceder a cuadernillos de lectura o ensayos originales de práctica.</p>
    <nav aria-label="Carpetas por nivel" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16,marginTop:28}}>
      <button type="button" onClick={()=>setGrade("2")} aria-expanded={grade==="2"} style={{textAlign:"left",border:grade==="2"?"2px solid #00a6a6":"1px solid #cbdde5",borderRadius:16,padding:22,background:grade==="2"?"#e9f8f8":"white",color:"inherit",cursor:"pointer"}}>
        <span aria-hidden="true" style={{fontSize:32}}>📁</span><h2>2° básico</h2><p>Cuadernillos y actividades para aprender y comprender lo que se lee.</p>
      </button>
      <button type="button" onClick={()=>setGrade("4")} aria-expanded={grade==="4"} style={{textAlign:"left",border:grade==="4"?"2px solid #00a6a6":"1px solid #cbdde5",borderRadius:16,padding:22,background:grade==="4"?"#e9f8f8":"white",color:"inherit",cursor:"pointer"}}>
        <span aria-hidden="true" style={{fontSize:32}}>📁</span><h2>4° básico</h2><p>Ensayos tipo SIMCE de Matemática y Lectura.</p>
      </button>
    </nav>
    {grade && <section style={{marginTop:26}}>
      <h2>📂 {grade}° básico — {grade==="2"?"Lectura y comprensión":"Ensayos tipo SIMCE"}</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16}}>
        {items.map(item=><a key={item.module} href={`/recursos-aprendizaje?modulo=${item.module}&nivel=${grade}`} style={{border:"1px solid #cbdde5",borderRadius:14,padding:22,textDecoration:"none",color:"inherit",background:"#fff"}}>
          <span style={{fontSize:28}}>{item.icon}</span><h3>{item.title}</h3><p>{item.description}</p><strong style={{color:"#007e90"}}>Abrir →</strong>
        </a>)}
      </div>
      <p style={{marginTop:20,fontSize:13,color:"#596b77"}}>Los recursos se generan con IA para revisión docente. Los ensayos tipo SIMCE son originales y no oficiales.</p>
    </section>}
  </main>;
}
