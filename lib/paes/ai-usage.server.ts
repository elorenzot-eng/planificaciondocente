import {prisma} from "../prisma";
import {checkAiEntitlement} from "../ai-entitlement";

export class PaesQuotaError extends Error {
 constructor(message:string,public status:number=429){super(message);}
}
export async function assertPaesAiAccess(userId:string){
 const user=await prisma.user.findUnique({where:{id:userId},select:{active:true}});
 if(!user?.active)throw new PaesQuotaError("Cuenta inactiva.",403);
 const access=await checkAiEntitlement(userId);
 if(!access.ok)throw new PaesQuotaError(access.error||"No tienes generaciones IA disponibles.");
}
// Completion receipt and counter are committed together. A retry cannot charge twice.
export async function chargeCompletedPaes(userId:string,jobId:string){
 return prisma.$transaction(async tx=>{
  const claim=await tx.paesInternalJob.updateMany({where:{id:jobId,userId,status:"COMPLETED",aiChargedAt:null},data:{aiChargedAt:new Date()}});
  if(claim.count!==1){
   const job=await tx.paesInternalJob.findFirst({where:{id:jobId,userId,status:"COMPLETED"},select:{aiChargedAt:true}});
   if(job?.aiChargedAt)return;
   throw new PaesQuotaError("Ensayo no disponible para este usuario.",403);
  }
  const user=await tx.user.findUnique({where:{id:userId},select:{active:true,role:true,accountType:true,subscriptionStatus:true,trialEndsAt:true,subscriptionEndsAt:true,monthlyAiLimit:true}});
  if(!user?.active)throw new PaesQuotaError("Cuenta inactiva.",403);
  if(user.role==="SUPERADMIN"||user.accountType!=="INDIVIDUAL")return;
  const now=new Date(),trial=user.subscriptionStatus==="TRIAL";
  const valid=trial?!!user.trialEndsAt&&user.trialEndsAt>now:user.subscriptionStatus==="ACTIVE"&&!!user.subscriptionEndsAt&&user.subscriptionEndsAt>now;
  if(!valid)throw new PaesQuotaError("Tu suscripción no está activa.",403);
  const limit=trial?Math.min(5,user.monthlyAiLimit||5):(user.monthlyAiLimit||0);
  const charged=await tx.user.updateMany({where:{id:userId,active:true,accountType:"INDIVIDUAL",subscriptionStatus:user.subscriptionStatus,monthlyAiUsed:{lt:limit},...(trial?{trialEndsAt:{gt:now}}:{subscriptionEndsAt:{gt:now}})},data:{monthlyAiUsed:{increment:1}}});
  if(charged.count!==1)throw new PaesQuotaError("Alcanzaste el límite de generaciones IA de tu plan.");
 });
}
