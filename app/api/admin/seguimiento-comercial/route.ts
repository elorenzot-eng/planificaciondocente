import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export async function GET(){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"Inicia sesión"},{status:401});
 const admin=await prisma.user.findUnique({where:{id:String(session.id)},select:{active:true,role:true}});
 if(!admin?.active||admin.role!=="SUPERADMIN")return NextResponse.json({error:"Acceso restringido"},{status:403});
 const users=await prisma.user.findMany({where:{accountType:"INDIVIDUAL",subscriptionStatus:{in:["TRIAL","PAST_DUE","CANCELED"]}},select:{id:true,name:true,email:true,subscriptionStatus:true,trialEndsAt:true,monthlyAiUsed:true,monthlyAiLimit:true},orderBy:{trialEndsAt:"desc"},take:500});
 return NextResponse.json({users},{headers:{"Cache-Control":"private, no-store"}});
}
