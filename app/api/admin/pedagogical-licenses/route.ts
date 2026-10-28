import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const modules = ["PLANIFICACION", "EVALUACION", "RECURSOS_PEDAGOGICOS"] as const;
const headers = { "Cache-Control": "private, no-store" };
async function authorized() {
  const session = await getSession();
  if (!session?.id) return false;
  const user = await prisma.user.findUnique({ where: { id: String(session.id) }, select: { role: true, active: true } });
  return !!user?.active && user.role === "SUPERADMIN";
}
export async function GET(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Acceso reservado al superadministrador" }, { status: 403, headers });
  const schoolId = new URL(request.url).searchParams.get("schoolId");
  if (!schoolId) return NextResponse.json({ error: "schoolId requerido" }, { status: 400, headers });
  const licenses = await prisma.pedagogicalModuleLicense.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ licenses }, { headers });
}
export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Acceso reservado al superadministrador" }, { status: 403, headers });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers }); }
  const schoolId = typeof body.schoolId === "string" ? body.schoolId.trim() : "";
  const moduleName = body.module;
  const startsAt = new Date(body.startsAt);
  const expiresAt = new Date(body.expiresAt);
  if (!schoolId || !modules.includes(moduleName) || !Number.isFinite(startsAt.getTime()) || !Number.isFinite(expiresAt.getTime()) || startsAt >= expiresAt) {
    return NextResponse.json({ error: "Datos de licencia inválidos" }, { status: 400, headers });
  }
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { id: true } });
  if (!school) return NextResponse.json({ error: "Colegio inexistente" }, { status: 404, headers });
  const overlap = await prisma.pedagogicalModuleLicense.findFirst({
    where: { schoolId, module: moduleName, active: true, startsAt: { lte: expiresAt }, expiresAt: { gte: startsAt } },
    select: { id: true }
  });
  if (overlap) return NextResponse.json({ error: "Ya existe una licencia activa para ese módulo y período" }, { status: 409, headers });
  const license = await prisma.pedagogicalModuleLicense.create({ data: { schoolId, module: moduleName, startsAt, expiresAt, active: true } });
  return NextResponse.json({ license }, { status: 201, headers });
}
export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Acceso reservado al superadministrador" }, { status: 403, headers });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers }); }
  if (typeof body.id !== "string" || typeof body.active !== "boolean") return NextResponse.json({ error: "Datos inválidos" }, { status: 400, headers });
  const current = await prisma.pedagogicalModuleLicense.findUnique({ where: { id: body.id } });
  if (!current) return NextResponse.json({ error: "Licencia inexistente" }, { status: 404, headers });
  if (body.active) {
    const overlap = await prisma.pedagogicalModuleLicense.findFirst({
      where: { id: { not: current.id }, schoolId: current.schoolId, module: current.module, active: true, startsAt: { lt: current.expiresAt }, expiresAt: { gt: current.startsAt } },
      select: { id: true }
    });
    if (overlap) return NextResponse.json({ error: "No se puede reactivar: existe otra licencia activa para el período" }, { status: 409, headers });
  }
  const result = await prisma.pedagogicalModuleLicense.updateMany({ where: { id: body.id }, data: { active: body.active } });
  if (!result.count) return NextResponse.json({ error: "Licencia inexistente" }, { status: 404, headers });
  return NextResponse.json({ ok: true }, { headers });
}
