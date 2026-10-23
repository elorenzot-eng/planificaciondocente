import {NextRequest,NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
import {SCIENCE_SUBJECTS,validateSciencePractice,type ScienceExam} from "../../../../lib/paes/ciencias";
import {validateM1Full,M1_FULL_CONFIG} from "../../../../lib/paes/m1-full";
import {validateM2Full,M2_FULL_CONFIG} from "../../../../lib/paes/m2-full";
import type {M1Exam} from "../../../../lib/paes/m1";
import type {M2Exam} from "../../../../lib/paes/m2";
import {reviewLectoraExam} from "../../../../lib/paes/lectora-review";
import {INTERNAL_65_MATRIX} from "../../../../lib/paes/lectora-65-internal.server";
import type {LectoraExam} from "../../../../lib/paes/lectora";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 const records=await prisma.savedPaesExam.findMany({where:{userId},orderBy:{createdAt:"desc"},select:{id:true,title:true,examType:true,createdAt:true}});
 return NextResponse.json({items:records},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:NextRequest){
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 let body:{jobId?:string};try{body=await request.json();}catch{return NextResponse.json({error:"JSON inválido."},{status:400});}
 if(typeof body.jobId!=="string"||body.jobId.length>100)return NextResponse.json({error:"Identificador inválido."},{status:400});
 const job=await prisma.paesInternalJob.findUnique({where:{id:body.jobId}});
 if(!job||job.userId!==userId)return NextResponse.json({error:"Ensayo no disponible para este usuario."},{status:403});
 let exam:ScienceExam|M1Exam|M2Exam|LectoraExam,title:string,examType:string;
 if(job.difficulty.startsWith("CIENCIAS:")&&job.nextPart===12){
  const elective=job.difficulty.split(":")[1];
  if(!SCIENCE_SUBJECTS.includes(elective as ScienceExam["elective"]))return NextResponse.json({error:"Electivo inválido."},{status:400});
  const science:ScienceExam={version:"educantay-paes-ciencias-piloto-v1",elective:elective as ScienceExam["elective"],items:job.items as unknown as ScienceExam["items"]};
  if(validateSciencePractice(science).length)return NextResponse.json({error:"Ensayo inválido."},{status:422});
  exam=science;title=`PAES Ciencias · ${elective} · 12 preguntas`;examType="CIENCIAS";
 }else if(job.difficulty.startsWith("M1:")&&job.nextPart===65){
  const m1:M1Exam={version:M1_FULL_CONFIG.version,items:job.items as unknown as M1Exam["items"]};
  if(validateM1Full(m1).length)return NextResponse.json({error:"Ensayo M1 inválido."},{status:422});
  exam=m1;title="PAES Matemática M1 · 65 preguntas";examType="M1";
 }else if(job.difficulty.startsWith("M2:")&&job.nextPart===55){
  const m2:M2Exam={version:M2_FULL_CONFIG.version,items:job.items as unknown as M2Exam["items"]};
  if(validateM2Full(m2).length)return NextResponse.json({error:"Ensayo M2 inválido."},{status:422});
  exam=m2;title="PAES Matemática M2 · 55 preguntas";examType="M2";
 }else if(job.nextPart===30&&job.difficulty.startsWith("LECTORA:")){
  const lectora:LectoraExam={specificationVersion:INTERNAL_65_MATRIX.version,texts:job.texts as unknown as LectoraExam["texts"],items:job.items as unknown as LectoraExam["items"]};
  if(!reviewLectoraExam(lectora,INTERNAL_65_MATRIX).valid)return NextResponse.json({error:"Ensayo Lectora inválido."},{status:422});
  exam=lectora;title="PAES Competencia Lectora · 65 preguntas";examType="LECTORA";
 }else return NextResponse.json({error:"Ensayo incompleto o no compatible."},{status:400});
 const saved=await prisma.savedPaesExam.upsert({where:{userId_sourceJobId:{userId,sourceJobId:job.id}},create:{userId,sourceJobId:job.id,title,examType,exam:exam as unknown as import("@prisma/client").Prisma.InputJsonValue},update:{},select:{id:true}});
 return NextResponse.json({savedId:saved.id});
}
export async function DELETE(request:NextRequest){
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 const id=new URL(request.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Identificador requerido."},{status:400});
 const deleted=await prisma.savedPaesExam.deleteMany({where:{id,userId}});
 return NextResponse.json({deleted:deleted.count});
}
