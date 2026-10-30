"use client";
import { useState } from "react";
import { SIMCE_PAPER_MM as mm } from "../../../lib/simce-paper-template";

const choices = ["A", "B", "C", "D"];
export default function HojaRespuestasSimce() {
  const [ensayo, setEnsayo] = useState("");
  const [nivel, setNivel] = useState("4° básico");
  const [asignatura, setAsignatura] = useState("Lectura");
  const [preguntas, setPreguntas] = useState(35);
  const cantidades = nivel==="4° básico" ? [asignatura==="Lectura"?35:36] : nivel==="6° básico" ? [30,31,32,33,34,35] : nivel==="8° básico" ? [35,36,37,38,39,40] : [asignatura==="Lectura"?43:41];
  const cambiarConfiguracion = (nuevoNivel:string,nuevaAsignatura:string) => {
    setNivel(nuevoNivel);setAsignatura(nuevaAsignatura);
    setPreguntas(nuevoNivel==="4° básico"?(nuevaAsignatura==="Lectura"?35:36):nuevoNivel==="6° básico"?35:nuevoNivel==="8° básico"?40:(nuevaAsignatura==="Lectura"?43:41));
  };
  const [estudiante, setEstudiante] = useState("");
  const [curso, setCurso] = useState("");
  const total = cantidades.includes(preguntas) ? preguntas : cantidades[0];
  return <main className="sheet-page">
    <style>{`
      .sheet-page{max-width:900px;margin:0 auto;padding:24px;color:#18394c;font-family:Arial,sans-serif}
      .sheet-config{background:#f0fafb;border:1px solid #bde5e6;padding:18px;border-radius:14px;margin:16px 0}
      .sheet-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .sheet-fields label{font-size:14px;font-weight:600;display:grid;gap:5px}
      .sheet-fields input,.sheet-fields select{width:100%;padding:10px;border:1px solid #adcbd0;border-radius:8px;background:white;color:#18394c}
      .sheet-action{border:0;background:#087f91;color:white;padding:12px 18px;border-radius:9px;font-weight:700;cursor:pointer;margin-top:15px}
      .answer-sheet{background:white;position:relative;margin:0 auto 20px;width:186mm;height:273mm;box-sizing:border-box;break-inside:avoid;page-break-inside:avoid;overflow:hidden;color:#18394c}
      .sheet-fiducial{position:absolute;width:12mm;height:12mm;background:#111;print-color-adjust:exact;-webkit-print-color-adjust:exact}
      .sheet-title{position:absolute;top:20mm;left:0;width:100%;text-align:center;font-size:18px;margin:0}
      .sheet-meta{position:absolute;top:29mm;left:20mm;width:146mm;display:grid;grid-template-columns:1fr 1fr;gap:2mm;font-size:10px}
      .sheet-meta div{border-bottom:1px solid #9daeb9;padding:1mm 0;overflow:hidden;white-space:nowrap}
      .bubble-row{position:absolute;height:6mm;display:flex;align-items:center;gap:4mm;font-size:11px}
      .bubble-number{position:absolute;right:3mm;width:12mm;text-align:right;font-weight:bold}
      .bubble{position:absolute;top:0;width:6mm;height:6mm;box-sizing:border-box;border:0.35mm solid #172d3b;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:bold}
      .sheet-note{position:absolute;bottom:14mm;left:20mm;font-size:10px;color:#465b65}
      @media(max-width:600px){.sheet-fields{grid-template-columns:1fr}.sheet-page{padding:12px}.answer-sheet{transform-origin:top left;max-width:none}}
      @media print{@page{size:A4;margin:12mm}body{background:white!important}.sheet-config,.sheet-back,.sheet-intro{display:none!important}.sheet-page{padding:0;max-width:none}.answer-sheet{margin:0;break-after:page;page-break-after:always}.answer-sheet:last-child{break-after:auto;page-break-after:auto}}
    `}</style>
    <a className="sheet-back" href="/ensayos-simce">← Volver a Ensayos SIMCE</a>
    <h1 className="sheet-intro">Hoja de respuestas SIMCE · versión imprimible</h1>
    <section className="sheet-config">
      <p>Configura e imprime la hoja. Las preguntas se distribuyen por columnas correlativas para facilitar la lectura óptica. La corrección automática requiere calibración y revisión de las marcas detectadas. Las cuatro marcas negras ayudan a ubicar la hoja. Si se imprime en más de una página, cada página deberá procesarse por separado.</p>
      <div className="sheet-fields">
        <label>Identificador del ensayo<input maxLength={60} value={ensayo} onChange={e=>setEnsayo(e.target.value)} placeholder="Ej. SIMCE-4M-001" /></label>
        <label>Nivel<select value={nivel} onChange={e=>cambiarConfiguracion(e.target.value,asignatura)}>{["4° básico","6° básico","8° básico","2° medio"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Asignatura<select value={asignatura} onChange={e=>cambiarConfiguracion(nivel,e.target.value)}><option>Lectura</option><option>Matemática</option></select></label>
        <label>Número de preguntas<select value={total} onChange={e=>setPreguntas(Number(e.target.value))}>{cantidades.map(n=><option key={n} value={n}>{n} preguntas</option>)}</select></label>
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
        {[[mm.fiducialLeft,mm.fiducialTop],[mm.fiducialRight,mm.fiducialTop],[mm.fiducialLeft,mm.fiducialBottom],[mm.fiducialRight,mm.fiducialBottom]].map(([x,y],i)=><span key={i} className="sheet-fiducial" style={{left:`${x-6}mm`,top:`${y-6}mm`}}/>)}
        <h2 className="sheet-title">EducAntay · Hoja de respuestas</h2>
        <div className="sheet-meta"><div>Ensayo: {ensayo || "________________"}</div><div>Nivel: {nivel} · {asignatura}</div><div>Estudiante: {estudiante || "________________"}</div><div>Curso: {curso || "________________"}</div><div>Página: {pageIndex+1} de {Math.ceil(total/50)}</div><div>Preguntas: {first}–{first+count-1}</div></div>
        {[0,1].flatMap(column=>Array.from({length:column===0?leftCount:count-leftCount},(_,offset)=>{
          const number=first+offset+(column===0?0:leftCount);
          const firstX=column===0?mm.firstLeftX:mm.firstRightX;
          const y=mm.firstY+offset*mm.rowStep;
          return <div key={number} className="bubble-row" style={{left:`${firstX}mm`,top:`${y-3}mm`}}>
            <span className="bubble-number" style={{top:0,right:"4mm",transform:"translateX(-4mm)"}}>{number}.</span>
            {choices.map((c,i)=><span key={c} className="bubble" style={{left:`${i*mm.optionStep-3}mm`}}>{c}</span>)}
          </div>;
        }))}
        <p className="sheet-note">Marca completamente una alternativa por pregunta. Procesa cada página por separado.</p>
      </section>;
    })}
  </main>;
}
