import {prisma} from "../prisma";
import {checkAiEntitlement} from "../ai-entitlement";

export class PaesQuotaError extends Error {
 constructor(message:string,public status:number=429){super(message);}
}
export async function assertPaesAiAccess(userId:string){
 const user=await prisma.user.findUnique({where:{id:userId},select:{active:true,accountType:true,organizationId:true,schoolId:true,organization:{select:{active:true}},school:{select:{active:true}}}});
 if(!user?.active)throw new PaesQuotaError("Cuenta inactiva.",403);
 if(user.accountType!=="INSTITUTIONAL"||!user.organization?.active||user.school?.active===false)throw new PaesQuotaError("PAES requiere una cuenta institucional activa.",403);
 const now=new Date();
 const licenses=await prisma.institutionalExamLicense.count({where:{organizationId:user.organizationId, ...(user.schoolId?{schoolId:user.schoolId}:{}),module:"PAES",active:true,startsAt:{lte:now},endsAt:{gt:now}}});
 if(!licenses)throw new PaesQuotaError("No existe licencia PAES institucional vigente para este establecimiento.",403);
 const access=await checkAiEntitlement(userId);
 if(!access.ok)throw new PaesQuotaError(access.error||"No tienes generaciones IA disponibles.");
}
// Completion receipt and counter are committed together. A retry cannot charge twice.
export async function chargeCompletedPaes(userId:string,jobId:string){
 return prisma.$transaction(async tx=>{
  const claim=await tx.paesInternalJob.updateMany({where:{id:jobId,userId,aiChargedAt:null},data:{aiChargedAt:new Date()}});
  if(claim.count!==1){
   const job=await tx.paesInternalJob.findFirst({where:{id:jobId,userId},select:{aiChargedAt:true}});
   if(job?.aiChargedAt)return;
   throw new PaesQuotaError("Ensayo no disponible para este usuario.",403);
  }
  const user=await tx.user.findUnique({where:{id:userId},select:{active:true,accountType:true,subscriptionStatus:true,trialEndsAt:true,subscriptionEndsAt:true,monthlyAiLimit:true}});
  if(!user?.active)throw new PaesQuotaError("Cuenta inactiva.",403);
  if(user.accountType!=="INSTITUTIONAL")throw new PaesQuotaError("PAES requiere acceso institucional.",403);
  return;

 });
}
