const {PrismaClient}=require("@prisma/client");
const prisma=new PrismaClient();
const DAY=86400000;
async function send(user,days){
 const from=process.env.RESEND_FROM_EMAIL||"Educantay <contacto@educantay.cl>";
 const base=(process.env.APP_URL||"https://educantay.cl").replace(/\/$/,"");
 const link=base+"/?renew=1";
 const when=days===1?"mañana":`en ${days} días`;
 const subject=days===1?"Tu Plan Educantay vence mañana":`Tu Plan Educantay vence en ${days} días`;
 const text=`Hola ${user.name},\n\nTu Plan Individual Educantay vence ${when}. Puedes renovar 30 días por $20.000 IVA incluido.\n\nRenovar: ${link}\n\nNo realizamos cobros automáticos. Tú decides cuándo renovar.\n\nEducantay · Tu espacio de trabajo docente`;
 const html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#243b53"><h2 style="color:#123f6d">Tu Plan Educantay vence ${when}</h2><p>Hola ${user.name}, mantén la continuidad de tu espacio docente y tus herramientas de IA.</p><p><b>Plan Individual:</b> $20.000 IVA incluido · 30 días · 90 generaciones IA.</p><p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Renovar 30 días</a></p><p style="font-size:13px;color:#60758a">No realizamos cobros automáticos. Tú decides cuándo renovar.</p></div>`;
 const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from,to:[user.email],reply_to:"contacto@educantay.cl",subject,text,html})});
 if(!r.ok)throw new Error(await r.text());
}
async function main(){
 if(!process.env.RESEND_API_KEY)throw new Error("RESEND_API_KEY missing");
 const now=new Date();const users=await prisma.user.findMany({where:{accountType:"INDIVIDUAL",subscriptionStatus:"ACTIVE",active:true,subscriptionEndsAt:{gt:now}},select:{id:true,name:true,email:true,subscriptionEndsAt:true}});
 for(const user of users){const days=Math.ceil((user.subscriptionEndsAt.getTime()-now.getTime())/DAY);if(![7,3,1].includes(days))continue;
  const exists=await prisma.subscriptionReminder.findUnique({where:{userId_subscriptionEndsAt_daysBefore:{userId:user.id,subscriptionEndsAt:user.subscriptionEndsAt,daysBefore:days}}});if(exists)continue;
  try{await send(user,days);await prisma.subscriptionReminder.create({data:{userId:user.id,subscriptionEndsAt:user.subscriptionEndsAt,daysBefore:days}});console.log("renewal-reminder-sent",days,user.id)}catch(e){console.error("renewal-reminder-failed",days,user.id,String(e))}
 }
}
main().finally(()=>prisma.$disconnect());
