"use client";
import { useEffect, useState } from "react";
const names: Record<string,string> = { PLANIFICACION:"Planificación IA", EVALUACION:"Evaluaciones IA", RECURSOS_PEDAGOGICOS:"Recursos Pedagógicos" };
type School = { id:string; name:string; organization:string };
type License = { id:string; module:string; active:boolean; startsAt:string; expiresAt:string };
export default function PedagogicalLicensesClient(){
 const [schools,setSchools]=useState<School[]>([]);
 const [schoolId,setSchoolId]=useState("");
 const [moduleName,setModuleName]=useState("PLANIFICACION");
 const [startsAt,setStartsAt]=useState(new Date().toISOString().slice(0,10));
 const [expiresAt,setExpiresAt]=useState("");
 const [licenses,setLicenses]=useState<License[]>([]);
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{fetch("/api/admin",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Acceso restringido");return r.json()}).then(data=>{const orgs=Array.isArray(data)?data:data.organizations||[];const list=orgs.flatMap((o:any)=>(o.schools||[]).map((s:any)=>({id:s.id,name:s.name,organization:o.name})));setSchools(list);if(list.length)setSchoolId(list[0].id)}).catch(e=>setMessage(e.message))},[]);
 async function refresh(id:string){if(!id)return;try{const r=await fetch("/api/admin/pedagogical-licenses?schoolId="+encodeURIComponent(id),{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setLicenses(d.licenses||[])}catch(e:any){setMessage(e.message)}}
 useEffect(()=>{refresh(schoolId)},[schoolId]);
 async function send(method:string,body:any){setBusy(true);setMessage("");try{const r=await fetch("/api/admin/pedagogical-licenses",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw Error(d.error||"No fue posible guardar");setMessage("Licencia actualizada correctamente");await refresh(schoolId)}catch(e:any){setMessage(e.message)}finally{setBusy(false)}}
 return <main style={{maxWidth:1000,margin:"40px auto",padding:24,fontFamily:"Arial,sans-serif",color:"#17324d"}}>
 <a href="/" style={{color:"#0d9488"}}>← Volver a EducAntay</a>
 <h1 style={{color:"#0d9488"}}>Licencias pedagógicas</h1><p>Administración exclusiva del superadministrador. La Biblioteca EducAntay se habilita únicamente con Planificación, Evaluaciones o Recursos Pedagógicos vigentes.</p>
 <section style={{border:"1px solid #dce4ed",borderRadius:16,padding:24,display:"grid",gap:14}}>
 <label>Establecimiento<select value={schoolId} onChange={e=>setSchoolId(e.target.value)} style={{display:"block",padding:12,width:"100%",marginTop:6}}>{schools.map(s=><option key={s.id} value={s.id}>{s.name} — {s.organization}</option>)}</select></label>
 <label>Módulo<select value={moduleName} onChange={e=>setModuleName(e.target.value)} style={{display:"block",padding:12,width:"100%",marginTop:6}}>{Object.entries(names).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>
 <div style={{display:"flex",gap:16,flexWrap:"wrap"}}><label>Desde<input type="date" value={startsAt} onChange={e=>setStartsAt(e.target.value)} style={{display:"block",padding:10}}/></label><label>Hasta<input type="date" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} style={{display:"block",padding:10}}/></label></div>
 <button disabled={busy||!schoolId||!startsAt||!expiresAt||expiresAt<=startsAt} onClick={()=>send("POST",{schoolId,module:moduleName,startsAt:startsAt+"T00:00:00.000Z",expiresAt:expiresAt+"T23:59:59.999Z"})} style={{background:"#0d9488",color:"white",padding:14,border:0,borderRadius:10,cursor:"pointer"}}>Asignar licencia</button></section>
 {message&&<p role="status">{message}</p>}
 <h2 style={{marginTop:32}}>Licencias del establecimiento</h2>
 {licenses.length===0?<p>No hay licencias pedagógicas registradas.</p>:<div style={{display:"grid",gap:12}}>{licenses.map(l=><div key={l.id} style={{border:"1px solid #dce4ed",borderRadius:12,padding:16,display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",alignItems:"center"}}><div><strong>{names[l.module]||l.module}</strong><p style={{margin:"5px 0",fontSize:13}}>Vigencia: {l.startsAt.slice(0,10)} al {l.expiresAt.slice(0,10)} · {l.active?"Activa":"Desactivada"}</p></div><button disabled={busy} onClick={()=>send("PATCH",{id:l.id,active:!l.active})} style={{background:l.active?"#7c3aed":"#0d9488",color:"white",border:0,borderRadius:8,padding:"10px 16px"}}>{l.active?"Desactivar":"Activar"}</button></div>)}</div>}
 </main>
}
