import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export async function GET(){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"No autorizado"},{status:401});
 const admin=await prisma.user.findUnique({where:{id:String(session.id)},select:{role:true,active:true}});
 if(!admin?.active||admin.role!=="SUPERADMIN")return NextResponse.json({error:"Solo Superadmin"},{status:403});
 const now=new Date();
 const base={accountType:"INDIVIDUAL" as const,active:true,subscriptionStatus:"TRIAL" as const,trialEndsAt:{lt:now}};
 const [expired,consentRows,excludedRows,enabledCampaigns]=await Promise.all([
 prisma.user.count({where:base}),
 prisma.commercialEmailConsent.findMany({where:{optedIn:true},select:{userId:true},take:10000}),
 prisma.commercialLeadActivity.findMany({where:{doNotContact:true},select:{userId:true},distinct:["userId"],take:10000}),
 prisma.commercialEmailCampaign.count({where:{enabled:true}})
 ]);
 const consentIds=consentRows.map(x=>x.userId);const excludedIds=excludedRows.map(x=>x.userId);const [consented,excluded]=await Promise.all([prisma.user.count({where:{...base,id:{in:consentIds}}}),prisma.user.count({where:{...base,id:{in:excludedIds}}})]);
 const campaign=await prisma.commercialEmailCampaign.findFirst({where:{enabled:true},orderBy:{createdAt:"asc"},select:{id:true,name:true}});
 let eligible=0;
 if(campaign){
  const leads=await prisma.user.findMany({where:base,select:{id:true},take:500});
  const cutoff=new Date(Date.now()-30*24*60*60*1000);
  for(const lead of leads){
   const [blocked,already,recent]=await Promise.all([
    prisma.commercialLeadActivity.findFirst({where:{userId:lead.id,doNotContact:true},select:{id:true}}),
    prisma.commercialEmailDelivery.findUnique({where:{campaignId_userId:{campaignId:campaign.id,userId:lead.id}},select:{id:true}}),
    prisma.commercialEmailDelivery.findFirst({where:{userId:lead.id,status:{in:["SENT","PROCESSING"]},createdAt:{gte:cutoff}},select:{id:true}})
   ]);
   if(consentIds.includes(lead.id)&&!blocked&&!already&&!recent)eligible++;
  }
 }
 return NextResponse.json({expired,consented,excluded,enabledCampaigns,eligible,previewCampaign:campaign?.name||null,sendLimit:25,note:"Estimación sin envíos. Revisión de hasta 500 pruebas vencidas, aplicando consentimiento, exclusiones e historial."},{headers:{"Cache-Control":"no-store"}});
}
