import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

async function owner() {
  const session = await getSession();
  if (!session?.id) return null;
  return prisma.user.findFirst({ where: { id: String(session.id), active: true }, select: { id: true } });
}
export async function GET() {
  const user = await owner();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const resources = await prisma.learningResource.findMany({
    where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 100,
    select: { id: true, moduleId: true, grade: true, title: true, updatedAt: true, content: true }
  });
  return NextResponse.json({ resources });
}
export async function POST(request: Request) {
  const user = await owner();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  let data: any;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  const allowed = ["precursores","cuadernillos","simce-lectura","simce-matematica","fluidez"];
  const moduleId = String(data.moduleId || "");
  const content = data.content;
  const grade = moduleId.startsWith("simce") ? (String(data.grade) === "2" ? "2° básico" : "4° básico") : "2° básico";
  if (!allowed.includes(moduleId) || !content || typeof content !== "object" || Array.isArray(content) ||
      typeof content.title !== "string" || !Array.isArray(content.activities) || content.activities.length > 40 ||
      JSON.stringify(content).length > 120000) {
    return NextResponse.json({ error: "Recurso inválido" }, { status: 400 });
  }
  const existingId = typeof data.id === "string" ? data.id : null;
  if (existingId) {
    const updated = await prisma.learningResource.updateMany({ where: { id: existingId, userId: user.id }, data: { moduleId, grade, title: content.title.slice(0, 200), content } });
    if (!updated.count) return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });
    return NextResponse.json({ resource: { id: existingId }, updated: true });
  }
  const resource = await prisma.learningResource.create({
    data: { userId: user.id, moduleId, grade,
      title: content.title.slice(0, 200), content },
    select: { id: true, title: true, updatedAt: true }
  });
  return NextResponse.json({ resource }, { status: 201 });
}
