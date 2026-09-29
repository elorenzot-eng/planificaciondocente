import Link from "next/link";

export default function SeoLanding({eyebrow,title,description,features}:{eyebrow:string;title:string;description:string;features:string[]}){
 return <main style={{maxWidth:1080,margin:"0 auto",padding:"32px 24px 72px",fontFamily:"Arial, sans-serif",color:"#14213d"}}>
  <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,marginBottom:72}}>
   <Link href="/" style={{fontWeight:900,fontSize:22,textDecoration:"none",color:"inherit"}}>EDUCANTAY</Link>
   <Link href="/?ingresar=1" style={{padding:"12px 18px",borderRadius:12,textDecoration:"none",background:"#14213d",color:"white",fontWeight:700}}>Probar Educantay</Link>
  </nav>
  <section style={{maxWidth:820}}>
   <p style={{fontWeight:800,letterSpacing:1,fontSize:13}}>{eyebrow}</p>
   <h1 style={{fontSize:"clamp(38px,6vw,68px)",lineHeight:1.02,margin:"12px 0 24px"}}>{title}</h1>
   <p style={{fontSize:21,lineHeight:1.55,color:"#46536b"}}>{description}</p>
   <div style={{display:"flex",gap:12,flexWrap:"wrap",margin:"32px 0"}}>
    <Link href="/" style={{padding:"14px 20px",borderRadius:12,textDecoration:"none",background:"#14213d",color:"white",fontWeight:800}}>Crear cuenta docente</Link>
    <Link href="/" style={{padding:"14px 20px",borderRadius:12,textDecoration:"none",border:"1px solid #ccd3df",color:"#14213d",fontWeight:800}}>Conocer Educantay</Link>
   </div>
  </section>
  <section style={{marginTop:72}}>
   <h2 style={{fontSize:32}}>Herramientas para el trabajo pedagógico</h2>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:24}}>
    {features.map((x,i)=><article key={x} style={{padding:24,border:"1px solid #e1e5ec",borderRadius:18}}><b style={{fontSize:18}}>{x}</b><p style={{lineHeight:1.5,color:"#5a6578"}}>Trabaja con una base curricular integrada y adapta el resultado a las necesidades de tu curso.</p></article>)}
   </div>
  </section>
  <section style={{marginTop:72,padding:32,borderRadius:22,background:"#f4f7fb"}}>
   <h2 style={{fontSize:30,marginTop:0}}>Currículum, pedagogía e inteligencia artificial en un solo espacio</h2>
   <p style={{fontSize:18,lineHeight:1.6,color:"#46536b"}}>Educantay ayuda a docentes de Chile a planificar, evaluar, crear recursos y organizar su trabajo. Los contenidos generados son editables para que cada docente los revise y ajuste a su contexto pedagógico.</p>
  </section>
 </main>
}
