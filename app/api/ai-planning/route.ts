import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";

const pilotOA=[
 {code:"MA08 OA 01",text:"Mostrar que comprenden la multiplicación y la división de números enteros: representándolos de manera concreta, pictórica y simbólica; aplicando procedimientos usados en la multiplicación y la división de números naturales; aplicando la regla de los signos de la operación; resolviendo problemas rutinarios y no rutinarios."},
 {code:"MA08 OA 02",text:"Utilizar las operaciones de multiplicación y división con los números racionales en el contexto de la resolución de problemas: representándolos en la recta numérica; involucrando diferentes conjuntos numéricos (fracciones, decimales y números enteros)."},
 {code:"MA08 OA 03",text:"Explicar la multiplicación, la división y el proceso de formar potencias de potencias de base natural y exponente natural hasta 3, de manera concreta, pictórica y simbólica."},
 {code:"MA08 OA 07",text:"Mostrar que comprenden la noción de función por medio de un cambio lineal: utilizando tablas; usando metáforas de máquinas; estableciendo reglas entre x e y; representando de manera gráfica (plano cartesiano, diagramas de venn), de manera manual y/o con software educativo."}
];

async function currentUser(){
 const s=await getSession(); if(!s?.id)return null;
 const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,role:true,active:true,organizationId:true,schoolId:true}});
 return u?.active?u:null;
}
async function ensurePilotOA(){
 for(const oa of pilotOA){
  const exists=await prisma.learningObjective.findFirst({where:{code:oa.code,level:"8° Básico",subject:"Matemática"}});
  if(!exists)await prisma.learningObjective.create({data:{...oa,level:"8° Básico",subject:"Matemática",source:"Currículum Nacional · MINEDUC"}});
 }
}
function outputText(data:any){
 if(typeof data?.output_text==="string")return data.output_text;
 return (data?.output||[]).flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==="output_text").map((c:any)=>c.text).join("");
}
export async function GET(){
 const u=await currentUser();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 await ensurePilotOA();
 const where:any={academicYear:{year:2027}};
 if(u.role==="DOCENTE"){if(!u.schoolId)return NextResponse.json({error:"Usuario docente sin establecimiento"},{status:403});where.schoolId=u.schoolId;where.teachingAssignments={some:{teacherId:u.id}}}
 else if(u.role==="DIRECTOR"||u.role==="UTP"){if(!u.schoolId)return NextResponse.json({error:"Usuario sin establecimiento"},{status:403});where.schoolId=u.schoolId}
 else if(u.role==="SOSTENEDOR"){if(!u.organizationId)return NextResponse.json({error:"Usuario sin organización"},{status:403});where.school={organizationId:u.organizationId}};
 const courses=await prisma.course.findMany({where,include:{teachingAssignments:{where:u.role==="DOCENTE"?{teacherId:u.id}:{},select:{subject:true,teacherId:true}},academicYear:true},orderBy:{name:"asc"}});
 const objectives=await prisma.learningObjective.findMany({where:{level:"8° Básico",subject:"Matemática"},orderBy:{code:"asc"}});
 const planningScope:any=u.role==="DOCENTE"?{userId:u.id}:u.role==="SOSTENEDOR"?{course:{school:{organizationId:u.organizationId}}}:u.role==="DIRECTOR"||u.role==="UTP"?{course:{schoolId:u.schoolId}}:{};const plannings=await prisma.planning.findMany({where:planningScope,include:{course:true,objectives:{include:{objective:true}}},orderBy:{createdAt:"desc"},take:10});
 return NextResponse.json({courses,objectives,plannings,aiReady:!!process.env.OPENAI_API_KEY});
}
export async function POST(req:Request){
 const u=await currentUser();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY no configurada"},{status:503});
 const b=await req.json();
 const course=await prisma.course.findUnique({where:{id:String(b.courseId||"")},include:{academicYear:true,teachingAssignments:true,school:true}});
 if(!course)return NextResponse.json({error:"Curso no encontrado"},{status:404});
 if(u.role==="SOSTENEDOR"&&course.school.organizationId!==u.organizationId)return NextResponse.json({error:"Curso no autorizado"},{status:403});if((u.role==="DIRECTOR"||u.role==="UTP"||u.role==="DOCENTE")&&(!u.schoolId||course.schoolId!==u.schoolId))return NextResponse.json({error:"Curso no autorizado"},{status:403});
 const subject=String(b.subject||"").trim();
 if(u.role==="DOCENTE"&&!course.teachingAssignments.some(a=>a.teacherId===u.id&&a.subject===subject))return NextResponse.json({error:"No tienes esta asignación docente"},{status:403});
 const ids=Array.isArray(b.objectiveIds)?b.objectiveIds.map(String):[];
 const objectives=await prisma.learningObjective.findMany({where:{id:{in:ids},level:course.level,subject}});
 if(!objectives.length)return NextResponse.json({error:"Selecciona al menos un OA oficial disponible"},{status:400});
 const duration=String(b.duration||"90 minutos");const modality=String(b.modality||"Clase a clase");const instructions=String(b.instructions||"");const includeAdaptations=b.includeAdaptations===true;const adaptationContext=String(b.adaptationContext||"").trim();
 const adaptationInstruction=includeAdaptations?`Incluye adecuacionesCurriculares como array separado de DUA. Contexto entregado por el docente: ${adaptationContext||"sin contexto adicional"}. Propón ajustes de acceso, metodología, recursos, tiempo, participación o evaluación según corresponda. No inventes diagnósticos ni datos personales y no modifiques los OA oficiales.`:"No generes adecuaciones curriculares individualizadas; usa solo principios generales DUA.";const prompt=`Genera una planificación docente chilena en español. No inventes ni modifiques los OA entregados. ${adaptationInstruction} Curso: ${course.name}. Nivel: ${course.level}. Asignatura: ${subject}. Duración: ${duration}. Modalidad: ${modality}. OA oficiales: ${objectives.map(o=>o.code+": "+o.text).join(" | ")}. Indicaciones adicionales: ${instructions||"ninguna"}. Devuelve SOLO JSON válido con estas claves: titulo, objetivoClase, indicadores (array), inicio, desarrollo, cierre, recursos (array), evaluacionFormativa, dua (array), adecuacionesCurriculares (array), evidencia, observaciones. Los campos inicio/desarrollo/cierre deben ser objetos con minutos, actividadesDocente y actividadesEstudiantes.`;
 const ai=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5.6-terra",input:prompt})});
 const raw=await ai.json();
 if(!ai.ok)return NextResponse.json({error:"La IA no pudo generar la planificación",detail:raw?.error?.message||"Error OpenAI"},{status:502});
 let text=outputText(raw).trim().replace(/^\`\`\`json\s*/i,"").replace(/\`\`\`$/,"").trim();let generated:any;
 try{generated=JSON.parse(text)}catch{return NextResponse.json({error:"La IA respondió en un formato no válido. Intenta nuevamente."},{status:502})}
 const planning=await prisma.planning.create({data:{title:String(generated.titulo||`Planificación ${subject} · ${course.name}`),track:course.track,content:generated,userId:u.id,courseId:course.id,academicYearId:course.academicYearId,objectives:{create:objectives.map(o=>({objectiveId:o.id}))}},include:{course:true,objectives:{include:{objective:true}}}});
 return NextResponse.json({planning},{status:201});
}
