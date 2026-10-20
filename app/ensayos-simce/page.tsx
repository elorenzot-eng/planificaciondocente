"use client";
import { useState } from "react";
const groups=[
{grade:"2",label:"2° básico",color:"#0EA5E9",bg:"#F0FAFE",items:[{title:"Precursores de lectura",module:"precursores"},{title:"Fluidez lectora",module:"fluidez"},{title:"Comprensión lectora",module:"cuadernillos"}]},
{grade:"4",label:"4° básico",color:"#9B59D0",bg:"#FAF5FF",items:[{title:"Ensayo SIMCE · Lectura",module:"simce-lectura"},{title:"Ensayo SIMCE · Matemática",module:"simce-matematica"}]},
{grade:"6",label:"6° básico",color:"#F0AD25",bg:"#FFFBF0",items:[{title:"Ensayo SIMCE · Lectura",module:"simce-lectura"},{title:"Ensayo SIMCE · Matemática",module:"simce-matematica"}]},
{grade:"8",label:"8° básico",color:"#10B981",bg:"#F1FCF7",items:[{title:"Ensayo SIMCE · Lectura",module:"simce-lectura"},{title:"Ensayo SIMCE · Matemática",module:"simce-matematica"}]}
];
export default function EnsayosSimcePage(){
 const [selected,setSelected]=useState<string|null>(null);
 return <main style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px",fontFamily:"system-ui,sans-serif",color:"#15324b"}}>
 <a href="/" style={{color:"#007e90"}}>← Volver a EducAntay</a>
 <h1>Ensayos SIMCE y Lectura</h1>
 <p>Selecciona el nivel y luego el recurso que deseas generar.</p>
 <nav aria-label="Seleccionar nivel" style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginTop:22}}>
 {groups.map(g=><button type="button" key={g.grade} onClick={()=>setSelected(v=>v===g.grade?null:g.grade)} aria-expanded={selected===g.grade} style={{border:"none",borderLeft:`5px solid ${g.color}`,borderRadius:12,background:g.bg,color:"#15324b",fontSize:18,fontWeight:600,padding:"14px 8px",cursor:"pointer",outline:selected===g.grade?`2px solid ${g.color}`:"none"}}>{g.label}</button>)}
 </nav>
 {groups.filter(g=>g.grade===selected).map(g=><section key={g.grade} style={{marginTop:25}}>
 <h2 style={{fontSize:20}}>{g.grade==="2"?"Lectura · 2° básico":`Ensayos SIMCE · ${g.label}`}</h2>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>
 {g.items.map(item=><a key={item.module} href={`/recursos-aprendizaje?modulo=${item.module}&nivel=${g.grade}`} style={{textDecoration:"none",color:"#15324b",background:g.bg,borderLeft:`5px solid ${g.color}`,borderRadius:12,padding:18,display:"block"}}>
 <strong>{item.title}</strong><p style={{color:"#007e90",fontSize:13}}>Abrir y seleccionar OA →</p></a>)}
 </div></section>)}
 <p style={{marginTop:28,fontSize:13,color:"#596b77"}}>Los ensayos tipo SIMCE son recursos originales no oficiales. Revisa las preguntas y su tabla de especificaciones antes de aplicarlos.</p>
 </main>;
}
