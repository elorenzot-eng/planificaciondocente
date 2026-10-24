import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){
 const s=await getSession();if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:403});
 const user=await prisma.user.findUnique({where:{id:String(s.id)},select:{role:true,active:true}});
 if(!user?.active||user.role!=="SUPERADMIN")return NextResponse.json({error:"No autorizado"},{status:403});
 const origin=req.headers.get("origin"),host=req.headers.get("host");
 if(!origin||!host)return NextResponse.json({error:"Origen no autorizado"},{status:403});
 try{if(new URL(origin).host!==host)return NextResponse.json({error:"Origen no autorizado"},{status:403});}catch{return NextResponse.json({error:"Origen inválido"},{status:403});}

 const {id}=await params;
 const deleted=await prisma.yanayCommercialLead.delete({where:{id},select:{id:true}}).catch(()=>null);
 return deleted?NextResponse.json({deleted:true}):NextResponse.json({error:"No encontrado"},{status:404});
}
