import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { generateInternal65Draft, INTERNAL_65_MATRIX } from "../../../../../lib/paes/lectora-65-internal.server";
import { createLectoraPrintableHtml } from "../../../../../lib/paes/lectora-print";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 900;
let busy = false;
let lastAttempt = 0;
function authorized(provided: string | null, expected: string): boolean {
  if (!provided || expected.length < 32) return false;
  const a = Buffer.from(provided), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function POST(request: NextRequest) {
  if (process.env.PAES_PILOT_ENABLED !== "true")
    return NextResponse.json({ error: "Piloto deshabilitado." }, { status: 404 });
  if (!authorized(request.headers.get("x-paes-pilot-token"), process.env.PAES_PILOT_TOKEN ?? ""))
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  if (busy || Date.now() - lastAttempt < 600_000)
    return NextResponse.json({ error: "Hay una generación activa o debe esperar 10 minutos." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const difficulty = (body as { difficulty?: unknown })?.difficulty;
  if (!["Baja", "Media", "Alta", "Mixta"].includes(String(difficulty)))
    return NextResponse.json({ error: "Dificultad inválida." }, { status: 400 });
  busy = true;
  lastAttempt = Date.now();
  try {
    const { exam, warnings } = await generateInternal65Draft(difficulty as "Baja" | "Media" | "Alta" | "Mixta");
    return NextResponse.json({
      status: "INTERNAL_65_DRAFT_NOT_APPROVED",
      count: exam.items.length,
      warnings,
      exam,
      studentHtml: createLectoraPrintableHtml(exam, INTERNAL_65_MATRIX, "estudiante"),
      teacherHtml: createLectoraPrintableHtml(exam, INTERNAL_65_MATRIX, "profesor"),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No se pudo completar la generación de 65 preguntas. Revise los registros del servidor." }, { status: 422 });
  } finally { busy = false; }
}
