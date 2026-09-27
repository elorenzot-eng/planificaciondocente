import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";

async function currentUser(){const s=await getSession();if(!s?.id)return null;const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,role:true,active:true,organizationId:true,schoolId:true}});return u?.active?u:null}
function outputText(data:any){if(typeof data?.output_text==="string")return data.output_text;return (data?.output||[]).flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==="output_text").map((c:any)=>c.text).join("")}
export async function GET(){
 const u=await currentUser();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const where:any={academicYear:{year:2027}};if(u.role==="DOCENTE")where.teachingAssignments={some:{teacherId:u.id}};else if(u.role!=="SUPERADMIN")where.schoolId=u.schoolId||undefined;
 const courses=await prisma.course.findMany({where,include:{teachingAssignments:{where:u.role==="DOCENTE"?{teacherId:u.id}:{},select:{subject:true,teacherId:true}},academicYear:true},orderBy:{name:"asc"}});
 const objectives=await prisma.learningObjective.findMany({orderBy:[{level:"asc"},{subject:"asc"},{code:"asc"}]});
 const assessments=await prisma.assessment.findMany({where:u.role==="DOCENTE"?{userId:u.id}:u.schoolId?{course:{schoolId:u.schoolId}}:{},include:{course:true,objectives:{include:{objective:true}}},orderBy:{createdAt:"desc"},take:10});
 return NextResponse.json({courses,objectives,assessments,aiReady:!!process.env.OPENAI_API_KEY});
}
export async function POST(req:Request){
 const u=await currentUser();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY no configurada"},{status:503});
 const b=await req.json();const course=await prisma.course.findUnique({where:{id:String(b.courseId||"")},include:{teachingAssignments:true}});if(!course)return NextResponse.json({error:"Curso no encontrado"},{status:404});
 if(u.role!=="SUPERADMIN"&&course.schoolId!==u.schoolId)return NextResponse.json({error:"Curso no autorizado"},{status:403});
 const subject=String(b.subject||"").trim();if(u.role==="DOCENTE"&&!course.teachingAssignments.some(a=>a.teacherId===u.id&&a.subject===subject))return NextResponse.json({error:"No tienes esta asignación docente"},{status:403});
 const ids=Array.isArray(b.objectiveIds)?b.objectiveIds.map(String):[];const objectives=await prisma.learningObjective.findMany({where:{id:{in:ids},level:course.level,subject}});if(!objectives.length)return NextResponse.json({error:"Selecciona al menos un OA oficial"},{status:400});
 const type=String(b.type||"SUMMATIVE");if(!["DIAGNOSTIC","FORMATIVE","SUMMATIVE"].includes(type))return NextResponse.json({error:"Tipo de evaluación no válido"},{status:400});
 const instrument=String(b.instrument||"Prueba mixta");const questions=Math.max(1,Math.min(60,Number(b.questions)||20));const duration=String(b.duration||"60 minutos");const instructions=String(b.instructions||"");const totalScore=type==="SUMMATIVE"?Math.max(1,Number(b.totalScore)||questions):undefined;const difficulty=type==="SUMMATIVE"?Math.max(1,Math.min(100,Number(b.difficulty)||60)):undefined;const itemScores=type==="SUMMATIVE"&&Array.isArray(b.itemScores)?b.itemScores.map((x:any)=>Math.max(0,Number(x)||0)).slice(0,questions):[];if(type==="SUMMATIVE"&&itemScores.length===questions&&Math.abs(itemScores.reduce((a:number,v:number)=>a+v,0)-(totalScore||0))>0.001)return NextResponse.json({error:"La suma de puntajes por ítem debe coincidir con el puntaje total"},{status:400});const passingScore=type==="SUMMATIVE"?Number(((totalScore||0)*(difficulty||0)/100).toFixed(2)):undefined;
 const prompt=`Genera una evaluación escolar chilena en español. Curso: ${course.name}. Asignatura: ${subject}. Tipo: ${type}. Instrumento: ${instrument}. Cantidad referencial de ítems: ${questions}. Duración: ${duration}. OA oficiales, que no debes inventar ni modificar: ${objectives.map(o=>o.code+": "+o.text).join(" | ")}. Indicaciones: ${instructions||"ninguna"}. Devuelve SOLO JSON válido con: titulo, instrucciones, puntajeTotal, tablaEspecificaciones (array de objetos con oa, habilidad, items, puntaje), items (array de objetos con numero,tipo,enunciado,alternativas array,respuestaCorrecta,puntaje,oa), pautaCorreccion (array), nivelesLogro (array de objetos con nivel,desde,hasta,descripcion), configuracionSumativa (objeto con puntajeTotal,porcentajeExigencia,puntajeAprobacion), observaciones. Asegura alineación entre cada ítem y un OA entregado.`;
 const ai=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5.6-terra",input:prompt})});const raw=await ai.json();if(!ai.ok)return NextResponse.json({error:"La IA no pudo generar la evaluación",detail:raw?.error?.message||"Error OpenAI"},{status:502});
 let text=outputText(raw).trim().replace(/^\`\`\`json\s*/i,"").replace(/\`\`\`$/,"").trim();let generated:any;try{generated=JSON.parse(text)}catch{return NextResponse.json({error:"La IA respondió en un formato no válido. Intenta nuevamente."},{status:502})}
 const assessment=await prisma.assessment.create({data:{title:String(generated.titulo||`Evaluación ${subject} · ${course.name}`),type:type as any,track:course.track,content:generated,userId:u.id,courseId:course.id,academicYearId:course.academicYearId,objectives:{create:objectives.map(o=>({objectiveId:o.id}))}},include:{course:true,objectives:{include:{objective:true}}}});return NextResponse.json({assessment},{status:201});
}
export async function PATCH(req:Request){
 const u=await currentUser();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json();const assessment=await prisma.assessment.findUnique({where:{id:String(b.id||"")},include:{course:true}});
 if(!assessment)return NextResponse.json({error:"Evaluación no encontrada"},{status:404});
 if(u.role==="DOCENTE"&&assessment.userId!==u.id)return NextResponse.json({error:"No autorizado"},{status:403});
 if(u.role!=="SUPERADMIN"&&assessment.course.schoolId!==u.schoolId)return NextResponse.json({error:"No autorizado"},{status:403});
 if(!b.content||typeof b.content!=="object")return NextResponse.json({error:"Contenido no válido"},{status:400});
 const updated=await prisma.assessment.update({where:{id:assessment.id},data:{title:String(b.title||assessment.title),content:b.content}});
 return NextResponse.json({assessment:updated});
}