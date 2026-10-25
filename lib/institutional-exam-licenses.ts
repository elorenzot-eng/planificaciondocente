import { PrismaClient } from "@prisma/client";

export type InstitutionalQuotaAction = "PDF" | "REVIEW";

export async function consumeInstitutionalQuota(input: {
  licenseId: string;
  action: InstitutionalQuotaAction;
  institutionCode: string;
}) {
  const prisma = new PrismaClient();
  try {
    const now = new Date();
    const field = input.action === "PDF" ? "pdfUsed" : "reviewsUsed";
    const limit = input.action === "PDF" ? "pdfLimit" : "reviewLimit";
    // Atomic SQL update prevents concurrent requests from exceeding the quota.
    const changed = await prisma.$executeRawUnsafe(
      `UPDATE "InstitutionalExamLicense"
       SET "${field}" = "${field}" + 1, "updatedAt" = NOW()
       WHERE "id" = $1 AND "institutionCode" = $2 AND "active" = true
         AND "startsAt" <= $3 AND "expiresAt" > $3
         AND "${field}" < "${limit}"`,
      input.licenseId, input.institutionCode, now
    );
    return changed === 1;
  } finally {
    await prisma.$disconnect();
  }
}
