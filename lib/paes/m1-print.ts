import type { M1Exam } from "./m1";
import { validateM1 } from "./m1";
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
export function createM1Print(exam:M1Exam,teacher:boolean):string {
  const errors=validateM1(exam);
  if(errors.length)throw new Error(errors.join(" | "));
  const questions=exam.items.map((q,i)=>`<section class="q"><h3>${i+1}. ${esc(q.stem)}</h3><ol type="A">${q.options.map(o=>`<li>${esc(o)}</li>`).join("")}</ol>${teacher?`<aside><strong>Respuesta: ${"ABCD"[q.correctIndex]}</strong><p><strong>Desarrollo:</strong> ${esc(q.solution)}</p><p><strong>Verificación:</strong> ${esc(q.verification)}</p><p>${esc(q.area)} · ${esc(q.skill)}</p></aside>`:""}</section>`).join("");
  const answer=teacher?"":`<section><h2>Hoja de respuestas</h2><div class="answers">${exam.items.map((_,i)=>`<div>${i+1}. ○ A &nbsp; ○ B &nbsp; ○ C &nbsp; ○ D</div>`).join("")}</div></section>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>PAES M1 · ${teacher?"Solucionario docente":"Prueba estudiante"}</title><style>@page{size:A4;margin:15mm}body{font:11pt Arial,sans-serif;color:#18233a;line-height:1.4}header{border-bottom:3px solid #0d9488}h1{font-size:21pt}h2{color:#0d766e}.q{break-inside:avoid;margin:18px 0}.q li{margin:7px 0}aside{background:#edf9f7;padding:10px;border-left:3px solid #0d9488}.answers{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}</style></head><body><header><h1>PAES · Competencia Matemática M1</h1><p>${teacher?"Solucionario docente":"Prueba estudiante"} · Piloto EducAntay · 10 preguntas</p><p>Material de práctica original; no es prueba oficial DEMRE.</p></header>${questions}${answer}</body></html>`;
}
