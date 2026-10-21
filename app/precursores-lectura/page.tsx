import Link from "next/link";
const items=[
{title:"Precursores de lectura",description:"Conciencia fonológica y reconocimiento inicial",module:"precursores",color:"#0ea5e9",background:"#eaf7ff"},
{title:"Fluidez lectora",description:"Lectura, precisión y seguimiento",module:"fluidez",color:"#10b981",background:"#ecfdf5"},
{title:"Comprensión lectora",description:"Textos y preguntas de comprensión",module:"cuadernillos",color:"#a855f7",background:"#f5edff"}
];
export default function PrecursoresLecturaPage(){
return <main style={{maxWidth:1050,margin:"0 auto",padding:"32px 24px",color:"#173752",fontFamily:"system-ui,sans-serif"}}>
<Link href="/" style={{color:"#008c9b"}}>← Volver a EducAntay</Link>
<h1 style={{fontSize:32,marginBottom:8}}>Lectura · 2° básico</h1>
<p style={{color:"#61788a",marginBottom:24}}>Cuadernillos con estructura pedagógica propia, separados de los ensayos SIMCE.</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,alignItems:"start"}}>
{items.map(item=><Link key={item.module} href={`/recursos-aprendizaje?modulo=${item.module}&nivel=2`} style={{display:"flex",flexDirection:"column",justifyContent:"space-between",gap:12,textDecoration:"none",background:item.background,color:"#173752",borderLeft:`5px solid ${item.color}`,borderRadius:14,padding:"20px 22px",minHeight:0,boxShadow:"0 2px 8px rgba(20,50,80,.05)"}}>
<strong style={{display:"block",fontSize:19,lineHeight:1.25}}>{item.title}</strong>
<span style={{color:"#557388",fontSize:15,lineHeight:1.45}}>{item.description}</span>
<span style={{display:"block",marginTop:4,color:item.color,fontWeight:700,fontSize:15}}>Abrir cuadernillo →</span>
</Link>)}
</div>
</main>;
}
