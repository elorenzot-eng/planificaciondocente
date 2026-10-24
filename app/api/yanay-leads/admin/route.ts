import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export async function GET(){
 const s=await getSession();
 if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:403});
 const user=await prisma.user.findUnique({where:{id:String(s.id)},select:{role:true,active:true}});
 if(!user?.active||user.role!=="SUPERADMIN")return NextResponse.json({error:"No autorizado"},{status:403});
 const leads=await prisma.yanayCommercialLead.findMany({orderBy:{createdAt:"desc"},take:100});
 return NextResponse.json({leads});
}
