/**
 * Documentary applicability guard for the eight conditional rubric entries in the
 * original DocenteMás 2026 PDFs. This does NOT authorize grading or match scores.
 * Unknown context must never be interpreted as eligibility.
 */
export type Portfolio2026Context = {
 group: "Media Técnico-Profesional" | "Pueblos Originarios" | "Básica 1° a 6°" | "7° y 8° Básico / Media HC" | "Básica Generalista 1° a 4°";
 adultTechnicalProfessional?: boolean;
 recordedClassStudentCount?: number;
 grade?: number;
};
export type RubricApplicability = "eligible" | "ineligible" | "requires_context" | "requires_manual_review";

const SINGLE_STUDENT_IDS = new Set(["2026-011", "2026-032", "2026-053", "2026-072", "2026-091"]);
export const CONDITIONAL_RUBRIC_IDS_2026 = [
 "2026-003", "2026-011", "2026-032", "2026-037", "2026-038",
 "2026-053", "2026-072", "2026-091"
] as const;

/** Group consistency is mandatory; unknown IDs require review, not inferred eligibility. */
const GROUP_BY_ID: Record<string, Portfolio2026Context["group"]> = {
 "2026-003": "Media Técnico-Profesional",
 "2026-011": "Media Técnico-Profesional",
 "2026-032": "Pueblos Originarios",
 "2026-037": "Pueblos Originarios",
 "2026-038": "Pueblos Originarios",
 "2026-053": "Básica 1° a 6°",
 "2026-072": "7° y 8° Básico / Media HC",
 "2026-091": "Básica Generalista 1° a 4°"
};
export function conditionalRubricApplicability2026(
 indicatorId: string, context: Portfolio2026Context
): RubricApplicability {
 const expectedGroup = GROUP_BY_ID[indicatorId];
 if (!expectedGroup) return "requires_manual_review";
 if (context.group !== expectedGroup) return "ineligible";
 if (indicatorId === "2026-003") {
  if (typeof context.adultTechnicalProfessional !== "boolean") return "requires_context";
  return context.adultTechnicalProfessional ? "eligible" : "ineligible";
 }
 if (SINGLE_STUDENT_IDS.has(indicatorId)) {
  if (!Number.isInteger(context.recordedClassStudentCount) || (context.recordedClassStudentCount ?? 0) < 1)
   return "requires_context";
  return context.recordedClassStudentCount === 1 ? "eligible" : "ineligible";
 }
 if (!Number.isInteger(context.grade)) return "requires_context";
 if (indicatorId === "2026-037") return context.grade! >= 1 && context.grade! <= 4 ? "eligible" : "ineligible";
 if (indicatorId === "2026-038") return context.grade! >= 5 && context.grade! <= 8 ? "eligible" : "ineligible";
 return "requires_manual_review";
}
