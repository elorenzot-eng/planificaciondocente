"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type School = { id: string; name: string; rbd: string | null };
type License = { id: string; schoolId: string; module: string; level: string; subject: string; status: string;
  studentCount: number; startsAt: string; endsAt: string; pdfLimit: number; pdfUsed: number; reviewsPerStudent: number };
type Dashboard = { user: { name: string; role: string }; schools: School[]; licenses: License[]; enrollment: Record<string, number> };

export default function SchoolAdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  useEffect(() => {
    fetch("/api/institutional/dashboard", { cache: "no-store" })
      .then(async res => { const body = await res.json(); if (!res.ok) throw new Error(body.error || "Acceso denegado"); return body as Dashboard; })
      .then(body => { setData(body); setSelected(body.schools[0]?.id || ""); })
      .catch(e => setError(e.message));
  }, []);
  if (error) return <main style={{padding:24}}><h1>Administración institucional</h1><p role="alert">{error}</p></main>;
  if (!data) return <main style={{padding:24}}>Cargando panel del colegio…</main>;
  const school = data.schools.find(s => s.id === selected);
  const licenses = data.licenses.filter(l => l.schoolId === selected);
  const active = licenses.filter(l => l.status === "ACTIVE" && new Date(l.startsAt) <= new Date() && new Date(l.endsAt) > new Date());
  return <main style={{maxWidth:1100,margin:"24px auto",padding:20}}>
    <h1>Panel del Administrador del Colegio</h1>
    <p>Bienvenido/a, {data.user.name}. Gestión de licencias SIMCE y PAES.</p>
    <label>Establecimiento{" "}
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        {data.schools.map(s => <option key={s.id} value={s.id}>{s.name}{s.rbd ? ` · RBD ${s.rbd}` : ""}</option>)}
      </select>
    </label>
    {school ? <>
      <section style={{display:"flex",gap:16,flexWrap:"wrap",margin:"24px 0"}}>
        <article style={{padding:18,border:"1px solid #ddd",borderRadius:12,flex:1,minWidth:180}}>
          <h2>Estudiantes registrados</h2><strong>{data.enrollment[selected] || 0}</strong>
        </article>
        <article style={{padding:18,border:"1px solid #ddd",borderRadius:12,flex:1,minWidth:180}}>
          <h2>Licencias vigentes</h2><strong>{active.length}</strong>
        </article>
        <article style={{padding:18,border:"1px solid #ddd",borderRadius:12,flex:1,minWidth:180}}>
          <h2>Ensayos PDF restantes</h2><strong>{active.reduce((sum,l)=>sum+Math.max(0,l.pdfLimit-l.pdfUsed),0)}</strong>
        </article>
      </section>
      <p><Link href={`/institutional/students?schoolId=${encodeURIComponent(selected)}`}>Descargar plantilla y cargar estudiantes</Link></p>
      <h2>Licencias contratadas</h2>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
          <thead><tr><th>Módulo</th><th>Nivel</th><th>Asignatura</th><th>Estado</th><th>Matrícula</th><th>PDF disponibles</th><th>Revisiones por estudiante</th><th>Vence</th></tr></thead>
          <tbody>{licenses.map(l => <tr key={l.id}>
            <td>{l.module}</td><td>{l.level}</td><td>{l.subject}</td><td>{l.status}</td>
            <td>{l.studentCount}</td><td>{Math.max(0,l.pdfLimit-l.pdfUsed)} / {l.pdfLimit}</td>
            <td>{l.reviewsPerStudent}</td><td>{new Date(l.endsAt).toLocaleDateString("es-CL")}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {!licenses.length && <p>No hay licencias registradas para este colegio.</p>}
    </> : <p>No tiene establecimientos asignados.</p>}
  </main>;
}
