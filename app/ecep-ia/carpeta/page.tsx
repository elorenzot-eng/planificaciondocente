"use client";
import {useEffect,useState} from "react";
type Item={id:string;title:string;level:string;quantity:number;difficulty:string;createdAt:string};
const url=(id:string,version:string)=>"/api/ecep/ensayos/documento?id="+encodeURIComponent(id)+"&version="+version;
export default function EcepFolder(){
 const [items,setItems]=useState<Item[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(true),[preview,setPreview]=useState<string|null>(null);
 async function load(){setBusy(true);setError("");try{const r=await fetch("/api/ecep/ensayos",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"No se pudo cargar la carpeta.");setItems(d.items);}catch(e){setError(e instanceof Error?e.message:"Error de carga.");}finally{setBusy(false);}}
 useEffect(()=>{void load()},[]);
 const action={display:"inline-block",padding:"10px 14px",border:"1px solid #add5dc",borderRadius:10,color:"#087e83",background:"#f0fafb",textDecoration:"none",fontWeight:700};
 return <main style={{display:"block",width:"100%",minHeight:"100vh",padding:"clamp(16px,3vw,36px)",color:"#17324b"}}>
 <a href="/ecep-ia/temarios">← Catálogo ECEP</a><h1>Mi carpeta · Ensayos ECEP</h1><p>Abre tus pruebas y solucionarios guardados sin consumir otra generación IA. En el documento, usa Imprimir para guardar un PDF.</p>
 <a href="/ecep-ia/ensayos" style={action}>Generar otro ensayo ECEP</a>
 {busy&&<p role="status">Cargando…</p>}{error&&<p role="alert" style={{color:"#b91c1c"}}>{error} <button onClick={load}>Reintentar</button></p>}
 {!busy&&!error&&items.length===0&&<p>Todavía no hay ensayos ECEP guardados.</p>}
 {items.map(item=><article key={item.id} style={{padding:24,margin:"18px 0",background:"white",border:"1px solid #dce6eb",borderRadius:14}}>
 <h2>{item.title}</h2><p>{item.level} · Complejidad {item.difficulty} · {new Date(item.createdAt).toLocaleDateString("es-CL")}</p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
 <a href={url(item.id,"estudiante")} style={action} target="_blank" rel="noopener noreferrer">Abrir prueba · PDF</a>
 <a href={url(item.id,"profesor")} style={action} target="_blank" rel="noopener noreferrer">Solucionario y tabla docente · PDF</a>
 <button style={action} onClick={()=>setPreview(preview===item.id?null:item.id)}>{preview===item.id?"Cerrar vista previa":"Ver aquí"}</button></div>
 {preview===item.id&&<iframe title={item.title} src={url(item.id,"estudiante")} sandbox="allow-same-origin" style={{width:"100%",height:"75vh",border:"1px solid #ddd",marginTop:18}}/>}
 </article>)}</main>;
}
