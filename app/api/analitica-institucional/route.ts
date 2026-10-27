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
  const results = await prisma.academicExamResult.findMany({where:{schoolId:{in:schools.map(s=>s.id)}},select:{schoolId:true,studentId:true,course:true,subject:true,product:true,examId:true,examTitle:true,takenAt:true,correctAnswers:true,totalQuestions:true,score:true,skillResults:true,contentResults:true,achievementLevel:true,levelMethod:true},orderBy:{takenAt:"desc"}});
  const now = new Date();
  return NextResponse.json({
    schools:schools.map(s=>({
      id:s.id,name:s.name,rbd:s.rbd,
      academicResults:results.filter(x=>x.schoolId===s.id).map(x=>({studentId:x.studentId,course:x.course,subject:x.subject,product:x.product,examId:x.examId,examTitle:x.examTitle,takenAt:x.takenAt,correctAnswers:x.correctAnswers,totalQuestions:x.totalQuestions,score:x.score,skillResults:x.skillResults,contentResults:x.contentResults,achievementLevel:x.achievementLevel,levelMethod:x.levelMethod})),
      licenses:s.institutionalLicenses.filter(l=>l.active && l.expiresAt>now)
        .map(l=>({product:l.product,grade:l.grade,subject:l.subject,
          studentCount:l.studentCount,pdfLimit:l.pdfLimit,pdfUsed:l.pdfUsed,
          reviewLimit:l.reviewLimit,reviewsUsed:l.reviewsUsed}))
    })),
    resultsStatus:results.length?"AVAILABLE":"NO_RESULTS",
    note:results.length?"Resultados registrados por estudiante y curso.":"Todavía no hay resultados académicos registrados."
  },{headers:{"Cache-Control":"private, no-store"}});
}
