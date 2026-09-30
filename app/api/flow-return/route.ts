import {NextResponse} from "next/server";
import crypto from "node:crypto";
import {prisma} from "../../../lib/prisma";
const API=process.env.FLOW_API_URL||"https://sandbox.flow.cl/api";
function sign(p:Record<string,string>){return crypto.createHmac("sha256",process.env.FLOW_SECRET_KEY||"").update(Object.keys(p).sort().map(k=>k+p[k]).join("")).digest("hex")}
async function flowStatus(token:string){const p={apiKey:process.env.FLOW_API_KEY||"",token};const q=new URLSearchParams({...p,s:sign(p)});const r=await fetch(API+"/payment/getStatus?"+q,{cache:"no-store"});if(!r.ok)throw new Error("Flow status");return r.json()}
export async function POST(req:Request){
 const form=await req.formData();const token=String(form.get("token")||"");const u=new URL("/","https://educantay.cl");
 if(!token){u.searchParams.set("payment","unknown");return NextResponse.redirect(u,303)}
 try{
  const d=await flowStatus(token);const commerceOrder=String(d.commerceOrder||"");const payment=commerceOrder?await prisma.subscriptionPayment.findUnique({where:{commerceOrder}}):null;
  if(!payment||payment.flowToken!==token){u.searchParams.set("payment","unknown");return NextResponse.redirect(u,303)}
  const status=Number(d.status);
  if(status===2&&Number(d.amount)===payment.amount){
   if(payment.status!=="PAID"){
    await prisma.$transaction(async tx=>{const fresh=await tx.subscriptionPayment.findUnique({where:{commerceOrder}});if(!fresh||fresh.status==="PAID")return;const user=await tx.user.findUnique({where:{id:fresh.userId}});if(!user||user.accountType!=="INDIVIDUAL")throw new Error("usuario inválido");const now=new Date();const current=user.subscriptionEndsAt&&user.subscriptionEndsAt>now?user.subscriptionEndsAt:now;const end=new Date(current.getTime()+30*24*60*60*1000);await tx.subscriptionPayment.update({where:{commerceOrder},data:{status:"PAID",paidAt:now,flowOrder:d.flowOrder?Number(d.flowOrder):fresh.flowOrder}});await tx.user.update({where:{id:user.id},data:{subscriptionStatus:"ACTIVE",subscriptionEndsAt:end,monthlyPriceClp:20000,monthlyAiLimit:90,monthlyAiUsed:0,aiUsageResetAt:end,active:true}})})
   }
   u.searchParams.set("payment","approved");
  }else if(status===3||status===4){await prisma.subscriptionPayment.update({where:{commerceOrder},data:{status:"REJECTED"}}).catch(()=>{});u.searchParams.set("payment","rejected")}
  else{u.searchParams.set("payment","pending")}
 }catch{u.searchParams.set("payment","pending")}
 return NextResponse.redirect(u,303)
}