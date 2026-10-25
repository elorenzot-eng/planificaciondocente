"use client";
import {Suspense,useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {topics} from "../../../lib/ecep-topics";
import {topicKey,buildEcepPlan,type Difficulty} from "../../../lib/ecep/exam";
const action={display:"inline-block",padding:"12px 16px",border:"1px solid #add5dc",borderRadius:10,color:"#087e83",background:"#f0fafb",textDecoration:"none",fontWeight:700};
const documentUrl=(id:string,version:string)=>"/api/ecep/ensayos/documento?id="+encodeURIComponent(id)+"&version="+version;
function Generator(){
 const params=useSearchParams(),initial=params.get("especialidad")||"",initialTopic=topics.find(t=>topicKey(t)===initial);
 const [level,setLevel]=useState(initialTopic?.nivel||""),[specialtyKey,setSpecialtyKey]=useState(initialTopic?initial:""),[quantity,setQuantity]=useState(60),[difficulty,setDifficulty]=useState<Difficulty>("Mixta"),[domain,setDomain]=useState(-1);
 const [userId,setUserId]=useState(""),[remaining,setRemaining]=useState<number|null>(null),[busy,setBusy]=useState(false),[jobId,setJobId]=useState<string|null>(null),[progress,setProgress]=useState(0),[error,setError]=useState(""),[completed,setCompleted]=useState<string|null>(null),[seconds,setSeconds]=useState(0);
 const selected=topics.find(t=>topicKey(t)===specialtyKey),levels=Array.from(new Set(topics.map(t=>t.nivel)));
 const config={specialtyKey,quantity,difficulty,domain};
 const storageKey="educantay-ecep-"+userId+"-"+JSON.stringify(config);
 async function refreshBalance(){try{const r=await fetch("/api/profile",{cache:"no-store"});if(r.ok){const d=await r.json();setUserId(d.profile.id);setRemaining(d.profile.accountType==="INDIVIDUAL"?d.remainingAi:null);}}catch{}}
 useEffect(()=>{void refreshBalance()},[]);
 useEffect(()=>{setJobId(null);setProgress(0);setCompleted(null);setError("");if(!userId)return;try{const saved=JSON.parse(localStorage.getItem(storageKey)||"null");if(saved?.jobId&&Number.isInteger(saved.progress)&&saved.progress>=0&&saved.progress<=quantity){setJobId(saved.jobId);setProgress(saved.progress);}}catch{}},[storageKey,userId,quantity]);
 useEffect(()=>{if(!busy)return;const timer=setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(timer)},[busy]);
 let coverage="";try{if(selected)buildEcepPlan(selected,config);}catch(e){coverage=e instanceof Error?e.message:"Selecciona otro dominio.";}
 async function generate(){
  if(busy||!selected||coverage)return;
  setBusy(true);setError("");setCompleted(null);setSeconds(0);
  let current=jobId;
  if(!current)setProgress(0);
  try{
   for(let step=0,retries=0;step<=Math.ceil(quantity/5)+1;step++){
    const r=await fetch("/api/ecep/ensayos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...config,...(current?{jobId:current}:{})}),cache:"no-store"});
    const data=await r.json().catch(()=>({}));
    if(data.jobId){current=data.jobId;setJobId(current);}
    if(typeof data.completed==="number"){setProgress(data.completed);if(current)try{localStorage.setItem(storageKey,JSON.stringify({jobId:current,progress:data.completed}));}catch{}}
    else if(current)try{localStorage.setItem(storageKey,JSON.stringify({jobId:current,progress:0}));}catch{}
    if((r.status===409||r.status>=500)&&current&&retries<3){retries++;await new Promise(resolve=>setTimeout(resolve,5000));step--;continue;}
    if(!r.ok)throw Error(data.error||"El servicio se interrumpió. Reanuda para continuar.");
    retries=0;
    if(data.status==="COMPLETED"){setCompleted(data.jobId);setJobId(null);setProgress(quantity);try{localStorage.removeItem(storageKey);}catch{}await refreshBalance();return;}
   }
   setError("El avance está guardado. Presiona Reanudar para continuar.");
  }catch(e){setError(e instanceof Error?e.message:"Conexión interrumpida. Puedes reanudar sin perder el avance.");}
  finally{setBusy(false);}
 }
 return <main style={{display:"block",width:"100%",minHeight:"100vh",padding:"clamp(16px,3vw,36px)",color:"#17324b"}}>
 <div style={{display:"flex",gap:18,flexWrap:"wrap"}}><a href="/ecep-ia/temarios">← Catálogo ECEP</a><a href="/ecep-ia/carpeta">Mi carpeta · Ensayos ECEP</a></div>
 <h1>Ensayos ECEP con IA</h1><p>Preguntas originales de conocimiento disciplinar y pedagógico, vinculadas a los indicadores de tu asignatura o especialidad.</p>
 <section style={{padding:24,background:"white",borderRadius:16,border:"1px solid #dce6eb"}}>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))",gap:18,alignItems:"end"}}>
 <label>Nivel<select disabled={busy} value={level} onChange={e=>{setLevel(e.target.value);setSpecialtyKey("");setDomain(-1);}}><option value="">Selecciona el nivel</option>{levels.map(l=><option key={l}>{l}</option>)}</select></label>
 <label>Asignatura o especialidad<select disabled={busy||!level} value={specialtyKey} onChange={e=>{setSpecialtyKey(e.target.value);setDomain(-1);}}><option value="">Selecciona la especialidad</option>{topics.filter(t=>t.nivel===level).map(t=><option key={topicKey(t)} value={topicKey(t)}>{t.especialidad}</option>)}</select></label>
 <label>Dominios<select disabled={busy||!selected} value={domain} onChange={e=>setDomain(Number(e.target.value))}><option value={-1}>Todos los dominios con indicadores</option>{selected?.dominios.map((d,i)=><option key={i} value={i} disabled={!d.subdominios.some(s=>s.indicadores.some(x=>x.trim()))}>{i+1}. {d.nombre}</option>)}</select></label>
 <label>Extensión<select disabled={busy} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}><option value={60}>Ensayo completo · 60 preguntas</option><option value={30}>Práctica · 30 preguntas</option><option value={10}>Práctica breve · 10 preguntas</option></select></label>
 <label>Complejidad<select disabled={busy} value={difficulty} onChange={e=>setDifficulty(e.target.value as Difficulty)}>{["Baja","Media","Alta","Mixta"].map(d=><option key={d}>{d}</option>)}</select></label>
 <button disabled={busy||!selected||!!coverage||!userId} onClick={generate} style={{padding:16,border:0,borderRadius:10,background:busy?"#94a3b8":"#0d9488",color:"white",fontWeight:700,cursor:"pointer",minHeight:48}}>{busy?"Generando y validando…":jobId?"Reanudar desde "+progress+"/"+quantity:"Generar ensayo ECEP con IA"}</button>
 </div>
 {difficulty==="Mixta"&&<p>Complejidad mixta: {quantity*0.3} baja · {quantity*0.4} media · {quantity*0.3} alta.</p>}
 <p>Incluye ambas dimensiones: conocimiento disciplinar y conocimiento pedagógico de la asignatura.</p>
 <p>Un ensayo completado consume una generación IA. Incluye guardado automático, prueba, solucionario y tabla de especificaciones.</p>
 {remaining!==null&&<p><strong>Generaciones IA disponibles: {remaining}</strong></p>}
 {!userId&&<p><a href="/">Inicia sesión en EducAntay para generar tu ensayo.</a></p>}
 {coverage&&<p role="alert" style={{color:"#b91c1c"}}>{coverage}</p>}
 {(busy||progress>0)&&<p role="status">Avance: {progress}/{quantity} preguntas · {Math.round(progress/quantity*100)}%{busy?" · "+seconds+" segundos":""}</p>}
 {error&&<p role="alert" style={{color:"#b91c1c"}}>{error}</p>}
 </section>
 {completed&&<section style={{marginTop:22,background:"white",padding:24,borderRadius:16}}>
 <h2>Ensayo completado y guardado</h2><p>{selected?.especialidad} · {quantity} preguntas</p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
 <a style={action} href={documentUrl(completed,"estudiante")} target="_blank" rel="noopener noreferrer">Abrir prueba · Imprimir / guardar PDF</a>
 <a style={action} href={documentUrl(completed,"profesor")} target="_blank" rel="noopener noreferrer">Abrir solucionario y tabla docente · PDF</a>
 <a style={action} href="/ecep-ia/carpeta">Ver Mi carpeta ECEP</a></div>
 </section>}
 </main>;
}
export default function EcepExams(){return <Suspense fallback={<p>Cargando configuración ECEP…</p>}><Generator/></Suspense>}
