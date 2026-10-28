"use client";
import { useState } from "react";

const groups = [
  {grade:"4",label:"4° básico",color:"#9855D4",bg:"#F8F3FD",items:[{title:"Lectura",module:"simce-lectura",detail:"Ensayo SIMCE de Lectura"},{title:"Matemática",module:"simce-matematica",detail:"Ensayo SIMCE de Matemática"}]},
  {grade:"6",label:"6° básico",color:"#ECAA19",bg:"#FFFAED",items:[{title:"Lectura",module:"simce-lectura",detail:"Ensayo SIMCE de Lectura"},{title:"Matemática",module:"simce-matematica",detail:"Ensayo SIMCE de Matemática"}]},
  {grade:"8",label:"8° básico",color:"#12B981",bg:"#EFFBF6",items:[{title:"Lectura",module:"simce-lectura",detail:"Ensayo SIMCE de Lectura"},{title:"Matemática",module:"simce-matematica",detail:"Ensayo SIMCE de Matemática"}]},
  {grade:"10",label:"2° medio",color:"#0B83C6",bg:"#EFF8FF",items:[{title:"Lengua y Literatura",module:"simce-lectura",detail:"Ensayo SIMCE de Lectura para 2° medio"},{title:"Matemática",module:"simce-matematica",detail:"Ensayo SIMCE de Matemática para 2° medio"}]}
];

export default function EnsayosSimcePage() {
  const [selected,setSelected] = useState<string|null>(null);
  const active = groups.find(g=>g.grade===selected);
  return <div className="ea-simce-root">
    <style>{`
      .ea-simce-root {display:block!important; width:100%!important; max-width:1120px!important; margin:0 auto!important; padding:28px 24px 44px!important; box-sizing:border-box!important; font-family:system-ui,sans-serif!important; color:#173752!important}
      .ea-simce-root * {box-sizing:border-box!important}
      .ea-simce-root .ea-heading {display:block!important; width:100%!important; margin:0 0 8px!important; font-size:30px!important; line-height:1.2!important; font-weight:750!important}
      .ea-simce-root .ea-description {display:block!important; width:100%!important; margin:0 0 22px!important; font-size:15px!important; color:#61788a!important}
      .ea-simce-root .ea-grade-grid {display:grid!important; grid-template-columns:repeat(4,minmax(0,1fr))!important; gap:12px!important; width:100%!important; margin:0!important; padding:0!important; align-items:stretch!important}
      .ea-simce-root .ea-grade {display:flex!important; align-items:center!important; justify-content:center!important; width:100%!important; height:66px!important; min-height:66px!important; padding:10px!important; margin:0!important; border-top:1px solid #e4eaf0!important; border-right:1px solid #e4eaf0!important; border-bottom:1px solid #e4eaf0!important; border-radius:12px!important; font-size:17px!important; font-weight:700!important; line-height:1.3!important; text-align:center!important; cursor:pointer!important; box-shadow:none!important; transition:box-shadow .15s ease,transform .15s ease!important}
      .ea-simce-root .ea-grade:hover {transform:translateY(-1px)!important;box-shadow:0 3px 10px #14344c12!important}
      .ea-simce-root .ea-resource-section {display:block!important; width:100%!important; margin:24px 0 0!important; padding:0!important; clear:both!important}
      .ea-simce-root .ea-section-title {display:block!important; margin:0 0 14px!important; font-size:21px!important; line-height:1.3!important}
      .ea-simce-root .ea-resource-grid {display:grid!important; grid-template-columns:repeat(3,minmax(0,1fr))!important; width:100%!important; gap:14px!important; margin:0!important; padding:0!important; align-items:stretch!important}
      .ea-simce-root .ea-resource-card {display:flex!important; flex-direction:column!important; justify-content:space-between!important; width:100%!important; min-width:0!important; max-width:none!important; min-height:135px!important; margin:0!important; padding:18px!important; border-radius:12px!important; border-top:1px solid #e3ebef!important; border-right:1px solid #e3ebef!important; border-bottom:1px solid #e3ebef!important; text-decoration:none!important; color:#173752!important; overflow-wrap:normal!important; word-break:normal!important}
      .ea-simce-root .ea-resource-card strong {display:block!important; font-size:17px!important; line-height:1.3!important; font-weight:700!important}
      .ea-simce-root .ea-resource-card small {display:block!important; margin-top:7px!important; font-size:13px!important; line-height:1.4!important; color:#5b7281!important}
      .ea-simce-root .ea-resource-card span {display:block!important; margin-top:16px!important; font-size:13px!important; font-weight:700!important; color:#007e90!important}
      .ea-simce-root .ea-footnote {display:block!important; width:100%!important; margin:25px 0 0!important; font-size:12px!important; line-height:1.6!important; color:#61788a!important}
      @media(max-width:700px) {.ea-simce-root .ea-grade-grid {grid-template-columns:repeat(2,minmax(0,1fr))!important}.ea-simce-root .ea-resource-grid {grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:460px) {.ea-simce-root {padding:18px 12px 30px!important}.ea-simce-root .ea-resource-grid {grid-template-columns:1fr!important}.ea-simce-root .ea-heading {font-size:25px!important}}
    `}</style>
    <a href="/" style={{display:"inline-block",marginBottom:18,color:"#007e90",fontSize:14}}>← Volver a EducAntay</a>
    <h1 className="ea-heading">Ensayos SIMCE y Lectura</h1>
    <p className="ea-description">Selecciona el nivel y abre el recurso que deseas generar.</p>
    <div className="ea-grade-grid" role="group" aria-label="Seleccionar nivel">
      {groups.map(g=><button type="button" className="ea-grade" key={g.grade} onClick={()=>setSelected(g.grade)} aria-pressed={selected===g.grade} style={{background:g.bg,borderLeft:`5px solid ${g.color}`,outline:selected===g.grade?`2px solid ${g.color}`:"none",color:"#173752"}}>{g.label}</button>)}
    </div>
    {active && <div className="ea-resource-section">
      <h2 className="ea-section-title">{active.grade==="2"?"Lectura · 2° básico":`Ensayos SIMCE · ${active.label}`}</h2>
      <div className="ea-resource-grid">
        {active.items.map(item=><a className="ea-resource-card" key={item.module} href={`/recursos-aprendizaje?modulo=${item.module}&nivel=${active.grade}`} style={{background:active.bg,borderLeft:`5px solid ${active.color}`}}>
          <div><strong>{item.title}</strong><small>{item.detail}</small></div>
          <span>Abrir recurso →</span>
        </a>)}
      </div>
    </div>}
    <section className="ea-resource-section" aria-label="Herramientas de corrección SIMCE">
      <h2 className="ea-section-title">Corrector de pruebas SIMCE</h2>
      <div className="ea-resource-grid">
                <a className="ea-resource-card" href="/ensayos-simce/hoja-respuestas" style={{background:"#ECFAF9",borderLeft:"5px solid #0B9DAD"}}><div><strong>Hoja de respuestas</strong><small>Generar e imprimir hojas A–D.</small></div><span>Crear hoja →</span></a>
        <a className="ea-resource-card" href="/ensayos-simce/corrector/cargar" style={{background:"#F4F0FD",borderLeft:"5px solid #8650C7"}}><div><strong>Cargar JPG, PNG o PDF</strong><small>Vista previa de hojas. Lectura automática en desarrollo.</small></div><span>Cargar archivo →</span></a>
<a className="ea-resource-card" href="/ensayos-simce/corrector" style={{background:"#F4F0FD",borderLeft:"5px solid #8650C7"}}><div><strong>Corrector SIMCE</strong><small>Revisar respuestas, calcular resultados y exportar CSV.</small></div><span>Abrir corrector →</span></a>
      </div>
    </section>
    <p className="ea-footnote">Los ensayos tipo SIMCE son materiales originales no oficiales. Revisa las preguntas y la hoja de respuestas del docente antes de aplicarlos.</p>
  </div>;
}
