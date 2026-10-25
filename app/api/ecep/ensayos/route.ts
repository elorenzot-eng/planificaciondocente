import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import type {Prisma} from "@prisma/client";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
import {topics} from "../../../../lib/ecep-topics";
import {buildEcepPlan,topicKey,ECEP_DIFFICULTIES,validateCompletedEcep,type EcepConfig,type EcepQuestion,type PlannedItem} from "../../../../lib/ecep/exam";
import {generateEcepBatch} from "../../../../lib/ecep/generate.server";
import {completeEcepExam} from "../../../../lib/ecep/usage.server";
import {assertPaesAiAccess,PaesQuotaError} from "../../../../lib/paes/ai-usage.server";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=150;
async function owner(){const s=await getSession();if(typeof s?.id!=="string")return null;return prisma.user.findFirst({where:{id:s.id,active:true},select:{id:true}});}
export async function GET(){
 const user=await owner();if(!user)return NextResponse.json({error:"Inicia sesión."},{status:401});
 const items=await prisma.ecepExam.findMany({where:{userId:user.id,status:"COMPLETED",aiChargedAt:{not:null}},select:{id:true,title:true,level:true,quantity:true,difficulty:true,createdAt:true},orderBy:{createdAt:"desc"},take:100});
 return NextResponse.json({items},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:Request){
 const user=await owner();if(!user)return NextResponse.json({error:"Inicia sesión para generar ensayos."},{status:401});
 let body:any;try{body=await request.json();}catch{return NextResponse.json({error:"Solicitud inválida."},{status:400});}
 if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"Solicitud inválida."},{status:400});
 const config:EcepConfig={specialtyKey:String(body.specialtyKey||""),quantity:Number(body.quantity),difficulty:body.difficulty,domain:Number(body.domain)};
 const topic=topics.find(t=>topicKey(t)===config.specialtyKey);
 if(!topic||![10,30,60].includes(config.quantity)||!ECEP_DIFFICULTIES.includes(config.difficulty)||!Number.isInteger(config.domain)||config.domain< -1||config.domain>=topic.dominios.length||body.jobId!==undefined&&(typeof body.jobId!=="string"||!body.jobId||body.jobId.length>100))return NextResponse.json({error:"Selecciona una especialidad, cantidad y dificultad válidas."},{status:400});
 let plan;try{plan=buildEcepPlan(topic,config);}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"No hay indicadores disponibles."},{status:400});}
 let jobId=body.jobId as string|undefined;
 try{
  let job;
  if(jobId){job=await prisma.ecepExam.findFirst({where:{id:jobId,userId:user.id}});}
  else{
   await assertPaesAiAccess(user.id);
   if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"Generación IA no configurada."},{status:503});
   job=await prisma.ecepExam.create({data:{userId:user.id,title:"ECEP · "+topic.especialidad+" · "+config.quantity+" preguntas",level:topic.nivel,planSnapshot:plan as unknown as Prisma.InputJsonValue,...config}});
   jobId=job.id;
   return NextResponse.json({jobId:job.id,status:"IN_PROGRESS",completed:0,total:job.quantity},{status:202,headers:{"Cache-Control":"private, no-store"}});
  }
  if(!job)return NextResponse.json({error:"Ensayo no encontrado."},{status:404});
  if(job.specialtyKey!==config.specialtyKey||job.quantity!==config.quantity||job.difficulty!==config.difficulty||job.domain!==config.domain)return NextResponse.json({error:"La configuración no coincide con el ensayo en curso."},{status:400});
  plan=job.planSnapshot as unknown as PlannedItem[];
  if(!Array.isArray(plan)||plan.length!==job.quantity)throw Error("Matriz guardada inválida.");
  if(job.nextIndex===job.quantity){
   validateCompletedEcep(job.questions,plan);
   await completeEcepExam(user.id,job.id,job.quantity);
   return NextResponse.json({jobId:job.id,status:"COMPLETED",completed:job.quantity,total:job.quantity,title:job.title},{headers:{"Cache-Control":"private, no-store"}});
  }
  await assertPaesAiAccess(user.id);
  const leaseToken=randomUUID(),cutoff=new Date(Date.now()-180000);
  const claim=await prisma.ecepExam.updateMany({where:{id:job.id,userId:user.id,nextIndex:job.nextIndex,OR:[{status:"PENDING"},{status:"RUNNING",updatedAt:{lt:cutoff}}]},data:{status:"RUNNING",leaseToken,error:null}});
  if(claim.count!==1)return NextResponse.json({jobId:job.id,status:"BUSY",completed:job.nextIndex,total:job.quantity,error:"Hay un grupo en proceso. Tu avance está guardado."},{status:409,headers:{"Retry-After":"5"}});
  try{
   const batch=await generateEcepBatch(topic.especialidad,topic.nivel,plan.slice(job.nextIndex,job.nextIndex+5),job.questions as unknown as EcepQuestion[]);
   const questions=[...(job.questions as unknown as EcepQuestion[]),...batch];
   const saved=await prisma.ecepExam.updateMany({where:{id:job.id,userId:user.id,status:"RUNNING",leaseToken,nextIndex:job.nextIndex},data:{status:"PENDING",leaseToken:null,nextIndex:questions.length,questions:questions as unknown as Prisma.InputJsonValue}});
   if(saved.count!==1)return NextResponse.json({jobId:job.id,error:"El proceso se recuperó en otra solicitud. Reanuda para consultar el avance."},{status:409});
   return NextResponse.json({jobId:job.id,status:"IN_PROGRESS",completed:questions.length,total:job.quantity},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){
   console.error("[ECEP] Generación interrumpida",job.id,error instanceof Error?error.message:"Error");
   await prisma.ecepExam.updateMany({where:{id:job.id,userId:user.id,leaseToken},data:{status:"PENDING",leaseToken:null,error:"No se pudo validar este grupo."}});
   return NextResponse.json({jobId:job.id,completed:job.nextIndex,total:job.quantity,error:"No se pudo completar este grupo. Puedes reanudar sin perder las preguntas anteriores."},{status:422});
  }
 }catch(error){
  if(error instanceof PaesQuotaError)return NextResponse.json({jobId,error:error.message},{status:error.status});
  console.error("[ECEP] Proceso",error instanceof Error?error.message:"Error");
  return NextResponse.json({jobId,error:"No se pudo continuar el ensayo. El avance guardado se conserva."},{status:500});
 }
}
