import type { LectoraExam } from "./lectora";
import { reviewLectoraExam, type ReviewedLectoraMatrix } from "./lectora-review";
import { buildLectoraPrompt, parseAndReviewLectoraResponse, planLectoraBatches, assembleLectoraBatches } from "./lectora-generator";
import { generateCompleteLectoraDraft, resumeCompleteLectoraDraft } from "./lectora-openai.server";
import { createLectoraPrintableHtml } from "./lectora-print";

/**
 * Pruebas de regresión ejecutables por un runner TS del proyecto.
 * Usa un ejemplo didáctico de UN ítem, no una matriz oficial DEMRE.
 */
export function testLectoraPipeline(): { exam: LectoraExam; matrix: ReviewedLectoraMatrix } {
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
  assert(!reviewLectoraExam({ ...exam, items: [null] } as unknown as LectoraExam, matrix).valid,
    "ítem nulo aceptado");
  assert(!reviewLectoraExam({ ...exam, texts: [null] } as unknown as LectoraExam, matrix).valid,
    "texto nulo aceptado");
  const studentHtml = createLectoraPrintableHtml(exam, matrix, "estudiante");
  const teacherHtml = createLectoraPrintableHtml(exam, matrix, "profesor");
  assert(studentHtml.includes("Hoja de respuestas") && studentHtml.includes("○ D"),
    "hoja de respuestas del estudiante incompleta");
  assert(!studentHtml.includes("Clave:</strong>") && !studentHtml.includes("Tabla de especificaciones del ensayo"),
    "la versión del estudiante expone las respuestas");
  assert(teacherHtml.includes("Tabla de especificaciones del ensayo") && teacherHtml.includes("<td>B</td>"),
    "versión del profesor sin clave B");
  assert(teacherHtml.includes("Evidencia:") && teacherHtml.includes("Justificación:"),
    "versión del profesor sin fundamentos");
  let rejectedPrint = false;
  try { createLectoraPrintableHtml({ ...exam, items: [] }, matrix, "estudiante"); }
  catch { rejectedPrint = true; }
  assert(rejectedPrint, "se permitió imprimir un ensayo inválido");
  assert(!reviewLectoraExam({ ...exam, items: undefined } as unknown as LectoraExam, matrix).valid,
    "ensayo sin arreglo de preguntas aceptado");
  assert(!reviewLectoraExam({ ...exam, texts: undefined } as unknown as LectoraExam, matrix).valid,
    "ensayo sin arreglo de textos aceptado");

  // Matriz ficticia de 65 ítems: verifica partición sin afirmar proporciones oficiales.
  const fullMatrix: ReviewedLectoraMatrix = {
    ...matrix, version: "TEST-ONLY-65", questionCount: 65,
    bySkill: { Localizar: 15, Interpretar: 35, Evaluar: 15 },
    byGenre: { Literario: 30, "No literario": 35 },
  };
  const batches = planLectoraBatches(fullMatrix);
  assert(batches.length === 7, "se esperan siete bloques");
  assert(batches.map(b => b.questionCount).join(",") === "10,10,10,10,10,10,5",
    "los bloques no suman 65");
  for (const skill of ["Localizar", "Interpretar", "Evaluar"] as const)
    assert(batches.reduce((n,b) => n + b.bySkill[skill], 0) === fullMatrix.bySkill[skill],
      "se perdió distribución por habilidad");
  for (const genre of ["Literario", "No literario"] as const)
    assert(batches.reduce((n,b) => n + b.byGenre[genre], 0) === fullMatrix.byGenre[genre],
      "se perdió distribución por género");
  let rejectedMatrix = false;
  try { planLectoraBatches({ ...fullMatrix, bySkill: { ...fullMatrix.bySkill, Localizar: 14 } }); }
  catch { rejectedMatrix = true; }
  assert(rejectedMatrix, "se aceptó matriz de 65 inconsistente");

  const parts = batches.map((batch, i): LectoraExam => {
    const texts: LectoraExam["texts"] = [];
    const items: LectoraExam["items"] = [];
    for (const genre of ["Literario", "No literario"] as const) {
      if (batch.byGenre[genre] > 0)
        texts.push({ id: genre === "Literario" ? "L" : "N", genre,
          body: "Texto original de prueba para verificar ensamblaje.", sourceAttribution: "Fixture" });
    }
    const genres = ["Literario", "No literario"] as const;
    const skills = ["Localizar", "Interpretar", "Evaluar"] as const;
    const genreSlots = genres.flatMap(g => Array.from({ length: batch.byGenre[g] }, () => g));
    const skillSlots = skills.flatMap(k => Array.from({ length: batch.bySkill[k] }, () => k));
    for (let j = 0; j < batch.questionCount; j++) {
      const genre = genreSlots[j];
      items.push({ id: "P" + j, textId: genre === "Literario" ? "L" : "N", genre,
        skill: skillSlots[j], stem: "Pregunta " + j, options: ["A", "B", "C", "D"],
        correctIndex: j % 4, rationale: "Justificación", evidence: "Texto original" });
    }
    return { specificationVersion: batch.version, texts, items };
  });
  const assembled = assembleLectoraBatches(parts, fullMatrix);
  assert(assembled.exam.items.length === 65, "el ensamblaje no contiene 65 preguntas");
  assert(new Set(assembled.exam.items.map(x => x.id)).size === 65, "hay IDs duplicados");
  assert(reviewLectoraExam(assembled.exam, fullMatrix).valid, "ensayo consolidado inválido");
  let missingBlockRejected = false;
  try { assembleLectoraBatches(parts.slice(0, 6), fullMatrix); }
  catch { missingBlockRejected = true; }
  assert(missingBlockRejected, "se aceptó un ensayo incompleto");
  return { exam, matrix };
}

/** Prueba asíncrona sin proveedor real ni claves. */
export async function testLectoraCompleteOrchestration(): Promise<void> {
  const matrix: ReviewedLectoraMatrix = {
    version: "TEST-65", reviewedBy: "Prueba", reviewedAt: "2026-10-28",
    sourceReference: "Fixture sintético", questionCount: 65,
    bySkill: { Localizar: 15, Interpretar: 35, Evaluar: 15 },
    byGenre: { Literario: 30, "No literario": 35 },
  };
  let calls = 0;
  const result = await generateCompleteLectoraDraft({ matrix, difficulty: "Mixta" },
    async ({ matrix: batch }) => {
      calls++;
      const genres = (["Literario", "No literario"] as const)
        .flatMap(g => Array.from({ length: batch.byGenre[g] }, () => g));
      const skills = (["Localizar", "Interpretar", "Evaluar"] as const)
        .flatMap(k => Array.from({ length: batch.bySkill[k] }, () => k));
      const texts: LectoraExam["texts"] = (["Literario", "No literario"] as const)
        .filter(g => batch.byGenre[g] > 0)
        .map(g => ({ id: g, genre: g, body: "Texto original de prueba", sourceAttribution: "Fixture" }));
      const items: LectoraExam["items"] = genres.map((genre, i) => ({
        id: "P" + i, textId: genre, genre, skill: skills[i],
        stem: "Pregunta " + i, options: ["A", "B", "C", "D"] as [string,string,string,string],
        correctIndex: 0, rationale: "Razón de prueba", evidence: "Texto original",
      }));
      return { exam: { specificationVersion: batch.version, texts, items }, warnings: [] };
    });
  if (calls !== 7 || result.exam.items.length !== 65 ||
      !reviewLectoraExam(result.exam, matrix).valid)
    throw new Error("Orquestación PAES de 65 preguntas fallida");
}

/** Simula una caída tras el tercer bloque y recuperación desde el cuarto. */
export async function testLectoraResume(): Promise<void> {
  const matrix: ReviewedLectoraMatrix = {
    version: "TEST-RESUME-65", reviewedBy: "Fixture", reviewedAt: "2026-10-28",
    sourceReference: "Prueba interna sintética", questionCount: 65,
    bySkill: { Localizar: 15, Interpretar: 35, Evaluar: 15 },
    byGenre: { Literario: 30, "No literario": 35 },
  };
  let state: { nextPart: number; parts: LectoraExam[] } = { nextPart: 0, parts: [] };
  const store = {
    load: async () => ({ ...state, parts: [...state.parts] }),
    commit: async (expectedPart: number, next: typeof state) => {
      if (state.nextPart !== expectedPart) return false;
      state = next;
      return true;
    },
  };
  let calls = 0;
  let failAfterThree = true;
  const generate = async ({ matrix: batch }: { matrix: ReviewedLectoraMatrix; difficulty: "Mixta" }) => {
    calls++;
    if (failAfterThree && calls === 4) throw new Error("Interrupción simulada");
    const genres = (["Literario", "No literario"] as const)
      .flatMap(g => Array.from({ length: batch.byGenre[g] }, () => g));
    const skills = (["Localizar", "Interpretar", "Evaluar"] as const)
      .flatMap(k => Array.from({ length: batch.bySkill[k] }, () => k));
    const texts: LectoraExam["texts"] = (["Literario", "No literario"] as const)
      .filter(g => batch.byGenre[g] > 0)
      .map(g => ({ id: g, genre: g, body: "Texto original de prueba", sourceAttribution: "Fixture" }));
    const items: LectoraExam["items"] = genres.map((genre, i) => ({
      id: "P" + i, textId: genre, genre, skill: skills[i],
      stem: "Pregunta " + i, options: ["A", "B", "C", "D"] as [string,string,string,string],
      correctIndex: 0, rationale: "Justificación", evidence: "Texto original",
    }));
    return { exam: { specificationVersion: batch.version, texts, items }, warnings: [] };
  };
  let interrupted = false;
  try { await resumeCompleteLectoraDraft({ matrix, difficulty: "Mixta" }, store, generate); }
  catch { interrupted = true; }
  if (!interrupted || state.nextPart !== 3 || state.parts.length !== 3)
    throw new Error("No se conservaron los tres bloques confirmados");
  failAfterThree = false;
  const result = await resumeCompleteLectoraDraft({ matrix, difficulty: "Mixta" }, store, generate);
  if (calls !== 8 || state.nextPart !== 7 || result.exam.items.length !== 65 ||
      !reviewLectoraExam(result.exam, matrix).valid)
    throw new Error("La reanudación duplicó bloques o produjo un ensayo inválido");
}
