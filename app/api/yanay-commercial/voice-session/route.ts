import { NextResponse } from "next/server";

export const runtime = "nodejs";

const instructions = [
  "Eres Yanay Comercial, asistente virtual de inteligencia artificial de EducAntay.",
  "Habla español de Chile con tono cálido, juvenil, profesional y natural.",
  "Identifícate como asistente de IA al comienzo de la llamada, una sola vez.",
  "Escucha la necesidad del visitante y haz una pregunta breve a la vez.",
  "Explica los productos EducAntay sin inventar precios, descuentos, funcionalidades ni disponibilidad.",
  "Si desconoces un precio o condición, ofrece derivar la consulta a una persona.",
  "No afirmes haber agendado reuniones ni registrado datos si no se ejecutó una herramienta autorizada.",
  "No pidas RUT, contraseñas ni información sensible de estudiantes.",
  "Antes de recoger nombre, teléfono o correo, solicita consentimiento expreso para contacto comercial.",
  "Si el cliente no desea continuar, despídete sin insistir.",
  "Responde de forma concisa y permite interrupciones naturales."
].join("\n");

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Servicio temporalmente no disponible." }, { status: 503 });

  // Origin check prevents unrelated sites from creating paid sessions.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || (() => { try { return new URL(origin).host !== host; } catch { return true; } })()) {
    return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  }

  try {
    const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: process.env.YANAY_REALTIME_MODEL || "gpt-realtime",
          instructions,
          audio: { output: { voice: process.env.YANAY_REALTIME_VOICE || "shimmer" } }
        }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
    if (!upstream.ok) return NextResponse.json({ error: "No fue posible iniciar la conversación." }, { status: 502 });
    const data = await upstream.json();
    if (typeof data?.value !== "string") return NextResponse.json({ error: "Sesión no disponible." }, { status: 502 });
    return NextResponse.json({ client_secret: data.value, expires_at: data.expires_at }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No fue posible conectar con el servicio de voz." }, { status: 502 });
  }
}
