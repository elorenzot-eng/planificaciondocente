"use client";
import { useMemo, useState } from "react";
import { gradeSimce, type SimceAlternative, type SimceMark } from "@/lib/simce-paper-grading";

const OPTIONS: SimceAlternative[] = ["A", "B", "C", "D"];
function parseKey(raw: string) {
  const letters = raw.toUpperCase().replace(/[^ABCD]/g, "").split("") as SimceAlternative[];
  if (!letters.length || letters.length > 100) throw new Error("Ingresa una pauta de 1 a 100 respuestas A, B, C o D.");
  return letters.map((correct, i) => ({number:i + 1, correct}));
}
export default function CorrectorSimcePage() {
  const [key, setKey] = useState("");
  const [marks, setMarks] = useState<Record<number, SimceMark>>({});
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const questions = useMemo(() => { try { return parseKey(key); } catch { return []; } }, [key]);
  const result = useMemo(() => {
    if (!questions.length) return null;
    try { return gradeSimce(questions, questions.map(q => ({number:q.number, mark:marks[q.number] ?? null}))); }
    catch { return null; }
  }, [questions, marks]);
  const setMark = (number:number, mark:SimceMark) => {setLocked(false);setMarks(prev=>({...prev,[number]:mark}));};
  const exportCsv = () => {
    if (!locked || !result || result.reviewRequired) return;
    const rows = [["Estudiante","Pregunta","Respuesta","Correcta","Estado"],...result.detail.map(d=>[name,d.number,String(d.mark??""),d.correct,d.status])];
    const csv = "\uFEFF"+rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(";")).join("\r\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download="correccion-simce.csv";link.click();URL.revokeObjectURL(url);
  };
  return <main style={{maxWidth:1000,margin:"auto",padding:24,fontFamily:"Arial,sans-serif",color:"#173752"}}>
    <a href="/ensayos-simce" style={{color:"#087f91"}}>← Ensayos SIMCE</a>
    <h1>Corrector SIMCE · revisión docente</h1>
    <p>Versión inicial para ingresar o revisar respuestas manualmente. La lectura por fotografía y la vinculación automática con ensayos guardados todavía no están disponibles.</p>
    <div style={{background:"#f0fafb",padding:18,borderRadius:12,display:"grid",gap:12}}>
      <label>Estudiante (opcional)<input value={name} maxLength={100} onChange={e=>{setName(e.target.value);setLocked(false);}} style={{display:"block",padding:10,width:"100%",boxSizing:"border-box"}}/></label>
      <label>Pauta del docente (ejemplo: ABCDABCD)<textarea rows={3} value={key} onChange={e=>{setKey(e.target.value);setMarks({});setLocked(false);setError("");}} style={{display:"block",padding:10,width:"100%",boxSizing:"border-box"}}/></label>
      <button type="button" onClick={()=>{try{parseKey(key);setError("");}catch(e){setError(e instanceof Error?e.message:"Pauta inválida");}}} style={{background:"#087f91",color:"white",border:0,borderRadius:8,padding:12,cursor:"pointer"}}>Validar pauta</button>
      {error&&<p role="alert" style={{color:"#a02040"}}>{error}</p>}
    </div>
    {!!questions.length && <section>
      <h2>Respuestas del estudiante ({questions.length} preguntas)</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))",gap:10}}>
        {questions.map(q=><fieldset key={q.number} style={{border:"1px solid #d3e5ea",borderRadius:9,padding:10}}>
          <legend>Pregunta {q.number}</legend>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {([...OPTIONS,null,"MULTIPLE","UNCERTAIN"] as SimceMark[]).map((mark,i)=><label key={i} style={{fontSize:13,whiteSpace:"nowrap"}}><input type="radio" name={`q-${q.number}`} checked={(marks[q.number]??null)===mark} onChange={()=>setMark(q.number,mark)}/>{mark===null?"Sin marca":mark==="MULTIPLE"?"Doble":mark==="UNCERTAIN"?"Dudosa":mark}</label>)}
          </div>
        </fieldset>)}
      </div>
    </section>}
    {result && <section style={{marginTop:24,padding:18,border:"1px solid #c9e7e6",borderRadius:12}}>
      <h2>Resumen provisional</h2>
      <p>Correctas: <strong>{result.correct}</strong> · Incorrectas: <strong>{result.incorrect}</strong> · Omitidas: <strong>{result.blank}</strong> · Revisión pendiente: <strong>{result.reviewRequired}</strong></p>
      <p>{result.percentage===null?"Porcentaje retenido hasta resolver las marcas dudosas.":`Logro: ${result.percentage}% (porcentaje de aciertos, no puntaje oficial SIMCE)`}</p>
      <button type="button" disabled={result.reviewRequired>0} onClick={()=>setLocked(true)} style={{background:"#6c39ad",color:"white",border:0,borderRadius:8,padding:12,cursor:"pointer",opacity:result.reviewRequired?0.5:1}}>Confirmar revisión</button>{" "}
      <button type="button" disabled={!locked} onClick={exportCsv} style={{background:"#087f91",color:"white",border:0,borderRadius:8,padding:12,cursor:"pointer",opacity:locked?1:0.5}}>Exportar CSV</button>
      {locked&&<p role="status">Revisión confirmada en esta sesión. Aún no se guarda en Mi carpeta.</p>}
    </section>}
  </main>;
}
