import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const redirectToPreview = (request: NextRequest, status: string) => {
  const url = new URL("/yanay-comercial", request.url);
  url.searchParams.set("google_calendar", status);
  return NextResponse.redirect(url);
};

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  if (error) return redirectToPreview(request, "denied");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("yanay_google_oauth_state")?.value;
  const response = redirectToPreview(request, "not_configured");
  response.cookies.set("yanay_google_oauth_state", "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });

  // Fail closed: never exchange authorization codes without a matching
  // server-issued state, and never expose OAuth codes or tokens in the UI.
  if (!code || !state || !savedState || state !== savedState) {
    return redirectToPreview(request, "invalid_state");
  }

  // Secure server-side token exchange and encrypted persistence are intentionally
  // pending. Do not mark Google Calendar as connected before these exist.
  return response;
}
