import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "../../../lib/auth";

async function currentAdmin() {
  const session = await getSession();
  if (!session?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: String(session.id) },
    select: { id:true, role:true, active:true, organizationId:true }
  });
  if (!user?.active || !["SUPERADMIN","SOSTENEDOR","DIRECTOR"].includes(user.role)) return null;
  return user;
}

export async function GET() {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error:"No autorizado"},{status:401});
  const organizations = await prisma.organization.findMany({
    where: admin.role === "SUPERADMIN" ? {} : { id: admin.organizationId },
    include: { schools: { where: admin.role === "DIRECTOR" ? { users: { some: { id: admin.id } } } : {}, orderBy:{name:"asc"}}, users: { where: admin.role === "DIRECTOR" ? { schoolId: { not: null }, school: { users: { some: { id: admin.id } } } } : {}, select: { id:true,name:true,email:true,role:true,active:true,schoolId:true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(organizations);
}

export async function POST(req: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error:"No autorizado"},{status:401});
  const body = await req.json();

  if (body.kind === "organization") {
    if (admin.role !== "SUPERADMIN") return NextResponse.json({error:"Solo el Superadministrador puede crear sostenedores"},{status:403});
    if (!String(body.name||"").trim()) return NextResponse.json({error:"Nombre requerido"},{status:400});
    const item = await prisma.organization.create({data:{name:String(body.name).trim(),rut:body.rut?String(body.rut).trim():null}});
    return NextResponse.json(item,{status:201});
  }

  if (body.kind === "school") {
    if (admin.role === "DIRECTOR") return NextResponse.json({error:"El Director administra usuarios de su establecimiento; no puede crear establecimientos"},{status:403});
    const organizationId = admin.role === "SUPERADMIN" ? String(body.organizationId||"") : admin.organizationId;
    if (!String(body.name||"").trim() || !organizationId) return NextResponse.json({error:"Nombre y sostenedor requeridos"},{status:400});
    const org = await prisma.organization.findUnique({where:{id:organizationId},select:{id:true,active:true}});
    if (!org?.active) return NextResponse.json({error:"Sostenedor no válido"},{status:400});
    const item = await prisma.school.create({data:{
      name:String(body.name).trim(),rbd:body.rbd?String(body.rbd).trim():null,commune:body.commune?String(body.commune).trim():null,region:body.region?String(body.region):null,organizationId
    }});
    return NextResponse.json(item,{status:201});
  }

  if (body.kind === "user") {
    const organizationId = admin.role === "SUPERADMIN" ? String(body.organizationId||"") : admin.organizationId;
    const role = String(body.role||"");
    const allowed = admin.role === "SUPERADMIN" ? ["SOSTENEDOR","DIRECTOR","UTP","DOCENTE"] : admin.role === "SOSTENEDOR" ? ["DIRECTOR","UTP","DOCENTE"] : ["UTP","DOCENTE"];
    const password = String(body.password||"");
    if (!String(body.name||"").trim() || !String(body.email||"").trim() || !organizationId || !allowed.includes(role)) return NextResponse.json({error:"Datos de usuario o rol no válidos"},{status:400});
    if (password.length < 12) return NextResponse.json({error:"La contraseña debe tener al menos 12 caracteres"},{status:400});
    if (admin.role === "DIRECTOR" && String(body.schoolId||"") !== String((await prisma.user.findUnique({where:{id:admin.id},select:{schoolId:true}}))?.schoolId||"")) return NextResponse.json({error:"El Director solo puede crear usuarios en su propio establecimiento"},{status:403});
    if (body.schoolId) {
      const school = await prisma.school.findFirst({where:{id:String(body.schoolId),organizationId,active:true},select:{id:true}});
      if (!school) return NextResponse.json({error:"El establecimiento no pertenece al sostenedor seleccionado"},{status:400});
    }
    if (role !== "SOSTENEDOR" && !body.schoolId) return NextResponse.json({error:"Director, UTP y Docente deben estar asociados a un establecimiento"},{status:400});
    const passwordHash = await bcrypt.hash(password,12);
    try {
      const item = await prisma.user.create({data:{name:String(body.name).trim(),email:String(body.email).trim().toLowerCase(),role:role as any,passwordHash,organizationId,schoolId:body.schoolId?String(body.schoolId):null}});
      return NextResponse.json({id:item.id,name:item.name,email:item.email,role:item.role,schoolId:item.schoolId},{status:201});
    } catch {
      return NextResponse.json({error:"No fue posible crear el usuario. Verifica que el correo no esté registrado."},{status:400});
    }
  }
  return NextResponse.json({error:"Operación no válida"},{status:400});
}


export async function PATCH(req: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({error:"No autorizado"},{status:401});
  const body = await req.json();
  const kind = String(body.kind||"");
  const id = String(body.id||"");
  if (!id) return NextResponse.json({error:"Identificador requerido"},{status:400});

  if (kind === "school") {
    const school = await prisma.school.findUnique({where:{id},select:{id:true,organizationId:true}});
    if (!school || (admin.role !== "SUPERADMIN" && school.organizationId !== admin.organizationId) || admin.role === "DIRECTOR") return NextResponse.json({error:"Establecimiento no autorizado"},{status:403});
    const item = await prisma.school.update({where:{id},data:{
      ...(typeof body.active === "boolean" ? {active:body.active} : {}),
      ...(body.name ? {name:String(body.name).trim()} : {}),
      ...(body.rbd !== undefined ? {rbd:body.rbd?String(body.rbd).trim():null} : {}),
      ...(body.commune !== undefined ? {commune:body.commune?String(body.commune).trim():null} : {}),
      ...(body.region !== undefined ? {region:body.region?String(body.region):null} : {})
    }});
    return NextResponse.json(item);
  }

  if (kind === "user") {
    const target = await prisma.user.findUnique({where:{id},select:{id:true,role:true,organizationId:true}});
    if (!target || target.role === "SUPERADMIN" || (admin.role !== "SUPERADMIN" && target.organizationId !== admin.organizationId)) return NextResponse.json({error:"Usuario no autorizado"},{status:403});
    if (admin.role === "DIRECTOR") { const me=await prisma.user.findUnique({where:{id:admin.id},select:{schoolId:true}}); const fullTarget=await prisma.user.findUnique({where:{id},select:{schoolId:true,role:true}}); if (!me?.schoolId || fullTarget?.schoolId!==me.schoolId || !["UTP","DOCENTE"].includes(String(fullTarget?.role))) return NextResponse.json({error:"El Director solo puede gestionar UTP y Docentes de su establecimiento"},{status:403}); }
    if (admin.role === "SOSTENEDOR" && target.role === "SOSTENEDOR") return NextResponse.json({error:"Un sostenedor no puede modificar otra cuenta sostenedor"},{status:403});
    const data:any = {};
    if (typeof body.active === "boolean") data.active=body.active;
    if (body.name) data.name=String(body.name).trim();
    if (body.password) {
      if (String(body.password).length < 12) return NextResponse.json({error:"La contraseña debe tener al menos 12 caracteres"},{status:400});
      data.passwordHash=await bcrypt.hash(String(body.password),12);
    }
    const item = await prisma.user.update({where:{id},data,select:{id:true,name:true,email:true,role:true,active:true,schoolId:true}});
    return NextResponse.json(item);
  }

  if (kind === "organization") {
    if (admin.role !== "SUPERADMIN") return NextResponse.json({error:"Solo el Superadministrador puede modificar sostenedores"},{status:403});
    const item = await prisma.organization.update({where:{id},data:{
      ...(typeof body.active === "boolean" ? {active:body.active} : {}),
      ...(body.name ? {name:String(body.name).trim()} : {}),
      ...(body.rut !== undefined ? {rut:body.rut?String(body.rut).trim():null} : {})
    }});
    return NextResponse.json(item);
  }
  return NextResponse.json({error:"Operación no válida"},{status:400});
}
