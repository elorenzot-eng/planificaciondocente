import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
const MARKER=-999; // SubscriptionReminder marker reserved for expired trial service notices
export async function POST(req:Request){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"No autorizado"},{status:401});
 const admin=await prisma.user.findUnique({where:{id:String(session.id)},select:{role:true,active:true}});
 if(!admin?.active||admin.role!=="SUPERADMIN")return NextResponse.json({error:"Prohibido"},{status:403});
 const body=await req.json().catch(()=>({}));
 const send=body.confirm==="ENVIAR_NOTIFICACIONES_VENCIMIENTO";
 const apiKey=process.env.RESEND_API_KEY;
 const from=process.env.RESEND_FROM_EMAIL||process.env.COMMERCIAL_EMAIL_FROM;
 if(send&&(!apiKey||!from))return NextResponse.json({error:"Falta configurar Resend"},{status:503});
 const users=await prisma.user.findMany({where:{accountType:"INDIVIDUAL",active:true,subscriptionStatus:"TRIAL",trialEndsAt:{lt:new Date()}},select:{id:true,email:true,name:true,trialEndsAt:true},take:500});
 let excluded=0,already=0,eligible=0,sent=0,failed=0;
 for(const user of users){
  if(!user.trialEndsAt)continue;
  const [exclusion,prior]=await Promise.all([
   prisma.commercialLeadActivity.findFirst({where:{userId:user.id,doNotContact:true},select:{id:true}}),
   prisma.subscriptionReminder.findUnique({where:{userId_subscriptionEndsAt_daysBefore:{userId:user.id,subscriptionEndsAt:user.trialEndsAt,daysBefore:MARKER}}})
  ]);
  if(exclusion){excluded++;continue}
  if(prior){already++;continue}
  eligible++;
  if(!send||sent+failed>=50)continue;
  // Atomic unique claim prevents duplicate sends across concurrent invocations.
  const claimed=await prisma.subscriptionReminder.createMany({data:[{userId:user.id,subscriptionEndsAt:user.trialEndsAt,daysBefore:MARKER}],skipDuplicates:true});
  if(!claimed.count){already++;continue}
  const firstName=(user.name||"").trim().split(/\s+/)[0]||"";
  const text=`Hola${firstName?" "+firstName:""}:\n\nTe informamos que el período de prueba gratuita asociado a tu cuenta de EducAntay ha finalizado.\n\nPuedes ingresar a https://educantay.cl para revisar el estado de tu cuenta.\n\nSi consideras que recibiste esta notificación por error o necesitas asistencia con tu acceso, responde a este correo.\n\nEquipo EducAntay\ncontacto@educantay.cl`;
  try{
   const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+apiKey,"Content-Type":"application/json","Idempotency-Key":"trial-expired-"+user.id+"-"+user.trialEndsAt.toISOString()},body:JSON.stringify({from,to:[user.email],subject:"Información sobre tu prueba gratuita de EducAntay",text})});
   if(!response.ok)throw new Error("Resend HTTP "+response.status);
   sent++;
  }catch(e){
   failed++;
   // Keep claim on uncertain delivery to avoid accidentally sending twice.
   console.error("trial expiration notification failed",user.id,String(e));
  }
 }
 return NextResponse.json({dryRun:!send,expired:users.length,excluded,already,eligible,sent,failed,limitPerRun:50,note:failed?"Revisar logs antes de reintentar: reservas de envío retenidas para evitar duplicados":undefined},{headers:{"Cache-Control":"no-store"}});
}
