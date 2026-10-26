import { Prisma, PrismaClient } from "@prisma/client";
import { InstitutionalQuotaError } from "./institutional-exam-quota.server";

export async function enrollInstitutionalStudent(db: PrismaClient, licenseId: string, studentId: string, actorId?: string) {
  if (typeof licenseId !== "string" || !licenseId.trim() || typeof studentId !== "string" || !studentId.trim()) throw new InstitutionalQuotaError("Inscripción inválida", 400);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await db.$transaction(async tx => {
        const license = await tx.institutionalExamLicense.findUnique({ where: { id: licenseId } });
        if (actorId) {
          const actor = await tx.user.findUnique({ where: { id: actorId } });
          if (!actor?.active || actor.accountType !== "INSTITUTIONAL" || actor.organizationId !== license?.organizationId ||
              !["SUPERADMIN", "SOSTENEDOR", "DIRECTOR", "ADMIN_COLEGIO", "UTP"].includes(actor.role) ||
              (!["SUPERADMIN", "SOSTENEDOR"].includes(actor.role) && actor.schoolId !== license?.schoolId))
            throw new InstitutionalQuotaError("Permisos insuficientes", 403);
        }
        const now = new Date();
        if (!license || license.status !== "ACTIVE" || license.startsAt > now || license.endsAt <= now ||
            !Number.isSafeInteger(license.studentCount) || license.studentCount < 1)
          throw new InstitutionalQuotaError("Licencia no vigente", 403);
        const student = await tx.institutionalStudent.findFirst({
          where: { id: studentId, schoolId: license.schoolId, curso: license.level, active: true },
          select: { id: true },
        });
        if (!student) throw new InstitutionalQuotaError("Estudiante fuera de alcance", 403);
        const existing = await tx.institutionalLicenseEnrollment.findUnique({
          where: { licenseId_studentId: { licenseId, studentId } },
        });
        if (existing?.active) return "duplicate" as const;
        const used = await tx.institutionalLicenseEnrollment.count({ where: { licenseId, active: true } });
        if (used >= license.studentCount) throw new InstitutionalQuotaError("Cupos de estudiantes agotados", 409);
        if (existing) await tx.institutionalLicenseEnrollment.update({
          where: { licenseId_studentId: { licenseId, studentId } }, data: { active: true },
        });
        else await tx.institutionalLicenseEnrollment.create({ data: { licenseId, studentId } });
        return "enrolled" as const;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError &&
          ["P2034", "P2002"].includes(error.code) && attempt < 4) continue;
      throw error;
    }
  }
  throw new InstitutionalQuotaError("No se pudo completar la inscripción");
}
