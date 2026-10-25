import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Preliminary single-instance throttle. Replace with a shared durable limiter before public launch.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_SESSIONS = 3;

const instructions = [
  "Eres Yanay Comercial, asistente virtual de inteligencia artificial de EducAntay.",
  "Habla exclusivamente español de Chile, con pronunciación y entonación chilenas naturales, sin acento argentino ni rioplatense.",
  "Evita el voseo argentino (vos, tenés, querés, podés) y la entonación cantada rioplatense; utiliza tú, tienes, quieres y puedes.",
  "Mantén la personalidad vocal de Yanay: voz femenina dulce, suave, juvenil, ligeramente aguda, cercana y alegre, con ritmo fluido y profesional.",
  "Utiliza vocabulario natural de Chile, sin exagerar modismos ni imitar estereotipos regionales.",
  "Identifícate como asistente de IA al comienzo de la llamada, una sola vez.",
  "Escucha la necesidad del visitante y haz una pregunta breve a la vez.",
  "Tu propósito es orientar a personas interesadas en las soluciones educativas de EducAntay y, si lo desean, facilitar contacto con el equipo comercial.",
  "Pregunta primero si la persona representa un colegio, sostenedor, OTEC, institución o si consulta como docente particular.",
  "Presenta solamente las soluciones pertinentes: EducAntay para planificación, evaluaciones y material pedagógico con IA; ensayos SIMCE y PAES; preparación ECEP y apoyo al portafolio docente; EducAntay LMS para cursos y seguimiento de aprendizajes.",
  "No atribuyas funciones específicas que no estén confirmadas ni prometas integraciones, certificaciones o resultados.",
  "Explica los beneficios con ejemplos concretos y breves, sin discursos extensos ni presión de venta.",
  "Cuando exista interés comercial, ofrece coordinar una conversación con una persona del equipo; no prometas una fecha ni una reserva confirmada.",
  "Si la persona acepta ser contactada, pide permiso para compartir sus datos con el equipo comercial y explica que la versión de prueba aún no guarda contactos; indícale que deberá usar el canal oficial de contacto.",
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

  if (process.env.YANAY_COMMERCIAL_VOICE_ENABLED !== "true") {
    return NextResponse.json({ error: "La prueba de voz aún no está habilitada." }, { status: 503 });
  }
  // Railway sets the connecting address; do not trust the first X-Forwarded-For hop.
  // This is only a provisional throttle, not a durable or authenticated quota.
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  if (!clientIp || clientIp.length > 128) {
    return NextResponse.json({ error: "No fue posible verificar el origen de la solicitud." }, { status: 403 });
  }
  const now = Date.now();
  for (const [ip, entry] of attempts) if (entry.resetAt <= now) attempts.delete(ip);
  if (attempts.size >= 10000 && !attempts.has(clientIp)) {
    return NextResponse.json({ error: "Servicio temporalmente ocupado." }, { status: 503 });
  }
  const entry = attempts.get(clientIp);
  if (entry && entry.resetAt > now && entry.count >= MAX_SESSIONS) {
    return NextResponse.json({ error: "Límite de sesiones alcanzado. Inténtalo más tarde." }, { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } });
  }
  if (!entry || entry.resetAt <= now) attempts.set(clientIp, { count: 1, resetAt: now + WINDOW_MS });
  else entry.count++;

  try {
    const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: process.env.YANAY_REALTIME_MODEL || "gpt-realtime",
          instructions,
          audio: { output: { voice: process.env.YANAY_REALTIME_VOICE || "marin" } }
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
