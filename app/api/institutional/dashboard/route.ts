import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Inicie sesión" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { id: String(session.id) },
    select: { id: true, name: true, active: true, role: true, organizationId: true, schoolId: true },
  });
  if (!user?.active || !["ADMIN_COLEGIO", "DIRECTOR", "SOSTENEDOR", "SUPERADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }
  const schools = await prisma.school.findMany({
    where: user.role === "SUPERADMIN" ? {} : user.role === "SOSTENEDOR"
      ? { organizationId: user.organizationId } : { id: user.schoolId || "" },
    select: { id: true, name: true, rbd: true, organizationId: true },
    orderBy: { name: "asc" },
  });
  const schoolIds = schools.map(s => s.id);
  const [licenses, counts] = await Promise.all([
    prisma.institutionalExamLicense.findMany({
      where: { schoolId: { in: schoolIds } },
      select: { id: true, schoolId: true, module: true, level: true, subject: true, status: true,
        studentCount: true, startsAt: true, endsAt: true, pdfLimit: true, pdfUsed: true, reviewsPerStudent: true },
      orderBy: { endsAt: "asc" },
    }),
    prisma.institutionalStudent.groupBy({
      by: ["schoolId"], where: { schoolId: { in: schoolIds }, active: true }, _count: { _all: true },
    }),
  ]);
  return NextResponse.json({
    user: { name: user.name, role: user.role },
    schools, licenses,
    enrollment: Object.fromEntries(counts.map(c => [c.schoolId, c._count._all])),
  }, { headers: { "Cache-Control": "no-store" } });
}
