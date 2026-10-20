import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

const allowed = ["precursores","cuadernillos","simce-lectura","simce-matematica","fluidez"] as const;
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  const account = await prisma.user.findUnique({ where: { id: String(session.id) }, select: { id: true, active: true, monthlyAiLimit: true, monthlyAiUsed: true } });
  if (!account?.active) return NextResponse.json({ error: "Cuenta inactiva." }, { status: 403 });
  if (account.monthlyAiLimit !== null && account.monthlyAiUsed >= account.monthlyAiLimit) return NextResponse.json({ error: "Límite de generaciones IA alcanzado." }, { status: 429 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const moduleId = String(body.moduleId || "");
  const difficulty = String(body.difficulty || "");
  const oa = String(body.oa || "").trim().slice(0, 300);
  const quantity = Number(body.quantity);
  const mode = String(body.mode || "Práctica");
  if (!allowed.some(x => x === moduleId) || !["Inicial","Intermedio","Avanzado"].includes(difficulty) || !Number.isInteger(quantity) || quantity < 1 || quantity > 40 || !["Diagnóstico","Práctica","Simulacro"].includes(mode)) {
    return NextResponse.json({ error: "Parámetros fuera de rango." }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Generación IA no configurada." }, { status: 503 });
  const grade = moduleId.startsWith("simce") ? "4° básico" : "2° básico";
  const instruction = [
    "Eres especialista en currículum escolar chileno. Genera material ORIGINAL, claro, apropiado para la edad y revisable por un docente.",
    "No atribuyas preguntas a SIMCE ni afirmes que sean oficiales. No inventes códigos ni textos oficiales de OA.",
    "Devuelve exclusivamente JSON válido con estructura: {title:string, introduction:string, activities:[{number:number, stimulus:string, question:string, options:string[], correctAnswer:string, explanation:string, skill:string}], teacherNotes:string}.",
    "Para selección múltiple entrega cuatro alternativas distintas y una única respuesta correcta que coincida exactamente con una alternativa. Para actividades abiertas deja options=[] y correctAnswer como respuesta modelo.",
    "Para fluidez lectora entrega textos breves y pautas de observación; no inventes resultados de estudiantes."
  ].join("\n");
  const prompt = JSON.stringify({moduleId,grade,difficulty,oa:oa || "OA por definir y validar por docente",quantity,mode});
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:process.env.OPENAI_MODEL || "gpt-4o-mini",temperature:0.4,response_format:{type:"json_object"},messages:[{role:"system",content:instruction},{role:"user",content:prompt}]}),
      signal:AbortSignal.timeout(90000)
    });
    if (!response.ok) return NextResponse.json({error:"No fue posible generar el recurso. Intenta nuevamente."},{status:502});
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (typeof raw !== "string") throw new Error("Empty response");
    const result = JSON.parse(raw);
    if (!result || typeof result.title !== "string" || !Array.isArray(result.activities) || result.activities.length === 0 || result.activities.length > 40) throw new Error("Invalid structure");
    const charged = await prisma.user.updateMany({ where: { id: account.id, active: true, ...(account.monthlyAiLimit !== null ? { monthlyAiUsed: { lt: account.monthlyAiLimit } } : {}) }, data: { monthlyAiUsed: { increment: 1 } } });
    if (!charged.count) return NextResponse.json({ error: "Límite de generaciones IA alcanzado." }, { status: 429 });
    return NextResponse.json({resource:result,grade,moduleId,notice:"Borrador generado con IA. Revisión docente obligatoria antes de utilizar."});
  } catch {
    return NextResponse.json({error:"La generación no pudo completarse. Vuelve a intentarlo."},{status:502});
  }
}
