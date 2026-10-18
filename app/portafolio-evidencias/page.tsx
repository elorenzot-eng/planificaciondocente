"use client";
import { useEffect, useState } from "react";
import { OFFICIAL_PORTFOLIO_2026 } from "../../lib/portfolio-official-2026";

const groups = ["Básica 1° a 6°","Básica Generalista 1° a 4°","7° y 8° Básico / Media HC","Media Técnico-Profesional"];
type Review = {fortalezas:string[];mejoras:string[];evidencias:string[];preguntas:string[]};
type Score={claridad:number;evidencia:number;reflexion:number;coherencia:number;total:number;max:number;official:false};
type ReviewRecord={id:string;date:string;group:string;module:number;section:number;review:Review;score?:Score;stage?:"initial"|"final"};
export default function PortfolioEvidencePage(){
 const [group,setGroup]=useState(groups[0]),[module,setModule]=useState(1),[section,setSection]=useState(0);
 const [evidence,setEvidence]=useState(""),[review,setReview]=useState<Review|null>(null);
 const [busy,setBusy]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [recovering,setRecovering]=useState(false),[matchInfo,setMatchInfo]=useState(false);
 const [history,setHistory]=useState<ReviewRecord[]>([]);
 const [showComparison,setShowComparison]=useState(false);
 const [stage,setStage]=useState<"initial"|"final">("initial");
 const [currentScore,setCurrentScore]=useState<Score|null>(null);
 const [scoredStage,setScoredStage]=useState<"initial"|"final"|null>(null);
 const rubricSource=OFFICIAL_PORTFOLIO_2026.find(item=>item.group===group);
 const selectedHistory=history.filter(h=>h.group===group&&h.module===module&&h.section===section);
 const newest=selectedHistory[0],oldest=selectedHistory[selectedHistory.length-1];
 useEffect(()=>{try{const raw=localStorage.getItem("educantay-portfolio-feedback-history-v1");if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed))setHistory(parsed.slice(0,20));}}catch{}},[]);
 function rememberFeedback(next:Review,score?:Score){
  const record:ReviewRecord={id:Date.now().toString(),date:new Date().toISOString(),group,module,section,review:next,score,stage};
  setHistory(previous=>{const updated=[record,...previous].slice(0,20);try{localStorage.setItem("educantay-portfolio-feedback-history-v1",JSON.stringify(updated));}catch{}return updated;});
 }
 async function recover(){
  if(evidence.trim()&&!window.confirm("Se reemplazará el texto actual con el borrador guardado. ¿Continuar?"))return;
  setError("");setNotice("");setRecovering(true);
  try{
   const r=await fetch("/api/portfolio-drafts",{cache:"no-store"});const x=await r.json();
   if(!r.ok)throw Error(x.error||"No se pudieron consultar tus borradores");
   const draft=(x.drafts||[]).find((d:{grouping:string;module:number;section:number})=>d.grouping===group&&d.module===module-1&&d.section===section);
   if(!draft){setNotice("No hay un borrador guardado para esta agrupación, módulo y sección.");return;}
   setEvidence(draft.content||"");setReview(null);setCurrentScore(null);setScoredStage(null);setNotice("Borrador recuperado desde tu cuenta.");
  }catch(e){setError(e instanceof Error?e.message:"No se pudo recuperar el borrador");}finally{setRecovering(false);}
 }
 const card:React.CSSProperties={padding:18,border:"1px solid #d9e4ea",borderRadius:14,background:"#fff",marginTop:14};
 async function analyze(){
  setError("");setNotice("");setReview(null);setCurrentScore(null);setScoredStage(null);setBusy(true);
  try{
   const r=await fetch("/api/portfolio-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({group,module,notes:evidence})});
   const x=await r.json();if(!r.ok)throw Error(x.error||"No se pudo analizar");
   setReview(x.review);setCurrentScore(x.formativeScore||null);setScoredStage(stage);rememberFeedback(x.review,x.formativeScore);
  }catch(e){setError(e instanceof Error?e.message:"Error al analizar");}finally{setBusy(false);}
 }
 async function save(){
  if(!window.confirm("Se reemplazará el borrador guardado de esta agrupación, módulo y sección. ¿Continuar?"))return;
  setError("");setNotice("");setSaving(true);
  try{
   const r=await fetch("/api/portfolio-drafts",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({grouping:group,module:module-1,section,content:evidence})});
   const x=await r.json();if(!r.ok)throw Error(x.error||"No se pudo guardar");
   setNotice("Evidencia guardada en tu cuenta. Puedes recuperarla en Portafolio Docente IA.");
  }catch(e){setError(e instanceof Error?e.message:"Error al guardar");}finally{setSaving(false);}
 }
 return <main className="portfolio-page">
  <style>{`
   .portfolio-page{display:block!important;width:100%;min-height:100vh;max-width:1440px;margin:0 auto;padding:24px 28px 60px;font-family:Arial,sans-serif;line-height:1.55;color:#1b293b;box-sizing:border-box}
   .portfolio-page *{box-sizing:border-box}.portfolio-page .portfolio-grid,.portfolio-page .portfolio-left,.portfolio-page .portfolio-results{width:100%;min-width:0}.portfolio-page .portfolio-card{width:100%}
   .portfolio-page .portfolio-header{display:block;position:static;margin:0 0 24px}.portfolio-page .portfolio-header a{display:inline-block;margin-bottom:8px}.portfolio-page .portfolio-header h1{display:block}.portfolio-header h1{font-size:clamp(25px,3vw,38px);color:#123b65;margin:12px 0 5px}.portfolio-header p{color:#506477;margin:0}
   .portfolio-page .portfolio-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:18px}
   .portfolio-step{border:1px solid #dce8f1;border-radius:14px;background:#eaf5ff;padding:13px 16px;font-weight:700;color:#12416b}
   .portfolio-step:nth-child(2){background:#f2ebff;color:#6334a1}.portfolio-step:nth-child(3){background:#fff0f5;color:#a72863}
   .portfolio-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:20px;align-items:start}
   .portfolio-left{min-width:0;display:grid;gap:18px}.portfolio-card{min-width:0;padding:22px;border:1px solid #d9e4ea;border-radius:17px;background:#fff;box-shadow:0 3px 12px rgba(25,65,105,.05)}
   .portfolio-card h2{font-size:21px;margin:0 0 15px;color:#173b63}.portfolio-card h3{font-size:17px;margin:0 0 10px}
   .portfolio-fields{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);gap:12px}
   .portfolio-page .portfolio-fields label{display:block;margin:0 0 7px;gap:0;font-weight:600;font-size:13px;margin-bottom:7px}.portfolio-fields select{width:100%;min-width:0;padding:11px;border:1px solid #cad8e5;border-radius:10px;background:white}
   .portfolio-page .portfolio-editor{display:block;width:100%;min-height:310px;resize:vertical;padding:14px;border:1px solid #cad8e5;border-radius:12px;margin-top:12px;font:inherit}
   .portfolio-actions{display:flex;gap:12px;flex-wrap:wrap}.portfolio-actions button{padding:12px 17px;border-radius:11px;border:1px solid #7c3aed;background:#fff;color:#6826ba;font-weight:700;cursor:pointer}
   .portfolio-actions button:first-child{background:#7425c7;color:#fff}.portfolio-actions button:disabled{opacity:.55;cursor:not-allowed}
   .portfolio-results{min-width:0}.portfolio-results .portfolio-card{margin-bottom:12px}
   .portfolio-results ul{margin:0;padding-left:22px;overflow-wrap:anywhere}.portfolio-results li{margin-bottom:9px}
   .portfolio-results .feedback-green{background:#effbf3;border-color:#d2ecd9}.portfolio-results .feedback-amber{background:#fff8e8;border-color:#f3e5b9}
   .portfolio-results .feedback-purple{background:#f7f0ff;border-color:#e7d8fc}.portfolio-results .feedback-blue{background:#edf7ff;border-color:#d5e8fa}
   .portfolio-note{font-size:13px;color:#526477}
   @media(max-width:980px){.portfolio-grid{grid-template-columns:1fr}.portfolio-fields{grid-template-columns:1fr 1fr}.portfolio-fields>div:first-child{grid-column:1/-1}}
   @media(max-width:580px){.portfolio-page{padding:18px 14px 40px}.portfolio-flow{grid-template-columns:1fr;gap:7px}.portfolio-fields{grid-template-columns:1fr}.portfolio-fields>div:first-child{grid-column:auto}.portfolio-card{padding:17px}.portfolio-actions button{width:100%}}
  `}</style>
  <header className="portfolio-header"><a href="/">← Volver a EducAntay</a><h1>Portafolio Docente IA 2026</h1><p>Registra evidencias, recibe retroalimentación y fortalece tu práctica docente.</p></header>
  <nav className="portfolio-flow" aria-label="Etapas del portafolio"><div className="portfolio-step">1. Contexto</div><div className="portfolio-step">2. Evidencia</div><div className="portfolio-step">3. Retroalimentación IA</div></nav>
  <div className="portfolio-grid">
   <div className="portfolio-left">
    <section className="portfolio-card"><h2>1. Contexto de tu portafolio</h2>
     <div className="portfolio-fields">
      <div><label htmlFor="group">Agrupación docente</label><select id="group" value={group} onChange={e=>{setGroup(e.target.value);setReview(null);setCurrentScore(null);setScoredStage(null)}}>{groups.map(g=><option key={g}>{g}</option>)}</select></div>
      <div><label htmlFor="module">Módulo</label><select id="module" value={module} onChange={e=>{setModule(Number(e.target.value));setReview(null)}}>{[1,2,3].map(n=><option key={n} value={n}>Módulo {n}</option>)}</select></div>
      <div><label htmlFor="section">Sección del borrador</label><select id="section" value={section} onChange={e=>{setSection(Number(e.target.value));setReview(null);setCurrentScore(null);setScoredStage(null)}}>{[0,1,2].map(n=><option key={n} value={n}>Sección {n+1}</option>)}</select></div>
     </div>
    </section>
    <section className="portfolio-card"><h2>2. Evidencia pedagógica</h2>
     <label htmlFor="evidence">Ingresa una evidencia auténtica de tu práctica docente</label>
     <textarea className="portfolio-editor" id="evidence" maxLength={16000} value={evidence} onChange={e=>{setEvidence(e.target.value);setReview(null);setCurrentScore(null);setScoredStage(null)}} placeholder="Describe lo que hiciste, cómo lo implementaste y qué evidencia observaste..." />
     <p className="portfolio-note">{evidence.length.toLocaleString("es-CL")} / 16.000 caracteres. Para análisis IA, mínimo 80. Evita incluir datos personales de estudiantes.</p>
     <div style={{display:"flex",gap:12,margin:"12px 0",flexWrap:"wrap"}}><label><input type="radio" name="stage" checked={stage==="initial"} onChange={()=>{setStage("initial");setReview(null);setCurrentScore(null);setScoredStage(null)}}/> Entrega inicial</label><label><input type="radio" name="stage" checked={stage==="final"} onChange={()=>{setStage("final");setReview(null);setCurrentScore(null);setScoredStage(null)}}/> Revisión final</label></div>
     <div className="portfolio-actions">
      <button type="button" onClick={analyze} disabled={busy||saving||evidence.trim().length<80}>{busy?"Analizando evidencia...":"✦ Analizar con IA"}</button>
      <button type="button" onClick={save} disabled={saving||busy||!evidence.trim()}>{saving?"Guardando...":"Guardar en mi portafolio"}</button>
      <button type="button" onClick={recover} disabled={recovering||busy||saving}>{recovering?"Recuperando...":"Recuperar borrador"}</button>
      <button type="button" onClick={()=>setMatchInfo(v=>!v)} aria-expanded={matchInfo}>Match con rúbrica 2026</button>
     </div>
     {matchInfo&&<div role="status" style={{marginTop:14,padding:14,borderRadius:10,background:"#edf7ff",border:"1px solid #cfe4fa"}}>
      <strong>Match formativo de evidencias — sin puntaje oficial</strong>
      {rubricSource&&<p><a href={rubricSource.rubric} target="_blank" rel="noopener noreferrer">Consultar rúbrica oficial 2026 de esta agrupación ↗</a></p>}
      {review?<p>La retroalimentación con fortalezas y evidencias pendientes está disponible en el panel de resultados, sin duplicarla aquí.</p>:<p>Primero selecciona «Analizar con IA» para obtener retroalimentación formativa.</p>}
      <p style={{margin:"6px 0 0"}}>La comparación con indicadores, niveles y porcentajes de rúbricas oficiales DocenteMás 2026 permanece deshabilitada hasta completar su validación.</p>
     </div>}
     <p className="portfolio-note">Guardar reemplaza el contenido anterior de la sección elegida, previa confirmación. El análisis IA no se guarda automáticamente.</p>
     {error&&<p role="alert" style={{color:"#a32626"}}>{error}</p>}{notice&&<p role="status" style={{color:"#11634b"}}>{notice}</p>}
    </section>
   </div>
   <section className="portfolio-results" aria-live="polite"><div style={{margin:"0 0 12px"}}><h2 style={{margin:"0 0 5px"}}>3. Retroalimentación formativa</h2><p className="portfolio-note" style={{margin:0}}>La IA ofrece orientación pedagógica, no una calificación oficial.</p></div>
    {currentScore&&<div className="portfolio-card"><h3>Calificación formativa: {scoredStage==="initial"?"inicial":"final"}</h3><p style={{fontSize:28,fontWeight:700}}>{currentScore.total}/100</p><p>Claridad {currentScore.claridad}/25 · Evidencia {currentScore.evidencia}/25 · Reflexión {currentScore.reflexion}/25 · Coherencia {currentScore.coherencia}/25</p><p className="portfolio-note">Estimación IA de EducAntay. No corresponde a una calificación oficial DocenteMás.</p></div>}
    {review?([[ "Fortalezas observadas",review.fortalezas,"feedback-green"],["Aspectos por mejorar",review.mejoras,"feedback-amber"],["Evidencias que conviene reforzar",review.evidencias,"feedback-purple"],["Preguntas para tu reflexión",review.preguntas,"feedback-blue"]] as [string,string[],string][]).map(([heading,items,kind])=><div key={heading} className={"portfolio-card "+kind}><h3>{heading}</h3><ul>{items.map((item,i)=><li key={i}>{item}</li>)}</ul></div>):<div className="portfolio-card"><p>Ingresa tu evidencia y selecciona <strong>Analizar con IA</strong> para visualizar aquí las fortalezas, oportunidades de mejora y orientaciones.</p></div>}
    {review&&<p className="portfolio-note">Análisis orientativo basado en tu texto. No constituye evaluación oficial de DocenteMás ni certifica niveles de rúbrica.</p>}
    {selectedHistory.some(h=>h.stage==="initial"&&h.score)&&selectedHistory.some(h=>h.stage==="final"&&h.score)&&<div className="portfolio-card"><h3>Match inicial vs. final</h3><p>Inicial: {selectedHistory.find(h=>h.stage==="initial"&&h.score)?.score?.total}/100 · Final: {selectedHistory.find(h=>h.stage==="final"&&h.score)?.score?.total}/100 · Variación: {selectedHistory.find(h=>h.stage==="final"&&h.score)!.score!.total-selectedHistory.find(h=>h.stage==="initial"&&h.score)!.score!.total} puntos</p><p className="portfolio-note">Comparación formativa de IA, no calificación oficial. Historial solo en este navegador.</p></div>}
    {selectedHistory.length>=2&&<div className="portfolio-card"><h3>Comparar revisiones</h3>
     <button type="button" onClick={()=>setShowComparison(v=>!v)} aria-expanded={showComparison} style={{padding:"10px 14px",borderRadius:9,cursor:"pointer"}}>{showComparison?"Ocultar comparación":"Comparar primera y última revisión"}</button>
     {showComparison&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,220px),1fr))",gap:12,marginTop:12}}>
      {([["Primera revisión",oldest],["Última revisión",newest]] as [string,ReviewRecord][]).map(([title,item])=><div key={title} style={{padding:14,borderRadius:12,background:"#f3f8ff",minWidth:0}}><strong>{title}</strong><p className="portfolio-note">{new Date(item.date).toLocaleString("es-CL")}</p><b>Fortalezas identificadas</b><ul>{item.review.fortalezas.map((v,i)=><li key={i}>{v}</li>)}</ul><b>Aspectos por mejorar</b><ul>{item.review.mejoras.map((v,i)=><li key={i}>{v}</li>)}</ul></div>)}
     </div>}
     <p className="portfolio-note">Comparación descriptiva de dos respuestas de IA. No demuestra por sí sola una mejora ni equivale a una calificación oficial.</p>
    </div>}
    {history.length>0&&<div className="portfolio-card"><h3>Historial de revisiones en este dispositivo</h3><p className="portfolio-note">Se conservan hasta 20 retroalimentaciones en este navegador; no se sincronizan con tu cuenta ni incluyen una copia del texto original.</p><ul>{history.filter(h=>h.group===group&&h.module===module&&h.section===section).map(h=><li key={h.id}><button type="button" onClick={()=>{setReview(h.review);setCurrentScore(h.score||null);setStage(h.stage||"initial");setScoredStage(h.stage||"initial");setMatchInfo(true)}} style={{cursor:"pointer",padding:7}}>{new Date(h.date).toLocaleString("es-CL")} · Ver revisión</button></li>)}</ul></div>}
   </section>
  </div>
 </main>;
}
