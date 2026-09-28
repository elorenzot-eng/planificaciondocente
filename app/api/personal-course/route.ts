import {NextResponse} from "next/server";
import {prisma} from "../../../lib/prisma";
import {getSession} from "../../../lib/auth";

const trackFor=(level:string)=>level.includes("Medio TP")?"TP":level.includes("Medio")?"HC":level.includes("Básico")?"BASICA":"PARVULARIA";

export async function GET(){
 const s=await getSession();if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:401});
 const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,accountType:true,active:true,schoolId:true}});
 if(!u?.active||u.accountType!=="INDIVIDUAL"||!u.schoolId)return NextResponse.json({error:"Disponible solo para cuentas individuales"},{status:403});
 const courses=await prisma.course.findMany({where:{schoolId:u.schoolId,academicYear:{year:2027}},include:{teachingAssignments:{where:{teacherId:u.id},orderBy:{subject:"asc"}}},orderBy:{level:"asc"}});
 return NextResponse.json({courses});
}

export async function POST(req:Request){
 const s=await getSession();if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:401});
 const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,accountType:true,active:true,schoolId:true}});
 if(!u?.active||u.accountType!=="INDIVIDUAL"||!u.schoolId)return NextResponse.json({error:"Disponible solo para cuentas individuales"},{status:403});
 const b=await req.json();const level=String(b.level||"").trim();const subjects=Array.isArray(b.subjects)?b.subjects.map((x:any)=>String(x).trim()).filter(Boolean):[];
 if(!level)return NextResponse.json({error:"Selecciona un curso"},{status:400});
 const objectiveExists=await prisma.learningObjective.findFirst({where:{level},select:{id:true}});
 const moduleExists=level.includes("Medio TP")?await prisma.curriculumModule.findFirst({where:{level,active:true},select:{id:true}}):null;
 if(!objectiveExists&&!moduleExists)return NextResponse.json({error:"El curso seleccionado no tiene currículo cargado"},{status:400});
 const ay=await prisma.academicYear.upsert({where:{schoolId_year:{schoolId:u.schoolId,year:2027}},update:{},create:{schoolId:u.schoolId,year:2027}});
 let course=await prisma.course.findFirst({where:{schoolId:u.schoolId,academicYearId:ay.id,level,name:level}});
 if(!course)course=await prisma.course.create({data:{name:level,level,track:trackFor(level) as any,schoolId:u.schoolId,academicYearId:ay.id}});
 if(subjects.length){await prisma.$transaction(subjects.map((subject:string)=>prisma.teachingAssignment.upsert({where:{courseId_subject_teacherId:{courseId:course!.id,subject,teacherId:u.id}},update:{},create:{courseId:course!.id,subject,teacherId:u.id}})))}
 const full=await prisma.course.findUnique({where:{id:course.id},include:{teachingAssignments:{where:{teacherId:u.id},orderBy:{subject:"asc"}}}});
 return NextResponse.json({course:full});
}