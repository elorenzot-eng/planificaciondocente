"use client";
import { useEffect, useMemo, useState } from "react";
import { gradeSimce, type SimceAlternative, type SimceMark } from "../../../lib/simce-paper-grading";

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
  const [roster,setRoster]=useState<{id:string;name:string;licensedStudents:{id:string;firstName:string;paternalSurname:string;maternalSurname:string;course:string}[]}[]>([]);
  const [course,setCourse]=useState("");
  useEffect(()=>{fetch("/api/analitica-institucional/nomina",{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(j=>setRoster(j.schools||[])).catch(()=>setRoster([]))},[]);
  const [schoolId,setSchoolId]=useState("");
  const [studentId,setStudentId]=useState("");
  const [examId,setExamId]=useState("");
  const [subject,setSubject]=useState("");
  const [grade,setGrade]=useState("");
  const [saving,setSaving]=useState(false);
  const [saveMessage,setSaveMessage]=useState("");
  const saveResult=async()=>{if(!result||result.reviewRequired||!locked)return;setSaving(true);setSaveMessage("");try{const res=await fetch("/api/analitica-institucional/resultados",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({schoolId,studentId,examId,examTitle:"Ensayo SIMCE "+examId,subject,grade,correctAnswers:result.correct,totalQuestions:questions.length})});const json=await res.json();if(!res.ok)throw Error(json.error||"No se pudo guardar");setSaveMessage("Resultado académico guardado correctamente.")}catch(e){setSaveMessage(e instanceof Error?e.message:"Error al guardar")}finally{setSaving(false)}};
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
    <a href="/ensayos-simce/corrector/cargar" style={{display:"inline-block",background:"#087f91",color:"#fff",padding:"11px 16px",borderRadius:9,textDecoration:"none",marginBottom:12}}>Cargar hoja JPG, PNG o PDF →</a>
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
      {locked&&<div style={{marginTop:16,display:"grid",gap:10}}><h3>Guardar resultado académico institucional</h3><p>Selecciona el establecimiento, curso y estudiante desde la nómina autorizada.</p><label>Colegio <select value={schoolId} onChange={e=>{setSchoolId(e.target.value);setCourse("");setStudentId("")}}><option value="">Seleccionar colegio</option>{roster.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Curso <select value={course} onChange={e=>{setCourse(e.target.value);setStudentId("")}}><option value="">Seleccionar curso</option>{Array.from(new Set((roster.find(s=>s.id===schoolId)?.licensedStudents||[]).map(x=>x.course))).map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>Estudiante <select value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Seleccionar estudiante</option>{(roster.find(s=>s.id===schoolId)?.licensedStudents||[]).filter(x=>x.course===course).map(x=><option key={x.id} value={x.id}>{x.paternalSurname} {x.maternalSurname}, {x.firstName}</option>)}</select></label><label>ID del ensayo<input value={examId} onChange={e=>setExamId(e.target.value)} /></label><label>Asignatura<input value={subject} onChange={e=>setSubject(e.target.value)} /></label><label>Nivel<input value={grade} onChange={e=>setGrade(e.target.value)} /></label><button type="button" disabled={saving||![schoolId,studentId,examId,subject,grade].every(Boolean)} onClick={saveResult}>{saving?"Guardando…":"Guardar resultado académico"}</button>{saveMessage&&<p role="status">{saveMessage}</p>}</div>}
    </section>}
  </main>;
}
