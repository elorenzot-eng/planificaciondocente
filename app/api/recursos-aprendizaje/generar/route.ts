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
  const requestedGrade = String(body.grade || "4");
  if (!allowed.some(x => x === moduleId) || !["Inicial","Intermedio","Avanzado"].includes(difficulty) || !Number.isInteger(quantity) || quantity < 1 || quantity > 40 || !["Diagnóstico","Práctica","Simulacro"].includes(mode) || !["2","4","6","8"].includes(requestedGrade)) {
    return NextResponse.json({ error: "Parámetros fuera de rango." }, { status: 400 });
  }
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Generación IA no configurada." }, { status: 503 });
  const grade = moduleId.startsWith("simce") ? `${requestedGrade}° básico` : "2° básico";
  const simce = moduleId.startsWith("simce");
  const specification = simce ? {level:grade,subject:moduleId==="simce-lectura"?"Lectura":"Matemática",dimensions:moduleId==="simce-lectura"?["Localizar información","Interpretar y relacionar","Reflexionar y evaluar"]:["Números y operaciones","Patrones y álgebra","Geometría","Medición","Datos y probabilidades"],questionCount:quantity,scoring:"Un punto por respuesta correcta; porcentaje de logro. No estimar puntaje oficial SIMCE."} : null;
  const instruction = [
    "Eres especialista en currículum escolar chileno. Genera material ORIGINAL, claro, apropiado para la edad y revisable por un docente.",
    "No atribuyas preguntas a SIMCE ni afirmes que sean oficiales. No inventes códigos ni textos oficiales de OA.",
    "Devuelve exclusivamente JSON válido con estructura: {title:string, introduction:string, activities:[{number:number, stimulus:string, question:string, options:string[], correctAnswer:string, explanation:string, skill:string}], teacherNotes:string}.",
    "Para selección múltiple entrega cuatro alternativas distintas y una única respuesta correcta que coincida exactamente con una alternativa. Para actividades abiertas deja options=[] y correctAnswer como respuesta modelo.",
    "Para fluidez lectora entrega textos breves y pautas de observación; no inventes resultados de estudiantes.",
    "Si el módulo es SIMCE, incluye specificationTable como arreglo con una fila por ítem: {number:number, curricularAxis:string, learningObjective:string, skill:string, difficulty:string, points:number, correctAnswer:string}. Los números deben coincidir con activities; asigna 1 punto por ítem. Distribuye habilidades/ejes y complejidades de manera equilibrada, coherente con el currículum del nivel solicitado. No inventes códigos OA oficiales; si no hay OA proporcionado utiliza descripciones curriculares revisables.",
    "Para 2° básico, aplica estrictamente el MODELO PEDAGÓGICO correspondiente al módulo, con contenido y ejemplos originales; no reproduzcas textos, imágenes, logos, diagramación exacta ni preguntas de los documentos de referencia.",
    "MODELO PRECURSORES (2° básico): cuadernillo de actividades numeradas y visuales, con un ejemplo resuelto inicial (ítem 0) por tipo de ejercicio. Secuencia de reconocimiento de sílabas y sonidos, discriminación entre letras/palabras y pseudopalabras, correspondencia imagen-palabra, reconocimiento de palabras en contextos y sonidos iniciales/finales. Preferir tres alternativas A/B/C por ítem y consignas breves. Para estímulos visuales, describir la ilustración original requerida en stimulus; no afirmar que ya existe una imagen. No convertirlo en una prueba de lectura de textos extensos.",
    "MODELO COMPRENSIÓN (2° básico): cuadernillo con instrucciones iniciales, al menos un texto narrativo y uno informativo originales, agrupación de 2 a 4 preguntas por texto, tres alternativas A/B/C para selección múltiple y al menos una pregunta abierta que pida justificar con evidencia textual. Evaluar información explícita, inferencias simples, tema central y relación entre imagen y texto. Cada stimulus debe incluir el texto íntegro necesario para responder; evitar fragmentos inconexos. No inventar ilustraciones existentes.",
    "Incluye en el JSON workbookType ('precursores' o 'comprension' cuando corresponda), studentInstructions y coverSubtitle; conserva activities, y en teacherNotes agrega orientaciones de aplicación y revisión. Para preguntas abiertas options=[] y correctAnswer es una respuesta modelo.",
  ].join("\n");
  const prompt = JSON.stringify({moduleId,grade,difficulty,oa:oa || "OA por definir y validar por docente",quantity,mode,specification});
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
    if (simce) { const table = result.specificationTable; if (!Array.isArray(table) || table.length !== result.activities.length || result.activities.length !== quantity || !table.every((row:any,i:number)=>row && row.number===i+1 && row.points===1 && typeof row.skill==="string" && typeof row.curricularAxis==="string" && typeof row.learningObjective==="string" && typeof row.correctAnswer==="string")) throw new Error("Invalid specification table"); result.scoring = {maximumPoints:quantity,method:"1 punto por respuesta correcta; porcentaje de logro",officialSimceScore:false}; }
    if ((moduleId === "precursores" || moduleId === "cuadernillos") && (!result.studentInstructions || typeof result.studentInstructions !== "string" || result.activities.some((a:any)=>!Array.isArray(a.options) || (a.options.length!==0 && a.options.length!==3)))) throw new Error("Invalid second-grade workbook");
    const charged = await prisma.user.updateMany({ where: { id: account.id, active: true, ...(account.monthlyAiLimit !== null ? { monthlyAiUsed: { lt: account.monthlyAiLimit } } : {}) }, data: { monthlyAiUsed: { increment: 1 } } });
    if (!charged.count) return NextResponse.json({ error: "Límite de generaciones IA alcanzado." }, { status: 429 });
    return NextResponse.json({resource:result,grade,moduleId,notice:"Borrador generado con IA. Revisión docente obligatoria antes de utilizar."});
  } catch {
    return NextResponse.json({error:"La generación no pudo completarse. Vuelve a intentarlo."},{status:502});
  }
}
