import {NextResponse} from "next/server";
import crypto from "node:crypto";
import {prisma} from "../../../lib/prisma";
const API=process.env.FLOW_API_URL||"https://sandbox.flow.cl/api";
function sign(p:Record<string,string>){return crypto.createHmac("sha256",process.env.FLOW_SECRET_KEY||"").update(Object.keys(p).sort().map(k=>k+p[k]).join("")).digest("hex")}
async function flowStatus(token:string){const p={apiKey:process.env.FLOW_API_KEY||"",token};const q=new URLSearchParams({...p,s:sign(p)});const r=await fetch(API+"/payment/getStatus?"+q,{cache:"no-store"});if(!r.ok)throw new Error("Flow status");return r.json()}
export async function POST(req:Request){
 try{
  const form=await req.formData();const token=String(form.get("token")||"");if(!token)return new NextResponse("token requerido",{status:400});
  const d=await flowStatus(token);const commerceOrder=String(d.commerceOrder||"");
  if(!commerceOrder)return new NextResponse("orden inválida",{status:400});
  const payment=await prisma.subscriptionPayment.findUnique({where:{commerceOrder}});
  if(!payment||payment.flowToken!==token||payment.amount!==20000)return new NextResponse("orden no reconocida",{status:400});
  if(Number(d.status)!==2||Number(d.amount)!==payment.amount)return new NextResponse("ok");
  await prisma.$transaction(async tx=>{
   const fresh=await tx.subscriptionPayment.findUnique({where:{commerceOrder}});
   if(!fresh||fresh.status==="PAID")return;
   const user=await tx.user.findUnique({where:{id:fresh.userId}});
   if(!user||user.accountType!=="INDIVIDUAL")throw new Error("usuario inválido");
   const now=new Date();const current=user.subscriptionEndsAt&&user.subscriptionEndsAt>now?user.subscriptionEndsAt:now;
   const end=new Date(current.getTime()+30*24*60*60*1000);
   await tx.subscriptionPayment.update({where:{commerceOrder},data:{status:"PAID",paidAt:now,flowOrder:d.flowOrder?Number(d.flowOrder):fresh.flowOrder}});
   await tx.user.update({where:{id:user.id},data:{subscriptionStatus:"ACTIVE",subscriptionEndsAt:end,monthlyPriceClp:20000,monthlyAiLimit:90,monthlyAiUsed:0,aiUsageResetAt:end,active:true}});
  });
  return new NextResponse("ok")
 }catch{return new NextResponse("error",{status:500})}
}