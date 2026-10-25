import { createDecipheriv, createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expected = process.env.YANAY_GOOGLE_CONNECT_ADMIN_KEY;
  const supplied = request.headers.get("x-yanay-admin-key");
  if (!expected || !supplied || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const secret = process.env.YANAY_GOOGLE_TOKEN_ENCRYPTION_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret || !clientId || !clientSecret) return NextResponse.json({ error: "Configuración incompleta." }, { status: 503 });

  const db = new PrismaClient();
  try {
    const rows = await db.$queryRaw<Array<{ encryptedRefreshToken: string }>>`SELECT "encryptedRefreshToken" FROM "YanayGoogleConnection" WHERE "email" = 'contacto@educantay.cl' LIMIT 1`;
    if (!rows.length) return NextResponse.json({ connected: false, reason: "pending_authorization" }, { headers: { "Cache-Control": "no-store" } });
    const data = Buffer.from(rows[0].encryptedRefreshToken, "base64");
    if (data.length < 29) throw new Error("Invalid token ciphertext");
    const decipher = createDecipheriv("aes-256-gcm", createHash("sha256").update(secret).digest(), data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    const refreshToken = Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
    if (!tokenResponse.ok) return NextResponse.json({ connected: false, reason: "token_refresh_failed" }, { status: 502 });
    const token = await tokenResponse.json();
    if (typeof token.access_token !== "string") return NextResponse.json({ connected: false, reason: "token_invalid" }, { status: 502 });
    const freebusy = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ timeMin: new Date().toISOString(), timeMax: new Date(Date.now() + 86400000).toISOString(), items: [{ id: "primary" }], timeZone: "America/Santiago" }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
    if (!freebusy.ok) return NextResponse.json({ connected: false, reason: "calendar_access_failed" }, { status: 502 });
    const result = await freebusy.json();
    if (result.calendars?.primary?.errors?.length) return NextResponse.json({ connected: false, reason: "calendar_permission_error" }, { status: 502 });
    return NextResponse.json({ connected: true, calendar: "primary", availabilityCheck: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ connected: false, reason: "verification_failed" }, { status: 502 });
  } finally {
    await db.$disconnect();
  }
}
