import type { LectoraExam } from "./lectora";
import { reviewLectoraExam, type ReviewedLectoraMatrix } from "./lectora-review";
import { buildLectoraPrompt, parseAndReviewLectoraResponse } from "./lectora-generator";

/**
 * Pruebas de regresión ejecutables por un runner TS del proyecto.
 * Usa un ejemplo didáctico de UN ítem, no una matriz oficial DEMRE.
 */
export function testLectoraPipeline(): void {
  const matrix: ReviewedLectoraMatrix = {
    version: "TEST-ONLY-1",
    reviewedBy: "Fixture automatizado",
    reviewedAt: "2026-10-23",
    sourceReference: "DATOS FICTICIOS: no usar en producción",
    questionCount: 1,
    bySkill: { Localizar: 1, Interpretar: 0, Evaluar: 0 },
    byGenre: { Literario: 0, "No literario": 1 },
  };
  const exam: LectoraExam = {
    specificationVersion: matrix.version,
    texts: [{ id: "T1", genre: "No literario", body: "La biblioteca abre a las ocho de la mañana.", sourceAttribution: "Texto original de prueba" }],
    items: [{
      id: "P1", textId: "T1", skill: "Localizar", genre: "No literario",
      stem: "¿A qué hora abre la biblioteca?",
      options: ["A las siete", "A las ocho", "A las nueve", "A las diez"],
      correctIndex: 1, rationale: "El texto indica explícitamente las ocho.",
      evidence: "abre a las ocho de la mañana",
    }],
  };
  const assert = (condition: boolean, message: string) => {
    if (!condition) throw new Error("Fallo prueba PAES: " + message);
  };
  assert(reviewLectoraExam(exam, matrix).valid, "ensayo válido rechazado");
  assert(parseAndReviewLectoraResponse(JSON.stringify(exam), matrix).exam.items.length === 1,
    "respuesta IA válida rechazada");
  assert(buildLectoraPrompt({ matrix, difficulty: "Mixta" }).includes("Cantidad exacta: 1"),
    "prompt no respeta matriz");
  assert(!reviewLectoraExam({ ...exam, items: [{ ...exam.items[0], options: ["a", "a", "c", "d"] }] }, matrix).valid,
    "alternativas duplicadas aceptadas");
  assert(!reviewLectoraExam({ ...exam, items: [{ ...exam.items[0], correctIndex: 4 }] }, matrix).valid,
    "clave fuera de A-D aceptada");
  assert(!reviewLectoraExam({ ...exam, specificationVersion: "OTRA" }, matrix).valid,
    "matriz incorrecta aceptada");
  assert(!reviewLectoraExam({ ...exam, items: [] }, matrix).valid,
    "cantidad incorrecta aceptada");
  assert(!reviewLectoraExam({ ...exam, items: [{ ...exam.items[0], textId: "NO-EXISTE" }] }, matrix).valid,
    "ítem sin texto aceptado");
}
