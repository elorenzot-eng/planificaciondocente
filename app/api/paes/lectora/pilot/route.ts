import { getSession } from "../../../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { generateReviewedLectoraDraft } from "../../../../../lib/paes/lectora-openai.server";
import { createLectoraPrintableHtml } from "../../../../../lib/paes/lectora-print";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

// Piloto cerrado: una sola generación en curso por instancia y un enfriamiento
// conservador. NO es una cuota distribuida ni un sistema de producción.
let busy = false;
let lastAttempt = 0;
function authorized(provided: string | null, expected: string): boolean {
  if (!provided || !expected || expected.length < 32) return false;
  const a = Buffer.from(provided), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function POST(request: NextRequest) {
  if (process.env.PAES_PILOT_ENABLED !== "true")
    return NextResponse.json({ error: "Piloto PAES no habilitado." }, { status: 404 });
  if (!(await getSession()) && !authorized(request.headers.get("x-paes-pilot-token"), process.env.PAES_PILOT_TOKEN ?? ""))
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  if (busy || Date.now() - lastAttempt < 600_000)
    return NextResponse.json({ error: "Espere 10 minutos antes de otra prueba." }, { status: 429 });
  let input: unknown;
  try { input = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  const difficulty = (input as { difficulty?: unknown })?.difficulty;
  if (!["Baja", "Media", "Alta", "Mixta"].includes(String(difficulty)))
    return NextResponse.json({ error: "Dificultad inválida." }, { status: 400 });
  busy = true;
  lastAttempt = Date.now();
  try {
    // Matriz interna de prueba aprobada para 10 ítems; no es especificación DEMRE.
    const matrix = {
      version: "educantay-paes-pilot-10-v1",
      reviewedBy: "Configuración piloto EducAntay",
      reviewedAt: "2026-10-23",
      sourceReference: "Piloto interno de 10 preguntas; distribución no oficial",
      questionCount: 10,
      bySkill: { Localizar: 2, Interpretar: 6, Evaluar: 2 },
      byGenre: { Literario: 5, "No literario": 5 },
    };
    const { exam, warnings } = await generateReviewedLectoraDraft({ matrix, difficulty: difficulty as "Baja" | "Media" | "Alta" | "Mixta" });
    return NextResponse.json({
      status: "PILOT_ONLY_NOT_FULL_EXAM",
      count: exam.items.length,
      warnings,
      exam,
      studentHtml: createLectoraPrintableHtml(exam, matrix, "estudiante"),
      teacherHtml: createLectoraPrintableHtml(exam, matrix, "profesor"),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No se completó la prueba. Revise la configuración y registros del servidor." }, { status: 422 });
  } finally {
    busy = false;
  }
}
