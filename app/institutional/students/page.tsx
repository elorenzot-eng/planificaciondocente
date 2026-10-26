"use client";

import { useState } from "react";

const HEADERS = ["Nombres", "Apellido paterno", "Apellido materno", "RUT", "Curso"] as const;
type StudentRow = Record<(typeof HEADERS)[number], string>;

function parseCsv(input: string): StudentRow[] {
  const lines = input.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) throw new Error("Archivo vacío");
  const separator = lines[0].includes(";") ? ";" : ",";
  const header = lines.shift()!.split(separator).map(x => x.trim());
  if (HEADERS.some((col, index) => header[index] !== col)) throw new Error("Encabezados incorrectos");
  return lines.map(line => {
    const fields = line.split(separator).map(x => x.trim());
    return Object.fromEntries(HEADERS.map((col, i) => [col, fields[i] || ""])) as StudentRow;
  });
}

export default function InstitutionalStudentImport() {
  const [schoolId, setSchoolId] = useState("");
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState<Array<{fila:number;campo:string;mensaje:string}>>([]);
  const [busy, setBusy] = useState(false);
  async function submit(confirm: boolean) {
    setBusy(true); setFeedback(""); setErrors([]);
    try {
      const res = await fetch("/api/institutional/students", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, rows, confirm }),
      });
      const data = await res.json();
      setErrors(data.errors || []);
      setFeedback(data.error || (confirm ? `Importados: ${data.imported || 0}` : `Registros válidos: ${data.count || 0}`));
    } catch { setFeedback("Error de conexión"); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 850, margin: "32px auto", padding: 20 }}>
    <h1>Carga de estudiantes — EducAntay</h1>
    <p>Descargue la plantilla CSV compatible con Excel, complete los datos y guárdela como CSV UTF-8.</p>
    <label>Identificador del establecimiento <input value={schoolId} onChange={e => setSchoolId(e.target.value)} /></label>
    <p><a href={schoolId ? `/api/institutional/students?schoolId=${encodeURIComponent(schoolId)}` : "#"}>Descargar plantilla</a></p>
    <input type="file" accept=".csv,text/csv" onChange={async e => {
      try { const file = e.target.files?.[0]; if (!file) return; setRows(parseCsv(await file.text())); setFeedback(`Filas cargadas: ${parseCsv(await file.text()).length}`); setErrors([]); }
      catch (err) { setRows([]); setFeedback(err instanceof Error ? err.message : "Archivo inválido"); }
    }} />
    <p><button disabled={busy || !schoolId || !rows.length} onClick={() => submit(false)}>Validar y previsualizar</button>{" "}
    <button disabled={busy || !schoolId || !rows.length || errors.length > 0} onClick={() => submit(true)}>Confirmar importación</button></p>
    <p role="status">{feedback}</p>
    {errors.length > 0 && <table><thead><tr><th>Fila</th><th>Campo</th><th>Error</th></tr></thead><tbody>{errors.map((e,i) => <tr key={i}><td>{e.fila}</td><td>{e.campo}</td><td>{e.mensaje}</td></tr>)}</tbody></table>}
  </main>;
}
