import { mkdirSync, writeFileSync } from "node:fs";
import { reviewLectoraExam, type ReviewedLectoraMatrix } from "../lib/paes/lectora-review";
import { createLectoraPrintableHtml } from "../lib/paes/lectora-print";
import type { LectoraExam, LectoraGenre, LectoraSkill } from "../lib/paes/lectora";

const skills: LectoraSkill[] = ["Localizar", "Interpretar", "Evaluar"];
const genres: LectoraGenre[] = ["Literario", "No literario"];
const exam: LectoraExam = { specificationVersion: "SYNTHETIC-65-NOT-DEMRE", texts: [], items: [] };
const bySkill: ReviewedLectoraMatrix["bySkill"] = { Localizar: 0, Interpretar: 0, Evaluar: 0 };
const byGenre: ReviewedLectoraMatrix["byGenre"] = { Literario: 0, "No literario": 0 };
for (let n = 1; n <= 65; n++) {
  const genre = genres[n % genres.length];
  const skill = skills[n % skills.length];
  const id = `T${n}`;
  exam.texts.push({ id, genre, body: `Texto sintético número ${n}. Este pasaje se utiliza exclusivamente para verificar la impresión y el conteo de preguntas. No constituye material PAES validado ni contenido DEMRE.\\nSegundo párrafo del texto de prueba ${n}.`, sourceAttribution: "Texto ficticio automatizado" });
  exam.items.push({ id: `P${n}`, textId: id, skill, genre, stem: `Pregunta ficticia número ${n}: ¿qué número identifica este pasaje?`, options: [`Número ${n+1}`, `Número ${n}`, `Número ${n+2}`, `Número ${n+3}`], correctIndex: 1, rationale: `El texto señala el número ${n}.`, evidence: `Texto sintético número ${n}` });
  bySkill[skill]++;
  byGenre[genre]++;
}
const matrix: ReviewedLectoraMatrix = { version: exam.specificationVersion!, reviewedBy: "Fixture automatizado", reviewedAt: "2026-10-23", sourceReference: "SIMULACIÓN TÉCNICA; no representa distribución oficial", questionCount: 65, bySkill, byGenre };
const review = reviewLectoraExam(exam, matrix);
if (!review.valid) throw new Error(review.errors.join(" | "));
for (const version of ["estudiante", "profesor"] as const) {
  const html = createLectoraPrintableHtml(exam, matrix, version);
  if ((html.match(/<h3>Pregunta /g) || []).length !== 65) throw new Error(`Faltan preguntas en ${version}`);
  if (version === "estudiante" && (html.includes("Clave:</strong>") || html.includes("Tabla de especificaciones del ensayo"))) throw new Error("Se filtraron claves al estudiante");
  if (version === "profesor" && (html.match(/<tr><td>\\d+<\\/td>/g) || []).length !== 65) throw new Error("Tabla de especificaciones incompleta");
  mkdirSync("artifacts/paes-lectora-65", { recursive: true });
  writeFileSync(`artifacts/paes-lectora-65/${version}.html`, html, "utf8");
}
console.log("PASS: 65 synthetic questions, both printable versions, 65 teacher key rows; NOT an OpenAI or PDF validation.");
