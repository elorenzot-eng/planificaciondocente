import { NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

async function admin() {
  const session=await getSession();
  if (!session?.id) return null;
  const user=await prisma.user.findUnique({where:{id:String(session.id)},select:{role:true,active:true}});
  return user?.active && user.role==="SUPERADMIN" ? user : null;
}
export async function GET() {
  if (!await admin()) return NextResponse.json({error:"No autorizado"},{status:403});
  const [licenses,schools]=await Promise.all([
    prisma.institutionalExamLicense.findMany({include:{school:{select:{id:true,name:true,rbd:true,organization:{select:{name:true}}}}},orderBy:{createdAt:"desc"}}),
    prisma.school.findMany({where:{active:true,organization:{name:{not:{startsWith:"Cuenta personal"}}}},select:{id:true,name:true,rbd:true,organization:{select:{name:true}}},orderBy:{name:"asc"}})
  ]);
  return NextResponse.json({licenses,schools},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:Request) {
  if (!await admin()) return NextResponse.json({error:"No autorizado"},{status:403});
  let body:any;try{body=await request.json()}catch{return NextResponse.json({error:"Solicitud inválida"},{status:400})}
  const schoolId=String(body.schoolId||"");
  const product=String(body.product||"").toUpperCase();
  const grade=String(body.grade||"").trim();
  const subject=String(body.subject||"").trim();
  const studentCount=Number(body.studentCount);
  const startsAt=new Date(body.startsAt);
  if(!schoolId || !["SIMCE","PAES"].includes(product) || !grade || !subject || !Number.isSafeInteger(studentCount) || studentCount<1 || studentCount>10000 || !Number.isFinite(startsAt.getTime())) return NextResponse.json({error:"Revisa establecimiento, módulo, nivel, asignatura, estudiantes y fecha"},{status:400});
  const school=await prisma.school.findFirst({where:{id:schoolId,active:true}});
  if(!school) return NextResponse.json({error:"Establecimiento no encontrado"},{status:404});
  const expiresAt=new Date(startsAt);expiresAt.setUTCFullYear(expiresAt.getUTCFullYear()+1);
  const license=await prisma.institutionalExamLicense.create({data:{schoolId,product,grade,subject,studentCount,reviewLimit:studentCount*10,startsAt,expiresAt}});
  return NextResponse.json({license},{status:201});
}
export async function PATCH(request:Request) {
  if (!await admin()) return NextResponse.json({error:"No autorizado"},{status:403});
  let body:any;try{body=await request.json()}catch{return NextResponse.json({error:"Solicitud inválida"},{status:400})}
  const id=String(body.id||"");
  if(typeof body.active!=="boolean"||!id) return NextResponse.json({error:"Parámetros inválidos"},{status:400});
  const result=await prisma.institutionalExamLicense.updateMany({where:{id},data:{active:body.active}});
  return NextResponse.json({updated:result.count});
}
