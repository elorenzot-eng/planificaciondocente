import { Prisma, PrismaClient } from "@prisma/client";

/** Requires the InstitutionalExamLicense and InstitutionalExamUsage models from PR #135.
 * This service must be called by trusted generation/review completion handlers, never
 * by a browser endpoint that accepts arbitrary claims of completion.
 */
type Db = Pick<PrismaClient, "$transaction">;
type Kind = "PDF" | "REVIEW";
type Charge = { licenseId: string; kind: Kind; requestKey: string; studentId?: string; schoolId: string; organizationId: string; module: string; level: string; subject: string };
export class InstitutionalQuotaError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}
export async function chargeInstitutionalExam(db: Db, args: Charge): Promise<"charged" | "duplicate"> {
  if (!/^[a-zA-Z0-9_-]{12,128}$/.test(args.requestKey) || (args.kind === "REVIEW" && !args.studentId))
    throw new InstitutionalQuotaError("Operación inválida", 400);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async tx => {
        const prior = await tx.institutionalExamUsage.findUnique({ where: { requestKey: args.requestKey } });
        if (prior) {
          if (prior.licenseId !== args.licenseId || prior.kind !== args.kind ||
              (args.kind === "REVIEW" && prior.studentKey !== args.studentId))
            throw new InstitutionalQuotaError("Clave de operación reutilizada", 409);
          return "duplicate" as const;
        }
        const license = await tx.institutionalExamLicense.findFirst({
          where: { id: args.licenseId, schoolId: args.schoolId, organizationId: args.organizationId,
            module: args.module, level: args.level, subject: args.subject,
            status: "ACTIVE", startsAt: { lte: new Date() }, endsAt: { gt: new Date() } },
        });
        if (!license) throw new InstitutionalQuotaError("Licencia no vigente o fuera de alcance", 403);
        if (args.kind === "PDF") {
          const result = await tx.institutionalExamLicense.updateMany({
            where: { id: license.id, pdfUsed: { lt: license.pdfLimit }, status: "ACTIVE",
              startsAt: { lte: new Date() }, endsAt: { gt: new Date() } },
            data: { pdfUsed: { increment: 1 } },
          });
          if (result.count !== 1) throw new InstitutionalQuotaError("Cupo PDF agotado");
        } else {
          const student = await tx.institutionalStudent.findFirst({
            where: { id: args.studentId!, schoolId: license.schoolId, active: true },
            select: { id: true },
          });
          if (!student) throw new InstitutionalQuotaError("Estudiante no autorizado", 403);
          const used = await tx.institutionalExamUsage.count({
            where: { licenseId: license.id, kind: "REVIEW", studentKey: student.id },
          });
          if (used >= license.reviewsPerStudent) throw new InstitutionalQuotaError("Cupo de revisiones agotado");
        }
        await tx.institutionalExamUsage.create({
          data: { licenseId: license.id, kind: args.kind, requestKey: args.requestKey,
            studentKey: args.kind === "REVIEW" ? args.studentId! : null },
        });
        return "charged" as const;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" && attempt < 2) continue;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")
        throw new InstitutionalQuotaError("Operación concurrente: consultar el recibo antes de reintentar");
      throw error;
    }
  }
  throw new InstitutionalQuotaError("No fue posible completar la operación");
}
