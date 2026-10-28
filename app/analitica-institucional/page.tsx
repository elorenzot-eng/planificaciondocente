"use client";
import {useEffect,useState} from "react";
type License={product:string;grade:string;subject:string;studentCount:number;pdfLimit:number;pdfUsed:number;reviewLimit:number;reviewsUsed:number};
type AcademicResult={studentId:string;course:string;subject:string;product:string;examId:string;examTitle:string;takenAt:string;correctAnswers:number;totalQuestions:number;score:number|null;skillResults:unknown;contentResults:unknown;achievementLevel:string|null;levelMethod:string|null};
type School={id:string;name:string;rbd:string|null;licenses:License[];academicResults:AcademicResult[]};
type SimceAction={foco?:string;accion?:string;responsable?:string;plazo?:string;indicador?:string;meta?:string;verificacion?:string};
type SimceReport={diagnostico:string;fortalezas?:string[];prioridades?:string[];acciones:SimceAction[];seguimiento?:string};

export default function AnaliticaInstitucional(){
 const [schools,setSchools]=useState<School[]>([]);
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 const [selectedSchool,setSelectedSchool]=useState("all");
 const [reportKey,setReportKey]=useState("");
 const [reportLoading,setReportLoading]=useState(false);
 const [reportError,setReportError]=useState("");
 const [report,setReport]=useState<SimceReport|null>(null);
 const [reportContext,setReportContext]=useState<{school:string;course:string;exam:string;date:string}|null>(null);
 const generateReport=async(schoolId:string,course:string,examId:string)=>{
  setReport(null);setReportContext(null);setReportError("");setReportKey([schoolId,course,examId].join("|"));setReportLoading(true);
  try{const response=await fetch("/api/analitica-institucional/informe-simce-ia",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({schoolId,course,examId})});
   const payload=await response.json();if(!response.ok)throw Error(payload.error||"No fue posible generar el informe");
   setReport(payload.report as SimceReport);
   setReportContext({school:schools.find(x=>x.id===schoolId)?.name||"Establecimiento",course,exam:examId,date:new Date().toLocaleDateString("es-CL")});
  }catch(e){setReportError(e instanceof Error?e.message:"Error de generación")}finally{setReportLoading(false)}
 };

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
 <h2>Resultados académicos por curso</h2>{visibleSchools.map(s=>{const groups=new Map<string,AcademicResult[]>();for(const x of s.academicResults||[]){const key=[x.course,x.product,x.subject].join(" · ");groups.set(key,[...(groups.get(key)||[]),x])}return <section key={s.id}><h3>{s.name}</h3>{groups.size===0?<p>Sin resultados académicos registrados.</p>:Array.from(groups.entries()).map(([key,items])=>{const valid=items.filter(x=>x.totalQuestions>0);const avg=valid.length?valid.reduce((n,x)=>n+x.correctAnswers/x.totalQuestions*100,0)/valid.length:null;return <div key={key} style={{padding:12,borderBottom:"1px solid #ddd"}}><strong>{key}</strong><p>{items.length} resultados registrados · Logro promedio: {avg===null?"Sin datos":avg.toFixed(1)+"%"}</p></div>})}</section>})}

 <h2>Análisis SIMCE por habilidades, contenidos y niveles</h2>
 <p>Informe académico basado en ensayos corregidos. Los porcentajes corresponden a respuestas correctas, no a puntajes SIMCE oficiales.</p>
 {visibleSchools.map(s=>{const simce=(s.academicResults||[]).filter(x=>x.product.toUpperCase().includes("SIMCE"));const courses=Array.from(new Set(simce.map(x=>x.course+" · "+x.examId)));return <section key={s.id}><h3>{s.name}</h3>{courses.length===0?<p>Sin resultados SIMCE registrados para analizar.</p>:courses.map(course=>{const items=simce.filter(x=>x.course+" · "+x.examId===course);const aggregate=(field:"skillResults"|"contentResults")=>{const map=new Map<string,{correct:number;total:number}>();for(const item of items){const value=item[field];if(!Array.isArray(value))continue;for(const row of value){if(!row||typeof row!=="object")continue;const v=row as Record<string,unknown>;const name=typeof v.name==="string"?v.name:"";const correct=Number(v.correct);const total=Number(v.total);if(!name||!Number.isFinite(correct)||!Number.isFinite(total)||total<=0||correct<0||correct>total)continue;const old=map.get(name)||{correct:0,total:0};map.set(name,{correct:old.correct+correct,total:old.total+total})}}return Array.from(map.entries()).map(([name,v])=>({name,percent:100*v.correct/v.total,total:v.total})).sort((a,b)=>a.percent-b.percent)};const skills=aggregate("skillResults"),contents=aggregate("contentResults");const levels=new Map<string,number>();for(const x of items){if(x.achievementLevel&&x.levelMethod)levels.set(x.achievementLevel,(levels.get(x.achievementLevel)||0)+1)}return <div key={course} style={{border:"1px solid #d8e1e6",borderRadius:12,padding:16,marginBottom:12}}><h4>{course} · {items.length} resultados</h4><h5>Habilidades evaluadas</h5>{skills.length?skills.map(v=><p key={v.name}>{v.name}: {v.percent.toFixed(1)}% ({v.total} respuestas evaluadas)</p>):<p>Sin desglose de habilidades registrado.</p>}<h5>Prioridades de reforzamiento</h5>{[...skills.map(x=>({...x,dimension:"Habilidad"})),...contents.map(x=>({...x,dimension:"Contenido"}))].sort((a,b)=>a.percent-b.percent).slice(0,5).map(x=><p key={x.dimension+x.name}>{x.dimension}: {x.name} — {x.percent.toFixed(1)}% de logro · revisar estrategias de enseñanza y práctica focalizada</p>)}{!skills.length&&!contents.length&&<p>Sin datos desagregados para identificar prioridades.</p>}<button type="button" disabled={reportLoading} onClick={()=>generateReport(s.id,items[0].course,items[0].examId)} style={{padding:"10px 16px",background:"#6d28d9",color:"white",border:0,borderRadius:9,cursor:"pointer",margin:"12px 0"}}>{reportLoading&&reportKey===[s.id,items[0].course,items[0].examId].join("|")?"Generando informe IA…":"Generar informe técnico-pedagógico IA"}</button>
 {reportKey===[s.id,items[0].course,items[0].examId].join("|")&&reportError&&<p role="alert">{reportError}</p>}
 {reportKey===[s.id,items[0].course,items[0].examId].join("|")&&report&&<article style={{border:"2px solid #0f9eac",borderRadius:12,padding:18,margin:"12px 0",background:"#f9fcff"}}>
 <h5>Informe técnico-pedagógico generado con IA</h5><p><strong>Establecimiento:</strong> {reportContext?.school} · <strong>Curso:</strong> {reportContext?.course} · <strong>Ensayo:</strong> {reportContext?.exam} · <strong>Fecha:</strong> {reportContext?.date}</p><p><strong>Diagnóstico:</strong> {report.diagnostico}</p>
 <h6>Fortalezas</h6>{(report.fortalezas||[]).map((x,i)=><p key={i}>{x}</p>)}
 <h6>Prioridades</h6>{(report.prioridades||[]).map((x,i)=><p key={i}>{x}</p>)}
 <h6>Plan de acciones</h6>{report.acciones.map((x,i)=><div key={i} style={{padding:10,borderBottom:"1px solid #dde4ea"}}><strong>{i+1}. {x.foco}</strong><p>{x.accion}</p><p>Responsable: {x.responsable||"Por definir"} · Plazo: {x.plazo||"Por definir"}</p><p>Indicador: {x.indicador||"Por definir"} · Meta: {x.meta||"Por definir"}</p><p>Verificación: {x.verificacion||"Por definir"}</p></div>)}
 <p><strong>Seguimiento:</strong> {report.seguimiento}</p><p style={{fontSize:12}}>Propuesta IA basada en ensayos internos. Validar con docentes y UTP antes de implementar. No representa resultados oficiales SIMCE.</p>
 <button type="button" onClick={()=>window.print()} style={{padding:"8px 12px",background:"#087e88",color:"white",border:0,borderRadius:8}}>Imprimir / Guardar como PDF</button>
 </article>}
 <h5>Informe técnico-pedagógico y plan de mejora</h5><p><strong>Diagnóstico:</strong> análisis descriptivo de {items.length} correcciones del ensayo, con foco en las dimensiones de menor porcentaje de respuestas correctas. No representa una medición oficial SIMCE.</p>{skills.length+contents.length===0?<p>Para emitir acciones focalizadas, registra la tabla de especificaciones del ensayo.</p>:[...skills.map(x=>({...x,dimension:"Habilidad"})),...contents.map(x=>({...x,dimension:"Contenido"}))].sort((a,b)=>a.percent-b.percent).slice(0,5).map((x,i)=><div key={"accion-"+x.dimension+x.name} style={{padding:12,marginBottom:10,background:"#f4f8fb",borderRadius:8}}><strong>Acción {i+1}: reforzar {x.dimension.toLowerCase()} «{x.name}»</strong><p><strong>Evidencia:</strong> {x.percent.toFixed(1)}% de logro sobre {x.total} respuestas evaluadas.</p><p><strong>Intervención:</strong> aplicar diagnóstico breve de errores, modelamiento docente explícito, práctica guiada diferenciada y retroalimentación individual con tareas graduadas.</p><p><strong>Responsables:</strong> docente de asignatura y UTP. <strong>Plazo sugerido:</strong> 4 semanas.</p><p><strong>Seguimiento:</strong> evaluación paralela de la misma dimensión al cierre del ciclo; comparar porcentaje de respuestas correctas y registrar acuerdos de ajuste pedagógico.</p></div>)}<p><strong>Seguimiento institucional:</strong> revisar avances quincenalmente en equipo técnico, priorizar estudiantes que requieren apoyo y documentar acciones en el PME. Las acciones son sugerencias automáticas basadas en resultados; requieren validación docente y contextualización curricular.</p><h5>Contenidos evaluados</h5>{contents.length?contents.map(v=><p key={v.name}>{v.name}: {v.percent.toFixed(1)}% ({v.total} respuestas evaluadas)</p>):<p>Sin desglose de contenidos registrado.</p>}<h5>Niveles de logro</h5>{levels.size?Array.from(levels.entries()).map(([level,count])=><p key={level}>{level}: {count} resultados</p>):<p>Sin niveles clasificados mediante un método registrado. No se asignan categorías SIMCE oficiales automáticamente.</p>}</div>})}</section>})}
 <style jsx global>{`@media print {
 body {background:#fff!important;color:#111!important}
 button, select {display:none!important}
 article {break-inside:avoid;box-shadow:none!important}
 section {break-inside:auto}
 h2,h3,h4,h5 {break-after:avoid}
 }`}</style>
 <h2>Utilización de licencias (administración)</h2>{visibleSchools.map(s=>{const used=s.licenses.reduce((n,l)=>n+l.pdfUsed,0);const limit=s.licenses.reduce((n,l)=>n+l.pdfLimit,0);return <div key={s.id} style={{marginBottom:12}}><span>{s.name}: {used} de {limit} ensayos</span><div style={{height:14,background:"#e7edf0",borderRadius:7,overflow:"hidden"}}><div style={{height:"100%",width:(limit?Math.min(100,used/limit*100):0)+"%",background:"#087e88"}}/></div></div>})}
 <p style={{marginTop:24}}>Los niveles de aprendizaje oficiales requieren criterios técnicos validados. Los porcentajes presentados son resultados de ensayos internos.</p>
 </main>
}
