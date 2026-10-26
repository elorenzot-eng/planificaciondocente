import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";
import { previewInstitutionalStudentImport, commitInstitutionalStudentImport } from "../../../../lib/institutional-student-service";
import type { StudentRow } from "../../../../lib/institutional-student-import";

export const runtime = "nodejs";
const columns = ["Nombres", "Apellido paterno", "Apellido materno", "RUT", "Curso"];
async function authorize(schoolId: string) {
  const session = await getSession();
  if (!session?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: String(session.id) },
    select: { id: true, role: true, active: true, organizationId: true, schoolId: true },
  });
  if (!user?.active || !["SUPERADMIN", "SOSTENEDOR", "DIRECTOR"].includes(user.role)) return null;
  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { organizationId: true } });
  if (!school) return null;
  if (user.role !== "SUPERADMIN" && school.organizationId !== user.organizationId) return null;
  if (user.role === "DIRECTOR" && user.schoolId !== schoolId) return null;
  return user;
}
export async function GET(request: Request) {
  const url = new URL(request.url);
  const schoolId = url.searchParams.get("schoolId") || "";
  if (!(await authorize(schoolId))) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const csv = "\uFEFF" + columns.join(";") + "\r\n";
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="educantay-estudiantes.csv"', "Cache-Control": "no-store" },
  });
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schoolId = typeof body.schoolId === "string" ? body.schoolId : "";
    if (!(await authorize(schoolId))) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    if (!Array.isArray(body.rows) || body.rows.length > 10000) return NextResponse.json({ error: "Planilla inválida o demasiado grande" }, { status: 400 });
    const rows = body.rows as StudentRow[];
    const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { organizationId: true } });
    if (!school) return NextResponse.json({ error: "Colegio no encontrado" }, { status: 404 });
    const licenses = await prisma.institutionalExamLicense.findMany({
      where: { schoolId, organizationId: school.organizationId, status: "ACTIVE", startsAt: { lte: new Date() }, endsAt: { gt: new Date() } },
      select: { studentCount: true },
    });
    if (!licenses.length) return NextResponse.json({ error: "Sin licencia institucional activa" }, { status: 403 });
    const courses = await prisma.institutionalStudent.findMany({ where: { schoolId }, select: { curso: true } });
    const allowedCourses = new Set<string>(Array.isArray(body.allowedCourses) ? body.allowedCourses.filter((x: unknown): x is string => typeof x === "string") : courses.map(c => c.curso));
    if (!allowedCourses.size) return NextResponse.json({ error: "Primero configure los cursos del colegio" }, { status: 400 });
    if (body.confirm !== true) {
      const result = await previewInstitutionalStudentImport({ schoolId, rows, allowedCourses });
      return NextResponse.json({ valid: result.errors.length === 0, count: result.students.length, errors: result.errors });
    }
    const result = await commitInstitutionalStudentImport({ schoolId, rows, allowedCourses, licensedStudentCount: Math.min(...licenses.map(l => l.studentCount)) });
    return NextResponse.json(result, { status: result.errors.length ? 422 : 200 });
  } catch {
    return NextResponse.json({ error: "No fue posible procesar la carga" }, { status: 500 });
  }
}
