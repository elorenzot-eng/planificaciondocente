"use client";
import { useEffect, useState } from "react";
import { assessSimceImageQuality, type SimceImageQuality } from "../../../../lib/simce-paper-image-quality";
import { detectRegistrationCorners } from "../../../../lib/simce-paper-registration";
import { rectifySheet } from "../../../../lib/simce-paper-perspective";
import { buildSimceGrid } from "../../../../lib/simce-paper-grid";
import { readCalibratedSheet, type OmrSheetResult } from "../../../../lib/simce-paper-sheet-reader";

const ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "application/pdf"]);
export default function CargaHojaSimce() {
  const [file,setFile] = useState<File|null>(null);
  const [error,setError] = useState("");
  const [preview,setPreview] = useState<string|null>(null);
  const [total,setTotal] = useState(40);
  const [firstQuestion,setFirstQuestion] = useState(1);
  const [result,setResult] = useState<OmrSheetResult|null>(null);
  const [pages,setPages] = useState<OmrSheetResult[]>([]);
  const [corrections,setCorrections] = useState<Record<number,string>>({});
  const [answerKey,setAnswerKey] = useState("");
  const [quality,setQuality] = useState<SimceImageQuality|null>(null);
  const [busy,setBusy] = useState(false);
  const [autoAlign,setAutoAlign] = useState(true);
  const [advanced,setAdvanced] = useState(false);
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
    if(!file||!preview||file.name.toLowerCase().endsWith(".pdf")){setError("El análisis óptico inicial admite imágenes JPG o PNG; PDF está pendiente.");return;}
    if(!Number.isInteger(total)||total<1||total>50||!Number.isInteger(firstQuestion)||firstQuestion<1||firstQuestion+total-1>100){setError("Cada hoja admite entre 1 y 50 preguntas, numeradas hasta la 100. Revisa el inicio y la cantidad de preguntas.");return;}
    setBusy(true);setError("");setResult(null);
    try{
      const img=await createImageBitmap(file);
      try{
        const canvas=document.createElement("canvas");canvas.width=img.width;canvas.height=img.height;
        const ctx=canvas.getContext("2d",{willReadFrequently:true});
        if(!ctx)throw new Error("No se pudo abrir el lector de imagen");
        ctx.drawImage(img,0,0);
        const pixels=ctx.getImageData(0,0,img.width,img.height);
        const aligned=autoAlign?rectifySheet(pixels,detectRegistrationCorners(pixels.data,img.width,img.height)):pixels;
        const imageQuality=assessSimceImageQuality(pixels.data,img.width,img.height);
        setQuality(imageQuality);
        const rows=buildSimceGrid(total,{
          firstColumnA:{x:cal.leftX*aligned.width,y:cal.leftY*aligned.height},
          secondColumnA:{x:cal.rightX*aligned.width,y:cal.rightY*aligned.height},
          bubbleSpacing:cal.spacing*aligned.width,rowSpacing:cal.rowSpacing*aligned.height,
          bubbleRadius:cal.radius*Math.min(aligned.width,aligned.height),leftRows:advanced?cal.leftRows:Math.ceil(total/2)
        },aligned.width,aligned.height);
        const reading=readCalibratedSheet({data:aligned.data,width:aligned.width,height:aligned.height},rows);
        const offset=firstQuestion-1;
        setResult({...reading,answers:reading.answers.map(a=>({...a,number:a.number+offset})),reviewNumbers:reading.reviewNumbers.map(n=>n+offset),measurements:reading.measurements.map(m=>({...m,number:m.number+offset}))});
      }finally{img.close();}
    }catch(e){setError(e instanceof Error?e.message:"No fue posible analizar la imagen");}
    finally{setBusy(false);}
  }
  const savePage = () => {
    if(!result)return;
    const numbers=new Set(result.answers.map(a=>a.number));
    if(pages.some(page=>page.answers.some(a=>numbers.has(a.number)))){setError("Esta página contiene preguntas ya guardadas. Elimina las páginas anteriores antes de reemplazarlas.");return;}
    setPages(previous=>[...previous,result].sort((a,b)=>a.answers[0].number-b.answers[0].number));
    setError("");
  };
  const key=answerKey.toUpperCase().replace(/[^ABCD]/g,"");
  const combinedAnswers=pages.flatMap(p=>p.answers).sort((a,b)=>a.number-b.number);
  const resolved=combinedAnswers.map(a=>({number:a.number,mark:corrections[a.number]??a.mark}));
  const scored=resolved.filter(a=>a.number<=key.length && ["A","B","C","D"].includes(String(a.mark)));
  const correct=scored.filter(a=>a.mark===key[a.number-1]).length;
  const pending=resolved.filter(a=>a.mark==="UNCERTAIN"||a.mark==="MULTIPLE").length;
  const exportCombined = () => {
    const answers=pages.flatMap(p=>p.answers).sort((a,b)=>a.number-b.number);
    if(!answers.length)return;
    const rows=["Pregunta;Marca;Estado",...answers.map(a=>[a.number,String(corrections[a.number]??a.mark??""),corrections[a.number]!==undefined?"REVISADA":a.mark==="UNCERTAIN"||a.mark==="MULTIPLE"?"REVISAR":a.mark===null?"SIN_RESPUESTA":"LEIDA"].join(";"))];
    const blob=new Blob(["\uFEFF"+rows.join("\r\n")],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");link.href=url;link.download="lectura-simce-paginas.csv";link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
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
    <p>Admite JPG, PNG y PDF (máximo 10 MB). La lectura experimental permite alineación mediante las marcas de registro.</p>
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
        <h3>Lectura óptica experimental · una página por vez</h3>
        <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" checked={autoAlign} onChange={e=>{setAutoAlign(e.target.checked);setResult(null);}}/> Alinear automáticamente usando las cuatro marcas negras (experimental)</label>
        <p style={{fontSize:13}}>Para ensayos de más de 50 preguntas, carga cada página por separado. Puedes agregar cada página al consolidado y exportar todas juntas.</p>
        <p style={{fontSize:13}}>Coordenadas normalizadas de 0 a 1. Ajusta los centros de la primera burbuja A de cada columna. Los valores iniciales son ilustrativos, no una calibración validada. La distribución entre columnas se calcula automáticamente según la cantidad de preguntas, salvo que actives calibración avanzada.</p>
        <label>Primera pregunta de esta página <input type="number" min={1} max={100} value={firstQuestion} onChange={e=>{setFirstQuestion(Number(e.target.value));setResult(null);}}/></label>
        <label>Preguntas <input type="number" min={1} max={50} value={total} onChange={e=>{const next=Number(e.target.value);setTotal(next);setCal(old=>({...old,leftRows:Math.ceil(next/2)}));setResult(null);}}/></label>
        <button type="button" onClick={()=>setAdvanced(!advanced)} style={{marginTop:12,display:"block"}}>{advanced?"Ocultar":"Mostrar"} calibración avanzada</button>
        {advanced && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:12}}>
          {fields.map(f=><label key={f.key} style={{display:"grid",gap:4,fontSize:13}}>{f.label}<input type="number" step={f.step} min={0} max={f.key==="leftRows"?100:1} value={cal[f.key]} onChange={e=>{setCal(old=>({...old,[f.key]:Number(e.target.value)}));setResult(null);}}/></label>)}
        </div>}
        <button type="button" disabled={busy} onClick={analyze} style={{marginTop:14,background:"#087f91",color:"white",border:0,borderRadius:8,padding:"12px 18px"}}>{busy?"Analizando…":"Leer marcas (experimental)"}</button>
      </section>}
      {quality&&<section aria-live="polite" style={{padding:12,marginTop:12,border:"1px solid #bde5e6",borderRadius:8}}><h3>Calidad de imagen</h3>{quality.warnings.length?quality.warnings.map((warning,i)=><p key={i} style={{color:"#995000"}}>⚠ {warning}</p>):<p>No se detectaron problemas evidentes de iluminación, contraste o nitidez. Esto no garantiza una lectura correcta.</p>}</section>}
      {result&&<section aria-live="polite">
        <h3>Lectura preliminar: {result.answers.length} respuestas</h3>
        <p>{result.reviewNumbers.length} marcas dudosas o múltiples. <strong>No es una calificación ni debe utilizarse sin revisión docente.</strong></p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{result.answers.map(a=><span key={a.number} style={{padding:8,border:"1px solid #a7d6dc",borderRadius:6}}>{a.number}: {a.mark??"—"}</span>)}</div>
        <button type="button" onClick={savePage} style={{marginTop:14,marginRight:8,padding:10}}>Agregar esta página al ensayo</button>
        <button type="button" style={{marginTop:14,padding:10}} onClick={()=>{const csv="Pregunta,Marca,Confianza\n"+result.answers.map((a,i)=>[a.number,a.mark??"",result.measurements[i].confidence.toFixed(3)].join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download="lectura-simce-experimental.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Exportar lectura CSV para revisión</button>
      </section>}
      {pages.length>0&&<section style={{marginTop:16,padding:16,border:"1px solid #a7d6dc",borderRadius:10}}>
        <h3>Ensayo consolidado · {pages.length} página(s)</h3>
        <p>{pages.reduce((n,p)=>n+p.answers.length,0)} respuestas registradas. {pages.reduce((n,p)=>n+p.reviewNumbers.length,0)} marcas requieren revisión. Revisa todas las marcas antes de corregir.</p>
        <p style={{fontSize:13}}>Páginas: {pages.map(p=>`${p.answers[0].number}–${p.answers[p.answers.length-1].number}`).join(", ")}. La exportación no equivale a una calificación validada.</p>
        <details style={{marginBottom:12}}><summary>Revisar y corregir respuestas ({pages.flatMap(p=>p.reviewNumbers).length} observaciones)</summary>
          {pages.flatMap(p=>p.answers).sort((a,b)=>a.number-b.number).map(a=><label key={a.number} style={{display:"inline-flex",alignItems:"center",gap:6,margin:6,fontSize:13}}>
            {a.number}: <select aria-label={`Respuesta revisada pregunta ${a.number}`} value={corrections[a.number]??(a.mark??"")} onChange={e=>setCorrections(old=>({...old,[a.number]:e.target.value}))}>
              <option value="">Sin respuesta</option>{["A","B","C","D"].map(v=><option key={v} value={v}>{v}</option>)}
              {a.mark==="UNCERTAIN"||a.mark==="MULTIPLE"?<option value={a.mark}>{a.mark==="UNCERTAIN"?"Dudosa":"Múltiple"}</option>:null}
            </select>
          </label>)}
        </details>
        <div style={{padding:12,marginBottom:12,background:"#fff",borderRadius:8}}>
          <label style={{display:"grid",gap:6}}>Clave de respuestas (A, B, C, D en orden, sin números)
            <textarea value={answerKey} onChange={e=>setAnswerKey(e.target.value.toUpperCase())} rows={3} placeholder="Ejemplo: ABCDABCD..." style={{width:"100%",padding:8}}/>
          </label>
          <p style={{fontSize:13}}>Clave: {key.length} preguntas. Respuestas correctas verificables: {correct} de {scored.length}. Pendientes de revisión óptica: {pending}.</p>
          <p style={{fontSize:12}}>Resultado provisional; comprueba que la clave corresponda al ensayo y revisa las respuestas dudosas antes de utilizarlo.</p>
        </div>
        <button type="button" onClick={exportCombined} style={{padding:10,marginRight:8}}>Exportar páginas juntas (CSV)</button>
        <button type="button" onClick={()=>{setPages([]);setCorrections({});}} style={{padding:10}}>Vaciar páginas</button>
      </section>}
      <p style={{fontSize:13,color:"#526a78"}}>Procesamiento local en el navegador: no se sube el archivo al servidor. La corrección de perspectiva es experimental; aún faltan validación con fotografías reales, PDF y vinculación a la pauta del ensayo.</p>
    </section>}
  </main>;
}
