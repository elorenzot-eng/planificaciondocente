"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const HEADERS = ["Nombres", "Apellido paterno", "Apellido materno", "RUT", "Curso"] as const;
type StudentRow = Record<(typeof HEADERS)[number], string>;

async function parseWorkbook(file: File): Promise<StudentRow[]> {
  if (file.name.toLowerCase().endsWith(".xlsx")) {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error("Libro sin hojas");
    const headers = HEADERS.map((_, i) => String(sheet.getRow(1).getCell(i + 1).text).trim());
    if (HEADERS.some((col, i) => headers[i] !== col)) throw new Error("Encabezados incorrectos");
    const records: StudentRow[] = [];
    sheet.eachRow((row, number) => {
      if (number === 1) return;
      const record = Object.fromEntries(HEADERS.map((col, i) => [col, String(row.getCell(i + 1).text).trim()])) as StudentRow;
      if (HEADERS.some(col => record[col])) records.push(record);
    });
    return records;
  }
  return parseCsv(await file.text());
}

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

function InstitutionalStudentImportContent() {
  const params = useSearchParams();
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<Array<{id:string;name:string}>>([]);
  useEffect(() => {
    fetch("/api/institutional/dashboard", {cache:"no-store"}).then(async response => {
      if (!response.ok) throw new Error("No autorizado");
      return response.json();
    }).then(data => {
      const authorized = data.schools as Array<{id:string;name:string}>;
      setSchools(authorized);
      const requested = params.get("schoolId");
      setSchoolId(authorized.some(item=>item.id===requested) ? requested! : authorized[0]?.id || "");
    }).catch(() => setFeedback("No fue posible cargar los establecimientos autorizados"));
  }, [params]);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState<Array<{fila:number;campo:string;mensaje:string}>>([]);
  const [busy, setBusy] = useState(false);
  const [validated, setValidated] = useState(false);
  async function submit(confirm: boolean) {
    setBusy(true); setFeedback(""); setErrors([]);
    if (!confirm) setValidated(false);
    try {
      const res = await fetch("/api/institutional/students", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, rows, confirm }),
      });
      const data = await res.json();
      setErrors(data.errors || []);
      if (!confirm && res.ok && data.valid === true) setValidated(true);
      if (confirm) setValidated(false);
      setFeedback(data.error || (confirm ? `Importados: ${data.imported || 0}` : `Registros válidos: ${data.count || 0}`));
    } catch { setFeedback("Error de conexión"); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 850, margin: "32px auto", padding: 20 }}>
    <h1>Carga de estudiantes — EducAntay</h1>
    <p>Descargue la plantilla, complétela en Excel y cargue el archivo XLSX o CSV UTF-8.</p>
    <label>Establecimiento <select value={schoolId} onChange={e => { setSchoolId(e.target.value); setValidated(false); setRows([]); setErrors([]); }}><option value="">Seleccione un colegio</option>{schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>
    <p><a href={schoolId ? `/api/institutional/students?schoolId=${encodeURIComponent(schoolId)}` : "#"}>Descargar plantilla</a></p>
    <input type="file" accept=".xlsx,.csv,text/csv" onChange={async e => {
      try { const file = e.target.files?.[0]; if (!file) return; const parsed = await parseWorkbook(file); setRows(parsed); setFeedback(`Filas cargadas: ${parsed.length}`); setErrors([]); setValidated(false); }
      catch (err) { setRows([]); setValidated(false); setFeedback(err instanceof Error ? err.message : "Archivo inválido"); }
    }} />
    <p><button disabled={busy || !schoolId || !rows.length} onClick={() => submit(false)}>Validar y previsualizar</button>{" "}
    <button disabled={busy || !schoolId || !rows.length || !validated || errors.length > 0} onClick={() => submit(true)}>Confirmar importación</button></p>
    <p role="status">{feedback}</p>
    {errors.length > 0 && <table><thead><tr><th>Fila</th><th>Campo</th><th>Error</th></tr></thead><tbody>{errors.map((e,i) => <tr key={i}><td>{e.fila}</td><td>{e.campo}</td><td>{e.mensaje}</td></tr>)}</tbody></table>}
  </main>;
}

export default function InstitutionalStudentImport() {
  return <Suspense fallback={<p>Cargando formulario…</p>}><InstitutionalStudentImportContent /></Suspense>;
}
