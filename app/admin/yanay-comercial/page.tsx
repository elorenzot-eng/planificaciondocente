"use client";
import {useEffect,useState} from "react";
type Lead={id:string;name:string;institution:string|null;phone:string;email:string;product:string;preferredTime:string|null;status:string;createdAt:string};
export default function YanayLeadsAdmin(){
 const [leads,setLeads]=useState<Lead[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>{fetch("/api/yanay-leads/admin",{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error("Acceso restringido a superadministración");return r.json()}).then(d=>setLeads(d.leads||[])).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 return <main style={{maxWidth:1150,margin:"40px auto",padding:20,fontFamily:"Arial,sans-serif"}}><h1>Yanay · Seguimiento comercial</h1><p>Solicitudes de llamada pendientes de confirmación. No equivalen a reservas automáticas.</p>
 {loading?<p>Cargando…</p>:error?<p role="alert">{error}</p>:<><p>Total de interesados: {leads.length}</p><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>{["Fecha","Contacto","Institución","Teléfono","Correo","Interés","Horario solicitado","Estado"].map(h=><th key={h} style={{padding:8,textAlign:"left",borderBottom:"1px solid #ccc"}}>{h}</th>)}</tr></thead><tbody>{leads.map(l=><tr key={l.id}>{[new Date(l.createdAt).toLocaleString("es-CL"),l.name,l.institution||"—",l.phone,l.email,l.product,l.preferredTime||"Por coordinar",l.status].map((v,i)=><td key={i} style={{padding:8,borderBottom:"1px solid #eee"}}>{v}</td>)}</tr>)}</tbody></table></div></>}
 </main>;
}