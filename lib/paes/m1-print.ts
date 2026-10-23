import type { M1Exam } from "./m1";
import { validateM1 } from "./m1";
import { validateM1Full, M1_FULL_CONFIG } from "./m1-full";

const esc = (s: string) => String(s).replace(/[&<>"']/g, c =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"} as Record<string,string>)[c] || c
);
const formatted = (s:string) => esc(s).replace(/\r?\n/g,"<br>");

/** Documento A4 listo para imprimir o guardar como PDF desde el navegador. */
export function createM1Print(exam:M1Exam,teacher:boolean):string {
  const isFull=exam.version===M1_FULL_CONFIG.version;
  const errors=isFull?validateM1Full(exam):validateM1(exam);
  if(errors.length)throw new Error(errors.join(" | "));
  const title=teacher?"Solucionario docente":"Prueba del estudiante";
  const questions=exam.items.map((q,i)=>`
    <article class="question">
      <div class="question-title"><strong>${i+1}.</strong><div>${formatted(q.stem)}</div></div>
      <ol class="options" type="A">${q.options.map(o=>`<li>${formatted(o)}</li>`).join("")}</ol>
      ${teacher?`<div class="solution">
        <p class="key"><strong>Alternativa correcta: ${"ABCD"[q.correctIndex]}</strong></p>
        <p><strong>Desarrollo:</strong> ${formatted(q.solution)}</p>
        <p><strong>Verificación:</strong> ${formatted(q.verification)}</p>
        <p class="meta"><strong>Eje:</strong> ${esc(q.area)} &nbsp; <strong>Habilidad:</strong> ${esc(q.skill)}</p>
      </div>`:""}
    </article>`).join("");
  const answerSheet=teacher?"":`
    <section class="answer-sheet">
      <h2>Hoja de respuestas</h2>
      <p>Marca una alternativa por pregunta.</p>
      <div class="answer-grid">${exam.items.map((_,i)=>`<div class="answer-row"><b>${String(i+1).padStart(2,"0")}</b><span>◯ A</span><span>◯ B</span><span>◯ C</span><span>◯ D</span></div>`).join("")}</div>
    </section>`;
  const specifications=teacher?`
    <section class="specifications">
      <h2>Tabla de especificaciones · Matemática M1</h2>
      <p>Distribución de este ensayo generado por EducAntay. No es tabla oficial DEMRE.</p>
      <table><thead><tr><th>N.º</th><th>Eje temático</th><th>Habilidad</th><th>Clave</th></tr></thead>
      <tbody>${exam.items.map((q,i)=>`<tr><td>${i+1}</td><td>${esc(q.area)}</td><td>${esc(q.skill)}</td><td>${"ABCD"[q.correctIndex]}</td></tr>`).join("")}</tbody></table>
    </section>`:"";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>EducAntay PAES M1 - ${title}</title>
<style>
@page{size:A4 portrait;margin:13mm 15mm 14mm}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;font-size:10.5pt;line-height:1.4;color:#17233c;background:white}
header{border-bottom:2px solid #0d9488;padding:0 0 11px;margin-bottom:16px}
header .brand{color:#0d9488;font-size:11pt;font-weight:700;letter-spacing:.4px}
h1{font-size:19pt;line-height:1.18;margin:7px 0}
header p{font-size:9.5pt;margin:5px 0}
h2{font-size:13pt;color:#0b766e}
.question{border-top:1px solid #d8e3eb;padding:11px 0 10px;margin:0;break-inside:auto;page-break-inside:auto}
.question-title{display:flex;align-items:flex-start;gap:9px;font-size:11pt;break-after:avoid}
.question-title strong{min-width:24px}
.options{padding-left:46px;margin:8px 0 0;list-style-type:upper-alpha}
.options li{padding:1px 0 2px 5px;break-inside:avoid}
.solution{border-left:3px solid #0d9488;background:#f0faf8;padding:8px 11px;margin:9px 0 0;font-size:9.5pt;break-inside:auto}
.solution p{margin:4px 0}
.solution .key{color:#065f58}
.meta{font-size:8.5pt;color:#526078}
.answer-sheet{break-before:page;page-break-before:always}
.answer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px 10px}
.answer-row{display:flex;justify-content:space-between;align-items:center;gap:2px;border-bottom:1px solid #dce5ec;padding:2px 1px;font-size:8pt;break-inside:avoid;white-space:nowrap}
.answer-row b{min-width:17px}
.answer-sheet h2{margin:0 0 5px}.answer-sheet p{margin:0 0 8px;font-size:9pt}
.specifications{break-before:page;page-break-before:always}
.specifications table{border-collapse:collapse;width:100%;font-size:8.5pt}
.specifications th,.specifications td{border:1px solid #cbd5e1;padding:4px 6px;text-align:left}
.specifications th{background:#e7f5f2}
.specifications tr{break-inside:avoid}
.footer{border-top:1px solid #dce5ec;margin-top:20px;padding-top:8px;font-size:8pt;color:#64748b}
.toolbar{position:sticky;top:0;display:flex;justify-content:center;gap:12px;padding:10px;background:#e9f7f5;z-index:10}
.toolbar button{background:#0d9488;color:white;border:0;border-radius:8px;padding:10px 18px;font-weight:700;cursor:pointer}
@media print{
  .toolbar{display:none!important}
  body{font-size:10.5pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  a{color:inherit;text-decoration:none}
}
@media screen{body{max-width:900px;margin:auto;padding:0 18px 30px}.question{padding:16px 0}}
</style></head><body>
<div class="toolbar"><button type="button" onclick="window.print()">Imprimir / Guardar como PDF</button></div>
<header><div class="brand">EDUCANTAY · ENSAYOS PAES IA</div>
<h1>Competencia Matemática M1</h1>
<p><strong>${title}</strong> · ${exam.items.length} preguntas ${isFull?"· Tiempo de referencia: 2 h 20 min":""}</p>
${teacher?"<p>Uso docente: incluye claves, desarrollos y verificaciones.</p>":"<p>Nombre: ______________________________________ Curso: __________ Fecha: ______________</p>"}
<p>Material de práctica original. No corresponde a una prueba oficial DEMRE.</p></header>
<main>${questions}${answerSheet}${specifications}</main>
<footer class="footer">EducAntay · Material educativo de práctica PAES M1</footer>
</body></html>`;
}
