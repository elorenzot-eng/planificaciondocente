import {getSession} from "../../../../../lib/auth";
import {NextRequest,NextResponse} from "next/server";
import type {Prisma} from "@prisma/client";
import {prisma} from "../../../../../lib/prisma";
import {generateScienceItem} from "../../../../../lib/paes/ciencias-generate.server";
import {SCIENCE_PRACTICE_CONFIG,SCIENCE_SUBJECTS,validateSciencePractice,type ScienceSubject,type ScienceItem,type ScienceExam} from "../../../../../lib/paes/ciencias";
import {createSciencePrint} from "../../../../../lib/paes/ciencias-print";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=120;
export async function POST(request:NextRequest){
 if(process.env.PAES_PILOT_ENABLED!=="true")return NextResponse.json({error:"Piloto no habilitado."},{status:404});
 const session=await getSession();if(!session||typeof session.id!=="string")return NextResponse.json({error:"Inicia sesión para generar el ensayo."},{status:403});
 let body:{elective?:ScienceSubject;difficulty?:string;jobId?:string};
 try{body=await request.json();}catch{return NextResponse.json({error:"JSON inválido."},{status:400});}
 if(!SCIENCE_SUBJECTS.includes(body.elective as ScienceSubject)||!["Baja","Media","Alta","Mixta"].includes(body.difficulty||""))return NextResponse.json({error:"Configuración inválida."},{status:400});
 const jobDifficulty=`CIENCIAS:${body.elective}:${body.difficulty}`;
 try{
  let job=body.jobId?await prisma.paesInternalJob.findUnique({where:{id:body.jobId}}):await prisma.paesInternalJob.create({data:{difficulty:jobDifficulty,userId:session.id as string}});
  if(!job)return NextResponse.json({error:"Ensayo no encontrado."},{status:404});
  if(job.userId!==session.id)return NextResponse.json({error:"Ensayo de otro usuario."},{status:403});
  if(job.difficulty!==jobDifficulty)return NextResponse.json({error:"El ensayo no corresponde a esta configuración."},{status:400});
  if(job.nextPart===12){
   const exam:ScienceExam={version:SCIENCE_PRACTICE_CONFIG.version,elective:body.elective as ScienceSubject,items:job.items as unknown as ScienceItem[]};
   const errors=validateSciencePractice(exam);if(errors.length)throw new Error(errors.join(" | "));
   return NextResponse.json({jobId:job.id,status:"COMPLETED",completed:12,total:12,exam,studentHtml:createSciencePrint(exam,false),teacherHtml:createSciencePrint(exam,true)},{headers:{"Cache-Control":"no-store"}});
  }
  const claim=await prisma.paesInternalJob.updateMany({where:{id:job.id,status:"PENDING",nextPart:job.nextPart},data:{status:"RUNNING",error:null}});
  if(claim.count!==1)return NextResponse.json({jobId:job.id,status:"BUSY",completed:job.nextPart,total:12,error:"La generación está en curso. Intenta nuevamente."},{status:409});
  try{
   const item=await generateScienceItem(job.nextPart,body.elective as ScienceSubject,body.difficulty as "Baja"|"Media"|"Alta"|"Mixta");
   const items=[...(job.items as unknown as ScienceItem[]),item];
   job=await prisma.paesInternalJob.update({where:{id:job.id},data:{status:"PENDING",nextPart:job.nextPart+1,items:items as unknown as Prisma.InputJsonValue}});
   return NextResponse.json({jobId:job.id,status:"IN_PROGRESS",completed:job.nextPart,total:12},{headers:{"Cache-Control":"no-store"}});
  }catch(e){
   const message=e instanceof Error?e.message:String(e);
   await prisma.paesInternalJob.update({where:{id:job.id},data:{status:"PENDING",error:message.slice(0,400)}});
   return NextResponse.json({jobId:job.id,completed:job.nextPart,total:12,error:"La pregunta no superó la validación. Puedes reanudar."},{status:422});
  }
 }catch(e){console.error("[PAES-CIENCIAS]",e);return NextResponse.json({error:"No se pudo continuar el ensayo."},{status:500});}
}
