import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { enrollInstitutionalStudent } from "../../../../../lib/institutional-license-enrollment.server";
import { InstitutionalQuotaError } from "../../../../../lib/institutional-exam-quota.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (typeof session?.id !== "string") return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const actor = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, active: true, accountType: true, role: true, organizationId: true, schoolId: true },
  });
  if (!actor?.active || actor.accountType !== "INSTITUTIONAL" ||
      !["SUPERADMIN", "SOSTENEDOR", "DIRECTOR", "ADMIN_COLEGIO", "UTP"].includes(actor.role))
    return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { licenseId, studentId } = body as Record<string, unknown>;
  if (typeof licenseId !== "string" || typeof studentId !== "string" ||
      !licenseId.trim() || !studentId.trim() || licenseId.length > 128 || studentId.length > 128)
    return NextResponse.json({ error: "Identificadores inválidos" }, { status: 400 });
  const license = await prisma.institutionalExamLicense.findUnique({
    where: { id: licenseId },
    select: { organizationId: true, schoolId: true },
  });
  const school = license ? await prisma.school.findUnique({ where: { id: license.schoolId }, select: { active: true, organizationId: true } }) : null;
  const organization = license ? await prisma.organization.findUnique({ where: { id: license.organizationId }, select: { active: true } }) : null;
  if (!license || !school?.active || !organization?.active || school.organizationId !== license.organizationId || license.organizationId !== actor.organizationId ||
      (!["SUPERADMIN", "SOSTENEDOR"].includes(actor.role) && actor.schoolId !== license.schoolId))
    return NextResponse.json({ error: "Licencia fuera de alcance" }, { status: 403 });
  try {
    const result = await enrollInstitutionalStudent(prisma, licenseId, studentId, actor.id);
    return NextResponse.json({ status: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof InstitutionalQuotaError)
      return NextResponse.json({ error: error.message }, { status: error.status });
    throw error;
  }
}
