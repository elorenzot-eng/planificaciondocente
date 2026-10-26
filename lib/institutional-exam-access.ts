/** Shared authorization rules for institutional exam access.
 * Must be invoked on the server with session-derived user and DB-derived license.
 * This helper does NOT charge quotas or replace a database transaction.
 */
export type InstitutionalRole = "SUPERADMIN" | "SOSTENEDOR" | "DIRECTOR" | "ADMIN_COLEGIO" | "UTP" | "DOCENTE";
export type InstitutionalModule = "SIMCE" | "PAES";
export type InstitutionalOperation = "GENERATE" | "REVIEW" | "DOWNLOAD";

export interface InstitutionalActor {
  active: boolean;
  accountType: string;
  role: string;
  organizationId: string | null;
  schoolId: string | null;
}

export interface InstitutionalLicenseScope {
  organizationId: string;
  schoolId: string;
  module: string;
  level: string;
  subject: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
}

export function canAccessInstitutionalExam(
  actor: InstitutionalActor,
  license: InstitutionalLicenseScope,
  request: { module: InstitutionalModule; level: string; subject: string; operation: InstitutionalOperation },
  now = new Date(),
): boolean {
  if (!actor || !license || !request || !actor.active || actor.accountType !== "INSTITUTIONAL") return false;
  if (license.status !== "ACTIVE" || !(license.startsAt instanceof Date) || !(license.endsAt instanceof Date) || !(license.startsAt <= now && now < license.endsAt)) return false;
  if (!["SIMCE", "PAES"].includes(request.module) || !["GENERATE", "REVIEW", "DOWNLOAD"].includes(request.operation)) return false;
  if (license.module !== request.module || license.level !== request.level || license.subject !== request.subject) return false;
  if (!actor.organizationId || actor.organizationId !== license.organizationId) return false;
  if (actor.role === "SUPERADMIN" || actor.role === "SOSTENEDOR") return true;
  if (!actor.schoolId || actor.schoolId !== license.schoolId) return false;
  return ["DIRECTOR", "ADMIN_COLEGIO", "UTP", "DOCENTE"].includes(actor.role);
}
