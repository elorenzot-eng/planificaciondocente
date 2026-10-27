import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
export async function POST(request:Request){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"Inicia sesión."},{status:401});
 const user=await prisma.user.findUnique({where:{id:String(session.id)},select:{active:true,accountType:true,role:true,schoolId:true,organizationId:true}});
 if(!user?.active||user.accountType!=="INSTITUTIONAL"||!["DIRECTOR","SOSTENEDOR","UTP","DOCENTE","SUPERADMIN"].includes(user.role))return NextResponse.json({error:"Acceso denegado"},{status:403});
 const body=await request.json().catch(()=>null);
 const {schoolId,studentId,examId,examTitle,subject,grade,correctAnswers,totalQuestions,skillResults,contentResults}=body||{};
 if(![schoolId,studentId,examId,examTitle,subject,grade].every(x=>typeof x==="string"&&x.trim().length>0&&x.length<=200)||!Number.isInteger(correctAnswers)||!Number.isInteger(totalQuestions)||totalQuestions<1||totalQuestions>150||correctAnswers<0||correctAnswers>totalQuestions)return NextResponse.json({error:"Datos de corrección inválidos"},{status:400});
 const validDimension=(v:unknown)=>v===undefined||(Array.isArray(v)&&v.length<=100&&v.every((x:unknown)=>{if(!x||typeof x!=="object")return false;const a=x as Record<string,unknown>;return typeof a.name==="string"&&a.name.length<=120&&Number.isInteger(a.correct)&&Number.isInteger(a.total)&&(a.correct as number)>=0&&(a.total as number)>0&&(a.correct as number)<=(a.total as number)}));
 if(!validDimension(skillResults)||!validDimension(contentResults))return NextResponse.json({error:"Desglose pedagógico inválido"},{status:400});
 const school=await prisma.school.findUnique({where:{id:schoolId},select:{id:true,organizationId:true,active:true}});
 if(!school?.active||user.role!=="SUPERADMIN"&&(user.role==="SOSTENEDOR"?school.organizationId!==user.organizationId:school.id!==user.schoolId||school.organizationId!==user.organizationId))return NextResponse.json({error:"Colegio no autorizado"},{status:403});
 const student=await prisma.licensedStudent.findFirst({where:{id:studentId,schoolId},select:{id:true,course:true}});
 if(!student)return NextResponse.json({error:"Estudiante no pertenece al establecimiento"},{status:404});
 const record=await prisma.academicExamResult.upsert({where:{schoolId_studentId_product_examId:{schoolId,studentId,product:"SIMCE",examId}},create:{schoolId,studentId,product:"SIMCE",subject,grade,course:student.course,examId,examTitle,takenAt:new Date(),correctAnswers,totalQuestions,skillResults:skillResults||undefined,contentResults:contentResults||undefined,source:"SIMCE_MANUAL_REVIEW"},update:{correctAnswers,totalQuestions,skillResults:skillResults||undefined,contentResults:contentResults||undefined,subject,grade,examTitle,course:student.course,source:"SIMCE_MANUAL_REVIEW"},select:{id:true}});
 return NextResponse.json({id:record.id,saved:true},{headers:{"Cache-Control":"no-store"}});
}
