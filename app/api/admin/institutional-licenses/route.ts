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
  const selections=Array.isArray(body.selections)?body.selections:[];
  const studentCount=Number(body.studentCount);
  const startsAt=new Date(body.startsAt);
  const validGrades=["4","6","8","2M"];
  const validPaes=["Competencia Lectora","Matemática M1","Matemática M2","Ciencias","Historia"];
  if(!schoolId||!Number.isSafeInteger(studentCount)||studentCount<1||studentCount>10000||!Number.isFinite(startsAt.getTime())||selections.length<1||selections.length>9)
    return NextResponse.json({error:"Selecciona colegio, pruebas, estudiantes y fecha válida"},{status:400});
  const normalized=selections.map((x:any)=>({product:String(x.product||""),grade:String(x.grade||""),subject:String(x.subject||"")}));
  if(normalized.some((x:any)=>x.product==="SIMCE"?!validGrades.includes(x.grade)||x.subject!=="Lectura y Matemática":x.product==="PAES"?!validPaes.includes(x.grade)||x.subject!=="Prueba completa":true))
    return NextResponse.json({error:"Selección de pruebas no válida"},{status:400});
  if(new Set(normalized.map((x:any)=>[x.product,x.grade,x.subject].join("|"))).size!==normalized.length)
    return NextResponse.json({error:"No repitas pruebas"},{status:400});
  const school=await prisma.school.findFirst({where:{id:schoolId,active:true}});
  if(!school) return NextResponse.json({error:"Establecimiento no encontrado"},{status:404});
  const expiresAt=new Date(startsAt);expiresAt.setUTCFullYear(expiresAt.getUTCFullYear()+1);
  const licenses=await prisma.$transaction(async tx=>{
    const created=[];
    for(const item of normalized){
      created.push(await tx.institutionalExamLicense.create({data:{schoolId,...item,studentCount,reviewLimit:studentCount*10,startsAt,expiresAt}}));
    }
    return created;
  });
  return NextResponse.json({licenses},{status:201});
}

export async function PATCH(request:Request) {
  if (!await admin()) return NextResponse.json({error:"No autorizado"},{status:403});
  let body:any;try{body=await request.json()}catch{return NextResponse.json({error:"Solicitud inválida"},{status:400})}
  const id=String(body.id||"");
  if(typeof body.active!=="boolean"||!id) return NextResponse.json({error:"Parámetros inválidos"},{status:400});
  const result=await prisma.institutionalExamLicense.updateMany({where:{id},data:{active:body.active}});
  return NextResponse.json({updated:result.count});
}
