"use client";
import { useEffect, useState } from "react";
import { assessSimceImageQuality, type SimceImageQuality } from "@/lib/simce-paper-image-quality";
import { buildSimceGrid } from "@/lib/simce-paper-grid";
import { readCalibratedSheet, type OmrSheetResult } from "@/lib/simce-paper-sheet-reader";

const ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "application/pdf"]);
export default function CargaHojaSimce() {
  const [file,setFile] = useState<File|null>(null);
  const [error,setError] = useState("");
  const [preview,setPreview] = useState<string|null>(null);
  const [total,setTotal] = useState(40);
  const [result,setResult] = useState<OmrSheetResult|null>(null);
  const [quality,setQuality] = useState<SimceImageQuality|null>(null);
  const [busy,setBusy] = useState(false);
  const [cal,setCal] = useState({leftX:0.18,leftY:0.25,rightX:0.65,rightY:0.25,spacing:0.048,rowSpacing:0.026,radius:0.012,leftRows:20});
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
  const choose = (f?:File) => {
    setFile(null);setError("");setResult(null);setQuality(null);
    if(!f){setPreview(null);return;}
    const ext=f.name.toLowerCase().split(".").pop();
    const mime=f.type||({jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",pdf:"application/pdf"} as Record<string,string>)[ext||""];
    if(!ALLOWED.has(mime)||!["jpg","jpeg","png","pdf"].includes(ext||"")){setError("Formato no permitido. Selecciona JPG, PNG o PDF.");return;}
    if(!f.size||f.size>MAX_BYTES){setError("El archivo debe pesar entre 1 byte y 10 MB.");return;}
    setFile(f);setPreview(URL.createObjectURL(f));
  };
  async function analyze(){
    if(!file||!preview||file.type==="application/pdf"){setError("El análisis óptico inicial admite imágenes JPG o PNG; PDF está pendiente.");return;}
    setBusy(true);setError("");setResult(null);
    try{
      const img=await createImageBitmap(file);
      try{
        const canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;
        const ctx=canvas.getContext("2d",{willReadFrequently:true});
        if(!ctx)throw new Error("No se pudo abrir el lector de imagen");
        ctx.drawImage(img,0,0);
        const pixels=ctx.getImageData(0,0,img.width,img.height);
        const imageQuality=assessSimceImageQuality(pixels.data,img.width,img.height);
        setQuality(imageQuality);
        const rows=buildSimceGrid(total,{
          firstColumnA:{x:cal.leftX*img.width,y:cal.leftY*img.height},
          secondColumnA:{x:cal.rightX*img.width,y:cal.rightY*img.height},
          bubbleSpacing:cal.spacing*img.width,rowSpacing:cal.rowSpacing*img.height,
          bubbleRadius:cal.radius*Math.min(img.width,img.height),leftRows:cal.leftRows
        },img.width,img.height);
        setResult(readCalibratedSheet({data:pixels.data,width:img.width,height:img.height},rows));
      }finally{img.close();}
    }catch(e){setError(e instanceof Error?e.message:"No fue posible analizar la imagen");}
    finally{setBusy(false);}
  }
  const fields: {key:keyof typeof cal;label:string;step:string}[]=[
    {key:"leftX",label:"Columna izquierda X",step:"0.001"},
    {key:"leftY",label:"Columna izquierda Y",step:"0.001"},
    {key:"rightX",label:"Columna derecha X",step:"0.001"},
    {key:"rightY",label:"Columna derecha Y",step:"0.001"},
    {key:"spacing",label:"Separación alternativas (ancho)",step:"0.001"},
    {key:"rowSpacing",label:"Separación filas (alto)",step:"0.001"},
    {key:"radius",label:"Radio interior (lado menor)",step:"0.001"},
    {key:"leftRows",label:"Preguntas columna izquierda",step:"1"}
  ];
  return <main style={{maxWidth:780,margin:"auto",padding:24,fontFamily:"Arial,sans-serif",color:"#173752"}}>
    <a href="/ensayos-simce/corrector" style={{color:"#087f91"}}>← Volver al corrector</a>
    <h1>Cargar hoja de respuestas SIMCE</h1>
    <p>Admite JPG, PNG y PDF (máximo 10 MB). La lectura experimental requiere una imagen frontal, sin inclinación, y calibración manual.</p>
    <section style={{border:"2px dashed #39aeb7",background:"#f2fbfb",padding:24,borderRadius:14}}>
      <input type="file" accept={ACCEPT} onChange={e=>choose(e.target.files?.[0])} aria-label="Seleccionar hoja de respuestas"/>
      {error&&<p role="alert" style={{color:"#a41e42"}}>{error}</p>}
      {file&&<p role="status">Archivo: <strong>{file.name}</strong> ({(file.size/1024/1024).toFixed(2)} MB)</p>}
    </section>
    {preview&&file&&<section style={{marginTop:20}}>
      <h2>Vista previa</h2>
      {file.name.toLowerCase().endsWith(".pdf")?<iframe title="Vista previa PDF" src={preview} style={{width:"100%",height:400,border:"1px solid #d7e8eb"}}/>:
      <img alt="Hoja seleccionada" src={preview} style={{maxWidth:"100%",maxHeight:480,borderRadius:8}}/>}
      {!file.name.toLowerCase().endsWith(".pdf")&&<section style={{background:"#f2fbfb",padding:16,borderRadius:12,marginTop:16}}>
        <h3>Lectura óptica experimental · calibración manual</h3>
        <p style={{fontSize:13}}>Coordenadas normalizadas de 0 a 1. Ajusta los centros de la primera burbuja A de cada columna. Los valores iniciales son ilustrativos, no una calibración validada.</p>
        <label>Preguntas <input type="number" min={1} max={100} value={total} onChange={e=>{const next=Number(e.target.value);setTotal(next);setCal(old=>({...old,leftRows:Math.ceil(next/2)}));setResult(null);}}/></label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:12}}>
          {fields.map(f=><label key={f.key} style={{display:"grid",gap:4,fontSize:13}}>{f.label}<input type="number" step={f.step} min={0} max={f.key==="leftRows"?100:1} value={cal[f.key]} onChange={e=>{setCal(old=>({...old,[f.key]:Number(e.target.value)}));setResult(null);}}/></label>)}
        </div>
        <button type="button" disabled={busy} onClick={analyze} style={{marginTop:14,background:"#087f91",color:"white",border:0,borderRadius:8,padding:"12px 18px"}}>{busy?"Analizando…":"Leer marcas (experimental)"}</button>
      </section>}
      {quality&&<section aria-live="polite" style={{padding:12,marginTop:12,border:"1px solid #bde5e6",borderRadius:8}}><h3>Calidad de imagen</h3>{quality.warnings.length?quality.warnings.map((warning,i)=><p key={i} style={{color:"#995000"}}>⚠ {warning}</p>):<p>No se detectaron problemas evidentes de iluminación, contraste o nitidez. Esto no garantiza una lectura correcta.</p>}</section>}
      {result&&<section aria-live="polite">
        <h3>Lectura preliminar: {result.answers.length} respuestas</h3>
        <p>{result.reviewNumbers.length} marcas dudosas o múltiples. <strong>No es una calificación ni debe utilizarse sin revisión docente.</strong></p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{result.answers.map(a=><span key={a.number} style={{padding:8,border:"1px solid #a7d6dc",borderRadius:6}}>{a.number}: {a.mark??"—"}</span>)}</div>
        <button type="button" style={{marginTop:14,padding:10}} onClick={()=>{const csv="Pregunta,Marca,Confianza\n"+result.answers.map((a,i)=>[a.number,a.mark??"",result.measurements[i].confidence.toFixed(3)].join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="lectura-simce-experimental.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Exportar lectura CSV para revisión</button>
      </section>}
      <p style={{fontSize:13,color:"#526a78"}}>Procesamiento local en el navegador: no se sube el archivo al servidor. Faltan corrección automática de perspectiva, PDF y vinculación a la pauta oficial del ensayo.</p>
    </section>}
  </main>;
}
