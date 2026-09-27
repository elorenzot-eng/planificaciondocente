import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { createSession } from "../../../lib/auth";
export async function POST(req:Request){
 const {email,password}=await req.json();
 const user=await prisma.user.findUnique({where:{email:String(email||"").toLowerCase()}});
 if(!user?.active||!user.passwordHash||!(await bcrypt.compare(String(password||""),user.passwordHash)))return NextResponse.json({error:"Correo o contraseña incorrectos"},{status:401});
 await createSession({id:user.id,name:user.name,email:user.email,role:user.role,accountType:user.accountType,organizationId:user.organizationId,schoolId:user.schoolId});
 return NextResponse.json({user:{id:user.id,name:user.name,email:user.email,role:user.role,schoolId:user.schoolId,accountType:user.accountType}});
}