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
 const allowed=["NUEVO","POR_LLAMAR","CONTACTADO","PROPUESTA_ENVIADA","CERRADO","DESCARTADO"];
 if(!allowed.includes(b?.status))return NextResponse.json({error:"Estado inválido"},{status:400});
 const {id}=await params;
 const lead=await prisma.yanayCommercialLead.update({where:{id},data:{status:b.status},select:{id:true,status:true}}).catch(()=>null);
 return lead?NextResponse.json({lead}):NextResponse.json({error:"No encontrado"},{status:404});
}
