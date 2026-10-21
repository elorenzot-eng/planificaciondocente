import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

function normalizeSimceAnswers(result: any): boolean {
  if (!Array.isArray(result.activities)) return false;
  for (let n=0;n<result.activities.length;n++) {
    const item=result.activities[n];
    const original=Array.isArray(item.options)?item.options:[];
    if(original.length!==4) {console.error("SIMCE validation: option count",n+1,original.length);return false;}
    const strip=(v:string)=>v.trim().replace(/^[A-D][).:\-]\s*/i,"").trim();
    const options=original.map((o:unknown)=>typeof o==="string"?strip(o):"");
    if(options.some((o:string)=>!o) || new Set(options.map((o:string)=>o.toLocaleLowerCase("es"))).size!==4) {console.error("SIMCE validation: blank or duplicate options",n+1);return false;}
    const raw=String(item.correctAnswer??"").trim();
    let index=-1;
    const exact=options.map((o:string,i:number)=>o.toLocaleLowerCase("es")===strip(raw).toLocaleLowerCase("es")?i:-1).filter((i:number)=>i>=0);
    if(exact.length===1) index=exact[0];
    if(index<0) {
      const letter=raw.match(/^([A-D])(?:[).:\-]\s*.*)?$/i);
      if(letter) index=letter[1].toUpperCase().charCodeAt(0)-65;
    }
    if(index<0 && Number.isInteger(item.correctOptionIndex) && item.correctOptionIndex>=0 && item.correctOptionIndex<4) index=item.correctOptionIndex;
    if(index<0) {console.error("SIMCE validation: unresolvable answer",n+1,"answer",raw.slice(0,70));return false;}
    item.options=options;
    item.correctAnswer=options[index];
    item.correctOptionIndex=index;
    item.itemType="seleccion_multiple";
  }
  if(Array.isArray(result.specificationTable)) for(let i=0;i<result.specificationTable.length;i++) {
    if(result.specificationTable[i]&&result.activities[i]) result.specificationTable[i].correctAnswer=result.activities[i].correctAnswer;
  }
  return true;
}

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
  const oa = String(body.oa || "").trim().slice(0, 6000);
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
    "ENSAYOS AUTOMÁTICOS: el usuario no elige OA. Para cada ensayo distribuye autónomamente las preguntas entre los ejes y habilidades pertinentes al nivel y asignatura. Si recibes OA verificados, distribuye ítems entre ellos; si no, usa descripciones curriculares sin códigos oficiales inventados. Registra la correspondencia de cada pregunta en specificationTable. No solicites al usuario seleccionar OA ni afirmes cobertura curricular oficial completa.",
    "Devuelve exclusivamente JSON válido con estructura: {title:string, introduction:string, activities:[{number:number, stimulus:string, question:string, options:string[], correctAnswer:string, explanation:string, skill:string}], teacherNotes:string}.",
    "Para selección múltiple de 2° básico entrega exactamente TRES alternativas A/B/C; para ensayos de 4°, 6° y 8° básico entrega CUATRO alternativas A/B/C/D. Cada pregunta debe tener una única respuesta correcta y correctAnswer debe coincidir exactamente con el texto de una alternativa (sin prefijo A/B/C/D). Para actividades abiertas deja options=[] y correctAnswer como respuesta modelo.",
    "REFERENCIA PEDAGÓGICA: Ejemplos de preguntas Educación Básica 2018, Agencia de Calidad de la Educación (solo como patrón metodológico, no reproducir ítems, textos ni imágenes). El documento presenta ejemplos de Lectura y Matemática de 4° y 6° básico; NO incluye ejemplos de 8° básico. No atribuyas al documento requisitos oficiales de 8°.",
    "ENSAYOS LECTURA 4°, 6° y 8°: construir varios textos originales completos y variados, literarios y no literarios, con 2 a 5 preguntas relacionadas por texto. Incluir passages:[{id:string,title:string,type:string,text:string,illustrationDescription:string}] y passageId en cada activity. No repetir el texto completo en stimulus por cada pregunta. Equilibrar localizar información explícita, interpretar y relacionar (inferencias, causa-consecuencia, vocabulario contextual) y reflexionar/evaluar con evidencia textual. En esta versión los ensayos SIMCE son exclusivamente de selección múltiple A/B/C/D; no incluir preguntas abiertas.",
    "ENSAYOS MATEMÁTICA 4°, 6° y 8°: variar problemas rutinarios y no rutinarios, situaciones contextualizadas, operaciones y procedimientos, representaciones de fracciones o números, patrones y álgebra, geometría, medición, gráficos, tablas y datos, según OA efectivamente seleccionados y pertinencia del nivel. Algunas preguntas requieren un esquema, gráfico o figura: especificar en stimulus una descripción verificable, nunca dar por existente una imagen no generada. No crear preguntas cuya respuesta dependa de un gráfico ausente.",
    "En cada pregunta SIMCE, correctAnswer debe ser EXACTAMENTE el texto de una de las cuatro alternativas de options, sin letra A/B/C/D ni prefijos. Incluye también correctOptionIndex como índice entero 0,1,2,3 de la alternativa correcta. Antes de devolver JSON verifica que cada pregunta tenga 4 alternativas distintas y clave inequívoca.",
    "CALIDAD DE ÍTEMS SIMCE: generar exclusivamente selección múltiple A/B/C/D para permitir corrección automática. Los distractores deben representar errores plausibles (confusión de datos, inferencia incorrecta, procedimiento incompleto, lectura errónea de gráficos), no respuestas absurdas. Para cada activity agrega itemType ('seleccion_multiple'), distractorRationales como objeto opcional por alternativa incorrecta, scoringCriteria para desarrollo y explanation con fundamento comprobable. En specificationTable incluye además itemType y evidence cuando aplique. La dificultad es cualitativa; no asignar puntajes oficiales SIMCE ni inferir escala psicométrica.",
    "MODELO FLUIDEZ (2° básico): genera textos breves, originales, progresivos y apropiados a la edad para lectura en voz alta. Cada actividad incluye un texto completo en stimulus, una consigna concreta en question y options=[] (no es prueba de selección múltiple); correctAnswer debe describir el criterio de observación, no inventar desempeño ni resultados del estudiante. En teacherNotes incluye pauta para registrar palabras leídas, errores, tiempo en segundos, palabras correctas por minuto y observaciones, dejando todos los resultados sin completar. Incluye studentInstructions y coverSubtitle.",
    "Si el módulo es SIMCE, incluye specificationTable como arreglo con una fila por ítem: {number:number, curricularAxis:string, learningObjective:string, skill:string, difficulty:string, points:number, correctAnswer:string}. Los números deben coincidir con activities; asigna 1 punto por ítem. Distribuye habilidades/ejes y complejidades de manera equilibrada, coherente con el currículum del nivel solicitado. No inventes códigos OA oficiales; si no hay OA proporcionado utiliza descripciones curriculares revisables.",
    "Para 2° básico, aplica estrictamente el MODELO PEDAGÓGICO correspondiente al módulo, con contenido y ejemplos originales; no reproduzcas textos, imágenes, logos, diagramación exacta ni preguntas de los documentos de referencia.",
    "MODELO PRECURSORES (2° básico): cuadernillo de actividades numeradas y visuales, con un ejemplo resuelto inicial (ítem 0) por tipo de ejercicio. Secuencia de reconocimiento de sílabas y sonidos, discriminación entre letras/palabras y pseudopalabras, correspondencia imagen-palabra, reconocimiento de palabras en contextos y sonidos iniciales/finales. Preferir tres alternativas A/B/C por ítem y consignas breves. Para estímulos visuales, describir la ilustración original requerida en stimulus; no afirmar que ya existe una imagen. No convertirlo en una prueba de lectura de textos extensos.",
    "MODELO COMPRENSIÓN (2° básico): cuadernillo con instrucciones iniciales, al menos un texto narrativo y uno informativo originales, agrupación de 2 a 4 preguntas por texto, tres alternativas A/B/C para selección múltiple y al menos una pregunta abierta que pida justificar con evidencia textual. Evaluar información explícita, inferencias simples, tema central y relación entre imagen y texto. Devuelve passages:[{id:string,title:string,type:\"narrativo\"|\"informativo\",text:string,illustrationDescription:string}] con textos originales completos, y en cada activity agrega passageId correspondiente. Usa stimulus solo para estímulos adicionales de la pregunta; NO repitas el texto completo en cada pregunta. No inventes ilustraciones existentes.",
    "Incluye en el JSON workbookType ('precursores' o 'comprension' cuando corresponda), studentInstructions y coverSubtitle; conserva activities, y en teacherNotes agrega orientaciones de aplicación y revisión. Para preguntas abiertas options=[] y correctAnswer es una respuesta modelo.",
  ].filter(line => simce ? (!line.includes("2° básico") && !line.includes("MODELO PRECURSORES") && !line.includes("MODELO COMPRENSIÓN") && !line.includes("MODELO FLUIDEZ") && !line.includes("workbookType")) : (!line.startsWith("ENSAYOS ") && !line.startsWith("CALIDAD DE ÍTEMS SIMCE") && !line.startsWith("En cada pregunta SIMCE") && !line.startsWith("Si el módulo es SIMCE") && !line.startsWith("REFERENCIA PEDAGÓGICA") && (!line.startsWith("MODELO ") || (moduleId==="precursores" && line.startsWith("MODELO PRECURSORES")) || (moduleId==="cuadernillos" && line.startsWith("MODELO COMPRENSIÓN")) || (moduleId==="fluidez" && line.startsWith("MODELO FLUIDEZ"))))).join("\n");
  const prompt = JSON.stringify({moduleId,grade,difficulty,oa:oa || "OA por definir y validar por docente",quantity,mode,specification});
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({model:process.env.OPENAI_MODEL || "gpt-4o-mini",temperature:0.3,max_tokens:14000,response_format:{type:"json_object"},messages:[{role:"system",content:instruction},{role:"user",content:prompt}]}),
      signal:AbortSignal.timeout(90000)
    });
    if (!response.ok) return NextResponse.json({error:"No fue posible generar el recurso. Intenta nuevamente."},{status:502});
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content;
    if (typeof raw !== "string") throw new Error("Empty response");
    if (data.choices?.[0]?.finish_reason==="length") throw new Error("Response truncated due to token limit");
    const result = JSON.parse(raw);
    if (!result || typeof result.title !== "string" || !Array.isArray(result.activities) || result.activities.length === 0 || result.activities.length > 40) throw new Error("Invalid structure");
    if (simce && !normalizeSimceAnswers(result)) throw new Error("Invalid answer choices after normalization");
    if (simce) {
      if (result.activities.length !== quantity) throw new Error("Incorrect question count");
      const rows = Array.isArray(result.specificationTable) ? result.specificationTable : [];
      result.activities.forEach((item:any,i:number) => {
        item.number = i+1;
        if (!item.skill || typeof item.skill !== "string") item.skill = "Habilidad por revisar";
      });
      result.specificationTable = result.activities.map((item:any,i:number) => {
        const source = rows.find((row:any) => Number(row?.number)===i+1) || rows[i] || {};
        return {
          ...source,
          number:i+1,
          curricularAxis:typeof source.curricularAxis==="string" && source.curricularAxis.trim()?source.curricularAxis:(moduleId==="simce-lectura"?"Lectura":"Matemática"),
          learningObjective:typeof source.learningObjective==="string" && source.learningObjective.trim()?source.learningObjective:"Objetivo de aprendizaje por revisar por el docente",
          skill:typeof source.skill==="string" && source.skill.trim()?source.skill:item.skill,
          difficulty:typeof source.difficulty==="string" && source.difficulty.trim()?source.difficulty:difficulty,
          points:1,
          correctAnswer:item.correctAnswer
        };
      });
      result.scoring = {maximumPoints:quantity,method:"1 punto por respuesta correcta; porcentaje de logro",officialSimceScore:false};
    }
    if (moduleId === "cuadernillos" && (!Array.isArray(result.passages) || result.passages.length < 2 || !result.passages.some((p:any)=>p.type==="narrativo") || !result.passages.some((p:any)=>p.type==="informativo") || result.activities.some((a:any)=>!result.passages.some((p:any)=>p.id===a.passageId)))) throw new Error("Invalid reading passages");
    if ((moduleId === "precursores" || moduleId === "cuadernillos") && (!result.studentInstructions || typeof result.studentInstructions !== "string" || result.activities.some((a:any)=>!Array.isArray(a.options) || (a.options.length!==0 && a.options.length!==3) || (a.options.length===3 && !a.options.includes(a.correctAnswer))))) throw new Error("Invalid second-grade workbook");
    const charged = await prisma.user.updateMany({ where: { id: account.id, active: true, ...(account.monthlyAiLimit !== null ? { monthlyAiUsed: { lt: account.monthlyAiLimit } } : {}) }, data: { monthlyAiUsed: { increment: 1 } } });
    if (!charged.count) return NextResponse.json({ error: "Límite de generaciones IA alcanzado." }, { status: 429 });
    return NextResponse.json({resource:result,grade,moduleId,notice:"Borrador generado con IA. Revisión docente obligatoria antes de utilizar."});
  } catch (error) {
    console.error("Learning resource generation failure",error instanceof Error ? error.message : String(error));
    return NextResponse.json({error:"No se pudo completar el ensayo. Intenta con menos preguntas o vuelve a generar."},{status:502});
  }
}
