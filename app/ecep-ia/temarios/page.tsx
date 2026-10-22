"use client";
import {useMemo,useState} from "react";
import {topics,type Topic} from "../../../lib/ecep-topics";

const levels=["Educación Parvularia","Educación Básica","Educación Media HC","Educación Media TP"];
const stats=(t:Topic)=>{const sub=t.dominios.flatMap(d=>d.subdominios);return {domains:t.dominios.length,subdomains:sub.length,indicators:sub.reduce((n,s)=>n+s.indicadores.length,0),missing:sub.filter(s=>s.indicadores.length===0).length}};
const buttonStyle={border:"1px solid #c8d9e2",borderRadius:14,padding:"18px 16px",textAlign:"left" as const,cursor:"pointer",color:"#17324b"};
export default function TemariosEcep(){
 const [level,setLevel]=useState("");
 const [query,setQuery]=useState("");
 const [selected,setSelected]=useState("");
 const list=useMemo(()=>topics.filter(t=>t.nivel===level&&t.especialidad.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es"))).sort((a,b)=>a.especialidad.localeCompare(b.especialidad,"es")),[level,query]);
 const current=topics.find(t=>t.nivel+"::"+t.especialidad===selected);
 const chooseLevel=(next:string)=>{setLevel(next===level?"":next);setSelected("");setQuery("")};
 return <main style={{maxWidth:1080,margin:"auto",padding:"32px 20px",fontFamily:"system-ui,sans-serif",color:"#17324b"}}>
 <a href="/ecep-ia">← ECEP IA</a>
 <h1>Temarios y guías ECEP 2026</h1>
 <p>Selecciona el nivel de enseñanza y luego la asignatura o especialidad que deseas preparar.</p>
 <nav aria-label="Niveles de enseñanza ECEP" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(205px,1fr))",gap:12,margin:"24px 0"}}>
 {levels.map((name,i)=>{const active=level===name;const count=topics.filter(t=>t.nivel===name).length;return <button type="button" key={name} aria-expanded={active} aria-controls="ecep-specialties" onClick={()=>chooseLevel(name)} style={{...buttonStyle,background:active?"#dff4f2":"#fff",borderColor:active?"#087e83":"#c8d9e2",boxShadow:active?"0 0 0 2px #087e83 inset":"none"}}>
 <span aria-hidden="true" style={{display:"block",fontSize:26,marginBottom:8}}>{["🧸","📘","🎓","🛠️"][i]}</span>
 <strong style={{display:"block",fontSize:17}}>{name}</strong>
 <small style={{display:"block",marginTop:8}}>{count} {count===1?"especialidad":"especialidades"} · {active?"Ocultar":"Ver asignaturas"} →</small>
 </button>})}
 </nav>
 <div id="ecep-specialties">
 {!level?<p style={{padding:18,background:"#f2f7f9",borderRadius:12}}>Elige uno de los cuatro botones para desplegar sus asignaturas.</p>:<>
 <div style={{display:"flex",gap:12,justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
 <h2 style={{margin:0}}>{level} · Asignaturas y especialidades</h2>
 <label>Buscar <input value={query} onChange={e=>{setQuery(e.target.value);setSelected("")}} placeholder="Nombre de la asignatura" style={{padding:10,border:"1px solid #c8d9e2",borderRadius:8,marginLeft:8,maxWidth:230}}/></label>
 </div>
 <p>{list.length} {list.length===1?"especialidad disponible":"especialidades disponibles"}</p>
 <nav aria-label={"Asignaturas de "+level} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:24}}>
 {list.map(t=>{const key=t.nivel+"::"+t.especialidad;const active=selected===key;return <button type="button" key={key} onClick={()=>setSelected(active?"":key)} aria-expanded={active} style={{...buttonStyle,padding:14,background:active?"#dff4f2":"white",borderColor:active?"#087e83":"#c8d9e2"}}>
 <strong style={{display:"block"}}>{t.especialidad}</strong>
 <small style={{display:"block",marginTop:6}}>{stats(t).indicators} indicadores · {active?"Ocultar detalles":"Ver temario"} →</small>
 </button>})}
 </nav>
 {list.length===0&&<p>No se encontraron especialidades con ese nombre.</p>}
 {current&&<section aria-label={"Temario de "+current.especialidad} style={{border:"1px solid #d9e3e9",padding:20,borderRadius:14,background:"#fbfdfd"}}>
 <h2>{current.especialidad}</h2>
 <p>{current.nivel} · {stats(current).domains} dominios · {stats(current).subdomains} subdominios · {stats(current).indicators} indicadores recuperados</p>
 <div style={{display:"flex",gap:10,flexWrap:"wrap",margin:"16px 0"}}>
 <a href={`/ecep-ia/estudio?especialidad=${encodeURIComponent(current.nivel+"::"+current.especialidad)}`} style={{display:"inline-block",padding:12,background:"#087e83",borderRadius:9,color:"white",textDecoration:"none",fontWeight:650}}>Estudiar guía y autoevaluación →</a>
 {current.nivel==="Educación Parvularia"&&<><a href="/ecep-ia/guias/parvularia" style={{padding:12,background:"#e9f5f5",color:"#087e83",borderRadius:9,textDecoration:"none"}}>Guías de apoyo →</a><a href="/ecep-ia/ensayos/parvularia" style={{padding:12,background:"#e9f5f5",color:"#087e83",borderRadius:9,textDecoration:"none"}}>Ensayo y retroalimentación →</a></>}
 </div>
 <p style={{fontSize:13}}>Los indicadores provienen de la extracción de temarios aportados. Algunos textos requieren cotejo con su PDF original; las guías de EducAntay son material complementario.</p>
 {stats(current).missing>0&&<p role="status" style={{padding:12,background:"#fff4d8",borderRadius:8}}>Revisión pendiente: {stats(current).missing} subdominios sin indicadores recuperados.</p>}
 {current.dominios.map((d,i)=><details key={i} style={{border:"1px solid #d9e3e9",padding:14,borderRadius:12,marginBottom:12,background:"white"}}><summary style={{cursor:"pointer",fontWeight:700}}>Dominio {i+1}: {d.nombre}</summary>{d.subdominios.map((s,j)=><section key={j}><h3 style={{fontSize:16}}>{s.codigo} {s.nombre}</h3>{s.indicadores.length===0?<p style={{color:"#8a5500"}}>Indicadores pendientes de recuperación y validación.</p>:<ol>{s.indicadores.map((ind,k)=><li key={k} style={{marginBottom:8}}>{ind}</li>)}</ol>}</section>)}</details>)}
 </section>}
 </>}
 </div>
 </main>
}
