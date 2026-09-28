import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
export async function POST(req:Request){
 const {token,password}=await req.json(); const pass=String(password||"");
 if(pass.length<8)return NextResponse.json({error:"La contraseña debe tener al menos 8 caracteres."},{status:400});
 const tokenHash=createHash("sha256").update(String(token||"")).digest("hex");
 const row=await prisma.passwordResetToken.findUnique({where:{tokenHash}});
 if(!row||row.usedAt||row.expiresAt<=new Date())return NextResponse.json({error:"El enlace no es válido o ya expiró. Solicita uno nuevo."},{status:400});
 const passwordHash=await bcrypt.hash(pass,12);
 await prisma.$transaction([prisma.user.update({where:{id:row.userId},data:{passwordHash}}),prisma.passwordResetToken.update({where:{id:row.id},data:{usedAt:new Date()}}),prisma.passwordResetToken.deleteMany({where:{userId:row.userId,id:{not:row.id}}})]);
 return NextResponse.json({ok:true,message:"Contraseña actualizada. Ya puedes ingresar."});
}