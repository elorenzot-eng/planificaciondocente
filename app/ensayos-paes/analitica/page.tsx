"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Summary={course:string;subject:string;attempts:number;students:number;accuracyPercent:number|null};
type Report={totalAttempts:number;uniqueStudents:number;summary:Summary[];error?:string};
export default function PaesAnalytics(){
 const [data,setData]=useState<Report|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/paes/analytics",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"No se pudo cargar.");setData(d);}).catch(e=>setError(e instanceof Error?e.message:"Error de conexión")).finally(()=>setLoading(false));},[]);
 return <main style={{padding:"clamp(18px,4vw,48px)",background:"#f5f7fb",minHeight:"100vh",color:"#17233c",fontFamily:"Arial,sans-serif"}}>
 <Link href="/ensayos-paes">← Ensayos PAES</Link><h1>Analítica institucional PAES IA</h1><p>Resultados de evaluaciones corregidas y registradas en el establecimiento. Los ensayos generados sin corrección no se contabilizan como resultados.</p>
 {loading&&<p role="status">Cargando resultados…</p>}{error&&<p role="alert">{error}</p>}
 {data&&<><div style={{display:"flex",gap:16,flexWrap:"wrap"}}><section style={{padding:20,background:"white",borderRadius:14}}><strong>Evaluaciones registradas</strong><h2>{data.totalAttempts}</h2></section><section style={{padding:20,background:"white",borderRadius:14}}><strong>Estudiantes evaluados</strong><h2>{data.uniqueStudents}</h2></section></div>
 {data.summary.length===0?<p>No existen resultados PAES registrados para este establecimiento. Primero se deben corregir y guardar las hojas de respuestas.</p>:<div style={{overflowX:"auto",background:"white",borderRadius:14,marginTop:24,padding:16}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}><thead><tr><th>Curso</th><th>Prueba</th><th>Evaluaciones</th><th>Estudiantes</th><th>Respuestas correctas</th></tr></thead><tbody>{data.summary.map((r,i)=><tr key={i}>{[r.course,r.subject,r.attempts,r.students,r.accuracyPercent===null?"Sin datos":r.accuracyPercent+"%"].map((v,j)=><td key={j} style={{padding:"12px 8px",borderTop:"1px solid #e2e8f0"}}>{v}</td>)}</tr>)}</tbody></table></div>}
 <p style={{fontSize:13,color:"#64748b"}}>El porcentaje corresponde a respuestas correctas sobre preguntas respondidas, no a un puntaje DEMRE ni a un nivel de logro oficial.</p></>}
 </main>;
}
