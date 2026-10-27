import {NextResponse} from "next/server";
import {prisma} from "../../../lib/prisma";
import {parseYanayLead} from "../../../lib/yanay-commercial";
import {bookYanayMeeting} from "../../../lib/yanay-booking";
export const runtime="nodejs";
export async function POST(req:Request){
  const origin=req.headers.get("origin");
  const host=req.headers.get("host");
  if(!origin || !host)return NextResponse.json({error:"Origen requerido"},{status:403});
  if(origin && host){try{if(new URL(origin).host!==host)return NextResponse.json({error:"Origen no autorizado"},{status:403});}catch{return NextResponse.json({error:"Origen inválido"},{status:403});}}
  const type=req.headers.get("content-type")||"";
  if(!type.toLowerCase().startsWith("application/json"))return NextResponse.json({error:"Formato no admitido"},{status:415});
  const size=Number(req.headers.get("content-length")||0);
  if(size>8192)return NextResponse.json({error:"Solicitud demasiado grande"},{status:413});
  let payload:unknown;
  try{const raw=await req.text();if(raw.length>8192)return NextResponse.json({error:"Solicitud demasiado grande"},{status:413});payload=JSON.parse(raw);}catch{return NextResponse.json({error:"JSON inválido"},{status:400});}
  if(payload && typeof payload==="object" && "website" in payload && Boolean((payload as {website?:unknown}).website))return NextResponse.json({message:"Solicitud recibida",confirmed:false},{status:202});
  const parsed=parseYanayLead(payload);
  if(!parsed.ok)return NextResponse.json({error:"Revisa los datos",details:parsed.errors},{status:400});
  try{
    const data=parsed.data;
    const recent=await prisma.yanayCommercialLead.count({where:{email:data.email,createdAt:{gte:new Date(Date.now()-60*60*1000)}}});
    if(recent>=3)return NextResponse.json({error:"Ya recibimos solicitudes recientes de este correo. Intenta más tarde."},{status:429});
    const lead=await prisma.yanayCommercialLead.create({data:{name:data.name,institution:data.institution,role:data.role,phone:data.phone,email:data.email,product:data.product,preferredTime:data.preferredTime,notes:data.notes,consentAt:new Date(),status:"NUEVO"},select:{id:true}});
    if(data.preferredTime && !Number.isNaN(Date.parse(data.preferredTime)) && data.preferredTime.endsWith("Z")){
      try{
        const booking=await bookYanayMeeting({name:data.name,email:data.email,institution:data.institution,product:data.product,startsAt:data.preferredTime});
        await prisma.yanayCommercialLead.update({where:{id:lead.id},data:{status:"CONFIRMADO",confirmedMeetingAt:new Date(booking.startsAt)}});
        return NextResponse.json({id:lead.id,message:"Reunión confirmada en Google Calendar.",confirmed:true,meetUrl:booking.meetUrl,startsAt:booking.startsAt},{status:201});
      }catch(error){return NextResponse.json({id:lead.id,message:"Solicitud registrada, pero no se pudo confirmar la reunión.",confirmed:false,bookingError:error instanceof Error?error.message:"Error de calendario"},{status:201});}
    }
    return NextResponse.json({id:lead.id,message:"Solicitud recibida. Te contactaremos para confirmar la reunión.",confirmed:false},{status:201});
  }catch{return NextResponse.json({error:"No fue posible registrar la solicitud"},{status:500});}
}
