import { reviewLectoraExam, type ReviewedLectoraMatrix } from "./lectora-review";
import type { LectoraExam } from "./lectora";

type PrintVersion = "estudiante" | "profesor";
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c] ?? c));

/**
 * Prepara una versión imprimible para guardar como PDF desde el navegador.
 * Nunca entrega documentos de un ensayo que no pasó la validación estructural.
 * No equivale a revisión semántica o aprobación oficial DEMRE.
 */
export function createLectoraPrintableHtml(
  exam: LectoraExam,
  matrix: ReviewedLectoraMatrix,
  version: PrintVersion,
): string {
  const review = reviewLectoraExam(exam, matrix);
  if (!review.valid) throw new Error("Ensayo no validado: " + review.errors.join(" | "));
  if (version !== "estudiante" && version !== "profesor")
    throw new Error("Versión de impresión inválida.");
  const texts = new Map(exam.texts.map(t => [t.id, t]));
  const grouped = new Map<string, typeof exam.items>();
  for (const item of exam.items) grouped.set(item.textId, [...(grouped.get(item.textId) ?? []), item]);
  let number = 0;
  const printedItems: typeof exam.items = [];
  const sections = [...grouped.entries()].map(([textId, items]) => {
    const passage = texts.get(textId)!;
    const questions = items.map(item => {
      const n = ++number;
      printedItems.push(item);
      const options = item.options.map((option, i) =>
        `<li><strong>${"ABCD"[i]}.</strong> ${escapeHtml(option)}</li>`
      ).join("");
      const answer = version === "profesor" ?
        `<aside><strong>Clave:</strong> ${"ABCD"[item.correctIndex]} · <strong>Habilidad:</strong> ${escapeHtml(item.skill)}<p><strong>Evidencia:</strong> ${escapeHtml(item.evidence)}</p><p><strong>Justificación:</strong> ${escapeHtml(item.rationale)}</p></aside>` : "";
      return `<div class="question"><h3>Pregunta ${n}</h3><p>${escapeHtml(item.stem)}</p><ol class="options">${options}</ol>${answer}</div>`;
    }).join("");
    return `<section><h2>Texto ${escapeHtml(textId)}</h2><article class="passage">${escapeHtml(passage.body)}</article><p class="source">Fuente: ${escapeHtml(passage.sourceAttribution)}</p>${questions}</section>`;
  }).join("");
  const answerSheet = version === "estudiante" ?
    `<section class="answers"><h2>Hoja de respuestas</h2><p>Nombre: __________________________ Curso: __________ Fecha: __________</p><div class="answer-grid">${printedItems.map((_,i) =>
      `<div class="answer-row"><strong>${i+1}.</strong> ○ A &nbsp; ○ B &nbsp; ○ C &nbsp; ○ D</div>`
    ).join("")}</div></section>` : "";
  const key = version === "profesor" ?
    `<section class="key"><h2>Tabla de especificaciones del ensayo</h2><table><thead><tr><th>N.º</th><th>Clave</th><th>Habilidad</th><th>Género</th><th>Texto</th></tr></thead><tbody>${printedItems.map((item, i) =>
      `<tr><td>${i + 1}</td><td>${"ABCD"[item.correctIndex]}</td><td>${escapeHtml(item.skill)}</td><td>${escapeHtml(item.genre)}</td><td>${escapeHtml(item.textId)}</td></tr>`
    ).join("")}</tbody></table></section>` : "";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ensayo PAES Competencia Lectora - ${version}</title><style>
  @page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#18233a;font-size:11pt;line-height:1.45;max-width:800px;margin:auto}
  header{border-bottom:3px solid #0d9488;padding-bottom:12px}h1{font-size:22pt}h2{font-size:15pt;color:#0d766e}
  .passage{white-space:pre-wrap;margin:14px 0}.source{font-size:9pt;color:#555}
  .question{break-inside:avoid;margin:18px 0}.options{list-style:none;padding:0}.options li{padding:4px 0}
  aside{background:#edf9f7;padding:10px;border-left:3px solid #0d9488}table{border-collapse:collapse;width:100%;font-size:9pt}
  td,th{border:1px solid #aaa;padding:5px;text-align:left}section{margin-top:20px}
  .answers{break-before:page;page-break-before:always;margin-top:0}
.answers h2{margin:0 0 6px}.answers p{margin:0 0 9px;font-size:9pt}
.answer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px 10px}
.answer-row{font-size:8pt;white-space:nowrap;padding:2px 0;border-bottom:1px solid #e2e8f0;break-inside:avoid}
.answers{font-size:9pt}
  @media screen and (max-width:600px){.answer-grid{grid-template-columns:repeat(2,1fr)}}
  @media print{body{max-width:none}.question{break-inside:avoid}section.key{break-before:page}}
  </style></head><body><header><h1>Ensayo PAES · Competencia Lectora</h1>
  <p>Versión: ${version === "profesor" ? "Profesor" : "Estudiante"} · Preguntas: ${exam.items.length} · Matriz: ${escapeHtml(matrix.version)}</p>
  <p>Material de práctica EducAntay; no es una prueba oficial DEMRE.</p></header>
  ${sections}${answerSheet}${key}</body></html>`;
}
