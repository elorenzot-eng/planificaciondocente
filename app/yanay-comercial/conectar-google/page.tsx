"use client";

import { useState } from "react";

export default function ConnectGoogleCalendar() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkResult, setCheckResult] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingResult, setMeetingResult] = useState<{ eventUrl: string | null; meetUrl: string | null } | null>(null);
  async function testMeeting() {
    if (!meetingDate || !window.confirm("¿Crear una reunión interna de prueba de 15 minutos en contacto@educantay.cl, sin invitados?")) return;
    setBusy(true); setError(""); setMeetingResult(null);
    try {
      const response = await fetch("/api/yanay-commercial/google/test-meeting", { method: "POST", headers: { "Content-Type": "application/json", "x-yanay-admin-key": key }, body: JSON.stringify({ start: new Date(meetingDate).toISOString() }) });
      const result = await response.json();
      if (!response.ok || !result.created) throw new Error(result.error || "No se pudo crear la reunión.");
      setMeetingResult({ eventUrl: result.eventUrl, meetUrl: result.meetUrl });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Error al crear reunión."); }
    finally { setBusy(false); }
  }
  async function checkCalendar() {
    setBusy(true); setError(""); setCheckResult("");
    try {
      const response = await fetch("/api/yanay-commercial/google/check", { method: "POST", headers: { "x-yanay-admin-key": key }, cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.connected) throw new Error(result.reason === "pending_authorization" ? "Falta autorizar el calendario." : "No se pudo validar la conexión del calendario.");
      setCheckResult("Google Calendar conectado: consulta de disponibilidad correcta.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Error al comprobar Calendar."); }
    finally { setBusy(false); }
  }
  async function connect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/yanay-commercial/google/connect", {
        method: "POST",
        headers: { "x-yanay-admin-key": key },
        cache: "no-store"
      });
      const result = await response.json();
      if (!response.ok || !result.authorization_url) throw new Error("No fue posible iniciar la autorización. Revisa la clave administrativa.");
      const url = new URL(result.authorization_url);
      if (url.origin !== "https://accounts.google.com") throw new Error("Destino OAuth no válido.");
      window.location.assign(url.toString());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error al conectar.");
      setBusy(false);
    }
  }
  return <main style={{ maxWidth: 540, margin: "64px auto", padding: 24, fontFamily: "sans-serif" }}>
    <h1>Conectar Google Calendar a Yanay</h1>
    <p>Acceso exclusivo del administrador de EducAntay. Esta pantalla no está destinada a clientes.</p>
    <form onSubmit={connect}>
      <label htmlFor="admin-key">Clave administrativa de conexión</label>
      <input id="admin-key" type="password" autoComplete="off" value={key} onChange={event => setKey(event.target.value)} required style={{display:"block",width:"100%",padding:12,margin:"12px 0"}} />
      <button disabled={busy} type="submit" style={{padding:12}}>{busy ? "Conectando..." : "Autorizar con Google"}</button>
    </form>
    <button type="button" disabled={busy || !key} onClick={checkCalendar} style={{padding:12,marginTop:12,marginLeft:8}}>Verificar Google Calendar</button>
    {checkResult && <p role="status">{checkResult}</p>}
    <section style={{marginTop:28,paddingTop:16,borderTop:"1px solid #ddd"}}>
      <h2>Reunión interna de prueba</h2>
      <p>Selecciona fecha y hora. Se creará un evento de 15 minutos en el calendario de EducAntay, sin invitar a clientes.</p>
      <label htmlFor="meeting-date">Fecha y hora local</label>
      <input id="meeting-date" type="datetime-local" value={meetingDate} onChange={e=>setMeetingDate(e.target.value)} style={{display:"block",padding:12,margin:"12px 0"}} />
      <button type="button" disabled={busy || !key || !meetingDate} onClick={testMeeting} style={{padding:12}}>Crear reunión de prueba con Meet</button>
      {meetingResult && <div role="status"><p>Reunión creada correctamente.</p>{meetingResult.eventUrl && <p><a href={meetingResult.eventUrl} target="_blank" rel="noopener noreferrer">Abrir evento en Calendar</a></p>}{meetingResult.meetUrl ? <p><a href={meetingResult.meetUrl} target="_blank" rel="noopener noreferrer">Abrir Google Meet</a></p> : <p>Google aún no devolvió un enlace de Meet; revisa el evento.</p>}</div>}
    </section>
    {error && <p role="alert">{error}</p>}
    <p>Utiliza exclusivamente contacto@educantay.cl en Google. Nunca compartas la clave administrativa.</p>
  </main>;
}
