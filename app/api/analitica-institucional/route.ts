import { NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({error:"Debes iniciar sesión"},{status:401});
  const user = await prisma.user.findUnique({
    where:{id:String(session.id)},
    select:{active:true,role:true,accountType:true,organizationId:true,schoolId:true}
  });
  if (!user?.active || user.accountType !== "INSTITUTIONAL" ||
      !["DIRECTOR","SOSTENEDOR","SUPERADMIN"].includes(user.role)) {
    return NextResponse.json({error:"Acceso exclusivo para colegios y sostenedores"},{status:403});
  }
  const scope = user.role === "SUPERADMIN" ? {} :
    user.role === "SOSTENEDOR" ? {organizationId:user.organizationId} :
    {organizationId:user.organizationId,id:user.schoolId || "__sin_colegio__"};
  const schools = await prisma.school.findMany({
    where:{...scope,active:true},
    select:{id:true,name:true,rbd:true,institutionalLicenses:{
      select:{product:true,grade:true,subject:true,active:true,expiresAt:true,
        studentCount:true,pdfLimit:true,pdfUsed:true,reviewLimit:true,reviewsUsed:true}
    }}
  });
  const now = new Date();
  return NextResponse.json({
    schools:schools.map(s=>({
      id:s.id,name:s.name,rbd:s.rbd,
      licenses:s.institutionalLicenses.filter(l=>l.active && l.expiresAt>now)
        .map(l=>({product:l.product,grade:l.grade,subject:l.subject,
          studentCount:l.studentCount,pdfLimit:l.pdfLimit,pdfUsed:l.pdfUsed,
          reviewLimit:l.reviewLimit,reviewsUsed:l.reviewsUsed}))
    })),
    resultsStatus:"NOT_CONNECTED",
    note:"No hay resultados institucionales verificados para graficar todavía."
  },{headers:{"Cache-Control":"private, no-store"}});
}
