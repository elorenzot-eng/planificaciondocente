/** Reglas comerciales institucionales, independientes de Flow. */
export const INSTITUTIONAL_PRICE_CLP = 6100;
export const VAT_BPS = 1900;
export const PDF_LIMIT_PER_SUBJECT = 10;
export const REVIEWS_PER_STUDENT = 10;

export type ExamModule = "SIMCE" | "PAES";
export type LicenseStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "EXPIRED";

export function calculateInstitutionalPrice(studentCount: number) {
  if (!Number.isSafeInteger(studentCount) || studentCount <= 0) {
    throw new Error("La matrícula contratada debe ser un entero positivo");
  }
  const net = studentCount * INSTITUTIONAL_PRICE_CLP;
  if (!Number.isSafeInteger(net)) throw new Error("Monto fuera de rango");
  const vat = Math.round((net * VAT_BPS) / 10000);
  return { net, vat, total: net + vat, currency: "CLP" as const };
}

export function licenseEndsAt(start: Date): Date {
  if (Number.isNaN(start.getTime())) throw new Error("Fecha de inicio inválida");
  const end = new Date(start);
  const day = end.getUTCDate();
  end.setUTCDate(1);
  end.setUTCFullYear(end.getUTCFullYear() + 1);
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate();
  end.setUTCDate(Math.min(day, lastDay));
  return end;
}

export function isLicenseActive(status: string, startsAt: Date, endsAt: Date, now = new Date()) {
  return status === "ACTIVE" && startsAt <= now && now < endsAt;
}

export function canGeneratePdf(license: {
  status: string; startsAt: Date; endsAt: Date; pdfUsed: number; pdfLimit: number;
}, now = new Date()) {
  return isLicenseActive(license.status, license.startsAt, license.endsAt, now)
    && license.pdfUsed < license.pdfLimit;
}

export function canReviewStudent(license: {
  status: string; startsAt: Date; endsAt: Date; reviewsPerStudent: number;
}, studentReviewCount: number, now = new Date()) {
  return isLicenseActive(license.status, license.startsAt, license.endsAt, now)
    && Number.isSafeInteger(studentReviewCount) && studentReviewCount >= 0
    && studentReviewCount < license.reviewsPerStudent;
}
