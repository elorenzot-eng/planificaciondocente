import {assertPaesAiAccess,chargeCompletedPaes,PaesQuotaError} from "../../../../../lib/paes/ai-usage.server";
import { getSession } from "../../../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { generateInternal65Part, INTERNAL_65_MATRIX } from "../../../../../lib/paes/lectora-65-internal.server";
import { reviewLectoraExam } from "../../../../../lib/paes/lectora-review";
import type { LectoraExam } from "../../../../../lib/paes/lectora";
import { createLectoraPrintableHtml, createLectoraAnswerSheetHtml } from "../../../../../lib/paes/lectora-print";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
function authorized(provided: string | null, expected: string): boolean {
  if (!provided || expected.length < 32) return false;
  const a = Buffer.from(provided), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function POST(request: NextRequest) {
  if (process.env.PAES_PILOT_ENABLED !== "true")
    return NextResponse.json({ error: "Piloto deshabilitado." }, { status: 404 });
  const session=await getSession();
  if (!session && !authorized(request.headers.get("x-paes-pilot-token"), process.env.PAES_PILOT_TOKEN ?? ""))
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  if (request.nextUrl.searchParams.get("action") === "recover") {
    if (typeof session?.id !== "string")
      return NextResponse.json({ error: "Inicia sesión para recuperar tu ensayo." }, { status: 401 });
    const jobs = await prisma.paesInternalJob.findMany({
      where: { userId: session.id, difficulty: { in: ["Baja", "Media", "Alta", "Mixta"] },
        nextPart: { gt: 0 } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, difficulty: true, nextPart: true, status: true, updatedAt: true },
    });
    return NextResponse.json({ jobs }, { headers: { "Cache-Control": "no-store" } });
  }
  let body: { difficulty?: string; jobId?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }
  if (!["Baja","Media","Alta","Mixta"].includes(body.difficulty ?? ""))
    return NextResponse.json({ error: "Dificultad inválida." }, { status: 400 });
  try {
    let job = body.jobId
      ? await prisma.paesInternalJob.findUnique({ where: { id: body.jobId } })
      : await prisma.paesInternalJob.create({ data: { difficulty: body.difficulty!, userId: typeof session?.id==="string"?session.id:null } });
    if (!job) return NextResponse.json({ error: "Proceso no encontrado." }, { status: 404 });
    if (typeof session?.id!=="string" || job.userId!==session.id)
      return NextResponse.json({error:"Ensayo de otro usuario o sesión no válida."},{status:403});
    if (job.difficulty !== body.difficulty)
      return NextResponse.json({ error: "La dificultad no coincide con el proceso." }, { status: 400 });
    if (job.nextPart === 30) {
      const exam: LectoraExam = { specificationVersion: INTERNAL_65_MATRIX.version,
        texts: job.texts as LectoraExam["texts"], items: job.items as LectoraExam["items"] };
      const review = reviewLectoraExam(exam, INTERNAL_65_MATRIX);
      if (!review.valid) throw new Error("La validación final no fue aprobada.");
      const studentHtml=createLectoraPrintableHtml(exam, INTERNAL_65_MATRIX, "estudiante"),teacherHtml=createLectoraPrintableHtml(exam, INTERNAL_65_MATRIX, "profesor");
      // Legacy 30-part jobs may remain PENDING after their last group.
      // Mark completed only after structural review and printable outputs pass.
      if (job.status !== "COMPLETED") {
        const finished = await prisma.paesInternalJob.updateMany({
          where: { id: job.id, userId: session!.id as string, nextPart: 30,
            status: { in: ["PENDING", "RUNNING"] } },
          data: { status: "COMPLETED", error: null },
        });
        if (finished.count !== 1)
          return NextResponse.json({ error: "No se pudo confirmar el cierre del ensayo.", jobId: job.id }, { status: 409 });
      }
      await chargeCompletedPaes(session!.id as string, job.id);
   return NextResponse.json({ jobId: job.id, status: "COMPLETED", count: exam.items.length,
        warnings: review.warnings, exam,
        studentHtml,
        teacherHtml,
        answerSheetHtml:createLectoraAnswerSheetHtml(exam.items.length,job.id),
      }, { headers: { "Cache-Control": "no-store" } });
    }
  await assertPaesAiAccess(session!.id as string);
    // Reclamo atómico entre instancias para impedir doble generación del mismo grupo.
    const claim = await prisma.paesInternalJob.updateMany({
      where: { id: job.id, status: "PENDING", nextPart: job.nextPart },
      data: { status: "RUNNING", error: null },
    });
    if (claim.count !== 1)
      return NextResponse.json({ jobId: job.id, status: "BUSY", completed: job.nextPart, total: 30 }, { status: 409 });
    try {
      const result = await generateInternal65Part(job.nextPart,
        body.difficulty as "Baja"|"Media"|"Alta"|"Mixta");
      const texts = [...(job.texts as LectoraExam["texts"]), ...result.texts];
      const items = [...(job.items as LectoraExam["items"]), ...result.items];
      job = await prisma.paesInternalJob.update({
        where: { id: job.id }, data: { status: "PENDING", nextPart: job.nextPart + 1,
          texts: texts as unknown as Prisma.InputJsonValue,
          items: items as unknown as Prisma.InputJsonValue },
      });
      return NextResponse.json({ jobId: job.id, status: "IN_PROGRESS", completed: job.nextPart,
        total: 30, count: items.length }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[PAES65] Grupo ${job.nextPart + 1}: ${message.slice(0, 900)}`);
      await prisma.paesInternalJob.update({ where: { id: job.id },
        data: { status: "PENDING", error: message.slice(0, 500) } });
      return NextResponse.json({ jobId: job.id, completed: job.nextPart, total: 30,
        error: "El grupo no superó la validación. Puedes reintentar sin perder los grupos anteriores." }, { status: 422 });
    }
  } catch (error) {
    if(error instanceof PaesQuotaError)return NextResponse.json({error:error.message,jobId:body.jobId},{status:error.status});console.error("[PAES65] Error del proceso:", error instanceof Error ? error.message.slice(0, 500) : "Desconocido");
    return NextResponse.json({ error: "No fue posible continuar la generación. Revisa los registros de Railway." }, { status: 500 });
  }
}
