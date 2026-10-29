"use client";
import Link from "next/link";
import {useState} from "react";

const exams=[
 {name:"Competencia Lectora",short:"Lectura",symbol:"📖",tone:"#0f766e",soft:"#ccfbf1",questions:"65",path:"/ensayos-paes/piloto",description:"Comprende, interpreta y evalúa textos de distintos formatos.",details:"Lectura crítica · Interpretación · Evaluación"},
 {name:"Competencia Matemática M1",short:"Matemática M1",symbol:"∑",tone:"#9855D4",soft:"#F8F3FD",questions:"65",path:"/ensayos-paes/m1/piloto",description:"Resuelve problemas cotidianos mediante razonamiento matemático.",details:"Números · Álgebra · Geometría · Datos"},
 {name:"Competencia Matemática M2",short:"Matemática M2",symbol:"📐",tone:"#0B83C6",soft:"#EFF8FF",questions:"55",path:"/ensayos-paes/m2/piloto",description:"Profundiza en modelamiento y razonamiento matemático avanzado.",details:"Funciones · Modelos · Probabilidades"},
 {name:"Ciencias",short:"Ciencias",symbol:"⚗",tone:"#12B981",soft:"#EFFBF6",questions:"80",path:"/ensayos-paes/ciencias",description:"Prepara Ciencias con selección de electivo y práctica guiada.",details:"Biología · Física · Química"},
 {name:"Historia y Ciencias Sociales",short:"Historia",symbol:"🌎",tone:"#b57d0d",soft:"#FFFAED",questions:"65",path:"/ensayos-paes/historia",description:"Analiza procesos históricos, fuentes y ciudadanía.",details:"Historia · Ciudadanía · Economía"}
] as const;

export default function EnsayosPaes(){
 const [selected,setSelected]=useState<number|null>(null);
 const active=selected===null?null:exams[selected];
 return <main className="paes-root">
 <style>{`
 .paes-root{display:block;width:100%;min-height:100vh;background:#f5f7fb;font-family:system-ui,sans-serif;color:#173752;padding:28px 24px 44px;box-sizing:border-box}
 .paes-root *{box-sizing:border-box}
 .paes-shell{width:100%;max-width:1120px;min-width:0;margin:0 auto}
 .paes-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
 .paes-back{font-size:14px;color:#007e90;text-decoration:none;font-weight:700;padding:0}
 .paes-folder{display:inline-flex;align-items:center;gap:8px;text-decoration:none;background:#fff;border:1px solid #dce6ed;color:#173752;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:700}
 .paes-hero{display:block;margin:20px 0 0;padding:20px 24px;border:1px solid #cfe5ee;border-left:5px solid #0b83c6;border-radius:12px;background:#eff8ff;color:#173752}
 .paes-kicker{display:block;color:#007e90;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
 .paes-hero h1{font-size:28px;line-height:1.2;margin:8px 0;color:#173752;letter-spacing:-.02em}
 .paes-hero p{max-width:780px;color:#61788a;font-size:14px;line-height:1.5;margin:0}
 .paes-hero-stats{display:flex;gap:8px 18px;flex-wrap:wrap;margin-top:14px}
 .paes-stat{display:flex;align-items:center;gap:6px;font-size:12px;color:#61788a}
 .paes-stat strong{font-size:13px;color:#173752}
 .paes-heading{display:block;margin:24px 0 14px}
 .paes-heading h2{font-size:21px;line-height:1.3;margin:0 0 6px;color:#173752}
 .paes-heading p{margin:0;color:#61788a;font-size:14px}
 .paes-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;width:100%;align-items:stretch}
 .paes-card{appearance:none;display:flex;flex-direction:column;align-items:stretch;text-align:left;width:100%;min-width:0;margin:0;background:var(--soft);border:1px solid #e4eaf0;border-left:5px solid var(--accent);border-radius:12px;padding:14px 12px;height:66px;min-height:66px;justify-content:center;cursor:pointer;font-family:inherit;box-shadow:none;transition:transform .15s,box-shadow .15s}
 .paes-card:hover{transform:translateY(-1px);box-shadow:0 3px 10px #14344c12}
 .paes-card:focus-visible{outline:3px solid #1491a4;outline-offset:3px}
 .paes-card[data-selected="true"]{outline:2px solid var(--accent);outline-offset:1px}
 .paes-card-top{display:none;align-items:center;justify-content:space-between;gap:5px;flex-wrap:wrap}
 .paes-symbol{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:#ffffffa0;color:var(--accent);font-size:19px;font-weight:800}
 .paes-count{font-size:11px;color:#5b7281;font-weight:700}
 .paes-card h3{font-size:17px;line-height:1.3;margin:0;text-align:center;color:#173752;overflow-wrap:normal;word-break:normal}
 .paes-card p{display:none;color:#5b7281;font-size:12px;line-height:1.4;margin:0 0 12px;flex:1}
 .paes-card-bottom{display:none;justify-content:space-between;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--accent)}
 .paes-arrow{font-size:18px}
 .paes-panel{display:block;margin-top:24px;background:#fff;border:1px solid #e3ebef;border-left:5px solid var(--accent);border-radius:12px;padding:20px}
 .paes-panel-label{font-size:11px;letter-spacing:.06em;font-weight:800;text-transform:uppercase;color:#61788a}
 .paes-panel h2{margin:8px 0;font-size:21px;color:#173752}
 .paes-panel p{color:#61788a;font-size:14px;line-height:1.5}
 .paes-panel-meta{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 18px}
 .paes-panel-meta span{background:#f2f6fa;border-radius:8px;padding:8px 10px;color:#46586d;font-size:12px}
 .paes-cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:12px 18px;background:var(--accent);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700}
 .paes-tools-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.paes-tool{display:flex;flex-direction:column;justify-content:space-between;min-height:135px;padding:18px;border:1px solid #e3ebef;border-radius:12px;text-decoration:none;color:#173752}.paes-tool strong{font-size:17px}.paes-tool small{font-size:13px;line-height:1.5;color:#5b7281;margin-top:7px}.paes-tool span{font-size:13px;font-weight:700;color:#007e90;margin-top:16px}@media(max-width:700px){.paes-tools-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:460px){.paes-tools-grid{grid-template-columns:1fr}}\n .paes-note{margin-top:25px;color:#61788a;font-size:12px;line-height:1.6}
 @media(max-width:900px){.paes-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
 @media(max-width:700px){.paes-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:460px){.paes-root{padding:18px 12px 30px}.paes-grid{grid-template-columns:1fr}.paes-card{height:66px;min-height:66px;padding:10px}.paes-hero{padding:18px}.paes-hero h1{font-size:25px}.paes-folder{font-size:12px}.paes-cta{width:100%}}
 @media(prefers-reduced-motion:reduce){.paes-card{transition:none}.paes-card:hover{transform:none}}
 `}</style>
 <div className="paes-shell">
 <nav className="paes-top" aria-label="Navegación PAES"><Link className="paes-back" href="/">← Volver al menú principal</Link><Link className="paes-folder" href="/ensayos-paes/carpeta"><span aria-hidden="true">📁</span> Mi carpeta PAES <span aria-hidden="true">↗</span></Link></nav>
 <header className="paes-hero"><span className="paes-kicker">EducAntay · Preparación académica con IA</span><h1>Tu preparación PAES comienza aquí.</h1><p>Elige tu prueba, genera ensayos con inteligencia artificial y revisa tus respuestas con material de apoyo para estudiantes y docentes.</p><div className="paes-hero-stats"><div className="paes-stat"><strong>5</strong>Pruebas PAES</div><div className="paes-stat"><strong>IA</strong>Generación de ensayos</div><div className="paes-stat"><strong>PDF</strong>Prueba y solucionario</div></div></header>
 <div className="paes-heading"><div><h2>Selecciona tu ensayo</h2><p>Cinco áreas de preparación, una experiencia más simple.</p></div></div>
 <section className="paes-grid" aria-label="Pruebas PAES disponibles">{exams.map((exam,i)=><button type="button" className="paes-card" data-selected={selected===i} aria-pressed={selected===i} key={exam.name} onClick={()=>setSelected(i)} style={{"--accent":exam.tone,"--soft":exam.soft} as React.CSSProperties}><div className="paes-card-top"><span className="paes-symbol" aria-hidden="true">{exam.symbol}</span><span className="paes-count">{exam.questions} preguntas</span></div><h3>{exam.short==="Historia"?"Historia y Cs. Sociales":exam.short}</h3><p>{exam.description}</p><div className="paes-card-bottom"><span>{selected===i?"Prueba seleccionada":"Seleccionar prueba"}</span><span className="paes-arrow" aria-hidden="true">→</span></div></button>)}</section>
 {active&&<section className="paes-panel" aria-live="polite" style={{"--accent":active.tone} as React.CSSProperties}><span className="paes-panel-label">Tu prueba seleccionada</span><h2>{active.name}</h2><p>{active.description}</p><div className="paes-panel-meta"><span>{active.questions} preguntas · ensayo completo</span><span>{active.details}</span><span>Material para estudiante y docente</span></div><Link className="paes-cta" href={active.path}>Continuar a {active.short} <span aria-hidden="true">→</span></Link></section>}
 <section className="paes-tools" aria-label="Herramientas de corrección PAES">
 <div className="paes-heading"><h2>Panel de corrección PAES</h2><p>Herramientas organizadas como el panel SIMCE.</p></div>
 <div className="paes-tools-grid">
  <Link className="paes-tool" href="/ensayos-paes/hoja-respuestas" style={{background:"#ECFAF9",borderLeft:"5px solid #0B9DAD"}}><strong>Hoja de respuestas</strong><small>Seleccionar la prueba y generar su hoja OMR con la cantidad correspondiente de preguntas.</small><span>Crear hoja →</span></Link>
 <Link className="paes-tool" href="/ensayos-paes/corrector/cargar" style={{background:"#F4F0FD",borderLeft:"5px solid #8650C7"}}><strong>Cargar JPG, PNG o PDF</strong><small>Revisar hojas escaneadas. La lectura óptica automática requiere validación.</small><span>Cargar archivo →</span></Link>
<Link className="paes-tool" href="/ensayos-paes/corrector" style={{background:"#F4F0FD",borderLeft:"5px solid #8650C7"}}><strong>Corrector PAES</strong><small>Seleccionar ensayo guardado, ingresar respuestas y calcular resultados.</small><span>Abrir corrector →</span></Link>
 </div></section>
 <div style={{marginTop:18}}><Link className="paes-folder" href="/ensayos-paes/analitica">📊 Analítica institucional PAES · resultados e informe pedagógico</Link></div>
 <p className="paes-note">Los ensayos son material de práctica de EducAntay generado con IA. No corresponden a pruebas oficiales del DEMRE. La configuración específica se realiza dentro de cada generador.</p>
 </div></main>;
}
