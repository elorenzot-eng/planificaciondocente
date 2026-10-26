import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";
import { isLicenseActive } from "../../../../lib/institutional-exam-license";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({error:"Inicie sesión"},{status:401});
  const user = await prisma.user.findUnique({where:{id:String(session.id)},select:{id:true,active:true,role:true,schoolId:true,organizationId:true}});
  if (!user?.active || !["SUPERADMIN","SOSTENEDOR","DIRECTOR","ADMIN_COLEGIO","DOCENTE"].includes(user.role))
    return NextResponse.json({error:"No autorizado"},{status:403});
  let body: Record<string,unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({error:"Solicitud inválida"},{status:400}); }
  const licenseId = String(body.licenseId || "");
  const kind = String(body.kind || "");
  const requestKey = String(body.requestKey || "");
  const studentId = String(body.studentId || "");
  if (!licenseId || !["PDF","REVIEW"].includes(kind) || !/^[a-zA-Z0-9_-]{12,128}$/.test(requestKey) ||
      (kind === "REVIEW" && !studentId))
    return NextResponse.json({error:"Datos de consumo inválidos"},{status:400});
  try {
    return await prisma.$transaction(async tx => {
      const license = await tx.institutionalExamLicense.findUnique({where:{id:licenseId}});
      if (!license || !isLicenseActive(license.status,license.startsAt,license.endsAt))
        return NextResponse.json({error:"Licencia no vigente"},{status:403});
      if (user.role !== "SUPERADMIN" && (license.organizationId !== user.organizationId ||
          (user.role !== "SOSTENEDOR" && user.schoolId !== license.schoolId)))
        return NextResponse.json({error:"Establecimiento no autorizado"},{status:403});
      const prior = await tx.institutionalExamUsage.findUnique({where:{requestKey}});
      if (prior) {
        if (prior.licenseId !== licenseId || prior.kind !== kind || (kind === "REVIEW" && prior.studentKey !== studentId))
          return NextResponse.json({error:"Identificador de solicitud ya utilizado"},{status:409});
        return NextResponse.json({ok:true,duplicate:true});
      }
      if (kind === "PDF") {
        const updated = await tx.institutionalExamLicense.updateMany({
          where:{id:licenseId,pdfUsed:{lt:license.pdfLimit}},data:{pdfUsed:{increment:1}}
        });
        if (updated.count !== 1) return NextResponse.json({error:"Límite de PDF agotado"},{status:409});
      } else {
        const student = await tx.institutionalStudent.findFirst({
          where:{id:studentId,schoolId:license.schoolId,active:true},select:{id:true}
        });
        if (!student) return NextResponse.json({error:"Estudiante no matriculado en este colegio"},{status:403});
        const used = await tx.institutionalExamUsage.count({where:{licenseId,kind:"REVIEW",studentKey:studentId}});
        if (used >= license.reviewsPerStudent)
          return NextResponse.json({error:"Límite de revisiones agotado para este estudiante"},{status:409});
      }
      await tx.institutionalExamUsage.create({data:{licenseId,kind,studentKey:kind==="REVIEW"?studentId:null,requestKey}});
      return NextResponse.json({ok:true,duplicate:false});
    },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002","P2034"].includes(error.code))
      return NextResponse.json({error:"Consumo simultáneo; reintente con el mismo identificador"},{status:409});
    return NextResponse.json({error:"No fue posible registrar el consumo"},{status:500});
  }
}
