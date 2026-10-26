import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const redirectUri = "https://yanay-voice-preview-testing.up.railway.app/api/yanay-commercial/google/callback";

export async function POST(request: NextRequest) {
  // This endpoint must never be callable by anonymous visitors. The admin
  // credential is a separate Railway secret, not the Google client secret.
  const expected = process.env.YANAY_GOOGLE_CONNECT_ADMIN_KEY;
  const supplied = request.headers.get("x-yanay-admin-key");
  if (!expected || !supplied) return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) return NextResponse.json({ error: "Google no configurado." }, { status: 503 });
  const state = randomBytes(32).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.freebusy");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent select_account");
  url.searchParams.set("state", state);

  const response = NextResponse.json({ authorization_url: url.toString() }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("yanay_google_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/api/yanay-commercial/google" });
  return response;
}
