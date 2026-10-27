import Link from "next/link";
import "./presentacion.css";

const modules = [
 {title:"Currículum Nacional",desc:"Objetivos de aprendizaje y recursos curriculares para organizar la enseñanza.",tone:"cyan",href:"/?ingresar=1"},
 {title:"Planificaciones IA",desc:"Diseña experiencias de aprendizaje y secuencias pedagógicas con apoyo de IA.",tone:"yellow",href:"/?ingresar=1"},
 {title:"Evaluaciones IA",desc:"Elabora instrumentos, preguntas y criterios de evaluación.",tone:"pink",href:"/?ingresar=1"},
 {title:"Adecuaciones PIE",desc:"Apoyos y estrategias inclusivas con enfoque DUA.",tone:"green",href:"/?ingresar=1"},
 {title:"Material educativo",desc:"Crea guías, presentaciones y materiales para tus clases.",tone:"blue",href:"/?ingresar=1"},
 {title:"Ensayos SIMCE IA",desc:"Prepara ensayos y consulta herramientas de seguimiento y corrección.",tone:"cyan",href:"/ensayos-simce"},
 {title:"Ensayos PAES IA",desc:"Competencia Lectora, Matemática, Ciencias e Historia.",tone:"yellow",href:"/ensayos-paes"},
 {title:"Preparación ECEP IA",desc:"Practica conocimientos disciplinares y pedagógicos.",tone:"pink",href:"/ecep-ia"},
 {title:"Portafolio Docente IA",desc:"Organiza evidencias y recibe orientación formativa.",tone:"green",href:"/?ingresar=1"},
 {title:"Gestión institucional",desc:"Herramientas de administración para establecimientos y sostenedores.",tone:"blue",href:"/?ingresar=1"}
];
export default function PresentacionPage(){
return <main className="ep">
 <header className="ep-header"><Link href="/" className="ep-brand"><img src="/educantay-logo.svg" alt="" /> <span>EducAntay</span></Link><nav aria-label="Navegación"><a href="#soluciones">Soluciones</a><a href="#yanay">Yanay IA</a><a href="#contacto">Contacto</a><Link className="ep-login" href="/?ingresar=1">Ingresar a la plataforma</Link></nav></header>
 <section className="ep-hero"><div><span className="ep-kicker">EDTECH · ANTOFAGASTA, CHILE</span><h1>La educación avanza con <em>inteligencia artificial</em></h1><p>Planifica, evalúa y acompaña el aprendizaje con herramientas diseñadas para docentes, colegios y sostenedores.</p><div className="ep-actions"><a className="ep-primary" href="#soluciones">Conoce nuestros módulos</a><Link className="ep-secondary" href="/">Ingresar</Link></div></div><div className="ep-feature"><span>UNA PLATAFORMA, MÁS POSIBILIDADES</span><strong>Enseñar · Aprender · Evaluar · Gestionar</strong><p>Soluciones pedagógicas con identidad regional y foco en la mejora educativa.</p></div></section>
 <section id="soluciones" className="ep-section"><span className="ep-kicker">NUESTRAS SOLUCIONES</span><h2>Descubre todo lo que puedes hacer con EducAntay</h2><p>Explora nuestros módulos y encuentra las herramientas que necesitas.</p><div className="ep-modules">{modules.map((m,i)=><article className={"ep-module "+m.tone} key={m.title}><span className="ep-number">{String(i+1).padStart(2,"0")}</span><h3>{m.title}</h3><p>{m.desc}</p><Link href={m.href} aria-label={"Acceder a "+m.title}>{m.href==="/"? "Ingresar para explorar":"Abrir módulo"} <span aria-hidden="true">→</span></Link></article>)}</div></section>
 <section id="yanay" className="ep-yanay"><div><span className="ep-kicker">ACOMPAÑAMIENTO INTELIGENTE</span><h2>Conoce a Yanay IA</h2><p>Tu asistente virtual de EducAntay, preparada para orientar, responder preguntas y acompañarte en el uso de nuestras soluciones educativas.</p><Link href="/?ingresar=1">Ingresar a EducAntay y consultar a Yanay →</Link></div><div className="ep-yanay-portrait" role="img" aria-label="Retrato oficial de Yanay"><span>Yanay IA</span></div></section>
 <section id="contacto" className="ep-contact"><h2>EducAntay para tu comunidad educativa</h2><p>Conoce las soluciones para docentes y establecimientos. Para consultar licencias institucionales, ingresa a la plataforma y solicita orientación.</p><Link className="ep-primary" href="/?ingresar=1">Explorar EducAntay</Link></section>
 <footer className="ep-footer">EducAntay · Tecnología educativa desde Antofagasta, Chile</footer>
 </main>;
}