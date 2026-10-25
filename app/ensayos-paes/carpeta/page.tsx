"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
type Item={id:string;title:string;examType:string;createdAt:string};
const documentUrl=(id:string,version:"estudiante"|"profesor")=>"/api/paes/saved/item?id="+encodeURIComponent(id)+"&version="+version;
export default function PaesFolder(){
 const [items,setItems]=useState<Item[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(true),[preview,setPreview]=useState<string|null>(null);
 async function load(){setError("");setBusy(true);try{const r=await fetch("/api/paes/saved",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"No se pudo cargar.");setItems(d.items);}catch(e){setError(e instanceof Error?e.message:"Error de carga.");}finally{setBusy(false);}}
 useEffect(()=>{void load();},[]);
 async function remove(id:string){if(!window.confirm("¿Eliminar este ensayo guardado?"))return;try{const r=await fetch("/api/paes/saved?id="+encodeURIComponent(id),{method:"DELETE"});if(!r.ok)throw Error("No se pudo eliminar.");setPreview(null);void load();}catch(e){setError(e instanceof Error?e.message:"No se pudo eliminar.");}}
 const actionStyle={display:"inline-block",padding:"10px 14px",border:"1px solid #b9dce1",borderRadius:10,background:"#f2fafb",color:"#147b89",fontWeight:700,textDecoration:"none"};
 return <main style={{display:"block",width:"100%",minHeight:"100vh",background:"#f5f7fb",padding:"clamp(16px,3vw,36px)",fontFamily:"Arial,sans-serif",color:"#17233c"}}>
 <div style={{width:"100%",minWidth:0,margin:"auto"}}>
 <Link href="/ensayos-paes">← Ensayos PAES</Link><h1>Mi carpeta · Ensayos PAES</h1>
 <p>Abre la prueba del estudiante o el solucionario docente de cada ensayo guardado, sin generar nuevamente con IA. Para guardar un PDF, abre el documento y usa Imprimir.</p>
 {error&&<p role="alert" style={{color:"#b91c1c"}}>{error}</p>}
 {busy?<p role="status">Cargando…</p>:items.length===0&&!error?<p>Todavía no tienes ensayos PAES guardados.</p>:items.map(item=><article key={item.id} style={{background:"white",padding:22,borderRadius:12,margin:"16px 0",border:"1px solid #dce3ed",width:"100%"}}>
 <h2 style={{fontSize:20,marginTop:0}}>{item.title}</h2><p>{new Date(item.createdAt).toLocaleDateString("es-CL")}</p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
 <a href={documentUrl(item.id,"estudiante")} target="_blank" rel="noopener noreferrer" style={actionStyle}>Abrir prueba estudiante · PDF</a>
 <a href={documentUrl(item.id,"profesor")} target="_blank" rel="noopener noreferrer" style={actionStyle}>Abrir solucionario docente · PDF</a>
 <button onClick={()=>setPreview(preview===item.id?null:item.id)} style={{...actionStyle,cursor:"pointer"}}>{preview===item.id?"Cerrar vista previa":"Ver aquí"}</button>
 <button onClick={()=>remove(item.id)} style={{...actionStyle,cursor:"pointer",color:"#b91c1c"}}>Eliminar</button>
 </div>
 {preview===item.id&&<iframe title={"Vista previa: "+item.title} src={documentUrl(item.id,"estudiante")} sandbox="allow-same-origin" style={{width:"100%",height:"75vh",border:"1px solid #dce3ed",borderRadius:10,marginTop:18,background:"white"}}/>}
 </article>)}
 </div></main>;
}
