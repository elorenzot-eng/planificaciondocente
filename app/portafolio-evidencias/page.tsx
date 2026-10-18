"use client";
import { useState } from "react";

const groups = ["Básica 1° a 6°","Básica Generalista 1° a 4°","7° y 8° Básico / Media HC","Media Técnico-Profesional"];
type Review = {fortalezas:string[];mejoras:string[];evidencias:string[];preguntas:string[]};
export default function PortfolioEvidencePage(){
 const [group,setGroup]=useState(groups[0]),[module,setModule]=useState(1),[section,setSection]=useState(0);
 const [evidence,setEvidence]=useState(""),[review,setReview]=useState<Review|null>(null);
 const [busy,setBusy]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const card:React.CSSProperties={padding:18,border:"1px solid #d9e4ea",borderRadius:14,background:"#fff",marginTop:14};
 async function analyze(){
  setError("");setNotice("");setReview(null);setBusy(true);
  try{
   const r=await fetch("/api/portfolio-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({group,module,notes:evidence})});
   const x=await r.json();if(!r.ok)throw Error(x.error||"No se pudo analizar");
   setReview(x.review);
  }catch(e){setError(e instanceof Error?e.message:"Error al analizar");}finally{setBusy(false);}
 }
 async function save(){
  if(!window.confirm("Se reemplazará el borrador guardado de esta agrupación, módulo y sección. ¿Continuar?"))return;
  setError("");setNotice("");setSaving(true);
  try{
   const r=await fetch("/api/portfolio-drafts",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({grouping:group,module:module-1,section,content:evidence,rubric:"",reviewed:false})});
   const x=await r.json();if(!r.ok)throw Error(x.error||"No se pudo guardar");
   setNotice("Evidencia guardada en tu cuenta. Puedes recuperarla en Portafolio Docente IA.");
  }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}finally{setSaving(false);}
 }
 return <main style={{maxWidth:950,margin:"28px auto",padding:"0 20px 45px",fontFamily:"Arial,sans-serif",lineHeight:1.55,color:"#1b293b"}}>
  <a href="/">← Volver a EducAntay</a><h1>Portafolio Docente IA 2026</h1>
  <p>Analiza tus evidencias con orientación pedagógica formativa. La IA no reemplaza la revisión profesional ni asigna una calificación oficial.</p>
  <section style={card}><h2 style={{marginTop:0}}>1. Contexto de tu portafolio</h2>
   <label htmlFor="group">Agrupación docente</label><select id="group" value={group} onChange={e=>{setGroup(e.target.value);setReview(null)}} style={{display:"block",width:"100%",padding:10,margin:"6px 0 14px"}}>{groups.map(g=><option key={g}>{g}</option>)}</select>
   <label htmlFor="module">Módulo</label><select id="module" value={module} onChange={e=>{setModule(Number(e.target.value));setReview(null)}} style={{display:"block",padding:10,margin:"6px 0 14px"}}>{[1,2,3].map(n=><option key={n} value={n}>Módulo {n}</option>)}</select>
   <label htmlFor="section">Sección del borrador para guardar</label><select id="section" value={section} onChange={e=>setSection(Number(e.target.value))} style={{display:"block",padding:10,margin:"6px 0"}}>{[0,1,2].map(n=><option key={n} value={n}>Sección {n+1}</option>)}</select>
  </section>
  <section style={card}><h2 style={{marginTop:0}}>2. Evidencia pedagógica</h2>
   <label htmlFor="evidence">Ingresa una evidencia auténtica de tu práctica docente</label>
   <textarea id="evidence" rows={12} maxLength={16000} value={evidence} onChange={e=>{setEvidence(e.target.value);setReview(null)}} placeholder="Describe lo que hiciste, cómo lo implementaste y qué evidencia observaste..." style={{display:"block",boxSizing:"border-box",width:"100%",padding:12,marginTop:10,border:"1px solid #bacbd4",borderRadius:10}}/>
   <p style={{fontSize:13,color:"#526477"}}>{evidence.length.toLocaleString("es-CL")} / 16.000 caracteres. Para análisis IA, mínimo 80.</p>
   <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
    <button type="button" onClick={analyze} disabled={busy||saving||evidence.trim().length<80} style={{padding:"12px 16px"}}>{busy?"Analizando evidencia...":"Analizar con IA"}</button>
    <button type="button" onClick={save} disabled={saving||busy||!evidence.trim()} style={{padding:"12px 16px"}}>{saving?"Guardando...":"Guardar en mi portafolio"}</button>
   </div><p style={{fontSize:13}}>Guardar reemplaza el contenido anterior de la sección elegida, previa confirmación. El análisis IA no se guarda automáticamente.</p>
  </section>
  {error&&<p role="alert" style={{color:"#a32626"}}>{error}</p>}{notice&&<p role="status" style={{color:"#11634b"}}>{notice}</p>}
  {review&&<section aria-live="polite" style={{marginTop:20}}><h2>3. Retroalimentación formativa</h2>
   {([["Fortalezas observadas",review.fortalezas],["Aspectos por mejorar",review.mejoras],["Evidencias que conviene reforzar",review.evidencias],["Preguntas para tu reflexión",review.preguntas]] as [string,string[]][]).map(([heading,items])=><div key={heading} style={card}><h3 style={{marginTop:0}}>{heading}</h3><ul style={{paddingLeft:22,marginBottom:0}}>{items.map((item,i)=><li key={i} style={{marginBottom:8}}>{item}</li>)}</ul></div>)}
   <p style={{fontSize:13,color:"#526477",marginTop:18}}>Análisis orientativo basado en tu texto. No constituye evaluación oficial de DocenteMás ni certifica niveles de rúbrica.</p>
  </section>}
 </main>;
}
