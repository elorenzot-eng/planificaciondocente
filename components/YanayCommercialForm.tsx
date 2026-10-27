"use client";
import {useState} from "react";
type Product="SIMCE"|"PAES"|"ECEP"|"PORTAFOLIO"|"PLANIFICACION"|"LICENCIA"|"OTRO";
export default function YanayCommercialForm({onClose}:{onClose:()=>void}){
 const [data,setData]=useState({name:"",institution:"",role:"",phone:"",email:"",product:"LICENCIA" as Product,preferredTime:"",notes:"",consent:false,website:""});
 const [busy,setBusy]=useState(false),[result,setResult]=useState(""),[done,setDone]=useState(false);
 const set=(key:keyof typeof data,value:string|boolean)=>setData(s=>({...s,[key]:value}));
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setResult("");try{
 const r=await fetch("/api/yanay-leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,preferredTime:data.preferredTime?new Date(data.preferredTime).toISOString():""})});
 const v=await r.json();if(!r.ok)throw new Error(v.details?.join(". ")||v.error||"Error de conexión");
 if(r.status===202){setResult("No pudimos completar el registro. Inténtalo nuevamente.");return;}setDone(true);setResult(v.confirmed?`Reunión confirmada para ${new Date(v.startsAt).toLocaleString("es-CL",{dateStyle:"full",timeStyle:"short"})}. Enlace Meet: ${v.meetUrl}`:`Solicitud registrada, pero la reunión aún no está confirmada. ${v.bookingError||"Te contactaremos para coordinar."}`);
 }catch(e){setResult(e instanceof Error?e.message:"No se pudo enviar");}finally{setBusy(false)}}
 const field=(key:"name"|"institution"|"role"|"phone"|"email"|"preferredTime"|"notes",label:string,required=false)=> <label style={{display:"grid",gap:3,fontSize:12}}>{label}<input required={required} type={key==="email"?"email":key==="phone"?"tel":"text"} value={data[key]} maxLength={key==="notes"?1000:180} onChange={e=>set(key,e.target.value)} style={{padding:8,border:"1px solid #abc",borderRadius:7}}/></label>;
 return <section aria-label="Solicitar llamada comercial" style={{padding:12,overflowY:"auto",maxHeight:340,display:"grid",gap:8}}>
 <div style={{display:"flex",justifyContent:"space-between"}}><strong>Solicitar llamada con EducAntay</strong><button type="button" onClick={onClose}>Volver</button></div>
 {done?<p role="status">{result}</p>:<form onSubmit={submit} style={{display:"grid",gap:8}}>
 {field("name","Nombre y apellido",true)}{field("institution","Colegio o institución")}{field("role","Cargo")}{field("phone","Teléfono de contacto",true)}{field("email","Correo electrónico",true)}
 <label style={{display:"grid",gap:3,fontSize:12}}>Producto de interés<select value={data.product} onChange={e=>set("product",e.target.value)}>{(["SIMCE","PAES","ECEP","PORTAFOLIO","PLANIFICACION","LICENCIA","OTRO"] as Product[]).map(p=><option key={p} value={p}>{p}</option>)}</select></label>
 <label style={{display:"grid",gap:3,fontSize:12}}>Fecha y hora para demostración (horario de tu dispositivo)<input type="datetime-local" value={data.preferredTime} onChange={e=>set("preferredTime",e.target.value)} style={{padding:8,border:"1px solid #abc",borderRadius:7}}/></label>{field("notes","¿Qué te gustaría conocer?")}
 <input aria-hidden="true" tabIndex={-1} autoComplete="off" style={{position:"absolute",left:-9999}} value={data.website} onChange={e=>set("website",e.target.value)}/>
 <label style={{fontSize:12,display:"flex",gap:6}}><input type="checkbox" required checked={data.consent} onChange={e=>set("consent",e.target.checked)}/>Autorizo a EducAntay a guardar estos datos para responder mi solicitud y contactarme. Puedo solicitar su eliminación.</label>
 <button disabled={busy} type="submit" style={{padding:10,background:"#087e88",color:"white",border:0,borderRadius:8}}>{busy?"Enviando…":"Solicitar llamada"}</button></form>}
 {result&&!done&&<p role="alert">{result}</p>}
 </section>
}