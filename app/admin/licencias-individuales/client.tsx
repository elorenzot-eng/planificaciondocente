"use client";
import { useEffect, useState } from "react";
type User = { id:string; name:string; email:string; active:boolean };
type License = { id:string; module:string; active:boolean; startsAt:string; expiresAt:string };
const names:Record<string,string> = { PLANIFICACION:"Planificación IA", EVALUACION:"Evaluaciones IA", RECURSOS_PEDAGOGICOS:"Recursos Pedagógicos" };
export default function IndividualLicensesClient({users}:{users:User[]}) {
  const [userId,setUserId]=useState(users[0]?.id||"");
  const [moduleName,setModuleName]=useState("PLANIFICACION");
  const [startsAt,setStartsAt]=useState(new Date().toISOString().slice(0,10));
  const [expiresAt,setExpiresAt]=useState("");
  const [licenses,setLicenses]=useState<License[]>([]);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if(!userId){setLicenses([]);return;}let alive=true;fetch("/api/admin/individual-pedagogical-licenses?userId="+encodeURIComponent(userId),{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error||"Error de consulta");return d}).then(d=>{if(alive)setLicenses(d.licenses||[])}).catch(e=>{if(alive)setMessage(e.message)});return()=>{alive=false}},[userId]);
  async function send(method:"POST"|"PATCH",body:object){
    setBusy(true);setMessage("");
    try {
      const r=await fetch("/api/admin/individual-pedagogical-licenses",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const d=await r.json();if(!r.ok)throw Error(d.error||"No fue posible guardar");
      const list=await fetch("/api/admin/individual-pedagogical-licenses?userId="+encodeURIComponent(userId),{cache:"no-store"});
      const data=await list.json();if(!list.ok)throw Error(data.error||"Error al actualizar");
      setLicenses(data.licenses||[]);setMessage("Licencia actualizada");
    } catch(e:any){setMessage(e.message)} finally{setBusy(false)}
  }
  return <main style={{maxWidth:1000,margin:"40px auto",padding:24,fontFamily:"Arial,sans-serif",color:"#17324d"}}>
    <a href="/admin/licencias-pedagogicas" style={{color:"#0d9488"}}>← Licencias institucionales</a>
    <h1 style={{color:"#0d9488"}}>Licencias pedagógicas individuales</h1>
    <p>Solo el superadministrador puede asignar licencias. Una suscripción vigente sin módulo pedagógico no habilita Biblioteca.</p>
    <section style={{border:"1px solid #dce4ed",borderRadius:16,padding:24,display:"grid",gap:14}}>
      <label>Cuenta individual<select value={userId} onChange={e=>{setUserId(e.target.value);setMessage("")}} style={{display:"block",padding:12,width:"100%",marginTop:6}}>
        {users.map(u=><option key={u.id} value={u.id}>{u.name} — {u.email}{u.active?"":" (inactiva)"}</option>)}
      </select></label>
      <label>Módulo<select value={moduleName} onChange={e=>setModuleName(e.target.value)} style={{display:"block",padding:12,width:"100%",marginTop:6}}>
        {Object.entries(names).map(([key,name])=><option key={key} value={key}>{name}</option>)}
      </select></label>
      <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
        <label>Desde<input type="date" value={startsAt} onChange={e=>setStartsAt(e.target.value)} style={{display:"block",padding:10}}/></label>
        <label>Hasta<input type="date" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} style={{display:"block",padding:10}}/></label>
      </div>
      <button disabled={busy||!userId||!startsAt||!expiresAt||expiresAt<=startsAt} onClick={()=>send("POST",{userId,module:moduleName,startsAt:startsAt+"T00:00:00.000Z",expiresAt:expiresAt+"T23:59:59.999Z"})} style={{background:"#0d9488",color:"white",padding:14,border:0,borderRadius:10}}>Asignar licencia</button>
    </section>
    {message&&<p role="status">{message}</p>}
    <h2 style={{marginTop:32}}>Licencias de la cuenta</h2>
    {licenses.length===0?<p>No hay licencias registradas.</p>:<div style={{display:"grid",gap:12}}>{licenses.map(l=><div key={l.id} style={{border:"1px solid #dce4ed",borderRadius:12,padding:16,display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",alignItems:"center"}}>
      <div><strong>{names[l.module]||l.module}</strong><p style={{margin:"5px 0",fontSize:13}}>Vigencia: {l.startsAt.slice(0,10)} al {l.expiresAt.slice(0,10)} · {l.active?"Activa":"Desactivada"}</p></div>
      <button disabled={busy} onClick={()=>send("PATCH",{id:l.id,active:!l.active})} style={{background:l.active?"#7c3aed":"#0d9488",color:"white",border:0,borderRadius:8,padding:"10px 16px"}}>{l.active?"Desactivar":"Activar"}</button>
    </div>)}</div>}
  </main>;
}
