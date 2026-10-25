import { createCipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
const redirectUri = "https://yanay-voice-preview-testing.up.railway.app/api/yanay-commercial/google/callback";
const account = "contacto@educantay.cl";

function redirect(request: NextRequest, status: string) {
  const url = new URL("/yanay-comercial", request.url);
  url.searchParams.set("google_calendar", status);
  const response = NextResponse.redirect(url);
  response.cookies.set("yanay_google_oauth_state", "", { httpOnly: true, secure: true, sameSite: "lax", path: "/api/yanay-commercial/google", maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has("error")) return redirect(request, "denied");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const saved = request.cookies.get("yanay_google_oauth_state")?.value;
  if (!code || !state || !saved || state.length !== saved.length ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(saved))) return redirect(request, "invalid_state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const encryptionSecret = process.env.YANAY_GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!clientId || !clientSecret || !encryptionSecret || !process.env.DATABASE_URL) return redirect(request, "not_configured");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
    if (!tokenResponse.ok) return redirect(request, "token_error");
    const token = await tokenResponse.json();
    if (typeof token.access_token !== "string" || typeof token.refresh_token !== "string") return redirect(request, "missing_refresh_token");

    const identityResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
    if (!identityResponse.ok) return redirect(request, "identity_error");
    const identity = await identityResponse.json();
    if (identity.email !== account || identity.email_verified !== true) return redirect(request, "wrong_account");

    // Encrypt before storage. Only the encrypted refresh token is persisted.
    const key = createHash("sha256").update(encryptionSecret).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(token.refresh_token, "utf8"), cipher.final()]);
    const encrypted = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
    const db = new PrismaClient();
    try {
      await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "YanayGoogleConnection" ("email" TEXT PRIMARY KEY, "encryptedRefreshToken" TEXT NOT NULL, "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
      await db.$executeRaw`INSERT INTO "YanayGoogleConnection" ("email", "encryptedRefreshToken", "updatedAt") VALUES (${account}, ${encrypted}, NOW()) ON CONFLICT ("email") DO UPDATE SET "encryptedRefreshToken" = EXCLUDED."encryptedRefreshToken", "updatedAt" = NOW()`;
    } finally { await db.$disconnect(); }
    return redirect(request, "connected");
  } catch {
    return redirect(request, "connection_error");
  }
}
