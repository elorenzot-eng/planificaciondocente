import { NextResponse } from "next/server";
import { createHash,randomBytes } from "crypto";
import { prisma } from "../../../lib/prisma";
export async function POST(req:Request){
 const {email}=await req.json(); const normalized=String(email||"").trim().toLowerCase();
 const user=normalized?await prisma.user.findUnique({where:{email:normalized}}):null;
 if(user?.active){
  await prisma.passwordResetToken.deleteMany({where:{userId:user.id,usedAt:null}});
  const token=randomBytes(32).toString("hex"), tokenHash=createHash("sha256").update(token).digest("hex");
  await prisma.passwordResetToken.create({data:{userId:user.id,tokenHash,expiresAt:new Date(Date.now()+60*60*1000)}});
  const origin=new URL(req.url).origin; const link=origin+"/?resetToken="+encodeURIComponent(token);
  if(process.env.RESEND_API_KEY){
   const from=process.env.RESEND_FROM_EMAIL||"PlanificaciónDocente <contacto@planificaciondocente.cl>";
   const rr=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({from,to:[user.email],subject:"Restablece tu contraseña · PlanificaciónDocente",html:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h2 style="color:#123f6d">Restablecer contraseña</h2><p>Hola ${user.name}, recibimos una solicitud para crear una nueva contraseña.</p><p><a href="${link}" style="display:inline-block;background:#2563eb;color:white;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Crear nueva contraseña</a></p><p>Este enlace vence en 60 minutos. Si no solicitaste el cambio, puedes ignorar este correo.</p></div>`})});
   if(!rr.ok) console.error("[password-reset-email]",await rr.text());
  }
 }
 return NextResponse.json({ok:true,message:"Si el correo está registrado, recibirás un enlace para crear una nueva contraseña."});
}