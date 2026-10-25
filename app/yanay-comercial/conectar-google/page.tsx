"use client";

import { useState } from "react";

export default function ConnectGoogleCalendar() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
    {error && <p role="alert">{error}</p>}
    <p>Utiliza exclusivamente contacto@educantay.cl en Google. Nunca compartas la clave administrativa.</p>
  </main>;
}
