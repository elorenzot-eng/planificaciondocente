"use client";
import Link from "next/link";
import {useState} from "react";
type Electivo="Biología"|"Física"|"Química";
const subjects:Electivo[]=["Biología","Física","Química"];
export default function CienciasPaes(){
 const [electivo,setElectivo]=useState<Electivo>("Biología");
 return <main style={{minHeight:"100vh",background:"#f5f7fb",padding:"clamp(16px,4vw,48px)",fontFamily:"Arial,sans-serif",color:"#17233c"}}>
 <div style={{maxWidth:1000,margin:"auto"}}>
 <Link href="/ensayos-paes" style={{color:"#15803d",fontWeight:700,textDecoration:"none"}}>← Volver a Ensayos PAES</Link>
 <h1 style={{marginTop:28}}>PAES Ciencias IA</h1>
 <p>Preparación de ensayos con módulo común de Ciencias y módulo electivo de profundización. Material original de práctica, no oficial DEMRE.</p>
 <section style={{background:"#fff",border:"1px solid #dce3ed",borderRadius:16,padding:24,marginTop:22}}>
 <h2 style={{marginTop:0}}>Selecciona tu módulo electivo</h2>
 <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{subjects.map(subject=><button key={subject} onClick={()=>setElectivo(subject)} aria-pressed={electivo===subject} style={{padding:"13px 20px",borderRadius:10,border:electivo===subject?"2px solid #15803d":"1px solid #cbd5e1",background:electivo===subject?"#ecfdf3":"white",fontWeight:700,cursor:"pointer"}}>{subject}</button>)}</div>
 <h3>Configuración seleccionada: Ciencias · {electivo}</h3>
 <p>La estructura contemplará preguntas del módulo común (Biología, Física y Química) y preguntas del electivo de {electivo}, con solucionario desarrollado y tabla de especificaciones al final.</p>
 <p style={{color:"#64748b",fontSize:14}}>Generación IA en desarrollo. Se habilitará tras implementar y validar los ejes, distribución y revisión de respuestas.</p>
 </section></div></main>;
}
