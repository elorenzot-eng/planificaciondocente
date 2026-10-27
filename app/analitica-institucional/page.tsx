"use client";
import {useEffect,useState} from "react";
type License={product:string;grade:string;subject:string;studentCount:number;pdfLimit:number;pdfUsed:number;reviewLimit:number;reviewsUsed:number};
type School={id:string;name:string;rbd:string|null;licenses:License[]};
export default function AnaliticaInstitucional(){
 const [schools,setSchools]=useState<School[]>([]);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [selectedSchool,setSelectedSchool]=useState("all");
 const visibleSchools=selectedSchool==="all"?schools:schools.filter(s=>s.id===selectedSchool);
 const totals=visibleSchools.flatMap(s=>s.licenses).reduce((a,l)=>({students:a.students+l.studentCount,exams:a.exams+l.pdfUsed,examLimit:a.examLimit+l.pdfLimit,reviews:a.reviews+l.reviewsUsed,reviewLimit:a.reviewLimit+l.reviewLimit}),{students:0,exams:0,examLimit:0,reviews:0,reviewLimit:0});
 useEffect(()=>{fetch("/api/analitica-institucional",{cache:"no-store"}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||"Error de acceso");setSchools(j.schools||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <main style={{maxWidth:1100,margin:"auto",padding:24}}>
 <h1>Analítica institucional</h1>
 <p>Informe de gestión de licencias · Fecha de emisión: {new Date().toLocaleDateString("es-CL")}</p>
 <label>Establecimiento: <select value={selectedSchool} onChange={e=>setSelectedSchool(e.target.value)}><option value="all">Todos los establecimientos autorizados</option>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 <div style={{display:"flex",gap:12,flexWrap:"wrap",margin:"16px 0"}}><strong>Estudiantes contratados: {totals.students}</strong><strong>Ensayos utilizados: {totals.exams} / {totals.examLimit}</strong><strong>Revisiones: {totals.reviews} / {totals.reviewLimit}</strong></div>
 <button type="button" onClick={()=>window.print()} style={{padding:"10px 16px",background:"#087e88",color:"white",border:0,borderRadius:8,cursor:"pointer"}}>Descargar informe en PDF</button>
 <p style={{fontSize:12}}>Al abrir la impresión, selecciona «Guardar como PDF». El informe contiene únicamente los datos autorizados que se muestran en pantalla.</p>
 <p>Licencias y utilización de ensayos SIMCE y PAES de tus establecimientos autorizados.</p>
 {loading?<p>Cargando datos…</p>:error?<p role="alert">{error}</p>:schools.length===0?<p>No hay establecimientos disponibles para tu cuenta.</p>:visibleSchools.map(s=><section key={s.id} style={{border:"1px solid #d8e1e6",borderRadius:12,padding:20,marginTop:16}}>
 <h2>{s.name}</h2><p>RBD: {s.rbd||"Sin registro"}</p>
 {s.licenses.length===0?<p>Sin licencias vigentes.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}><thead><tr><th>Producto</th><th>Nivel</th><th>Asignatura</th><th>Estudiantes</th><th>Ensayos</th><th>Revisiones</th></tr></thead><tbody>{s.licenses.map((l,i)=><tr key={i}><td>{l.product}</td><td>{l.grade}</td><td>{l.subject}</td><td>{l.studentCount}</td><td>{l.pdfUsed} / {l.pdfLimit}</td><td>{l.reviewsUsed} / {l.reviewLimit}</td></tr>)}</tbody></table></div>}
 </section>)}
 <h2>Utilización de licencias</h2>{visibleSchools.map(s=>{const used=s.licenses.reduce((n,l)=>n+l.pdfUsed,0);const limit=s.licenses.reduce((n,l)=>n+l.pdfLimit,0);return <div key={s.id} style={{marginBottom:12}}><span>{s.name}: {used} de {limit} ensayos</span><div style={{height:14,background:"#e7edf0",borderRadius:7,overflow:"hidden"}}><div style={{height:"100%",width:(limit?Math.min(100,used/limit*100):0)+"%",background:"#087e88"}}/></div></div>})}
 <p style={{marginTop:24}}>Los gráficos de rendimiento se habilitarán cuando los resultados de ensayos estén asociados y validados por establecimiento.</p>
 </main>
}
