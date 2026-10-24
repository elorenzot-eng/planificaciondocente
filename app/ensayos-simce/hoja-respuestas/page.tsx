"use client";
import { useState } from "react";

const choices = ["A", "B", "C", "D"];
export default function HojaRespuestasSimce() {
  const [ensayo, setEnsayo] = useState("");
  const [nivel, setNivel] = useState("4° básico");
  const [preguntas, setPreguntas] = useState(40);
  const [estudiante, setEstudiante] = useState("");
  const [curso, setCurso] = useState("");
  const total = Math.max(1, Math.min(100, Number(preguntas) || 1));
  return <main className="sheet-page">
    <style>{`
      .sheet-page{max-width:900px;margin:0 auto;padding:24px;color:#18394c;font-family:Arial,sans-serif}
      .sheet-config{background:#f0fafb;border:1px solid #bde5e6;padding:18px;border-radius:14px;margin:16px 0}
      .sheet-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .sheet-fields label{font-size:14px;font-weight:600;display:grid;gap:5px}
      .sheet-fields input,.sheet-fields select{width:100%;padding:10px;border:1px solid #adcbd0;border-radius:8px;background:white;color:#18394c}
      .sheet-action{border:0;background:#087f91;color:white;padding:12px 18px;border-radius:9px;font-weight:700;cursor:pointer;margin-top:15px}
      .answer-sheet{background:white;border:2px solid #18394c;padding:22px;position:relative;margin-bottom:20px;break-inside:avoid;page-break-inside:avoid}
      .sheet-registration{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
      .sheet-fiducial{width:12mm;height:12mm;background:#111;display:block;flex-shrink:0}
      .sheet-registration-bottom{margin-top:16px;margin-bottom:0}
      .sheet-title{text-align:center;margin:0 0 12px;font-size:22px}
      .sheet-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;margin-bottom:18px}
      .sheet-meta div{border-bottom:1px solid #9daeb9;padding:7px 0}
      .bubble-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 22px}
      .bubble-column{display:flex;flex-direction:column;min-width:0}\n      .bubble-row{display:flex;align-items:center;gap:11px;padding:6px 2px;break-inside:avoid;font-size:13px}
      .bubble-number{width:27px;text-align:right;font-weight:bold}
      .bubble{display:inline-flex;align-items:center;justify-content:center;border:1.5px solid #172d3b;border-radius:50%;width:26px;height:26px;font-size:11px;font-weight:bold}
      .sheet-note{font-size:12px;margin-top:18px;color:#465b65}
      @media(max-width:600px){.sheet-fields,.sheet-meta,.bubble-grid{grid-template-columns:1fr}.sheet-page{padding:12px}}
      @media print{ @page{size:A4;margin:12mm} body{background:white!important}.sheet-config,.sheet-back,.sheet-intro{display:none!important}.sheet-page{padding:0;max-width:none}.answer-sheet{border:0;padding:0}.sheet-fiducial{print-color-adjust:exact;-webkit-print-color-adjust:exact}.bubble-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bubble-row{padding:3px 2px}.sheet-title{font-size:18px}.answer-sheet{break-after:page;page-break-after:always}.answer-sheet:last-child{break-after:auto;page-break-after:auto}}
    `}</style>
    <a className="sheet-back" href="/ensayos-simce">← Volver a Ensayos SIMCE</a>
    <h1 className="sheet-intro">Hoja de respuestas SIMCE · versión imprimible</h1>
    <section className="sheet-config">
      <p>Configura e imprime la hoja. Las preguntas se distribuyen por columnas correlativas para facilitar la lectura óptica. La corrección automática aún está en validación. Las cuatro marcas negras ayudan a ubicar la hoja. Si se imprime en más de una página, cada página deberá procesarse por separado.</p>
      <div className="sheet-fields">
        <label>Identificador del ensayo<input maxLength={60} value={ensayo} onChange={e=>setEnsayo(e.target.value)} placeholder="Ej. SIMCE-4M-001" /></label>
        <label>Nivel<select value={nivel} onChange={e=>setNivel(e.target.value)}>{["4° básico","6° básico","8° básico","2° medio"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Número de preguntas (1–100)<input type="number" min={1} max={100} value={preguntas} onChange={e=>setPreguntas(Number(e.target.value))}/></label>
        <label>Curso<input maxLength={60} value={curso} onChange={e=>setCurso(e.target.value)} /></label>
        <label>Nombre del estudiante<input maxLength={100} value={estudiante} onChange={e=>setEstudiante(e.target.value)} /></label>
      </div>
      <button className="sheet-action" onClick={()=>window.print()}>Imprimir / Guardar PDF</button>
    </section>
    {Array.from({length:Math.ceil(total/50)},(_,pageIndex)=>{
      const first=pageIndex*50+1;
      const count=Math.min(50,total-pageIndex*50);
      const leftCount=Math.ceil(count/2);
      return <section className="answer-sheet" key={pageIndex} aria-label={`Hoja imprimible ${pageIndex+1}`}>
        <div className="sheet-registration" aria-label="Marcas de referencia superiores"><span className="sheet-fiducial"/><span className="sheet-fiducial"/></div>
        <h2 className="sheet-title">EducAntay · Hoja de respuestas</h2>
        <div className="sheet-meta"><div>Ensayo: {ensayo || "________________"}</div><div>Nivel: {nivel}</div><div>Estudiante: {estudiante || "________________"}</div><div>Curso: {curso || "________________"}</div><div>Página: {pageIndex+1} de {Math.ceil(total/50)}</div><div>Preguntas: {first}–{first+count-1}</div></div>
        <div className="bubble-grid">{[0,1].map(column=><div className="bubble-column" key={column}>{Array.from({length:column===0?leftCount:count-leftCount},(_,offset)=>{const number=first+offset+(column===0?0:leftCount);return <div className="bubble-row" key={number}><span className="bubble-number">{number}.</span>{choices.map(c=><span key={c} className="bubble">{c}</span>)}</div>;})}</div>)}</div>
        <div className="sheet-registration sheet-registration-bottom" aria-label="Marcas de referencia inferiores"><span className="sheet-fiducial"/><span className="sheet-fiducial"/></div>
        <p className="sheet-note">Marca completamente una alternativa por pregunta. Procesa cada página por separado.</p>
      </section>;
    })}
  </main>;
}
