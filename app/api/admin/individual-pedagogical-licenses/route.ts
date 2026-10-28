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
  const userId = new URL(request.url).searchParams.get("userId")?.trim();
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400, headers });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, accountType: true } });
  if (!user || user.accountType !== "INDIVIDUAL") return NextResponse.json({ error: "Cuenta individual inexistente" }, { status: 404, headers });
  const licenses = await prisma.individualPedagogicalLicense.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ licenses }, { headers });
}
export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Acceso reservado al superadministrador" }, { status: 403, headers });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers }); }
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const moduleName = body.module;
  const startsAt = new Date(body.startsAt);
  const expiresAt = new Date(body.expiresAt);
  if (!userId || !modules.includes(moduleName) || !Number.isFinite(startsAt.getTime()) || !Number.isFinite(expiresAt.getTime()) || startsAt >= expiresAt) {
    return NextResponse.json({ error: "Datos de licencia inválidos" }, { status: 400, headers });
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, active: true, accountType: true, organization: { select: { active: true } } } });
  if (!user || user.accountType !== "INDIVIDUAL") return NextResponse.json({ error: "Cuenta individual inexistente" }, { status: 404, headers });
  if (!user.active || !user.organization?.active) return NextResponse.json({ error: "Cuenta u organización inactiva" }, { status: 409, headers });
  const overlap = await prisma.individualPedagogicalLicense.findFirst({ where: { userId, module: moduleName, active: true, startsAt: { lt: expiresAt }, expiresAt: { gt: startsAt } }, select: { id: true } });
  if (overlap) return NextResponse.json({ error: "Licencia superpuesta" }, { status: 409, headers });
  const license = await prisma.individualPedagogicalLicense.create({ data: { userId, module: moduleName, startsAt, expiresAt, active: true } });
  return NextResponse.json({ license }, { status: 201, headers });
}
export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Acceso reservado al superadministrador" }, { status: 403, headers });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400, headers }); }
  if (typeof body.id !== "string" || typeof body.active !== "boolean") return NextResponse.json({ error: "Datos inválidos" }, { status: 400, headers });
  const current = await prisma.individualPedagogicalLicense.findUnique({ where: { id: body.id } });
  if (!current) return NextResponse.json({ error: "Licencia inexistente" }, { status: 404, headers });
  if (body.active) {
    const user = await prisma.user.findUnique({ where: { id: current.userId }, select: { active: true, accountType: true, organization: { select: { active: true } } } });
    if (!user?.active || user.accountType !== "INDIVIDUAL" || !user.organization?.active) return NextResponse.json({ error: "Cuenta inactiva o inválida" }, { status: 409, headers });
    const overlap = await prisma.individualPedagogicalLicense.findFirst({ where: { id: { not: current.id }, userId: current.userId, module: current.module, active: true, startsAt: { lt: current.expiresAt }, expiresAt: { gt: current.startsAt } }, select: { id: true } });
    if (overlap) return NextResponse.json({ error: "Licencia superpuesta" }, { status: 409, headers });
  }
  const changed = await prisma.individualPedagogicalLicense.updateMany({ where: { id: body.id }, data: { active: body.active } });
  return NextResponse.json({ ok: !!changed.count }, { status: changed.count ? 200 : 404, headers });
}
