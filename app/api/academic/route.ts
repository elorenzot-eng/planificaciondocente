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
