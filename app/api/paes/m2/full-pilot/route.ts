import {assertPaesAiAccess,chargeCompletedPaes,PaesQuotaError} from "../../../../../lib/paes/ai-usage.server";
import { getSession } from "../../../../../lib/auth";
import { NextRequest,NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../../lib/prisma";
import { generateM2Item } from "../../../../../lib/paes/m2-generate.server";
import { M2_FULL_CONFIG,validateM2Full } from "../../../../../lib/paes/m2-full";
import { createM2Print } from "../../../../../lib/paes/m2-print";
import type { M2Item,M2Exam } from "../../../../../lib/paes/m2";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=120;
function authorized(given:string|null,expected:string){if(!given||expected.length<32)return false;const a=Buffer.from(given),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b);}
export async function POST(request:NextRequest){
 if(process.env.PAES_PILOT_ENABLED!=="true")return NextResponse.json({error:"Piloto no habilitado."},{status:404});
 const session=await getSession();
 if(!session && !authorized(request.headers.get("x-paes-pilot-token"),process.env.PAES_PILOT_TOKEN||""))return NextResponse.json({error:"Acceso denegado."},{status:403});
 let body:{difficulty?:string;jobId?:string};
 try{body=await request.json();}catch{return NextResponse.json({error:"JSON inválido."},{status:400});}
 if(!["Baja","Media","Alta","Mixta"].includes(body.difficulty||""))return NextResponse.json({error:"Dificultad inválida."},{status:400});
 try{
  const jobDifficulty="M2:"+body.difficulty;
  let job=body.jobId?await prisma.paesInternalJob.findUnique({where:{id:body.jobId}}):await prisma.paesInternalJob.create({data:{difficulty:jobDifficulty,userId:typeof session?.id==="string"?session.id:null}});
  if(!job)return NextResponse.json({error:"Proceso no encontrado."},{status:404});
  if(!session||typeof session.id!=="string"||job.userId!==session.id)return NextResponse.json({error:"Ensayo de otro usuario o sesión no válida."},{status:403});
  if(job.difficulty!==jobDifficulty)return NextResponse.json({error:"El proceso no corresponde a esta prueba o dificultad."},{status:400});
  if(job.nextPart===55){
   const exam:M2Exam={version:M2_FULL_CONFIG.version,items:job.items as unknown as M2Item[]};
   const errors=validateM2Full(exam);
   if(errors.length)throw new Error("Validación final: "+errors.join(" | ").slice(0,400));
   if(job.status!=="COMPLETED"){await prisma.paesInternalJob.updateMany({where:{id:job.id,userId:session.id as string,nextPart:55,status:{in:["PENDING","RUNNING"]}},data:{status:"COMPLETED",error:null}});}
   const studentHtml=createM2Print(exam,false),teacherHtml=createM2Print(exam,true);
   await chargeCompletedPaes(session!.id as string,job.id);
   return NextResponse.json({jobId:job.id,status:"COMPLETED",completed:55,total:55,count:55,exam,studentHtml,teacherHtml},{headers:{"Cache-Control":"no-store"}});
  }
  await assertPaesAiAccess(session!.id as string);
  const claim=await prisma.paesInternalJob.updateMany({where:{id:job.id,status:"PENDING",nextPart:job.nextPart},data:{status:"RUNNING",error:null}});
  if(claim.count!==1)return NextResponse.json({jobId:job.id,status:"BUSY",completed:job.nextPart,total:55,error:"El grupo ya se está generando. Reintenta."},{status:409});
  try{
   const item=await generateM2Item(job.nextPart,body.difficulty as "Baja"|"Media"|"Alta"|"Mixta");
   const items=[...(job.items as unknown as M2Item[]),item];
   job=await prisma.paesInternalJob.update({where:{id:job.id},data:{status:"PENDING",nextPart:job.nextPart+1,items:items as unknown as Prisma.InputJsonValue}});
   return NextResponse.json({jobId:job.id,status:"IN_PROGRESS",completed:job.nextPart,total:55,count:items.length},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
   const message=error instanceof Error?error.message:String(error);
   console.error("[PAES-M2] Pregunta",job.nextPart+1,message.slice(0,400));
   await prisma.paesInternalJob.update({where:{id:job.id},data:{status:"PENDING",error:message.slice(0,400)}});
   return NextResponse.json({jobId:job.id,completed:job.nextPart,total:55,error:"La pregunta no superó la validación. Reintenta para continuar."},{status:422});
  }
 }catch(error){if(error instanceof PaesQuotaError)return NextResponse.json({error:error.message,jobId:body.jobId},{status:error.status});console.error("[PAES-M2] Proceso:",error instanceof Error?error.message.slice(0,400):"Desconocido");return NextResponse.json({error:"No fue posible continuar el ensayo M2."},{status:500});}
}
