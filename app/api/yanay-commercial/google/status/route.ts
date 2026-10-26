import { NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
export const runtime = "nodejs";
export async function GET() {
  const session = await getSession();
  if (!session || String(session.email).toLowerCase() !== "contacto@educantay.cl") {
    return NextResponse.json({error:"Acceso restringido"}, {status:403});
  }
  return NextResponse.json({ready: Boolean(process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET), connected:false, message:"Autorización de calendario pendiente"});
}
