import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import type { Prisma } from "@prisma/client";
export async function GET(){const existing=await prisma.user.count({where:{role:"SUPERADMIN"}});return NextResponse.json({needsSetup:existing===0})}
export async function POST(req:Request){
 const existing=await prisma.user.count({where:{role:"SUPERADMIN"}});
 if(existing>0)return NextResponse.json({error:"La plataforma ya fue inicializada"},{status:409});
 const {name,email,password,organization}=await req.json();
 if(!name||!email||!password||!organization)return NextResponse.json({error:"Datos incompletos"},{status:400});
 const passwordHash=await bcrypt.hash(String(password),12);
 const result=await prisma.$transaction(async (tx: Prisma.TransactionClient)=>{const org=await tx.organization.create({data:{name:organization}});const user=await tx.user.create({data:{name,email:String(email).toLowerCase(),passwordHash,role:"SUPERADMIN",organizationId:org.id}});return {organization:{id:org.id,name:org.name},user:{id:user.id,name:user.name,email:user.email,role:user.role}}});
 return NextResponse.json(result,{status:201});
}