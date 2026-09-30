import {NextResponse} from "next/server";
import crypto from "node:crypto";
import {getSession} from "../../../lib/auth";
import {prisma} from "../../../lib/prisma";
const API=process.env.FLOW_API_URL||"https://sandbox.flow.cl/api";
function sign(p:Record<string,string>){return crypto.createHmac("sha256",process.env.FLOW_SECRET_KEY||"").update(Object.keys(p).sort().map(k=>k+p[k]).join("")).digest("hex")}
export async function POST(){
 const s=await getSession();if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:401});
 const u=await prisma.user.findUnique({where:{id:String(s.id)}});if(!u||u.accountType!=="INDIVIDUAL")return NextResponse.json({error:"Cuenta no habilitada"},{status:403});
 if(!process.env.FLOW_API_KEY||!process.env.FLOW_SECRET_KEY)return NextResponse.json({error:"Flow no configurado"},{status:503});
 const base=process.env.APP_URL||"https://educantay.cl";
 const commerceOrder="EDU-"+u.id+"-"+Date.now();
 await prisma.subscriptionPayment.create({data:{commerceOrder,userId:u.id,amount:25000}});
 const p:Record<string,string>={apiKey:process.env.FLOW_API_KEY,commerceOrder,subject:"Plan Individual Educantay",currency:"CLP",amount:"25000",email:u.email,paymentMethod:"9",urlConfirmation:base+"/api/flow-confirmation",urlReturn:base+"/api/flow-return",optional:JSON.stringify({userId:u.id})};
 try{
  const body=new URLSearchParams({...p,s:sign(p)});
  const r=await fetch(API+"/payment/create",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body});
  const d=await r.json();
  if(!r.ok||!d?.url||!d?.token){await prisma.subscriptionPayment.update({where:{commerceOrder},data:{status:"ERROR"}});return NextResponse.json({error:d?.message||"No fue posible iniciar el pago"},{status:502})}
  await prisma.subscriptionPayment.update({where:{commerceOrder},data:{flowToken:String(d.token),flowOrder:d.flowOrder?Number(d.flowOrder):null}});
  return NextResponse.json({checkoutUrl:d.url+"?token="+encodeURIComponent(d.token)})
 }catch{await prisma.subscriptionPayment.update({where:{commerceOrder},data:{status:"ERROR"}}).catch(()=>{});return NextResponse.json({error:"No fue posible conectar con Flow"},{status:502})}
}