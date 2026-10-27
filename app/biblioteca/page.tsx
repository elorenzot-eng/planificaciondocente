"use client";
import { useEffect, useState } from "react";
type Resource = { id:string;title:string;kind:string;subject:string|null;level:string|null;description:string|null;content:unknown;published:boolean };
const kinds:Record<string,string>={planning:"Planificación",assessment:"Evaluación",material:"Material didáctico",rubric:"Rúbrica",guide:"Guía",tp:"Técnico profesional",dua:"DUA"};
export default function BibliotecaPage(){
 const [items,setItems]=useState<Resource[]>([]),[mine,setMine]=useState(false),[q,setQ]=useState(""),[kind,setKind]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(true),[selected,setSelected]=useState<Resource|null>(null);
 async function load(){setLoading(true);try{const params=new URLSearchParams();if(mine)params.set("mine","1");if(q)params.set("q",q);if(kind)params.set("kind",kind);const r=await fetch("/api/biblioteca?"+params.toString(),{cache:"no-store"});const b=await r.json();if(!r.ok)throw new Error(b.error||"No se pudo cargar");setItems(b.resources||[]);setError("")}catch(e){setError(e instanceof Error?e.message:"Error de conexión")}finally{setLoading(false)}}
 useEffect(()=>{void load()},[mine,kind]);
 function download(r:Resource){const blob=new Blob([JSON.stringify({title:r.title,kind:r.kind,content:r.content},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="educantay-recurso-"+r.id+".json";a.click();URL.revokeObjectURL(url)}
 async function publish(r:Resource){if(!confirm(r.published?"¿Dejar de compartir este recurso?":"¿Publicar este recurso para usuarios con licencia? Verifica que no contenga datos personales."))return;const response=await fetch("/api/biblioteca",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:r.id,published:!r.published})});if(!response.ok){setError((await response.json()).error||"No se pudo actualizar");return}await load()}
 return <main style={{maxWidth:1160,margin:"0 auto",padding:"36px 20px",color:"#17314b"}}>
 <a href="/" style={{color:"#008f9d"}}>← EducAntay</a>
 <h1 style={{fontSize:"2rem",margin:"20px 0 6px"}}>Biblioteca EducAntay</h1><p>Recursos educativos compartidos para usuarios con licencia. Los ensayos SIMCE y PAES están excluidos.</p>
 <div style={{display:"flex",flexWrap:"wrap",gap:10,margin:"22px 0"}}>
 <button onClick={()=>setMine(false)} aria-pressed={!mine} style={{padding:12,borderRadius:10,background:!mine?"#00a6a6":"#eee",color:!mine?"white":"#17314b"}}>Biblioteca compartida</button>
 <button onClick={()=>setMine(true)} aria-pressed={mine} style={{padding:12,borderRadius:10,background:mine?"#7044b8":"#eee",color:mine?"white":"#17314b"}}>Mis publicaciones</button>
 <input aria-label="Buscar recursos" placeholder="Buscar por título o asignatura" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")void load()}} style={{padding:12,border:"1px solid #ccc",borderRadius:10,flex:1,minWidth:180}}/>
 <select aria-label="Tipo de recurso" value={kind} onChange={e=>setKind(e.target.value)} style={{padding:12,borderRadius:10}}><option value="">Todos los recursos</option>{Object.entries(kinds).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
 <button onClick={()=>void load()} style={{padding:12,borderRadius:10,background:"#17314b",color:"white"}}>Buscar</button>
 </div>
 {error&&<p role="alert" style={{color:"#a32236"}}>{error}</p>}
 {loading?<p>Cargando recursos…</p>:items.length===0?<p>Aún no hay recursos en esta categoría.</p>:<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>{items.map(r=><article key={r.id} style={{padding:20,border:"1px solid #dbe4eb",borderRadius:16,background:"#fff"}}>
 <small style={{color:"#7044b8"}}>{kinds[r.kind]||r.kind}</small><h2 style={{fontSize:"1.2rem",margin:"10px 0"}}>{r.title}</h2><p>{[r.subject,r.level].filter(Boolean).join(" · ")}</p><p>{r.description}</p>
 <div style={{display:"flex",flexWrap:"wrap",gap:8}}><button onClick={()=>setSelected(r)}>Vista previa</button><button onClick={()=>download(r)}>Descargar</button>{mine&&<button onClick={()=>void publish(r)}>{r.published?"Retirar publicación":"Compartir"}</button>}</div>
 </article>)}</div>}
 {selected&&<div role="dialog" aria-modal="true" aria-label="Vista previa" style={{position:"fixed",inset:0,background:"#0009",display:"grid",placeItems:"center",padding:16,zIndex:1000}}><div style={{background:"white",padding:24,borderRadius:16,maxWidth:800,width:"100%",maxHeight:"85vh",overflow:"auto"}}><button onClick={()=>setSelected(null)}>Cerrar</button><h2>{selected.title}</h2><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(selected.content,null,2)}</pre></div></div>}
 </main>
}