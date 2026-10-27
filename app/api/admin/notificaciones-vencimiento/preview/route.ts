import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";

export const runtime="nodejs";

export async function GET(){
  const session=await getSession();
  if(!session?.id)return NextResponse.json({error:"No autorizado"},{status:401});
  const admin=await prisma.user.findUnique({where:{id:String(session.id)},select:{role:true,active:true}});
  if(!admin?.active||admin.role!=="SUPERADMIN")return NextResponse.json({error:"Solo Superadmin"},{status:403});

  const expired=await prisma.user.findMany({
    where:{accountType:"INDIVIDUAL",active:true,subscriptionStatus:"TRIAL",trialEndsAt:{lt:new Date()}},
    select:{id:true},take:500
  });
  const ids=expired.map(u=>u.id);
  const excluded=ids.length?await prisma.commercialLeadActivity.findMany({
    where:{userId:{in:ids},doNotContact:true},select:{userId:true},distinct:["userId"]
  }):[];
  const excludedIds=new Set(excluded.map(x=>x.userId));
  return NextResponse.json({
    expired:expired.length,
    excluded:expired.filter(u=>excludedIds.has(u.id)).length,
    candidates:expired.filter(u=>!excludedIds.has(u.id)).length,
    sendEnabled:false,
    note:"Vista previa de notificaciones de servicio. No envía mensajes. Requiere validar pertinencia, historial y deduplicación antes de activar."
  },{headers:{"Cache-Control":"no-store"}});
}
