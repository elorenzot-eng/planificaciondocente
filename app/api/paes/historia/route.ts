import {assertPaesAiAccess,chargeCompletedPaes,PaesQuotaError} from "../../../../lib/paes/ai-usage.server";
import {getSession} from "../../../../lib/auth";
import {NextRequest,NextResponse} from "next/server";
import type {Prisma} from "@prisma/client";
import {prisma} from "../../../../lib/prisma";
import {generateHistoryItem} from "../../../../lib/paes/historia-generate.server";
import {HISTORY_CONFIG,validateHistoryExam,type HistoryExam,type HistoryItem} from "../../../../lib/paes/historia";
import {createHistoryPrint} from "../../../../lib/paes/historia-print";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=120;
export async function POST(request:NextRequest){
 if(process.env.PAES_PILOT_ENABLED!=="true")return NextResponse.json({error:"Generador no habilitado."},{status:404});
 const session=await getSession();if(!session||typeof session.id!=="string")return NextResponse.json({error:"Inicia sesión para generar el ensayo."},{status:403});
 let body:{difficulty?:string;jobId?:string};try{body=await request.json();}catch{return NextResponse.json({error:"JSON inválido."},{status:400});}
 if(!["Baja","Media","Alta","Mixta"].includes(body.difficulty||""))return NextResponse.json({error:"Dificultad inválida."},{status:400});
 const total=HISTORY_CONFIG.totalQuestions,jobDifficulty=`HISTORIA:${body.difficulty}`;
 try{
  let job=body.jobId?await prisma.paesInternalJob.findUnique({where:{id:body.jobId}}):await prisma.paesInternalJob.create({data:{difficulty:jobDifficulty,userId:session.id}});
  if(!job)return NextResponse.json({error:"Ensayo no encontrado."},{status:404});
  if(job.userId!==session.id)return NextResponse.json({error:"Ensayo de otro usuario."},{status:403});
  if(job.difficulty!==jobDifficulty)return NextResponse.json({error:"El ensayo no corresponde a esta configuración."},{status:400});
  if(job.nextPart===total){
   const exam:HistoryExam={version:HISTORY_CONFIG.version,items:job.items as unknown as HistoryItem[]};
   const errors=validateHistoryExam(exam);if(errors.length)throw Error(errors.join(" | "));
   // Los ensayos antiguos podían llegar a 65/65 sin pasar de PENDING a COMPLETED.
   // La transición es idempotente y no modifica las preguntas ya generadas.
   if(job.status!=="COMPLETED"){
    const finalized=await prisma.paesInternalJob.updateMany({where:{id:job.id,userId:session.id,nextPart:total,status:{in:["PENDING","RUNNING"]}},data:{status:"COMPLETED",error:null}});
    if(finalized.count!==1)return NextResponse.json({error:"No se pudo finalizar el ensayo. Intenta recuperar nuevamente.",jobId:job.id,completed:total,total},{status:409});
   }
   const studentHtml=createHistoryPrint(exam,false),teacherHtml=createHistoryPrint(exam,true);
   await chargeCompletedPaes(session!.id as string,job.id);
   return NextResponse.json({jobId:job.id,status:"COMPLETED",completed:total,total,exam,studentHtml,teacherHtml},{headers:{"Cache-Control":"no-store"}});
  }
  if(job.nextPart>total)return NextResponse.json({error:"Estado inválido del ensayo."},{status:422});
  await assertPaesAiAccess(session!.id as string);
  const claim=await prisma.paesInternalJob.updateMany({where:{id:job.id,status:"PENDING",nextPart:job.nextPart},data:{status:"RUNNING",error:null}});
  if(claim.count!==1)return NextResponse.json({jobId:job.id,status:"BUSY",completed:job.nextPart,total,error:"Generación en curso; intenta nuevamente."},{status:409});
  try{
   const item=await generateHistoryItem(job.nextPart,body.difficulty as "Baja"|"Media"|"Alta"|"Mixta");
   const items=[...(job.items as unknown as HistoryItem[]),item];
   job=await prisma.paesInternalJob.update({where:{id:job.id},data:{status:job.nextPart+1===total?"COMPLETED":"PENDING",nextPart:job.nextPart+1,items:items as unknown as Prisma.InputJsonValue}});
   return NextResponse.json({jobId:job.id,status:"IN_PROGRESS",completed:job.nextPart,total},{headers:{"Cache-Control":"no-store"}});
  }catch(e){
   const message=e instanceof Error?e.message:String(e);
   await prisma.paesInternalJob.update({where:{id:job.id},data:{status:"PENDING",error:message.slice(0,400)}});
   return NextResponse.json({jobId:job.id,completed:job.nextPart,total,error:"No se pudo generar o validar esta pregunta. Puedes reanudar."},{status:422});
  }
 }catch(e){if(e instanceof PaesQuotaError)return NextResponse.json({error:e.message,jobId:body.jobId},{status:e.status});console.error("[PAES-HISTORIA]",e);return NextResponse.json({error:"No se pudo continuar el ensayo."},{status:500});}
}
