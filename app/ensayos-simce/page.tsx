"use client";

const groups = [
  {grade:"2", title:"2° básico · Lectura", subtitle:"Cuadernillos y actividades de lectura", items:[
    {title:"Precursores de lectura", module:"precursores", icon:"🔤", description:"Conciencia fonológica, sonidos y palabras"},
    {title:"Fluidez lectora", module:"fluidez", icon:"📚", description:"Precisión, ritmo y seguimiento lector"},
    {title:"Comprensión lectora", module:"cuadernillos", icon:"📖", description:"Textos narrativos e informativos y preguntas"}
  ]},
  {grade:"4", title:"Ensayo SIMCE · 4° básico", subtitle:"Ensayos originales para practicar y revisar", items:[
    {title:"Lectura", module:"simce-lectura", icon:"📗", description:"Preguntas por habilidades y OA"},
    {title:"Matemática", module:"simce-matematica", icon:"📘", description:"Preguntas por ejes y OA"}
  ]},
  {grade:"6", title:"Ensayo SIMCE · 6° básico", subtitle:"Ensayos originales para practicar y revisar", items:[
    {title:"Lectura", module:"simce-lectura", icon:"📗", description:"Preguntas por habilidades y OA"},
    {title:"Matemática", module:"simce-matematica", icon:"📘", description:"Preguntas por ejes y OA"}
  ]},
  {grade:"8", title:"Ensayo SIMCE · 8° básico", subtitle:"Ensayos originales para practicar y revisar", items:[
    {title:"Lectura", module:"simce-lectura", icon:"📗", description:"Preguntas por habilidades y OA"},
    {title:"Matemática", module:"simce-matematica", icon:"📘", description:"Preguntas por ejes y OA"}
  ]}
];
export default function EnsayosSimcePage(){
  return <main style={{maxWidth:1060,margin:"0 auto",padding:"32px 20px",fontFamily:"system-ui,sans-serif",color:"#15324b"}}>
    <a href="/" style={{color:"#007e90"}}>← Volver a EducAntay</a>
    <h1>Ensayos SIMCE y Lectura</h1>
    <p>Selecciona directamente el cuadro del recurso que deseas preparar. Los niveles aparecen de arriba hacia abajo, desde 2° hasta 8° básico.</p>
    {groups.map(group=><section key={group.grade} aria-label={group.title} style={{marginTop:30}}>
      <div style={{borderBottom:"2px solid #d8e9ee",paddingBottom:10,marginBottom:16}}>
        <h2 style={{margin:"0 0 5px",fontSize:23}}>{group.title}</h2>
        <p style={{margin:0,color:"#60788a"}}>{group.subtitle}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(225px,1fr))",gap:14}}>
        {group.items.map(item=><a key={item.module} href={`/recursos-aprendizaje?modulo=${item.module}&nivel=${group.grade}`} style={{display:"block",textDecoration:"none",color:"inherit",background:"#fff",border:"1px solid #cbdde5",borderRadius:16,padding:20,boxShadow:"0 2px 8px rgba(15,52,74,.05)"}}>
          <span aria-hidden="true" style={{fontSize:29}}>{item.icon}</span>
          <h3 style={{margin:"12px 0 8px",fontSize:19}}>{item.title}</h3>
          <p style={{fontSize:14,color:"#5b7281",minHeight:40}}>{item.description}</p>
          <strong style={{color:"#007e90"}}>Abrir recurso →</strong>
        </a>)}
      </div>
    </section>)}
    <p style={{marginTop:30,fontSize:13,color:"#596b77"}}>Los ensayos tipo SIMCE son materiales originales no oficiales. Revisa las preguntas y su tabla de especificaciones antes de aplicarlos.</p>
  </main>;
}
