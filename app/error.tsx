"use client";
import {useEffect} from "react";

export default function ErrorPage({error,reset}:{error:Error & {digest?:string},reset:()=>void}){
 useEffect(()=>{console.error("[client-error]",error)},[error]);
 return <main style={{display:"block",minHeight:"100vh",padding:"48px",background:"#f5f7fb"}}>
  <section style={{maxWidth:"900px",margin:"40px auto",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"16px",padding:"28px"}}>
   <h1 style={{color:"#123f6d"}}>Error de la aplicación</h1>
   <p>Se detectó una excepción en el navegador. Este mensaje permite identificar y corregir la causa.</p>
   <pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",padding:"16px",background:"#f8fafc",borderRadius:"10px"}}>{error?.name+": "+error?.message}</pre>
   {error?.digest&&<p><b>Referencia:</b> {error.digest}</p>}
   <button onClick={reset} style={{padding:"12px 18px",border:0,borderRadius:"9px",background:"#2563eb",color:"#fff",fontWeight:700}}>Reintentar</button>
  </section>
 </main>
}