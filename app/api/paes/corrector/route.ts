import {demreReferenceScore} from "../../../../lib/paes/demre-reference-score";
import {NextRequest,NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){
 const session=await getSession();
 if(typeof session?.id!=="string")return NextResponse.json({error:"Acceso denegado"},{status:401});
 let body:any;try{body=await req.json()}catch{return NextResponse.json({error:"Solicitud inválida"},{status:400})}
 const id=String(body.examId||"");
 const answers=body.answers;
 if(!id||!Array.isArray(answers)||answers.length>100||answers.some((a:unknown)=>typeof a!=="string"||!["","A","B","C","D","E"].includes(a)))return NextResponse.json({error:"Respuestas inválidas"},{status:400});
 const saved=await prisma.savedPaesExam.findFirst({where:{id,userId:session.id},select:{id:true,title:true,examType:true,exam:true}});
 if(!saved)return NextResponse.json({error:"Ensayo no disponible"},{status:404});
 const items=(saved.exam as any)?.items;
 if(!Array.isArray(items)||items.length<1||items.length>100||answers.length!==items.length)return NextResponse.json({error:"Cantidad de respuestas incorrecta"},{status:400});
 if(items.some((item:any)=>!Number.isInteger(item.correctIndex)||item.correctIndex<0||item.correctIndex>4||!Array.isArray(item.options)||item.correctIndex>=item.options.length))return NextResponse.json({error:"Clave de respuestas no disponible"},{status:422});
 const details=items.map((item:any,i:number)=>{const key="ABCDE"[item.correctIndex];const answer=answers[i];return {number:i+1,answer,key,correct:answer===key,omitted:answer===""}});
 const correct=details.filter((d:any)=>d.correct).length;
 const omitted=details.filter((d:any)=>d.omitted).length;
 const total=details.length;
 const demre=demreReferenceScore(saved.examType,total,correct);
 let institutionalSave:"NOT_REQUESTED"|"SAVED"="NOT_REQUESTED";
 if(body.studentId!==undefined){
  if(typeof body.studentId!=="string"||!body.studentId||body.studentId.length>100)return NextResponse.json({error:"Estudiante institucional inválido."},{status:400});
  const user=await prisma.user.findUnique({where:{id:session.id},select:{schoolId:true,active:true,role:true}});
  if(!user?.active||!user.schoolId||!["SUPERADMIN","SOSTENEDOR","DIRECTOR","UTP","DOCENTE"].includes(user.role))return NextResponse.json({error:"Se requiere acceso institucional para registrar resultados."},{status:403});
  const student=await prisma.licensedStudent.findFirst({where:{id:body.studentId,schoolId:user.schoolId},select:{id:true,course:true}});
  if(!student)return NextResponse.json({error:"El estudiante no pertenece al establecimiento."},{status:403});
  await prisma.academicExamResult.upsert({
   where:{schoolId_studentId_product_examId:{schoolId:user.schoolId,studentId:student.id,product:"PAES",examId:saved.id}},
   create:{schoolId:user.schoolId,studentId:student.id,product:"PAES",subject:saved.examType,grade:student.course,course:student.course,examId:saved.id,examTitle:saved.title,takenAt:new Date(),correctAnswers:correct,totalQuestions:total,score:demre?.score??null,source:"PAES_CORRECTOR_MANUAL",levelMethod:demre?"REFERENCIAL_DEMRE":null},
   update:{correctAnswers:correct,totalQuestions:total,score:demre?.score??null,takenAt:new Date(),course:student.course,grade:student.course,source:"PAES_CORRECTOR_MANUAL",levelMethod:demre?"REFERENCIAL_DEMRE":null}
  });
  institutionalSave="SAVED";
 }
 return NextResponse.json({institutionalSave,examTitle:saved.title,examType:saved.examType,total,correct,incorrect:total-correct-omitted,omitted,percentage:Math.round(correct/total*10000)/100,details,demre,scoreType:demre?"REFERENCIAL_DEMRE":"PORCENTAJE_DE_LOGRO",note:demre?"Conversión referencial mediante tabla DEMRE; ensayo EducAntay no equiparado.":"No se aplica conversión DEMRE a pilotos ni ensayos con preguntas no identificadas como puntuables. Se informa porcentaje de logro."},{headers:{"Cache-Control":"private, no-store"}});
}
