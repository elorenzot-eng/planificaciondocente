import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";
import { licenseEndsAt } from "../../../../lib/institutional-exam-license";

async function admin() {
  const session = await getSession();
  if (!session?.id) return null;
  return prisma.user.findFirst({ where: { id: String(session.id), active: true, role: "SUPERADMIN" }, select: { id: true } });
}
export async function POST(request: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Solo Superadministrador" }, { status: 403 });
  try {
    const body = await request.json();
    const schoolId = String(body.schoolId || "");
    const module = String(body.module || "");
    const level = String(body.level || "").trim();
    const subject = String(body.subject || "").trim();
    const studentCount = Number(body.studentCount);
    if (!schoolId || !["SIMCE","PAES"].includes(module) || !level || !subject ||
        !Number.isSafeInteger(studentCount) || studentCount < 1) {
      return NextResponse.json({ error: "Datos de licencia inválidos" }, { status: 400 });
    }
    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { id: true, organizationId: true, active: true } });
    if (!school?.active) return NextResponse.json({ error: "Establecimiento no encontrado" }, { status: 404 });
    const startsAt = body.startsAt ? new Date(String(body.startsAt)) : new Date();
    if (Number.isNaN(startsAt.getTime())) return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
    const item = await prisma.institutionalExamLicense.create({
      data: { schoolId, organizationId: school.organizationId, module, level, subject, studentCount,
        startsAt, endsAt: licenseEndsAt(startsAt), status: "PENDING" },
    });
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: "No se pudo crear la licencia" }, { status: 500 }); }
}
export async function PATCH(request: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Solo Superadministrador" }, { status: 403 });
  try {
    const body = await request.json();
    const id = String(body.id || "");
    const status = String(body.status || "");
    if (!id || !["ACTIVE","SUSPENDED","EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    const existing = await prisma.institutionalExamLicense.findUnique({ where: { id }, select: { id: true, status: true, endsAt: true } });
    if (!existing) return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
    if (status === "ACTIVE" && existing.endsAt <= new Date()) {
      return NextResponse.json({ error: "Renueve la licencia vencida antes de activarla" }, { status: 409 });
    }
    const item = await prisma.institutionalExamLicense.update({ where: { id }, data: { status } });
    return NextResponse.json(item);
  } catch { return NextResponse.json({ error: "No se pudo actualizar la licencia" }, { status: 500 }); }
}
