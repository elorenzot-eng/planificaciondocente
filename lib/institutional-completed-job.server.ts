import { PrismaClient } from "@prisma/client";
import { InstitutionalQuotaError, chargeInstitutionalExam } from "./institutional-exam-quota.server";

/** Server-only completion gate. Never accept a client assertion that a job completed. */
export async function chargeCompletedInstitutionalPaes(db: PrismaClient, args: {
  userId: string; jobId: string; licenseId: string; schoolId: string;
  organizationId: string; level: string; subject: string;
}) {
  if (!args.userId || !args.jobId) throw new InstitutionalQuotaError("Trabajo inválido", 400);
  const job = await db.paesInternalJob.findFirst({
    where: { id: args.jobId, userId: args.userId },
  });
  if (!job) throw new InstitutionalQuotaError("Ensayo ajeno o inexistente", 403);
  if (job.institutionalLicenseId !== args.licenseId || job.institutionalSchoolId !== args.schoolId || job.institutionalLevel !== args.level || job.institutionalSubject !== args.subject)
    throw new InstitutionalQuotaError("Trabajo no vinculado a la licencia contratada", 403);
  // The caller must validate actual exam contents and its final question count.
  // This gate alone is deliberately insufficient to charge until the real PAES handler is wired.
  throw new InstitutionalQuotaError("Integración de finalización institucional pendiente", 503);
}
