"use client";
import {useEffect,useState} from "react";
type License={product:string;grade:string;subject:string;studentCount:number;pdfLimit:number;pdfUsed:number;reviewLimit:number;reviewsUsed:number};
type School={id:string;name:string;rbd:string|null;licenses:License[]};
export default function AnaliticaInstitucional(){
 const [schools,setSchools]=useState<School[]>([]);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/analitica-institucional",{cache:"no-store"}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||"Error de acceso");setSchools(j.schools||[])}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <main style={{maxWidth:1100,margin:"auto",padding:24}}>
 <h1>Analítica institucional</h1>
 <p>Licencias y utilización de ensayos SIMCE y PAES de tus establecimientos autorizados.</p>
 {loading?<p>Cargando datos…</p>:error?<p role="alert">{error}</p>:schools.length===0?<p>No hay establecimientos disponibles para tu cuenta.</p>:schools.map(s=><section key={s.id} style={{border:"1px solid #d8e1e6",borderRadius:12,padding:20,marginTop:16}}>
 <h2>{s.name}</h2><p>RBD: {s.rbd||"Sin registro"}</p>
 {s.licenses.length===0?<p>Sin licencias vigentes.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}><thead><tr><th>Producto</th><th>Nivel</th><th>Asignatura</th><th>Estudiantes</th><th>Ensayos</th><th>Revisiones</th></tr></thead><tbody>{s.licenses.map((l,i)=><tr key={i}><td>{l.product}</td><td>{l.grade}</td><td>{l.subject}</td><td>{l.studentCount}</td><td>{l.pdfUsed} / {l.pdfLimit}</td><td>{l.reviewsUsed} / {l.reviewLimit}</td></tr>)}</tbody></table></div>}
 </section>)}
 <p style={{marginTop:24}}>Los gráficos de rendimiento se habilitarán cuando los resultados de ensayos estén asociados y validados por establecimiento.</p>
 </main>
}
