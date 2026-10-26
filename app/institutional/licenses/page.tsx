"use client";
import { useState } from "react";

export default function InstitutionalLicenseAdmin() {
  const [schoolId, setSchoolId] = useState("");
  const [module, setModule] = useState("SIMCE");
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [studentCount, setStudentCount] = useState(100);
  const [licenseId, setLicenseId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  async function send(method: "POST" | "PATCH", payload: object) {
    setBusy(true); setFeedback("");
    try {
      const response = await fetch("/api/institutional/licenses", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Operación rechazada");
      if (data.id) setLicenseId(data.id);
      setFeedback(method === "POST" ? "Licencia pendiente creada. Actívela cuando corresponda." : "Estado actualizado.");
    } catch (e) { setFeedback(e instanceof Error ? e.message : "Error de conexión"); }
    finally { setBusy(false); }
  }
  return <main style={{maxWidth:750,margin:"32px auto",padding:20}}>
    <h1>Licencias institucionales — Superadministrador</h1>
    <p>Creación y activación manual de contratos anuales SIMCE y PAES, sin Flow.</p>
    <form onSubmit={e => {e.preventDefault(); void send("POST",{schoolId,module,level,subject,studentCount});}}
      style={{display:"grid",gap:12}}>
      <label>ID del establecimiento <input required value={schoolId} onChange={e=>setSchoolId(e.target.value)} /></label>
      <label>Módulo <select value={module} onChange={e=>setModule(e.target.value)}><option>SIMCE</option><option>PAES</option></select></label>
      <label>Nivel <input required value={level} onChange={e=>setLevel(e.target.value)} /></label>
      <label>Asignatura <input required value={subject} onChange={e=>setSubject(e.target.value)} /></label>
      <label>Matrícula contratada <input required type="number" min={1} step={1} value={studentCount} onChange={e=>setStudentCount(Number(e.target.value))} /></label>
      <p>Precio de referencia anual: {new Intl.NumberFormat("es-CL",{style:"currency",currency:"CLP"}).format(studentCount*6100)} + IVA</p>
      <button disabled={busy} type="submit">Crear licencia pendiente</button>
    </form>
    <hr />
    <h2>Activar o suspender licencia</h2>
    <label>ID de licencia <input value={licenseId} onChange={e=>setLicenseId(e.target.value)} /></label>
    <p><button disabled={busy||!licenseId} onClick={()=>void send("PATCH",{id:licenseId,status:"ACTIVE"})}>Activar</button>{" "}
    <button disabled={busy||!licenseId} onClick={()=>void send("PATCH",{id:licenseId,status:"SUSPENDED"})}>Suspender</button></p>
    <p role="status">{feedback}</p>
  </main>;
}
