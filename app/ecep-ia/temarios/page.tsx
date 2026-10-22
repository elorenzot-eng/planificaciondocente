"use client";
import {useMemo,useState} from "react";
import {topics,type Topic} from "../../../lib/ecep-topics";

const levels=["Educación Parvularia","Educación Básica","Educación Media HC","Educación Media TP"];
const stats=(t:Topic)=>{const sub=t.dominios.flatMap(d=>d.subdominios);return {domains:t.dominios.length,subdomains:sub.length,indicators:sub.reduce((n,s)=>n+s.indicadores.length,0),missing:sub.filter(s=>s.indicadores.length===0).length}};
const palette=[{solid:"#123f6d",light:"#eaf1fa"},{solid:"#2563eb",light:"#eaf1ff"},{solid:"#e83e8c",light:"#fff0f7"},{solid:"#16a34a",light:"#eaf8ef"}];
const buttonStyle={border:"1px solid #c8d9e2",borderRadius:14,padding:"18px 16px",textAlign:"left" as const,cursor:"pointer",color:"#17324b"};
export default function TemariosEcep(){
 const [level,setLevel]=useState("");
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState("");
 const list=useMemo(()=>topics.filter(t=>t.nivel===level&&t.especialidad.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"))).sort((a,b)=>a.especialidad.localeCompare(b.especialidad,"es")),[level,query]);
 const current=topics.find(t=>t.nivel+"::"+t.especialidad===selected);
 const theme=palette[Math.max(0,levels.indexOf(level))];
 const chooseLevel=(next:string)=>{setLevel(next===level?"":next);setSelected("");setQuery("")};
 return <div style={{display:"block",width:"100%",maxWidth:1180,minHeight:"auto",margin:"0 auto",padding:"32px 24px",fontFamily:"system-ui,sans-serif",color:"#17324b"}}>
 <a href="/ecep-ia">← ECEP IA</a>
 <h1>Temarios y guías ECEP 2026</h1>
 <p>Selecciona el nivel de enseñanza y luego la asignatura o especialidad que deseas preparar.</p>
 <div role="navigation" aria-label="Niveles de enseñanza ECEP" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,235px),1fr))",gap:14,margin:"24px 0",width:"100%"}}>
 {levels.map((name,i)=>{const active=level===name;const count=topics.filter(t=>t.nivel===name).length;return <button type="button" key={name} aria-expanded={active} aria-controls="ecep-specialties" onClick={()=>chooseLevel(name)} style={{...buttonStyle,width:"100%",background:active?palette[i].light:"#fff",borderColor:active?palette[i].solid:"#c8d9e2",borderTop:"5px solid "+palette[i].solid,boxShadow:active?"0 0 0 1px "+palette[i].solid+" inset":"none"}}>
 <span aria-hidden="true" style={{display:"block",fontSize:26,marginBottom:8}}>{["🧸","📘","🎓","🛠️"][i]}</span>
 <strong style={{display:"block",fontSize:17}}>{name}</strong>
 <small style={{display:"block",marginTop:8}}>{count} {count===1?"especialidad":"especialidades"} · {active?"Ocultar":"Ver asignaturas"} →</small>
 </button>})}
 </div>
 <div id="ecep-specialties">
 {!level?<p style={{padding:18,background:"#f2f7f9",borderRadius:12}}>Elige uno de los cuatro botones para desplegar sus asignaturas.</p>:<>
 <div style={{display:"flex",gap:12,justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
 <h2 style={{margin:0}}>{level} · Asignaturas y especialidades</h2>
 <label>Buscar <input value={query} onChange={e=>{setQuery(e.target.value);setSelected("")}} placeholder="Nombre de la asignatura" style={{padding:10,border:"1px solid #c8d9e2",borderRadius:8,marginLeft:8,maxWidth:230}}/></label>
 </div>
 <p>{list.length} {list.length===1?"especialidad disponible":"especialidades disponibles"}</p>
 <div role="navigation" aria-label={"Asignaturas de "+level} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))",gap:12,marginBottom:24,width:"100%"}}>
 {list.map(t=>{const key=t.nivel+"::"+t.especialidad;const active=selected===key;return <button type="button" key={key} onClick={()=>setSelected(active?"":key)} aria-expanded={active} style={{...buttonStyle,width:"100%",padding:14,background:active?theme.light:"white",borderColor:active?theme.solid:"#c8d9e2",borderLeft:"5px solid "+theme.solid}}>
 <strong style={{display:"block"}}>{t.especialidad}</strong>
 <small style={{display:"block",marginTop:6}}>{stats(t).indicators} indicadores · {active?"Ocultar detalles":"Ver temario"} →</small>
 </button>})}
 </div>
 {list.length===0&&<p>No se encontraron especialidades con ese nombre.</p>}
 {current&&<section aria-label={"Temario de "+current.especialidad} style={{border:"1px solid #d9e3e9",padding:20,borderRadius:14,background:"#fbfdfd"}}>
 <h2>{current.especialidad}</h2>
 <p>{current.nivel} · {stats(current).domains} dominios · {stats(current).subdomains} subdominios · {stats(current).indicators} indicadores recuperados</p>
 <div style={{display:"flex",gap:10,flexWrap:"wrap",margin:"16px 0"}}>
 <a href={`/ecep-ia/estudio?especialidad=${encodeURIComponent(current.nivel+"::"+current.especialidad)}`} style={{display:"inline-block",padding:12,background:theme.solid,borderRadius:9,color:"white",textDecoration:"none",fontWeight:650}}>Estudiar guía y autoevaluación →</a>
 {current.nivel==="Educación Parvularia"&&<><a href="/ecep-ia/guias/parvularia" style={{padding:12,background:"#e9f5f5",color:"#087e83",borderRadius:9,textDecoration:"none"}}>Guías de apoyo →</a><a href="/ecep-ia/ensayos/parvularia" style={{padding:12,background:"#e9f5f5",color:"#087e83",borderRadius:9,textDecoration:"none"}}>Ensayo y retroalimentación →</a></>}
 </div>
 <p style={{fontSize:13}}>Los indicadores provienen de la extracción de temarios aportados. Algunos textos requieren cotejo con su PDF original; las guías de EducAntay son material complementario.</p>
 {stats(current).missing>0&&<p role="status" style={{padding:12,background:"#fff4d8",borderRadius:8}}>Revisión pendiente: {stats(current).missing} subdominios sin indicadores recuperados.</p>}
 <h3 style={{marginTop:24}}>Módulos de contenido</h3>
 <p>Abre un dominio para desplegar sus subdominios y, dentro de cada uno, sus indicadores. No necesitas recorrer listas laterales.</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,300px),1fr))",gap:14,alignItems:"start"}}>
 {current.dominios.map((d,i)=><details key={i} style={{border:"1px solid "+theme.solid,borderTop:"5px solid "+theme.solid,padding:16,borderRadius:14,background:theme.light}}>
 <summary style={{cursor:"pointer",fontWeight:700,fontSize:17,color:theme.solid,padding:"4px 0"}}>Módulo {i+1}: {d.nombre}<small style={{display:"block",color:"#526b7b",fontWeight:400,marginTop:8}}>{d.subdominios.length} subdominios · Pulsa para desplegar</small></summary>
 <div style={{marginTop:16,display:"grid",gap:10}}>
 {d.subdominios.map((s,j)=><details key={j} style={{border:"1px solid "+theme.solid+"55",borderLeft:"4px solid "+theme.solid,padding:12,borderRadius:10,background:"white"}}>
 <summary style={{cursor:"pointer",fontWeight:650}}>{s.codigo} · {s.nombre}<small style={{display:"block",color:"#526b7b",fontWeight:400,marginTop:5}}>{s.indicadores.length} indicadores · Ver contenidos</small></summary>
 <div style={{marginTop:12}}>{s.indicadores.length===0?<p style={{color:"#8a5500"}}>Indicadores pendientes de recuperación y validación.</p>:<ol style={{paddingLeft:22}}>{s.indicadores.map((ind,k)=><li key={k} style={{marginBottom:12,lineHeight:1.5}}>{ind}</li>)}</ol>}</div>
 </details>)}
 </div>
 </details>)}
 </div>
 </section>}
 </>}
 </div>
 </div>
}
