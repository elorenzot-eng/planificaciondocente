"use client";
import {useEffect,useState} from "react";
type Question={domain:string;question:string;options:string[];answer:number;explanation:string};
const sample:Question[]=[
{domain:"Evaluación pedagógica",question:"Una docente aplica una actividad diagnóstica y descubre que parte del curso no domina un prerrequisito. ¿Qué decisión es más pertinente?",options:["Mantener la secuencia sin ajustes","Reenseñar el prerrequisito y verificar avances","Calificar el diagnóstico como sumativo","Excluir el contenido del semestre"],answer:1,explanation:"La evaluación diagnóstica permite ajustar la enseñanza a las necesidades detectadas y monitorear el progreso."},
{domain:"Diversificación de la enseñanza",question:"¿Qué acción favorece el acceso al aprendizaje de estudiantes con necesidades diversas?",options:["Usar una sola modalidad de respuesta","Reducir las expectativas para todo el curso","Ofrecer distintas formas de participación y expresión","Aplicar idéntico apoyo sin considerar barreras"],answer:2,explanation:"Diversificar medios de participación y expresión ayuda a reducir barreras manteniendo objetivos de aprendizaje pertinentes."},
{domain:"Retroalimentación",question:"¿Cuál de las siguientes retroalimentaciones es más útil para mejorar un texto argumentativo?",options:["Muy bien, sigue así","Tu nota es 5,0","Debes esforzarte más","Tu tesis es clara; agrega evidencia específica para sustentar el segundo argumento"],answer:3,explanation:"Una retroalimentación eficaz señala evidencia concreta del desempeño y un paso accionable para mejorar."}
,
{domain:"Planificación pedagógica",question:"Al planificar una clase, ¿qué elemento permite verificar la coherencia entre aprendizaje y evaluación?",options:["La cantidad de diapositivas","La relación entre objetivo, actividades y evidencia evaluativa","El tiempo dedicado a pasar lista","La extensión del texto guía"],answer:1,explanation:"La alineación entre objetivos, experiencias de aprendizaje y evidencias permite tomar decisiones pedagógicas fundamentadas."},
{domain:"Gestión de aula",question:"Ante dificultades recurrentes para participar en una discusión grupal, ¿qué estrategia promueve mejor la participación?",options:["Asignar siempre la palabra a los mismos estudiantes","Eliminar toda discusión","Establecer turnos y apoyos explícitos para argumentar","Calificar negativamente cada silencio"],answer:2,explanation:"Las estructuras claras de participación y los apoyos favorecen un ambiente inclusivo y oportunidades equitativas."},
{domain:"Evaluación pedagógica",question:"¿Cuál evidencia permite monitorear mejor el avance hacia un objetivo de aprendizaje durante la clase?",options:["Solo la asistencia del curso","Una actividad breve con criterios vinculados al objetivo","La cantidad de páginas copiadas","La duración del recreo"],answer:1,explanation:"La evidencia de desempeño vinculada al objetivo permite identificar avances y ajustar oportunamente la enseñanza."}
];
export default function EcepPage(){
 const [answers,setAnswers]=useState<Record<number,number>>({});
 const [finished,setFinished]=useState(false);
 const [history,setHistory]=useState<{date:string;score:number;total:number}[]>([]);
 const [timed,setTimed]=useState(false);
 const [started,setStarted]=useState(false);
 const [secondsLeft,setSecondsLeft]=useState(600);
 useEffect(()=>{if(!started||!timed||finished||secondsLeft<=0)return;const id=window.setTimeout(()=>setSecondsLeft(v=>Math.max(0,v-1)),1000);return()=>window.clearTimeout(id)},[started,timed,finished,secondsLeft]);
 const timeUp=started&&timed&&secondsLeft===0;
 function restart(){setAnswers({});setFinished(false);setStarted(false);setSecondsLeft(600);}

 useEffect(()=>{try{const saved=window.localStorage.getItem("educantay-ecep-demo-history");if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed))setHistory(parsed.filter(x=>typeof x?.score==="number"&&typeof x?.total==="number"&&typeof x?.date==="string").slice(0,20));}}catch{}},[]);
 function finishPractice(){const result={date:new Date().toISOString(),score,total:sample.length};const next=[result,...history].slice(0,20);setHistory(next);try{window.localStorage.setItem("educantay-ecep-demo-history",JSON.stringify(next))}catch{}setFinished(true);}

 const score=sample.filter((q,i)=>answers[i]===q.answer).length;
 const domains=Array.from(new Set(sample.map(q=>q.domain))).map(domain=>{const ids=sample.map((q,i)=>q.domain===domain?i:-1).filter(i=>i>=0);return {domain,total:ids.length,correct:ids.filter(i=>answers[i]===sample[i].answer).length};});
 return <main style={{maxWidth:900,margin:"0 auto",padding:"32px 20px",fontFamily:"system-ui,sans-serif",color:"#17324b"}}>
 <a href="/" style={{color:"#008c99"}}>← Volver a EducAntay</a>
 <header style={{margin:"28px 0"}}><small>EDUCANTAY · PREPARACIÓN DOCENTE</small><h1>ECEP IA</h1><p>Practica, revisa tus respuestas y fortalece tus conocimientos pedagógicos.</p></header>
 <section style={{background:"#eef7f8",padding:20,borderRadius:16,marginBottom:24}}><strong>Demostración: Educación Básica</strong><p>Estas preguntas son originales e ilustrativas. No corresponden a ítems oficiales ni constituyen un ensayo ECEP validado. La alineación por especialidad y temario oficial está pendiente.</p></section>
 <section style={{padding:16,border:"1px solid #d9e3e9",borderRadius:12,marginBottom:20}}>
 <h2 style={{fontSize:19}}>Modalidad de práctica</h2>
 {!started?<><label><input type="checkbox" checked={timed} onChange={e=>setTimed(e.target.checked)}/> Activar práctica cronometrada (10 minutos)</label><p>Demostración con 6 preguntas; no reproduce la duración ni la estructura de la ECEP oficial.</p><button type="button" onClick={()=>setStarted(true)}>Comenzar práctica</button></>:<><strong>{timed?"Tiempo restante: "+String(Math.floor(secondsLeft/60)).padStart(2,"0")+":"+String(secondsLeft%60).padStart(2,"0"):"Práctica sin límite de tiempo"}</strong>{timeUp&&<p role="alert">Se agotó el tiempo. Envía tus respuestas para corregir.</p>}</>}
 </section>
 {started&&sample.map((q,i)=><section key={i} style={{border:"1px solid #d9e3e9",borderRadius:16,padding:22,marginBottom:16}}>
 <small>{q.domain} · Pregunta {i+1} de {sample.length}</small><h2 style={{fontSize:19}}>{q.question}</h2>
 {q.options.map((option,j)=><label key={j} style={{display:"block",padding:"10px 12px",margin:"8px 0",border:"1px solid #dae4e9",borderRadius:9,background:answers[i]===j?"#dff4f2":"white",cursor:finished?"default":"pointer"}}>
 <input type="radio" name={`question-${i}`} checked={answers[i]===j} disabled={finished||timeUp} onChange={()=>setAnswers(a=>({...a,[i]:j}))}/> {String.fromCharCode(65+j)}. {option}</label>)}
 {finished&&<div role="status" style={{padding:12,background:answers[i]===q.answer?"#edf8ef":"#fff5e9",borderRadius:8}}><strong>{answers[i]===q.answer?"Correcta":"Por revisar"} · Respuesta: {String.fromCharCode(65+q.answer)}</strong><p>{q.explanation}</p></div>}
 </section>)}
 {started&&!finished?<button disabled={!timeUp&&Object.keys(answers).length!==sample.length} onClick={finishPractice} style={{padding:"12px 24px",background:"#008c99",color:"white",border:0,borderRadius:9,cursor:"pointer"}}>Corregir práctica</button>:finished?<section aria-live="polite"><h2>Resultado: {score}/{sample.length} ({Math.round(score/sample.length*100)}%)</h2><p>Resultado de práctica orientativo, no equivalente a una calificación ECEP oficial.</p><h3>Desempeño por ámbito</h3><ul>{domains.map(d=><li key={d.domain}>{d.domain}: {d.correct}/{d.total} ({Math.round(100*d.correct/d.total)}%)</li>)}</ul><p>Recomendación: revisa las explicaciones de los ámbitos con menor porcentaje de aciertos antes de repetir la práctica.</p><button onClick={restart} style={{padding:"12px 24px",borderRadius:9}}>Volver a practicar</button></section>:null}
 {history.length>0&&<section style={{marginTop:30,padding:18,border:"1px solid #d9e3e9",borderRadius:12}}><h2 style={{fontSize:20}}>Mi historial de práctica</h2><p>Se guarda solo en este navegador y dispositivo. No se sincroniza con tu cuenta.</p><ol>{history.map((h,i)=><li key={i}>{new Date(h.date).toLocaleDateString("es-CL")}: {h.score}/{h.total} ({Math.round(h.score/h.total*100)}%)</li>)}</ol><button type="button" onClick={()=>{setHistory([]);try{window.localStorage.removeItem("educantay-ecep-demo-history")}catch{}}}>Eliminar historial local</button></section>}
 </main>
}