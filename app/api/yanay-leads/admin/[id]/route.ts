import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:403});
 const user=await prisma.user.findUnique({where:{id:String(s.id)},select:{role:true,active:true}});
 if(!user?.active||user.role!=="SUPERADMIN")return NextResponse.json({error:"No autorizado"},{status:403});
 const origin=req.headers.get("origin"),host=req.headers.get("host");
 if(!origin||!host)return NextResponse.json({error:"Origen no autorizado"},{status:403});
 try{if(new URL(origin).host!==host)return NextResponse.json({error:"Origen no autorizado"},{status:403});}catch{return NextResponse.json({error:"Origen inválido"},{status:403});}
 const b=await req.json().catch(()=>null);
 const allowed=["NUEVO","POR_LLAMAR","AGENDADO","CONTACTADO","PROPUESTA_ENVIADA","CERRADO","DESCARTADO"];
 if(!allowed.includes(b?.status))return NextResponse.json({error:"Estado inválido"},{status:400});
 const meeting=b.status==="AGENDADO"&&typeof b.confirmedMeetingAt==="string"?new Date(b.confirmedMeetingAt):null;
 if(b.status==="AGENDADO"&&(!meeting||!Number.isFinite(meeting.getTime())||meeting.getTime()<=Date.now()))return NextResponse.json({error:"Indica fecha futura para confirmar la reunión"},{status:400});
 const {id}=await params;
 if(meeting){const overlapping=await prisma.yanayCommercialLead.count({where:{id:{not:id},status:"AGENDADO",confirmedMeetingAt:{gte:new Date(meeting.getTime()-20*60*1000),lt:new Date(meeting.getTime()+20*60*1000)}}});if(overlapping)return NextResponse.json({error:"Ya existe una reunión en ese horario"},{status:409});}
 const lead=await prisma.yanayCommercialLead.update({where:{id},data:{status:b.status,confirmedMeetingAt:meeting},select:{id:true,status:true}}).catch(()=>null);
 return lead?NextResponse.json({lead}):NextResponse.json({error:"No encontrado"},{status:404});
}

export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:403});
 const user=await prisma.user.findUnique({where:{id:String(s.id)},select:{role:true,active:true}});
 if(!user?.active||user.role!=="SUPERADMIN")return NextResponse.json({error:"No autorizado"},{status:403});
 const origin=req.headers.get("origin"),host=req.headers.get("host");
 if(!origin||!host)return NextResponse.json({error:"Origen no autorizado"},{status:403});
 try{if(new URL(origin).host!==host)return NextResponse.json({error:"Origen no autorizado"},{status:403});}catch{return NextResponse.json({error:"Origen inválido"},{status:403});}
 const {id}=await params;
 const lead=await prisma.yanayCommercialLead.delete({where:{id},select:{id:true}}).catch(()=>null);
 return lead?NextResponse.json({deleted:true}):NextResponse.json({error:"No encontrado"},{status:404});
}
