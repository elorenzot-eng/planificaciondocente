import {assertPaesAiAccess,PaesQuotaError} from "../../../../../lib/paes/ai-usage.server";
import {reserveAiUse,releaseAiUse} from "../../../../../lib/ai-entitlement";
import { getSession } from "../../../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { randomUUID } from "node:crypto";
import { generateReviewedLectoraDraft } from "../../../../../lib/paes/lectora-openai.server";
import { createLectoraPrintableHtml } from "../../../../../lib/paes/lectora-print";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

// Piloto cerrado: una sola generación en curso por instancia y un enfriamiento
// conservador. NO es una cuota distribuida ni un sistema de producción.
let busy = false;
let lastAttempt = 0;
export async function POST(request: NextRequest) {
  if (process.env.PAES_PILOT_ENABLED !== "true")
    return NextResponse.json({ error: "Piloto PAES no habilitado." }, { status: 404 });
  // A valid authenticated session is mandatory: a pilot token alone must never bypass quotas.
  const session = await getSession();
  if (typeof session?.id !== "string")
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
  let reserved=false;
  try {
    if(typeof session?.id==="string"){
      await assertPaesAiAccess(session.id);
      const use=await reserveAiUse(session.id);
      if(!use.ok)return NextResponse.json({error:use.error},{status:429});
      reserved=use.reserved;
    }
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
    // Validate both printable versions before persisting or consuming a successful generation.
    const studentHtml = createLectoraPrintableHtml(exam, matrix, "estudiante");
    const teacherHtml = createLectoraPrintableHtml(exam, matrix, "profesor");
    let savedId: string | undefined;
    let saveError: string | undefined;
    if (typeof session?.id === "string") {
      try {
        const saved = await prisma.savedPaesExam.create({data:{
          userId:session.id,sourceJobId:"LECTORA10:"+randomUUID(),
          title:"PAES Competencia Lectora · 10 preguntas",examType:"LECTORA",
          exam:exam as unknown as import("@prisma/client").Prisma.InputJsonValue
        },select:{id:true}});
        savedId=saved.id;
      } catch { saveError="No se pudo guardar el ensayo en Mi carpeta."; }
    }
    return NextResponse.json({
      savedId, saveError,
      status: "PILOT_ONLY_NOT_FULL_EXAM",
      count: exam.items.length,
      warnings,
      exam,
      studentHtml,
      teacherHtml,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch(error) {
    if(reserved&&typeof session?.id==="string")await releaseAiUse(session.id);
    if(error instanceof PaesQuotaError)return NextResponse.json({error:error.message},{status:error.status});
    return NextResponse.json({ error: "No se completó la prueba. Revise la configuración y registros del servidor." }, { status: 422 });
  } finally {
    busy = false;
  }
}
