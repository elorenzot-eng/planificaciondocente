"use client";

import { useState } from "react";

type Feedback = {
  evidencePresented: string[];
  observedStrengths: string[];
  improvementAreas: string[];
  pedagogicalSuggestions: string[];
  limitations: string[];
};
type Result = {
  status: string;
  feedback: Feedback;
  officialScore: null;
  aiAnalysisPerformed: false;
};

export default function PortfolioEvidencePage() {
  const [evidence, setEvidence] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/portfolio-formative-feedback", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceText: evidence }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible registrar la evidencia");
      setResult(data as Result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 880, margin: "40px auto", padding: "0 20px", fontFamily: "Arial, sans-serif", lineHeight: 1.5 }}>
      <a href="/">← Volver a EducAntay</a>
      <h1>Portafolio Docente IA 2026</h1>
      <p>Registro formativo de evidencias. Esta herramienta no asigna una calificación oficial ni realiza aún un análisis pedagógico con IA.</p>
      <form onSubmit={submit}>
        <label htmlFor="portfolio-evidence"><strong>Evidencia pedagógica</strong></label>
        <textarea id="portfolio-evidence" value={evidence} onChange={e => setEvidence(e.target.value)} required maxLength={30000} rows={12}
          placeholder="Describe o pega aquí tu evidencia pedagógica..." style={{ display: "block", width: "100%", boxSizing: "border-box", margin: "12px 0", padding: 12 }} />
        <p>{evidence.length.toLocaleString("es-CL")} / 30.000 caracteres</p>
        <button type="submit" disabled={loading || !evidence.trim()} style={{ padding: "12px 18px", cursor: "pointer" }}>
          {loading ? "Registrando evidencia..." : "Revisar registro de evidencia"}
        </button>
      </form>
      {error && <p role="alert" style={{ color: "#a21d1d" }}>{error}</p>}
      {result && <section aria-live="polite" style={{ marginTop: 28 }}>
        <h2>Evidencia registrada para revisión</h2>
        <p>El texto fue procesado en esta sesión; todavía no se guarda en una carpeta permanente.</p>
        <h3>Fortalezas observadas</h3>
        <p>{result.feedback.observedStrengths.length ? result.feedback.observedStrengths.join("; ") : "Pendientes de revisión pedagógica."}</p>
        <h3>Aspectos por mejorar</h3>
        <p>{result.feedback.improvementAreas.length ? result.feedback.improvementAreas.join("; ") : "Pendientes de revisión pedagógica."}</p>
        <h3>Sugerencias pedagógicas</h3>
        <p>{result.feedback.pedagogicalSuggestions.length ? result.feedback.pedagogicalSuggestions.join("; ") : "Pendientes de revisión pedagógica."}</p>
        <h3>Limitaciones</h3>
        <ul>{result.feedback.limitations.map(item => <li key={item}>{item}</li>)}</ul>
      </section>}
    </main>
  );
}
