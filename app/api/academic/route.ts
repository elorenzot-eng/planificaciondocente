import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";

async function context(){
 const s=await getSession(); if(!s?.id)return null;
 const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,role:true,active:true,organizationId:true,schoolId:true}});
 return u?.active?u:null;
}
export async function GET(req:Request){
 const u=await context(); if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const url=new URL(req.url); const requested=url.searchParams.get("schoolId");
 const schoolId=u.role==="SUPERADMIN"||u.role==="SOSTENEDOR"?requested||u.schoolId:u.schoolId;
 if(!schoolId)return NextResponse.json({courses:[],teachers:[]});
 const school=await prisma.school.findFirst({where:{id:schoolId,...(u.role==="SUPERADMIN"?{}:{organizationId:u.organizationId})}});
 if(!school)return NextResponse.json({error:"Establecimiento no autorizado"},{status:403});
 const year=Number(url.searchParams.get("year")||2027);
 const academicYear=await prisma.academicYear.upsert({where:{schoolId_year:{schoolId,year}},update:{},create:{schoolId,year}});
 const courses=await prisma.course.findMany({where:{schoolId,academicYearId:academicYear.id},include:{teachingAssignments:{include:{teacher:{select:{id:true,name:true,email:true}}}}},orderBy:{name:"asc"}});
 const teachers=await prisma.user.findMany({where:{schoolId,active:true,role:"DOCENTE"},select:{id:true,name:true,email:true},orderBy:{name:"asc"}});
 return NextResponse.json({school,academicYear,courses,teachers});
}
export async function PUT(req:Request){
 const u=await context(); if(!u||!["SUPERADMIN","SOSTENEDOR","DIRECTOR","UTP"].includes(u.role))return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json();const schoolId=u.role==="DIRECTOR"||u.role==="UTP"?u.schoolId:String(b.schoolId||"");if(!schoolId)return NextResponse.json({error:"Establecimiento requerido"},{status:400});
 const school=await prisma.school.findFirst({where:{id:schoolId,...(u.role==="SUPERADMIN"?{}:{organizationId:u.organizationId})}});if(!school)return NextResponse.json({error:"No autorizado"},{status:403});
 const year=Number(b.year||2027);const ay=await prisma.academicYear.upsert({where:{schoolId_year:{schoolId,year}},update:{jec:Boolean(b.jec)},create:{schoolId,year,jec:Boolean(b.jec)}});return NextResponse.json(ay);
}
export async function POST(req:Request){
 const u=await context(); if(!u||!["SUPERADMIN","SOSTENEDOR","DIRECTOR","UTP"].includes(u.role))return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json(); const schoolId=u.role==="DIRECTOR"||u.role==="UTP"?u.schoolId:String(b.schoolId||"");
 if(!schoolId)return NextResponse.json({error:"Establecimiento requerido"},{status:400});
 const school=await prisma.school.findFirst({where:{id:schoolId,...(u.role==="SUPERADMIN"?{}:{organizationId:u.organizationId})}});
 if(!school)return NextResponse.json({error:"Establecimiento no autorizado"},{status:403});
 const year=Number(b.year||2027); const ay=await prisma.academicYear.upsert({where:{schoolId_year:{schoolId,year}},update:{},create:{schoolId,year}});
 if(b.kind==="course"){
  if(!b.name||!b.level||!["PARVULARIA","BASICA","HC","TP"].includes(String(b.track)))return NextResponse.json({error:"Datos del curso incompletos"},{status:400});
  return NextResponse.json(await prisma.course.create({data:{name:String(b.name),level:String(b.level),track:b.track,schoolId,academicYearId:ay.id}}),{status:201});
 }
 if(b.kind==="assignment"){
  const course=await prisma.course.findFirst({where:{id:String(b.courseId),schoolId,academicYearId:ay.id}});
  const teacher=await prisma.user.findFirst({where:{id:String(b.teacherId),schoolId,role:"DOCENTE",active:true}});
  if(!course||!teacher||!String(b.subject||"").trim())return NextResponse.json({error:"Curso, asignatura o docente no válido"},{status:400});
  try{return NextResponse.json(await prisma.teachingAssignment.create({data:{courseId:course.id,teacherId:teacher.id,subject:String(b.subject).trim()}}),{status:201})}catch{return NextResponse.json({error:"Esta asignación ya existe"},{status:400})}
 }
 return NextResponse.json({error:"Operación no válida"},{status:400});
}

export async function PATCH(req:Request){
 const u=await context(); if(!u||!["SUPERADMIN","SOSTENEDOR","DIRECTOR","UTP"].includes(u.role))return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json();
 if(b.kind==="course"){
  const course=await prisma.course.findUnique({where:{id:String(b.id)},include:{_count:{select:{plannings:true,assessments:true}}}});
  if(!course)return NextResponse.json({error:"Curso no encontrado"},{status:404});
  const school=await prisma.school.findFirst({where:{id:course.schoolId,...(u.role==="SUPERADMIN"?{}:{organizationId:u.organizationId})}});
  if(!school||(u.role==="DIRECTOR"||u.role==="UTP")&&course.schoolId!==u.schoolId)return NextResponse.json({error:"No autorizado"},{status:403});
  const data:any={};if(b.track&&["PARVULARIA","BASICA","HC","TP"].includes(String(b.track)))data.track=b.track;if(b.name)data.name=String(b.name);if(b.level)data.level=String(b.level);
  return NextResponse.json(await prisma.course.update({where:{id:course.id},data}));
 }
 return NextResponse.json({error:"Operación no válida"},{status:400});
}
export async function DELETE(req:Request){
 const u=await context(); if(!u||!["SUPERADMIN","SOSTENEDOR","DIRECTOR","UTP"].includes(u.role))return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json();
 if(b.kind==="assignment"){
  const a=await prisma.teachingAssignment.findUnique({where:{id:String(b.id)},include:{course:true}});
  if(!a)return NextResponse.json({error:"Asignación no encontrada"},{status:404});
  if(u.role!=="SUPERADMIN"&&(a.course.schoolId!==u.schoolId&&u.role!=="SOSTENEDOR"))return NextResponse.json({error:"No autorizado"},{status:403});
  if(u.role==="SOSTENEDOR"){const s=await prisma.school.findFirst({where:{id:a.course.schoolId,organizationId:u.organizationId}});if(!s)return NextResponse.json({error:"No autorizado"},{status:403})}
  await prisma.teachingAssignment.delete({where:{id:a.id}});return NextResponse.json({ok:true});
 }
 if(b.kind==="course"){
  const course=await prisma.course.findUnique({where:{id:String(b.id)},include:{_count:{select:{plannings:true,assessments:true}}}});
  if(!course)return NextResponse.json({error:"Curso no encontrado"},{status:404});
  if(u.role!=="SUPERADMIN"){const s=await prisma.school.findFirst({where:{id:course.schoolId,organizationId:u.organizationId}});if(!s||(u.role==="DIRECTOR"||u.role==="UTP")&&course.schoolId!==u.schoolId)return NextResponse.json({error:"No autorizado"},{status:403})}
  if(course._count.plannings||course._count.assessments)return NextResponse.json({error:"No se puede eliminar: el curso ya tiene historial curricular"},{status:409});
  await prisma.course.delete({where:{id:course.id}});return NextResponse.json({ok:true});
 }
 return NextResponse.json({error:"Operación no válida"},{status:400});
}
