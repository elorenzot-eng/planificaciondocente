import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const organizations = await prisma.organization.findMany({
    include: { schools: true, users: { select: { id:true,name:true,email:true,role:true,active:true,schoolId:true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(organizations);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.kind === "organization") {
    if (!body.name) return NextResponse.json({error:"Nombre requerido"},{status:400});
    const item = await prisma.organization.create({data:{name:body.name,rut:body.rut||null}});
    return NextResponse.json(item,{status:201});
  }
  if (body.kind === "school") {
    if (!body.name || !body.organizationId) return NextResponse.json({error:"Nombre y sostenedor requeridos"},{status:400});
    const item = await prisma.school.create({data:{
      name:body.name,rbd:body.rbd||null,commune:body.commune||null,region:body.region||null,organizationId:body.organizationId
    }});
    return NextResponse.json(item,{status:201});
  }
  if (body.kind === "user") {
    if (!body.name || !body.email || !body.organizationId || !body.role) return NextResponse.json({error:"Datos de usuario incompletos"},{status:400});
    const item = await prisma.user.create({data:{
      name:body.name,email:String(body.email).toLowerCase(),role:body.role,organizationId:body.organizationId,schoolId:body.schoolId||null
    }});
    return NextResponse.json(item,{status:201});
  }
  return NextResponse.json({error:"Operación no válida"},{status:400});
}
