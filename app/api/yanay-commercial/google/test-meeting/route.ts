import { createDecipheriv, createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expected = process.env.YANAY_GOOGLE_CONNECT_ADMIN_KEY;
  const provided = request.headers.get("x-yanay-admin-key");
  if (!expected || !provided || Buffer.byteLength(expected) !== Buffer.byteLength(provided) ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Origen inválido." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const start = new Date(body.start);
  if (typeof body.start !== "string" || !Number.isFinite(start.getTime()) || start.getTime() < Date.now() + 60000 ||
      start.getTime() > Date.now() + 30 * 86400000) return NextResponse.json({ error: "Selecciona una fecha válida dentro de los próximos 30 días." }, { status: 400 });
  const end = new Date(start.getTime() + 15 * 60000);
  const secret = process.env.YANAY_GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!secret || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return NextResponse.json({ error: "Configuración incompleta." }, { status: 503 });
  const db = new PrismaClient();
  try {
    const connection = await db.yanayGoogleConnection.findUnique({ where: { email: "contacto@educantay.cl" } });
    if (!connection) return NextResponse.json({ error: "Calendar no está autorizado." }, { status: 409 });
    const bytes = Buffer.from(connection.encryptedRefreshToken, "base64");
    const decipher = createDecipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const refreshToken = Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8");
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: refreshToken, grant_type: "refresh_token" }),
      cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!response.ok) return NextResponse.json({ error: "No fue posible renovar la autorización." }, { status: 502 });
    const token = await response.json();
    if (typeof token.access_token !== "string") throw new Error("Invalid access token");
    const headers = { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" };
    const freebusy = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", { method: "POST", headers,
      body: JSON.stringify({ timeMin: start.toISOString(), timeMax: end.toISOString(), items: [{ id: "primary" }] }),
      cache: "no-store", signal: AbortSignal.timeout(12000) });
    if (!freebusy.ok) return NextResponse.json({ error: "No se pudo consultar disponibilidad." }, { status: 502 });
    const calendar = await freebusy.json();
    if (calendar.calendars?.primary?.errors?.length) return NextResponse.json({ error: "Calendar rechazó la consulta." }, { status: 502 });
    if (calendar.calendars?.primary?.busy?.length) return NextResponse.json({ error: "Horario ocupado. Elige otro." }, { status: 409 });
    const created = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none", {
      method: "POST", headers, cache: "no-store", signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ summary: "PRUEBA INTERNA - Yanay Comercial IA", description: "Reunión de prueba de 15 minutos. Sin clientes invitados.",
        start: { dateTime: start.toISOString(), timeZone: "America/Santiago" }, end: { dateTime: end.toISOString(), timeZone: "America/Santiago" },
        conferenceData: { createRequest: { requestId: randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } } })
    });
    if (!created.ok) return NextResponse.json({ error: "Google Calendar no pudo crear la reunión." }, { status: 502 });
    const event = await created.json();
    return NextResponse.json({ created: true, eventUrl: event.htmlLink ?? null, meetUrl: event.hangoutLink ?? event.conferenceData?.entryPoints?.find((p: { entryPointType: string }) => p.entryPointType === "video")?.uri ?? null, start: event.start?.dateTime }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "No fue posible completar la reunión de prueba." }, { status: 502 }); }
  finally { await db.$disconnect(); }
}
