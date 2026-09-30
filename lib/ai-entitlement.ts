import {prisma} from "./prisma";

export async function checkAiEntitlement(userId:string){
 const u=await prisma.user.findUnique({where:{id:userId},select:{accountType:true,subscriptionStatus:true,trialEndsAt:true,subscriptionEndsAt:true,monthlyAiLimit:true,monthlyAiUsed:true}});
 if(!u)return{ok:false,error:"Usuario no encontrado"};
 if(u.accountType!=="INDIVIDUAL")return{ok:true,individual:false};
 const now=new Date();
 if(u.subscriptionStatus==="TRIAL"&&(!u.trialEndsAt||u.trialEndsAt<=now)){await prisma.user.update({where:{id:userId},data:{subscriptionStatus:"PAST_DUE"}}).catch(()=>{});return{ok:false,error:"Tu período de prueba de 3 días finalizó. Activa tu Plan Individual para continuar creando con IA."};}
 if(u.subscriptionStatus==="ACTIVE"&&(!u.subscriptionEndsAt||u.subscriptionEndsAt<=now)){await prisma.user.update({where:{id:userId},data:{subscriptionStatus:"PAST_DUE"}}).catch(()=>{});return{ok:false,error:"Tu Plan Individual está vencido. Renueva tu suscripción para continuar creando con IA."};}
 if(u.subscriptionStatus==="PAST_DUE"||u.subscriptionStatus==="CANCELED")return{ok:false,error:"Tu suscripción no está activa."};
 const limit=u.subscriptionStatus==="TRIAL"?Math.min(10,u.monthlyAiLimit||10):(u.monthlyAiLimit||0),used=u.monthlyAiUsed||0;if(used>=limit)return{ok:false,error:"Alcanzaste el límite de generaciones IA de tu plan."};
 return{ok:true,individual:true,remaining:limit-used};
}

export async function reserveAiUse(userId:string){
 const u=await prisma.user.findUnique({where:{id:userId},select:{accountType:true,subscriptionStatus:true,trialEndsAt:true,subscriptionEndsAt:true,monthlyAiLimit:true}});
 if(!u)return{ok:false,error:"Usuario no encontrado",reserved:false};
 if(u.accountType!=="INDIVIDUAL")return{ok:true,individual:false,reserved:false};
 const now=new Date();
 const validPeriod=u.subscriptionStatus==="TRIAL"?!!u.trialEndsAt&&u.trialEndsAt>now:u.subscriptionStatus==="ACTIVE"?!!u.subscriptionEndsAt&&u.subscriptionEndsAt>now:false;
 if(!validPeriod)return{ok:false,error:u.subscriptionStatus==="TRIAL"?"Tu período de prueba de 3 días finalizó. Activa tu Plan Individual para continuar creando con IA.":"Tu suscripción no está activa.",reserved:false};
 const limit=u.subscriptionStatus==="TRIAL"?Math.min(10,u.monthlyAiLimit||10):(u.monthlyAiLimit||0);
 const claimed=await prisma.user.updateMany({where:{id:userId,monthlyAiUsed:{lt:limit}},data:{monthlyAiUsed:{increment:1}}});
 if(claimed.count!==1)return{ok:false,error:"Alcanzaste el límite de generaciones IA de tu plan.",reserved:false};
 return{ok:true,individual:true,reserved:true};
}

export async function releaseAiUse(userId:string){
 const u=await prisma.user.findUnique({where:{id:userId},select:{accountType:true}});
 if(u?.accountType==="INDIVIDUAL")await prisma.user.updateMany({where:{id:userId,monthlyAiUsed:{gt:0}},data:{monthlyAiUsed:{decrement:1}}});
}

// Compatibilidad temporal para código antiguo. Los generadores nuevos deben usar reserveAiUse/releaseAiUse.
export async function chargeAiUse(userId:string){const r=await reserveAiUse(userId);return r.ok;}
