import Link from "next/link";
const items=[
{title:"Precursores de lectura",description:"Conciencia fonológica y reconocimiento inicial",module:"precursores"},
{title:"Fluidez lectora",description:"Lectura, precisión y seguimiento",module:"fluidez"},
{title:"Comprensión lectora",description:"Textos y preguntas de comprensión",module:"cuadernillos"}
];
export default function PrecursoresLecturaPage(){
return <main style={{maxWidth:1100,margin:"0 auto",padding:"32px 24px",color:"#173752",fontFamily:"system-ui,sans-serif"}}>
<Link href="/" style={{color:"#008c9b"}}>← Volver a EducAntay</Link>
<h1 style={{fontSize:32,marginBottom:8}}>Lectura · 2° básico</h1>
<p style={{color:"#61788a",marginBottom:28}}>Cuadernillos con estructura pedagógica propia, separados de los ensayos SIMCE.</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
{items.map(item=><Link key={item.module} href={`/recursos-aprendizaje?modulo=${item.module}&nivel=2`} style={{display:"block",textDecoration:"none",background:"#eff9fe",color:"#173752",borderLeft:"6px solid #0ea5e9",borderRadius:14,padding:24,minHeight:155}}>
<strong style={{display:"block",fontSize:20,marginBottom:12}}>{item.title}</strong><span style={{color:"#557388"}}>{item.description}</span><span style={{display:"block",marginTop:18,color:"#008c9b"}}>Abrir cuadernillo →</span>
</Link>)}
</div>
</main>;
}
