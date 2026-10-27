import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export async function GET(){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"Inicia sesión"},{status:401});
 const admin=await prisma.user.findUnique({where:{id:String(session.id)},select:{active:true,role:true}});
 if(!admin?.active||admin.role!=="SUPERADMIN")return NextResponse.json({error:"Acceso restringido"},{status:403});
 const users=await prisma.user.findMany({where:{accountType:"INDIVIDUAL",subscriptionStatus:{in:["TRIAL","PAST_DUE","CANCELED"]}},select:{id:true,name:true,email:true,subscriptionStatus:true,trialEndsAt:true,monthlyAiUsed:true,monthlyAiLimit:true},orderBy:{trialEndsAt:"desc"},take:500});
 const activities=await prisma.commercialLeadActivity.findMany({where:{userId:{in:users.map(u=>u.id)}},orderBy:{createdAt:"desc"},select:{id:true,userId:true,status:true,note:true,doNotContact:true,createdAt:true}});
 const latest=Object.values(activities.reduce((acc:Record<string,(typeof activities)[number]>,a)=>{if(!acc[a.userId])acc[a.userId]=a;return acc},{}));
 return NextResponse.json({users:users.map(u=>({...u,followUp:latest.find(a=>a.userId===u.id)||null}))},{headers:{"Cache-Control":"private, no-store"}});
}

export async function POST(req:Request){const session=await getSession();if(!session?.id)return NextResponse.json({error:"Inicia sesión"},{status:401});const admin=await prisma.user.findUnique({where:{id:String(session.id)},select:{id:true,active:true,role:true}});if(!admin?.active||admin.role!=="SUPERADMIN")return NextResponse.json({error:"Acceso restringido"},{status:403});const body=await req.json().catch(()=>null);const userId=String(body?.userId||"");const status=String(body?.status||"");const note=String(body?.note||"").trim();const doNotContact=body?.doNotContact===true;if(!userId||!["PENDIENTE","CONTACTADO","INTERESADO","NO_INTERESADO","NO_CONTACTAR"].includes(status)||note.length>1000)return NextResponse.json({error:"Datos inválidos"},{status:400});const target=await prisma.user.findFirst({where:{id:userId,accountType:"INDIVIDUAL"},select:{id:true}});if(!target)return NextResponse.json({error:"Usuario no encontrado"},{status:404});const previous=await prisma.commercialLeadActivity.findFirst({where:{userId},orderBy:{createdAt:"desc"},select:{doNotContact:true}});if(previous?.doNotContact&&!doNotContact)return NextResponse.json({error:"La exclusión de comunicaciones está vigente y no puede revertirse desde esta pantalla"},{status:403});const entry=await prisma.commercialLeadActivity.create({data:{userId,adminId:admin.id,status:doNotContact?"NO_CONTACTAR":status,note:note||null,doNotContact}});return NextResponse.json({entry},{status:201});}
