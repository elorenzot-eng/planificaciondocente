"use client";
import { useRef, useState } from "react";

const ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "application/pdf"]);
export default function CargaHojaSimce() {
  const input = useRef<HTMLInputElement>(null);
  const [file,setFile] = useState<File|null>(null);
  const [error,setError] = useState("");
  const [preview,setPreview] = useState<string|null>(null);
  const choose = (f?:File) => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);setFile(null);setError("");
    if (!f) return;
    const ext = f.name.toLowerCase().split(".").pop();
    const mime = f.type || ({jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",pdf:"application/pdf"} as Record<string,string>)[ext||""];
    if (!ALLOWED.has(mime) || !["jpg","jpeg","png","pdf"].includes(ext||"")) {setError("Formato no permitido. Selecciona JPG, PNG o PDF.");return;}
    if (f.size === 0 || f.size > MAX_BYTES) {setError("El archivo debe pesar entre 1 byte y 10 MB.");return;}
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };
  return <main style={{maxWidth:780,margin:"auto",padding:24,fontFamily:"Arial,sans-serif",color:"#173752"}}>
    <a href="/ensayos-simce/corrector" style={{color:"#087f91"}}>← Volver al corrector</a>
    <h1>Cargar hoja de respuestas SIMCE</h1>
    <p>Selecciona una imagen JPG o PNG, o un documento PDF. Máximo 10 MB por archivo.</p>
    <section style={{border:"2px dashed #39aeb7",background:"#f2fbfb",padding:24,borderRadius:14}}>
      <input ref={input} type="file" accept={ACCEPT} onChange={e=>choose(e.target.files?.[0])} aria-label="Seleccionar hoja de respuestas"/>
      {error && <p role="alert" style={{color:"#a41e42"}}>{error}</p>}
      {file && <p role="status">Archivo seleccionado: <strong>{file.name}</strong> ({(file.size/1024/1024).toFixed(2)} MB)</p>}
    </section>
    {preview && file && <section style={{marginTop:20}}>
      <h2>Vista previa</h2>
      {file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
        ? <iframe title="Vista previa PDF" src={preview} style={{width:"100%",height:540,border:"1px solid #d7e8eb",borderRadius:8}}/>
        : <img alt="Hoja de respuestas seleccionada" src={preview} style={{maxWidth:"100%",maxHeight:650,borderRadius:8}}/>}
      <p style={{fontSize:13,color:"#526a78"}}>La lectura automática OMR aún está en desarrollo. Seleccionar un archivo no lo envía al servidor ni genera una calificación.</p>
    </section>}
  </main>;
}
