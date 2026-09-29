import Link from "next/link";

export type ResourceItem={slug:string;title:string;description:string;keyword:string;sections:{heading:string;body:string}[]};

export const resources:ResourceItem[]=[
 {slug:"planificacion-docente",title:"Planificación docente: cómo organizar una clase efectiva",description:"Guía práctica para estructurar una planificación docente desde el objetivo de aprendizaje hasta la evaluación formativa.",keyword:"planificación docente",sections:[
  {heading:"¿Qué debe contener una planificación docente?",body:"Una planificación útil conecta el aprendizaje esperado con actividades concretas, recursos, apoyos y evidencias. Más que completar un formato, permite anticipar qué aprenderán los estudiantes, cómo se desarrollará la experiencia y cómo se observará el progreso."},
  {heading:"Del objetivo a la experiencia de aprendizaje",body:"Comienza identificando el objetivo y los conocimientos o habilidades que moviliza. Luego define una secuencia de inicio, desarrollo y cierre, incorporando preguntas, modelamiento, práctica, retroalimentación y oportunidades para que los estudiantes demuestren lo aprendido."},
  {heading:"Evaluación integrada a la planificación",body:"La evaluación formativa puede estar presente durante toda la clase mediante preguntas, producciones breves, observación, listas de cotejo o tickets de salida. La evidencia obtenida permite ajustar la enseñanza y preparar las siguientes experiencias."}
 ]},
 {slug:"dua-planificacion-docente",title:"DUA en la planificación docente: principios y aplicación práctica",description:"Cómo incorporar alternativas de participación, representación y acción en una planificación de clases.",keyword:"DUA planificación docente",sections:[
  {heading:"Planificar considerando la diversidad",body:"El Diseño Universal para el Aprendizaje invita a anticipar barreras y ofrecer distintas formas de acceso, participación y expresión. Esto permite diseñar experiencias más flexibles desde el inicio, en lugar de adaptar únicamente después."},
  {heading:"Opciones dentro de una misma clase",body:"Una actividad puede combinar explicaciones orales y visuales, ejemplos, organizadores, apoyos graduados y distintas maneras de responder. La selección debe relacionarse con el objetivo de aprendizaje y las características reales del grupo."},
  {heading:"DUA y decisiones pedagógicas",body:"Incorporar DUA no significa multiplicar actividades sin propósito. Significa tomar decisiones intencionadas sobre apoyos, recursos, formas de participación y demostración del aprendizaje manteniendo expectativas pedagógicas claras."}
 ]},
 {slug:"evaluacion-formativa",title:"Evaluación formativa: estrategias para recoger evidencia de aprendizaje",description:"Ideas para integrar evaluación formativa, retroalimentación y toma de decisiones durante la enseñanza.",keyword:"evaluación formativa",sections:[
  {heading:"Evaluar para tomar decisiones",body:"La evaluación formativa recoge evidencia durante el proceso de aprendizaje. Su valor está en utilizar esa información para retroalimentar al estudiante y decidir si es necesario reforzar, profundizar, cambiar una estrategia o avanzar."},
  {heading:"Estrategias breves y utilizables",body:"Preguntas focalizadas, semáforos de comprensión, mini producciones, observación con criterios, listas de cotejo y tickets de salida permiten obtener información sin transformar cada clase en una prueba."},
  {heading:"Retroalimentación vinculada a criterios",body:"Una retroalimentación útil señala qué se logró, qué necesita mejorar y cuál puede ser el siguiente paso. Cuando los criterios son comprensibles, el estudiante puede participar de manera más activa en la revisión de su propio trabajo."}
 ]},
 {slug:"rubricas-evaluacion",title:"Rúbricas de evaluación: cómo construir criterios claros",description:"Guía para diseñar rúbricas con criterios, niveles de desempeño y descriptores observables.",keyword:"rúbricas de evaluación",sections:[
  {heading:"Qué aporta una rúbrica",body:"Una rúbrica organiza criterios relevantes y describe distintos niveles de desempeño. Puede orientar la producción del estudiante, facilitar una evaluación consistente y hacer más transparente aquello que se espera observar."},
  {heading:"Criterios observables",body:"Los criterios deben representar aspectos importantes del aprendizaje y evitar formulaciones ambiguas. Los descriptores funcionan mejor cuando expresan diferencias observables entre niveles y no se limitan a cambiar palabras como excelente, bueno o insuficiente."},
  {heading:"Usarla antes, durante y después",body:"La rúbrica puede presentarse antes de la tarea, utilizarse para autoevaluación o coevaluación durante el proceso y servir de base para la retroalimentación final."}
 ]},
 {slug:"objetivos-de-aprendizaje-planificacion",title:"Objetivos de Aprendizaje: cómo utilizarlos en la planificación",description:"Cómo pasar de un Objetivo de Aprendizaje a actividades, evidencias y recursos coherentes para la clase.",keyword:"Objetivos de Aprendizaje planificación",sections:[
  {heading:"El OA como punto de partida",body:"El Objetivo de Aprendizaje orienta la selección de experiencias y evidencias. Conviene analizar qué conocimientos, habilidades o desempeños implica antes de escoger actividades o instrumentos."},
  {heading:"Alinear actividad y evidencia",body:"Una actividad es pertinente cuando permite movilizar aquello que el objetivo demanda. Del mismo modo, la evidencia debe permitir observar el aprendizaje esperado y no solamente la participación o el cumplimiento de una tarea."},
  {heading:"Mantener coherencia curricular",body:"La secuencia entre objetivo, actividad, apoyo y evaluación ayuda a evitar planificaciones fragmentadas. Educantay utiliza esta relación como base para generar documentos editables que el docente puede revisar y contextualizar."}
 ]}
];

export function ResourceLayout({item}:{item:ResourceItem}){
 return <main style={{maxWidth:980,margin:"0 auto",padding:"30px 24px 80px",fontFamily:"Arial,sans-serif",color:"#14213d"}}>
  <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,marginBottom:60}}><Link href="/" style={{fontWeight:900,fontSize:22,textDecoration:"none",color:"inherit"}}>EDUCANTAY</Link><div style={{display:"flex",gap:18,alignItems:"center"}}><Link href="/recursos-docentes">Recursos docentes</Link><Link href="/?ingresar=1" style={{padding:"11px 16px",borderRadius:12,textDecoration:"none",background:"#14213d",color:"white",fontWeight:700}}>Probar Educantay</Link></div></nav>
  <article><p style={{fontWeight:800,letterSpacing:1,fontSize:13}}>RECURSOS PARA DOCENTES · CHILE</p><h1 style={{fontSize:"clamp(36px,6vw,62px)",lineHeight:1.05,maxWidth:850}}>{item.title}</h1><p style={{fontSize:21,lineHeight:1.6,color:"#46536b",maxWidth:800}}>{item.description}</p>
   {item.sections.map(s=><section key={s.heading} style={{marginTop:48,maxWidth:820}}><h2 style={{fontSize:30}}>{s.heading}</h2><p style={{fontSize:18,lineHeight:1.75,color:"#46536b"}}>{s.body}</p></section>)}
   <section style={{marginTop:56,padding:30,borderRadius:20,background:"#f4f7fb"}}><h2 style={{marginTop:0}}>Lleva esta estructura a tu trabajo docente</h2><p style={{fontSize:18,lineHeight:1.65}}>Educantay permite trabajar con Objetivos de Aprendizaje, planificaciones, evaluaciones, rúbricas y material educativo en un mismo espacio. Los resultados son editables para que cada docente los revise y adapte a su contexto.</p><Link href="/?ingresar=1" style={{display:"inline-block",marginTop:10,padding:"14px 20px",borderRadius:12,textDecoration:"none",background:"#14213d",color:"white",fontWeight:800}}>Probar Educantay</Link></section>
  </article>
  <aside style={{marginTop:56}}><h2>Continúa explorando</h2><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:14}}>{resources.filter(x=>x.slug!==item.slug).slice(0,4).map(x=><Link key={x.slug} href={"/recursos-docentes/"+x.slug} style={{padding:18,border:"1px solid #e1e5ec",borderRadius:16,textDecoration:"none",color:"inherit",fontWeight:700}}>{x.title}</Link>)}</div></aside>
 </main>
}
