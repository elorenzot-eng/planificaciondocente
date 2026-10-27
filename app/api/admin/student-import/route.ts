import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
import {validateStudentImport} from "../../../../lib/student-import";

async function access() {
  const session = await getSession();
  if (!session?.id) return null;
  const user = await prisma.user.findUnique({
    where: {id: String(session.id)},
    select: {id:true,role:true,active:true,organizationId:true,schoolId:true}
  });
  return user?.active && ["SUPERADMIN","SOSTENEDOR","DIRECTOR"].includes(user.role) ? user : null;
}
async function allowedSchool(user: NonNullable<Awaited<ReturnType<typeof access>>>, schoolId: string) {
  return prisma.school.findFirst({where:{
    id:schoolId,active:true,
    ...(user.role === "SUPERADMIN" ? {} : {organizationId:user.organizationId}),
    ...(user.role === "DIRECTOR" ? {id:user.schoolId ?? "__none__"} : {})
  },select:{id:true,name:true}});
}
export async function GET(req:Request) {
  const user = await access();
  if (!user) return NextResponse.json({error:"No autorizado"},{status:403});
  const schoolId = new URL(req.url).searchParams.get("schoolId") ?? "";
  const school = await allowedSchool(user,schoolId);
  if (!school) return NextResponse.json({error:"Colegio no autorizado"},{status:403});
  const students = await prisma.licensedStudent.findMany({
    where:{schoolId},orderBy:[{course:"asc"},{paternalSurname:"asc"},{firstName:"asc"}],
    select:{id:true,firstName:true,paternalSurname:true,maternalSurname:true,rut:true,course:true}
  });
  return NextResponse.json({school,students},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:Request) {
  const user = await access();
  if (!user) return NextResponse.json({error:"No autorizado"},{status:403});
  let body:unknown;
  try {body=await req.json();} catch {return NextResponse.json({error:"JSON inválido"},{status:400});}
  if (!body || typeof body !== "object") return NextResponse.json({error:"Solicitud inválida"},{status:400});
  const payload = body as {schoolId?:unknown;rows?:unknown};
  const schoolId = String(payload.schoolId ?? "");
  const school = await allowedSchool(user,schoolId);
  if (!school) return NextResponse.json({error:"Colegio no autorizado"},{status:403});
  if (!Array.isArray(payload.rows) || payload.rows.length > 5000 || !payload.rows.every(Array.isArray))
    return NextResponse.json({error:"Planilla inválida o demasiado grande (máximo 5000 filas)"},{status:400});
  const {students,issues} = validateStudentImport(payload.rows as unknown[][]);
  if (issues.length) return NextResponse.json({error:"Corrige la planilla antes de importar",issues},{status:422});
  if (!students.length) return NextResponse.json({error:"No hay estudiantes válidos"},{status:400});
  const existing = await prisma.licensedStudent.findMany({
    where:{schoolId,rut:{in:students.map(s=>s.rut)}},select:{rut:true}
  });
  if (existing.length) return NextResponse.json({
    error:"Existen RUT ya registrados en este colegio",
    duplicates:existing.map(s=>s.rut)
  },{status:409});
  try {
    const result = await prisma.licensedStudent.createMany({data:students.map(s=>({...s,schoolId})),skipDuplicates:true});
    return NextResponse.json({imported:result.count},{status:201});
  } catch {
    return NextResponse.json({error:"No se pudo completar la importación"},{status:500});
  }
}
