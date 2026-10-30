"use client";
import { useEffect, useState } from "react";
import { simcePaperCalibration } from "../../../../lib/simce-paper-template";
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
  const [batchFiles,setBatchFiles] = useState<File[]>([]);
  const [batchResults,setBatchResults] = useState<{filename:string;status:"leída"|"revisar"|"error";correct:number|null;total:number;review:number;message:string}[]>([]);
  const [batchBusy,setBatchBusy] = useState(false);
  const [batchDone,setBatchDone] = useState(0);

  const [error,setError] = useState("");
  const [preview,setPreview] = useState<string|null>(null);
  const [total,setTotal] = useState(40);
  const [firstQuestion,setFirstQuestion] = useState(1);
  const [result,setResult] = useState<OmrSheetResult|null>(null);
  const [pages,setPages] = useState<OmrSheetResult[]>([]);
  const [corrections,setCorrections] = useState<Record<number,string>>({});
  const [answerKey,setAnswerKey] = useState("");
  const [studentId,setStudentId] = useState("");
  const [schoolId,setSchoolId]=useState("");
  const [course,setCourse]=useState("");
  const [subject,setSubject]=useState("Lenguaje");
  const [grade,setGrade]=useState("4° básico");
  const [roster,setRoster]=useState<{id:string;name:string;licensedStudents:{id:string;firstName:string;paternalSurname:string;maternalSurname:string;course:string}[]}[]>([]);
  const [saving,setSaving]=useState(false);
  const [saveMessage,setSaveMessage]=useState("");
  const [essayId,setEssayId] = useState("");
  const [expectedQuestions,setExpectedQuestions] = useState(40);
  const [confirmedReview,setConfirmedReview] = useState(false);
  const [quality,setQuality] = useState<SimceImageQuality|null>(null);
  const [busy,setBusy] = useState(false);
  const [autoAlign,setAutoAlign] = useState(true);
  const [pdfPage,setPdfPage] = useState(1);
  const [advanced,setAdvanced] = useState(false);
  const [cal,setCal] = useState(simcePaperCalibration);
  useEffect(()=>{fetch("/api/analitica-institucional/nomina",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>setRoster(j.schools||[])).catch(()=>setRoster([]))},[]);
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
    if(!file||!preview){setError("Selecciona una hoja JPG, PNG o PDF.");return;}
    if(!Number.isInteger(total)||total<1||total>50||!Number.isInteger(firstQuestion)||firstQuestion<1||firstQuestion+total-1>100){setError("Cada hoja admite entre 1 y 50 preguntas, numeradas hasta la 100. Revisa el inicio y la cantidad de preguntas.");return;}
    setBusy(true);setError("");setResult(null);
    try{
      const canvas=document.createElement("canvas");
      if(file.name.toLowerCase().endsWith(".pdf")){
        const pdfjs=await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();
        const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
        try{
          if(!Number.isInteger(pdfPage)||pdfPage<1||pdfPage>doc.numPages)throw new Error(`El PDF tiene ${doc.numPages} página(s). Selecciona una página válida.`);
          const page=await doc.getPage(pdfPage);
          const viewport=page.getViewport({scale:2});
          canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
          const context=canvas.getContext("2d",{willReadFrequently:true});
          if(!context)throw new Error("No se pudo crear el lienzo PDF");
          await page.render({canvasContext:context,viewport}).promise;
        }finally{await doc.destroy();}
      }else{
        const img=await createImageBitmap(file);
        try{canvas.width=img.width;canvas.height=img.height;const context=canvas.getContext("2d",{willReadFrequently:true});if(!context)throw new Error("No se pudo abrir el lector de imagen");context.drawImage(img,0,0);}finally{img.close();}
      }
      {
        const ctx=canvas.getContext("2d",{willReadFrequently:true});
        if(!ctx)throw new Error("No se pudo leer la hoja");
        const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
        const aligned=autoAlign?rectifySheet(pixels,detectRegistrationCorners(pixels.data,canvas.width,canvas.height)):pixels;
        const imageQuality=assessSimceImageQuality(pixels.data,canvas.width,canvas.height);
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
      }
    }catch(e){setError(e instanceof Error?e.message:"No fue posible analizar la imagen");}
    finally{setBusy(false);}
  }

  const selectBatch=(files:FileList|null)=>{
    const selected=Array.from(files||[]);
    if(selected.length>100){setError("Máximo 100 archivos por lote.");return;}
    const invalid=selected.find(f=>!["jpg","jpeg","png","pdf"].includes(f.name.toLowerCase().split(".").pop()||"")||f.size<1||f.size>MAX_BYTES);
    if(invalid){setError("Archivo no válido: "+invalid.name+". Usa JPG, PNG o PDF de hasta 10 MB.");return;}
    setBatchFiles(selected);setBatchResults([]);setBatchDone(0);setError("");
  };
  const processBatch=async()=>{
    if(!batchFiles.length||batchBusy)return;
    if(!keyValid||key.length!==expectedQuestions||expectedQuestions<1||expectedQuestions>50){setError("Antes de procesar el lote, ingresa una pauta válida con el número exacto de respuestas (máximo 50).");return;}
    setBatchBusy(true);setBatchDone(0);setBatchResults([]);setError("");
    const output:typeof batchResults=[];
    for(const fileItem of batchFiles){
      try{
        const canvas=document.createElement("canvas");
        if(fileItem.name.toLowerCase().endsWith(".pdf")){
          const pdfjs=await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();
          const doc=await pdfjs.getDocument({data:new Uint8Array(await fileItem.arrayBuffer())}).promise;
          try{
            if(doc.numPages!==1)throw new Error("PDF de varias páginas: separar por estudiante antes de procesar.");
            const page=await doc.getPage(1);const viewport=page.getViewport({scale:2});
            canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
            const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("No se pudo leer el PDF");
            await page.render({canvasContext:ctx,viewport}).promise;
          }finally{await doc.destroy();}
        }else{
          const bitmap=await createImageBitmap(fileItem);
          try{canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("No se pudo leer la imagen");ctx.drawImage(bitmap,0,0);}finally{bitmap.close();}
        }
        const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("No se pudo procesar la hoja");
        const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
        const aligned=autoAlign?rectifySheet(pixels,detectRegistrationCorners(pixels.data,canvas.width,canvas.height)):pixels;
        const rows=buildSimceGrid(expectedQuestions,{
          firstColumnA:{x:cal.leftX*aligned.width,y:cal.leftY*aligned.height},
          secondColumnA:{x:cal.rightX*aligned.width,y:cal.rightY*aligned.height},
          bubbleSpacing:cal.spacing*aligned.width,rowSpacing:cal.rowSpacing*aligned.height,
          bubbleRadius:cal.radius*Math.min(aligned.width,aligned.height),leftRows:Math.ceil(expectedQuestions/2)
        },aligned.width,aligned.height);
        const reading=readCalibratedSheet({data:aligned.data,width:aligned.width,height:aligned.height},rows);
        const pending=reading.reviewNumbers.length;
        const correctCount=reading.answers.filter(a=>a.mark===key[a.number-1]).length;
        output.push({filename:fileItem.name,status:pending?"revisar":"leída",correct:pending?null:correctCount,total:expectedQuestions,review:pending,message:pending?"Marcas dudosas: revisar individualmente":"Lectura preliminar; validar identidad y respuestas"});
      }catch(e){output.push({filename:fileItem.name,status:"error",correct:null,total:expectedQuestions,review:0,message:e instanceof Error?e.message:"Error de lectura"});}
      setBatchResults([...output]);setBatchDone(output.length);
    }
    setBatchBusy(false);
  };
  const exportBatch=()=>{
    const safe=(v:string)=>'"'+v.replace(/"/g,'""')+'"';
    const lines=["Archivo;Estado;Aciertos preliminares;Preguntas;Marcas dudosas;Observación",...batchResults.map(r=>[safe(r.filename),r.status,r.correct??"",r.total,r.review,safe(r.message)].join(";"))];
    const url=URL.createObjectURL(new Blob(["\\uFEFF".replace("\\uFEFF","\uFEFF")+lines.join("\r\n")],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="lote-simce-revision.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const newStudent = () => {
    setPages([]);setCorrections({});setConfirmedReview(false);setStudentId("");setResult(null);setFile(null);setPreview(null);setQuality(null);setError("");setFirstQuestion(1);
  };
  const savePage = () => {
    if(!result)return;
    const numbers=new Set(result.answers.map(a=>a.number));
    if(pages.some(page=>page.answers.some(a=>numbers.has(a.number)))){setError("Esta página contiene preguntas ya guardadas. Elimina las páginas anteriores antes de reemplazarlas.");return;}
    setPages(previous=>[...previous,result].sort((a,b)=>a.answers[0].number-b.answers[0].number));
    setConfirmedReview(false);
    setError("");
  };
  const key=answerKey.toUpperCase().replace(/[\s,;|:-]/g,"").replace(/[^ABCD]/g,"");
  const keyValid=/^[ABCD]*$/.test(answerKey.toUpperCase().replace(/[\s,;|:-]/g,""));
  const combinedAnswers=pages.flatMap(p=>p.answers).sort((a,b)=>a.number-b.number);
  const resolved=combinedAnswers.map(a=>({number:a.number,mark:corrections[a.number]??a.mark}));
  const scored=resolved.filter(a=>a.number<=key.length && ["A","B","C","D"].includes(String(a.mark)));
  const correct=scored.filter(a=>a.mark===key[a.number-1]).length;
  const rawScore=correct;
  const achievementPercentage=expectedQuestions>0?Math.round(rawScore/expectedQuestions*1000)/10:0;
  const diagnosticBand=achievementPercentage>=80?"Logro alto":achievementPercentage>=60?"Logro intermedio":"Logro inicial";
  const completeSet=Number.isInteger(expectedQuestions)&&expectedQuestions>=1&&expectedQuestions<=100&&combinedAnswers.length===expectedQuestions&&combinedAnswers.every((a,i)=>a.number===i+1);
  const keyComplete=completeSet&&keyValid&&key.length===expectedQuestions;
  const pending=resolved.filter(a=>a.mark==="UNCERTAIN"||a.mark==="MULTIPLE").length;
  const blank=resolved.filter(a=>a.mark===null||a.mark==="").length;
  const validatedScore=keyComplete&&pending===0&&confirmedReview;
  const readyToScore=keyComplete&&pending===0&&confirmedReview&&studentId.trim().length>0&&essayId.trim().length>0;
  const saveAcademic=async()=>{if(!readyToScore||saving||!schoolId||!subject||!grade)return;setSaving(true);setSaveMessage("");try{const response=await fetch("/api/analitica-institucional/resultados",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({schoolId,studentId,examId:essayId,examTitle:"Ensayo SIMCE "+essayId,subject,grade,correctAnswers:correct,totalQuestions:expectedQuestions})});const data=await response.json();if(!response.ok)throw new Error(data.error||"No se pudo guardar");setSaveMessage("Resultado guardado en analítica institucional.")}catch(e){setSaveMessage(e instanceof Error?e.message:"Error al guardar")}finally{setSaving(false)}};
  const exportCombined = () => {
    const answers=pages.flatMap(p=>p.answers).sort((a,b)=>a.number-b.number);
    if(!answers.length)return;
    const safe=(value:string)=>{const v=value.replace(/"/g,'""');return `"${/^[=+@-]/.test(v.trimStart())?"\u0027"+v:v}"`;};
    const rows=["Estudiante;Ensayo;Pregunta;Marca;Estado;Clave;Resultado",...answers.map(a=>{const mark=String(corrections[a.number]??a.mark??"");const status=corrections[a.number]!==undefined?"REVISADA":a.mark==="UNCERTAIN"||a.mark==="MULTIPLE"?"REVISAR":a.mark===null?"SIN_RESPUESTA":"LEIDA";const expected=readyToScore?key[a.number-1]:"";const outcome=readyToScore?(mark===expected?"CORRECTA":"INCORRECTA"):"NO_VALIDADO";return [safe(studentId),safe(essayId),a.number,safe(mark),status,expected,outcome].join(";");})];
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
    <section style={{background:"#edf8fa",border:"1px solid #a7d6dc",padding:18,borderRadius:12,marginBottom:20}}>
      <h2>Carga masiva de hojas · revisión docente</h2>
      <p>Selecciona hasta 100 archivos JPG, PNG o PDF, uno por estudiante. Cada PDF debe contener una sola página. La lectura se procesa secuencialmente en el navegador; no guarda calificaciones automáticamente.</p>
      <label>Archivos del lote <input type="file" multiple accept={ACCEPT} disabled={batchBusy} onChange={e=>selectBatch(e.target.files)}/></label>
      <p>Seleccionados: {batchFiles.length}. Para el lote se utilizarán {expectedQuestions} preguntas y la clave ingresada en el apartado de corrección de esta página.</p>
      <button type="button" disabled={batchBusy||!batchFiles.length} onClick={processBatch} style={{background:"#087f91",color:"white",padding:"10px 16px",border:0,borderRadius:8}}>{batchBusy?"Procesando…":"Leer lote"}</button>
      {(batchBusy||batchDone>0)&&<p role="status">Procesadas {batchDone} de {batchFiles.length} hojas ({batchFiles.length?Math.round(batchDone/batchFiles.length*100):0}%).</p>}
      {batchResults.length>0&&<><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",marginTop:12}}><thead><tr><th>Archivo</th><th>Estado</th><th>Aciertos preliminares</th><th>Observación</th></tr></thead><tbody>{batchResults.map((r,i)=><tr key={i}><td>{r.filename}</td><td>{r.status}</td><td>{r.correct===null?"Pendiente":r.correct+" / "+r.total}</td><td>{r.message}</td></tr>)}</tbody></table></div><button type="button" onClick={exportBatch} style={{marginTop:12,padding:10}}>Exportar resumen del lote (CSV)</button><p style={{fontSize:12}}>Los resultados son preliminares. Para guardar una nota institucional, valida la identidad y las marcas de cada estudiante con el corrector individual. No se asigna un puntaje SIMCE oficial.</p></>}
    </section>
    <p>Admite JPG, PNG y PDF (máximo 10 MB). En PDF se procesa una página a la vez. La lectura experimental permite alineación mediante las marcas de registro.</p>
    <section style={{border:"2px dashed #39aeb7",background:"#f2fbfb",padding:24,borderRadius:14}}>
      <input type="file" accept={ACCEPT} onChange={e=>choose(e.target.files?.[0])} aria-label="Seleccionar hoja de respuestas"/>
      {error&&<p role="alert" style={{color:"#a41e42"}}>{error}</p>}
      {file&&<p role="status">Archivo: <strong>{file.name}</strong> ({(file.size/1024/1024).toFixed(2)} MB)</p>}
    </section>
    {preview&&file&&<section style={{marginTop:20}}>
      <h2>Vista previa</h2>
      {file.name.toLowerCase().endsWith(".pdf")?<iframe title="Vista previa PDF" src={preview} style={{width:"100%",height:400,border:"1px solid #d7e8eb"}}/>:
      <img alt="Hoja seleccionada" src={preview} style={{maxWidth:"100%",maxHeight:480,borderRadius:8}}/>}
      {<section style={{background:"#f2fbfb",padding:16,borderRadius:12,marginTop:16}}>
        <h3>Lectura óptica experimental · una página por vez</h3>
        {file.name.toLowerCase().endsWith(".pdf")&&<label>Página del PDF <input type="number" min={1} value={pdfPage} onChange={e=>{setPdfPage(Number(e.target.value));setResult(null);}}/></label>}
        <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" checked={autoAlign} onChange={e=>{setAutoAlign(e.target.checked);setResult(null);}}/> Alinear automáticamente usando las cuatro marcas negras (experimental)</label>
        <p style={{fontSize:13}}>Para ensayos de más de 50 preguntas, carga cada página por separado. Puedes agregar cada página al consolidado y exportar todas juntas.</p>
        <p style={{fontSize:13}}>Coordenadas normalizadas de 0 a 1. Ajusta los centros de la primera burbuja A de cada columna. Los valores iniciales corresponden a la plantilla A4 de EducAntay; confirma la lectura antes de calificar. La distribución entre columnas se calcula automáticamente según la cantidad de preguntas, salvo que actives calibración avanzada.</p>
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
            {a.number}: <select aria-label={`Respuesta revisada pregunta ${a.number}`} value={corrections[a.number]??(a.mark??"")} onChange={e=>{setCorrections(old=>({...old,[a.number]:e.target.value}));setConfirmedReview(false);}}>
              <option value="">Sin respuesta</option>{["A","B","C","D"].map(v=><option key={v} value={v}>{v}</option>)}
              {a.mark==="UNCERTAIN"||a.mark==="MULTIPLE"?<option value={a.mark}>{a.mark==="UNCERTAIN"?"Dudosa":"Múltiple"}</option>:null}
            </select>
          </label>)}
        </details>
        <section aria-label="Resultados diagnósticos SIMCE" style={{background:"#f2fbfb",border:"1px solid #a7d6dc",padding:14,borderRadius:10,marginBottom:14}}><h4>Resultados diagnósticos · EducAntay</h4>{validatedScore?<><p><strong>Puntaje bruto:</strong> {rawScore} de {expectedQuestions} respuestas correctas · <strong>Logro:</strong> {achievementPercentage}%</p><p><strong>Diagnóstico interno:</strong> {diagnosticBand}</p></>:<p>Completa la pauta, revisa todas las marcas y confirma la revisión docente para obtener el resultado.</p>}<p style={{fontSize:12}}>El diagnóstico interno utiliza umbrales orientativos de EducAntay (60% y 80%), no los Estándares de Aprendizaje oficiales. El porcentaje y el puntaje bruto no equivalen a un puntaje SIMCE estandarizado de la Agencia de Calidad de la Educación.</p></section>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginBottom:12}}><label>Total de preguntas del ensayo<input type="number" min={1} max={100} value={expectedQuestions} onChange={e=>{setExpectedQuestions(Number(e.target.value));setConfirmedReview(false);}}/></label><label>Colegio<select value={schoolId} onChange={e=>{setSchoolId(e.target.value);setCourse("");setStudentId("");setConfirmedReview(false)}}><option value="">Seleccionar</option>{roster.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Curso<select value={course} onChange={e=>{setCourse(e.target.value);setStudentId("");setConfirmedReview(false)}}><option value="">Seleccionar</option>{Array.from(new Set((roster.find(s=>s.id===schoolId)?.licensedStudents||[]).map(x=>x.course))).map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>Estudiante<select value={studentId} onChange={e=>{setStudentId(e.target.value);setConfirmedReview(false)}}><option value="">Seleccionar</option>{(roster.find(s=>s.id===schoolId)?.licensedStudents||[]).filter(x=>x.course===course).map(x=><option key={x.id} value={x.id}>{x.paternalSurname} {x.maternalSurname}, {x.firstName}</option>)}</select></label><label>Identificador del ensayo<input value={essayId} onChange={e=>{setEssayId(e.target.value);setConfirmedReview(false);}} maxLength={60}/></label></div>
        <label style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}><input type="checkbox" checked={confirmedReview} onChange={e=>setConfirmedReview(e.target.checked)}/> Confirmo que revisé las marcas y que la pauta corresponde a este ensayo.</label>
        <div style={{padding:12,marginBottom:12,background:"#fff",borderRadius:8}}>
          <label style={{display:"grid",gap:6}}>Clave de respuestas (A, B, C, D en orden, sin números)
            <textarea value={answerKey} onChange={e=>{setAnswerKey(e.target.value.toUpperCase());setConfirmedReview(false);}} rows={3} placeholder="Ejemplo: ABCDABCD..." style={{width:"100%",padding:8}}/>
          </label>
          <p style={{fontSize:13}}>Cobertura: {combinedAnswers.length} de {expectedQuestions} preguntas. {completeSet?"Numeración completa.":"Faltan preguntas o existen saltos de numeración."} Clave: {key.length} preguntas. {readyToScore?`Aciertos provisionales: ${correct} de ${expectedQuestions}.`:"La corrección no está lista: verifica cobertura, clave, marcas dudosas, identificación de estudiante y ensayo, y confirmación docente antes de mostrar el resultado global."} Pendientes de revisión óptica: {pending}. Sin respuesta: {blank}.</p>
          <p style={{fontSize:12}}>Resultado provisional; comprueba que la clave corresponda al ensayo y revisa las respuestas dudosas antes de utilizarlo.</p>
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:12}}><label>Asignatura<select value={subject} onChange={e=>setSubject(e.target.value)}><option value="Lenguaje">Lenguaje</option><option value="Matemática">Matemática</option></select></label><label>Nivel<input value={grade} onChange={e=>setGrade(e.target.value)} maxLength={60}/></label></div>
        <button type="button" disabled={!readyToScore||!schoolId||saving} onClick={saveAcademic} style={{padding:10,marginRight:8,background:"#087f91",color:"white"}}>{saving?"Guardando…":"Guardar resultado académico"}</button>{saveMessage&&<p role="status">{saveMessage}</p>}
        <button type="button" onClick={exportCombined} style={{padding:10,marginRight:8}}>Exportar páginas juntas (CSV)</button>
        <button type="button" onClick={()=>{if(window.confirm("¿Iniciar otro estudiante? Se borrarán las lecturas y revisiones actuales. Exporta primero los resultados si deseas conservarlos."))newStudent();}} style={{padding:10}}>Nuevo estudiante · limpiar lecturas</button>
      </section>}
      <p style={{fontSize:13,color:"#526a78"}}>Procesamiento local en el navegador: no se sube el archivo al servidor. La corrección de perspectiva es experimental; aún faltan validación con fotografías reales, PDF y vinculación a la pauta del ensayo.</p>
    </section>}
  </main>;
}
