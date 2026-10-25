import YanayCommercialVoice from "../components/YanayCommercialVoice";

export const metadata = {
  title: "Yanay Comercial IA | Vista de prueba",
  robots: { index: false, follow: false }
};

export default function YanayComercialPreview() {
  return (
    <main style={{ minHeight: "100vh", padding: "48px 16px", display: "grid", placeItems: "center", background: "#f5f9fb" }}>
      <div>
        <p style={{ textAlign: "center", color: "#475569" }}>EducAntay · Vista de prueba</p>
        <YanayCommercialVoice />
        <p style={{ maxWidth: 380, fontSize: 13, color: "#64748b", marginTop: 16 }}>
          Esta vista está en desarrollo. No confirma reuniones ni registra clientes todavía.
        </p>
      </div>
    </main>
  );
}
