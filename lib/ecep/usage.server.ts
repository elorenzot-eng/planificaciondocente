import {prisma} from "../prisma";
import {PaesQuotaError} from "../paes/ai-usage.server";
export async function completeEcepExam(userId:string,id:string,total:number){
 return prisma.$transaction(async tx=>{
  const claim=await tx.ecepExam.updateMany({where:{id,userId,status:"PENDING",nextIndex:total,quantity:total,aiChargedAt:null},data:{status:"COMPLETED",aiChargedAt:new Date(),leaseToken:null,error:null}});
  if(claim.count!==1){
   const previous=await tx.ecepExam.findFirst({where:{id,userId,status:"COMPLETED",aiChargedAt:{not:null}},select:{id:true}});
   if(previous)return;
   throw new PaesQuotaError("El ensayo aún no está completo.",409);
  }
  const user=await tx.user.findUnique({where:{id:userId},select:{active:true,accountType:true,subscriptionStatus:true,trialEndsAt:true,subscriptionEndsAt:true,monthlyAiLimit:true}});
  if(!user?.active)throw new PaesQuotaError("Cuenta inactiva.",403);
  if(user.accountType!=="INDIVIDUAL")return;
  const now=new Date(),trial=user.subscriptionStatus==="TRIAL";
  const valid=trial?!!user.trialEndsAt&&user.trialEndsAt>now:user.subscriptionStatus==="ACTIVE"&&!!user.subscriptionEndsAt&&user.subscriptionEndsAt>now;
  if(!valid)throw new PaesQuotaError("Tu suscripción no está activa.",403);
  const limit=trial?Math.min(5,user.monthlyAiLimit||5):(user.monthlyAiLimit||0);
  const charged=await tx.user.updateMany({where:{id:userId,active:true,accountType:"INDIVIDUAL",subscriptionStatus:user.subscriptionStatus,monthlyAiUsed:{lt:limit},...(trial?{trialEndsAt:{gt:now}}:{subscriptionEndsAt:{gt:now}})},data:{monthlyAiUsed:{increment:1}}});
  if(charged.count!==1)throw new PaesQuotaError("Alcanzaste el límite de generaciones IA de tu plan.");
 });
}
