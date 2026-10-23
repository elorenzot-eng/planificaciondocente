"use client";
import Link from "next/link";
import {useState} from "react";

const exams=[
 {name:"Competencia Lectora",short:"Lectura",symbol:"📖",tone:"#0f766e",soft:"#ccfbf1",questions:"65",path:"/ensayos-paes/piloto",description:"Comprende, interpreta y evalúa textos de distintos formatos.",details:"Lectura crítica · Interpretación · Evaluación"},
 {name:"Competencia Matemática M1",short:"Matemática M1",symbol:"∑",tone:"#7c3aed",soft:"#ede9fe",questions:"65",path:"/ensayos-paes/m1/piloto",description:"Resuelve problemas cotidianos mediante razonamiento matemático.",details:"Números · Álgebra · Geometría · Datos"},
 {name:"Competencia Matemática M2",short:"Matemática M2",symbol:"📐",tone:"#1d4ed8",soft:"#dbeafe",questions:"55",path:"/ensayos-paes/m2/piloto",description:"Profundiza en modelamiento y razonamiento matemático avanzado.",details:"Funciones · Modelos · Probabilidades"},
 {name:"Ciencias",short:"Ciencias",symbol:"⚗",tone:"#15803d",soft:"#dcfce7",questions:"80",path:"/ensayos-paes/ciencias",description:"Prepara Ciencias con selección de electivo y práctica guiada.",details:"Biología · Física · Química"},
 {name:"Historia y Ciencias Sociales",short:"Historia",symbol:"🌎",tone:"#c2410c",soft:"#ffedd5",questions:"65",path:"/ensayos-paes/historia",description:"Analiza procesos históricos, fuentes y ciudadanía.",details:"Historia · Ciudadanía · Economía"}
] as const;

export default function EnsayosPaes(){
 const [selected,setSelected]=useState<number|null>(null);
 const active=selected===null?null:exams[selected];
 return <main className="paes-root">
 <style>{`
 .paes-root{min-height:100vh;background:linear-gradient(145deg,#eef8f8 0%,#f7f8fd 42%,#f7f5ff 100%);font-family:Arial,Helvetica,sans-serif;color:#15263b;padding:clamp(18px,4vw,52px)}
 .paes-shell{max-width:1190px;margin:auto}
 .paes-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
 .paes-back{font-size:14px;color:#25677a;text-decoration:none;font-weight:700}
 .paes-folder{display:inline-flex;align-items:center;gap:9px;text-decoration:none;background:#fff;border:1px solid #dce6ed;color:#19334b;border-radius:12px;padding:12px 16px;font-weight:700;box-shadow:0 4px 14px #18334b0b}
 .paes-hero{margin-top:26px;padding:clamp(24px,5vw,48px);border-radius:26px;background:linear-gradient(115deg,#0e6477 0%,#18538a 55%,#543d9e 100%);color:white;position:relative;overflow:hidden;box-shadow:0 18px 44px #174c8430}
 .paes-hero:after{content:"";position:absolute;width:300px;height:300px;right:-100px;top:-120px;border:50px solid #ffffff14;border-radius:50%;pointer-events:none}
 .paes-kicker{display:inline-block;border:1px solid #ffffff75;background:#ffffff20;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
 .paes-hero h1{font-size:clamp(31px,4.4vw,49px);line-height:1.1;margin:20px 0 13px;letter-spacing:-.035em;max-width:700px}
 .paes-hero p{max-width:690px;color:#e1f2fa;font-size:clamp(15px,1.6vw,18px);line-height:1.6;margin:0}
 .paes-hero-stats{display:flex;gap:12px;flex-wrap:wrap;margin-top:27px}
 .paes-stat{border:1px solid #ffffff40;background:#ffffff18;border-radius:12px;padding:11px 16px;font-size:13px}
 .paes-stat strong{font-size:21px;display:block;margin-bottom:3px}
 .paes-heading{display:flex;justify-content:space-between;gap:16px;align-items:end;margin:34px 0 19px}
 .paes-heading h2{font-size:clamp(22px,2.6vw,28px);margin:0 0 6px;letter-spacing:-.02em}
 .paes-heading p{margin:0;color:#627389;font-size:14px}
 .paes-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
 .paes-card{appearance:none;display:flex;flex-direction:column;align-items:stretch;text-align:left;width:100%;background:#fff;border:2px solid transparent;border-radius:20px;padding:23px;min-height:242px;cursor:pointer;box-shadow:0 6px 22px #1536530e;transition:transform .15s,box-shadow .15s,border-color .15s}
 .paes-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px #1536531a}
 .paes-card:focus-visible{outline:3px solid #1491a4;outline-offset:3px}
 .paes-card[data-selected="true"]{border-color:var(--accent);box-shadow:0 12px 28px #1536531b}
 .paes-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
 .paes-symbol{width:55px;height:55px;display:grid;place-items:center;border-radius:16px;background:var(--soft);color:var(--accent);font-size:27px;font-weight:800}
 .paes-count{font-size:12px;background:#f2f5f9;color:#53657a;border-radius:999px;padding:7px 10px;font-weight:700}
 .paes-card h3{font-size:19px;line-height:1.25;margin:20px 0 9px;color:#14263b}
 .paes-card p{color:#637387;font-size:14px;line-height:1.55;margin:0 0 19px;flex:1}
 .paes-card-bottom{display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:800;color:var(--accent)}
 .paes-arrow{font-size:22px}
 .paes-panel{margin-top:24px;background:white;border:1px solid #dce6ee;border-radius:20px;padding:clamp(20px,3vw,30px);box-shadow:0 8px 24px #1536530e}
 .paes-panel-label{font-size:12px;letter-spacing:.07em;font-weight:800;text-transform:uppercase;color:#66778a}
 .paes-panel h2{margin:9px 0 10px;font-size:25px}
 .paes-panel p{color:#637387;line-height:1.55}
 .paes-panel-meta{display:flex;gap:9px;flex-wrap:wrap;margin:18px 0 23px}
 .paes-panel-meta span{background:#f2f6fa;border-radius:8px;padding:9px 12px;color:#46586d;font-size:13px;font-weight:700}
 .paes-cta{display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:15px 22px;background:var(--accent);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:800}
 .paes-note{margin-top:24px;color:#7a8898;font-size:12px;line-height:1.5}
 @media(max-width:950px){.paes-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
 @media(max-width:600px){.paes-root{padding:16px}.paes-grid{grid-template-columns:1fr;gap:12px}.paes-card{min-height:unset;padding:19px}.paes-card h3{margin:13px 0 7px}.paes-card p{margin-bottom:14px}.paes-hero{border-radius:20px}.paes-heading{margin-top:26px}.paes-folder{font-size:13px}.paes-cta{width:100%;box-sizing:border-box}}
 @media(prefers-reduced-motion:reduce){.paes-card{transition:none}.paes-card:hover{transform:none}}
 `}</style>
 <div className="paes-shell">
 <nav className="paes-top" aria-label="Navegación PAES"><Link className="paes-back" href="/">← Volver al menú principal</Link><Link className="paes-folder" href="/ensayos-paes/carpeta"><span aria-hidden="true">📁</span> Mi carpeta PAES <span aria-hidden="true">↗</span></Link></nav>
 <header className="paes-hero"><span className="paes-kicker">EducAntay · Preparación académica con IA</span><h1>Tu preparación PAES comienza aquí.</h1><p>Elige tu prueba, genera ensayos con inteligencia artificial y revisa tus respuestas con material de apoyo para estudiantes y docentes.</p><div className="paes-hero-stats"><div className="paes-stat"><strong>5</strong>Pruebas PAES</div><div className="paes-stat"><strong>IA</strong>Generación de ensayos</div><div className="paes-stat"><strong>PDF</strong>Prueba y solucionario</div></div></header>
 <div className="paes-heading"><div><h2>Selecciona tu ensayo</h2><p>Cinco áreas de preparación, una experiencia más simple.</p></div></div>
 <section className="paes-grid" aria-label="Pruebas PAES disponibles">{exams.map((exam,i)=><button type="button" className="paes-card" data-selected={selected===i} aria-pressed={selected===i} key={exam.name} onClick={()=>setSelected(i)} style={{"--accent":exam.tone,"--soft":exam.soft} as React.CSSProperties}><div className="paes-card-top"><span className="paes-symbol" aria-hidden="true">{exam.symbol}</span><span className="paes-count">{exam.questions} preguntas</span></div><h3>{exam.name}</h3><p>{exam.description}</p><div className="paes-card-bottom"><span>{selected===i?"Prueba seleccionada":"Seleccionar prueba"}</span><span className="paes-arrow" aria-hidden="true">→</span></div></button>)}</section>
 {active&&<section className="paes-panel" aria-live="polite" style={{"--accent":active.tone} as React.CSSProperties}><span className="paes-panel-label">Tu prueba seleccionada</span><h2>{active.name}</h2><p>{active.description}</p><div className="paes-panel-meta"><span>{active.questions} preguntas · ensayo completo</span><span>{active.details}</span><span>Material para estudiante y docente</span></div><Link className="paes-cta" href={active.path}>Continuar a {active.short} <span aria-hidden="true">→</span></Link></section>}
 <p className="paes-note">Los ensayos son material de práctica de EducAntay generado con IA. No corresponden a pruebas oficiales del DEMRE. La configuración específica se realiza dentro de cada generador.</p>
 </div></main>;
}
