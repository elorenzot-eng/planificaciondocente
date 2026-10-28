import { reviewLectoraExam, type ReviewedLectoraMatrix } from "./lectora-review";
import type { LectoraExam } from "./lectora";

type PrintVersion = "estudiante" | "profesor";
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c] ?? c));

/** Hoja OMR independiente: 65 filas, cuatro óvalos por pregunta y marcas de registro. */
export function createLectoraAnswerSheetHtml(questionCount: number, examId: string): string {
  if (questionCount !== 65) throw new Error("La hoja OMR requiere 65 preguntas.");
  const safeId = escapeHtml(examId);
  const columns = [0, 22, 44].map((start, column) =>
    `<div class="column" data-column="${column + 1}">${Array.from({length:Math.min(22,65-start)},(_,offset)=>{
      const number=start+offset+1;
      return `<div class="answer-row" data-question="${number}"><span class="number">${String(number).padStart(2,"0")}</span>${["A","B","C","D"].map(letter=>`<span class="choice"><svg viewBox="0 0 18 18" width="18" height="18" aria-label="${letter}"><ellipse cx="9" cy="9" rx="6.5" ry="7" fill="white" stroke="black" stroke-width="1.2"/></svg><span>${letter}</span></span>`).join("")}</div>`;
    }).join("")}</div>`).join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Hoja de respuestas PAES Lectora · ${safeId}</title><style>
  @page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#000;background:white;margin:0;font-size:10pt}
  .sheet{position:relative;width:190mm;height:277mm;margin:0 auto;padding:13mm 7mm 8mm;border:1px solid #bbb}
  .mark{position:absolute;background:#000;width:6mm;height:6mm}.tl{top:2mm;left:2mm}.tr{top:2mm;right:2mm}.bl{bottom:2mm;left:2mm}.br{bottom:2mm;right:2mm}
  h1{font-size:15pt;margin:0 0 3mm}p{margin:2mm 0}.fields{margin:7mm 0 5mm;line-height:2.5}.exam-id{font-family:monospace;font-size:8pt;overflow-wrap:anywhere}
  .columns{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin-top:6mm}.answer-row{height:8mm;display:flex;align-items:center;gap:1.5mm;border-bottom:.2mm solid #ddd;white-space:nowrap}
  .number{font-size:9pt;font-weight:bold;width:7mm}.choice{display:flex;align-items:center;gap:.4mm;font-size:7pt}.choice svg{width:5mm;height:5mm;flex-shrink:0}
  .note{font-size:8pt;margin-top:7mm}.footer{position:absolute;bottom:10mm;font-size:7pt}
  @media print{.sheet{border:0}body{margin:0}}@media screen{body{padding:12px}.sheet{box-shadow:0 0 8px #bbb}}
  </style></head><body><main class="sheet" data-omr-version="paes-lectora-65-v1" data-exam-id="${safeId}">
  <i class="mark tl"></i><i class="mark tr"></i><i class="mark bl"></i><i class="mark br"></i>
  <h1>EDUCANTAY · Hoja de respuestas PAES</h1><p>Competencia Lectora · 65 preguntas · Marque un óvalo por pregunta</p>
  <p class="exam-id">ID de ensayo: ${safeId}</p>
  <div class="fields">Nombre: ____________________________________________________<br>RUT: _________________________ Curso: __________ Fecha: ______________</div>
  <div class="columns">${columns}</div>
  <p class="note">Rellene completamente el óvalo elegido con lápiz oscuro. No marque fuera de los óvalos. No doble ni recorte las marcas negras.</p>
  <div class="footer">Imprimir al 100% · Tamaño A4 · Sin ajustar a página · Hoja independiente para lectura óptica (OMR)</div>
  </main></body></html>`;
}

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
      return `<div class="question"><h3>Pregunta ${n}</h3><div class="question-content"><p>${escapeHtml(item.stem)}</p><ol class="options">${options}</ol>${answer}</div></div>`;
    }).join("");
    return `<section><article class="passage">${escapeHtml(passage.body)}</article><p class="source">Fuente: ${escapeHtml(passage.sourceAttribution)}</p>${questions}</section>`;
  }).join("");
  const textNumbers = new Map(exam.texts.map((text, index) => [text.id, index + 1]));
  const answerSheet = version === "estudiante" ?
    `<section class="answers"><h2>Hoja de respuestas · Competencia Lectora</h2><p>Nombre: __________________________ RUT: ______________ Curso: __________ Fecha: __________</p><p>Marca una sola alternativa por pregunta.</p><div class="answer-grid">${printedItems.map((_,i) =>
      `<div class="answer-row"><strong>${i+1}.</strong> <span class="bubble">○ A</span> <span class="bubble">○ B</span> <span class="bubble">○ C</span> <span class="bubble">○ D</span></div>`
    ).join("")}</div></section>` : "";
  const key = version === "profesor" ?
    `<section class="key"><h2>Tabla de especificaciones del ensayo</h2><table><thead><tr><th>N.º</th><th>Clave</th><th>Habilidad</th><th>Género</th><th>Texto</th></tr></thead><tbody>${printedItems.map((item, i) =>
      `<tr><td>${i + 1}</td><td>${"ABCD"[item.correctIndex]}</td><td>${escapeHtml(item.skill)}</td><td>${escapeHtml(item.genre)}</td><td>Texto ${textNumbers.get(item.textId) ?? "—"}</td></tr>`
    ).join("")}</tbody></table></section>` : "";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ensayo PAES Competencia Lectora - ${version}</title><style>
  @page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#18233a;font-size:11pt;line-height:1.45;max-width:800px;margin:auto}
  header{border-bottom:2px solid #0d9488;padding-bottom:12px}h1{font-size:20pt;margin:4px 0}h2{font-size:14pt;color:#17233c}.eyebrow{color:#008b87;font-weight:bold;font-size:11pt}.exam-meta{margin:4px 0;font-size:10pt}.student-fields{margin:4px 0;font-size:10pt}
  .passage{white-space:pre-wrap;margin:14px 0}.source{font-size:9pt;color:#555}
  .question{break-inside:avoid;display:flex;gap:18px;margin:16px 0;border-top:1px solid #e2e8f0;padding-top:12px}.question h3{font-weight:bold;min-width:16px;font-size:11pt;margin:0}.question-content{flex:1;min-width:0}.question-content p{margin:0 0 8px}.options{list-style:none;padding-left:0;margin:6px 0}.options li{padding:3px 0}.passage{color:#17233c}
  aside{background:#edf9f7;padding:10px;border-left:3px solid #0d9488}table{border-collapse:collapse;width:100%;font-size:9pt}
  td,th{border:1px solid #aaa;padding:5px;text-align:left}section{margin-top:20px}
  .answers{break-before:page;page-break-before:always;margin-top:0}
.answers h2{margin:0 0 6px}.answers p{margin:0 0 9px;font-size:9pt}
.answer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px 10px}
.answer-row{font-size:8pt;white-space:nowrap;padding:3px 0;border-bottom:1px solid #e2e8f0;break-inside:avoid}.bubble{display:inline-block;margin-left:5px}
.answers{font-size:9pt}
  @media screen and (max-width:600px){.answer-grid{grid-template-columns:repeat(2,1fr)}}
  @media print{body{max-width:none}.question{break-inside:avoid}section.key{break-before:page}}
  </style></head><body><header><div class="eyebrow">EDUCANTAY · ENSAYOS PAES IA</div><h1>Competencia Lectora</h1>
  <p class="exam-meta">Prueba del ${version === "profesor" ? "profesor" : "estudiante"} · ${exam.items.length} preguntas · Tiempo de referencia: 2 h 30 min</p>
  ${version === "estudiante" ? `<p class="student-fields">Nombre: __________________________________ Curso: __________ Fecha: __________</p>` : ""}
  <p class="exam-meta">Material de práctica original. No corresponde a una prueba oficial DEMRE.</p></header>
  ${sections}${answerSheet}${key}</body></html>`;
}
