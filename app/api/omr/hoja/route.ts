import { NextRequest, NextResponse } from "next/server";
import { createUnifiedAnswerSheet, type ExamFamily, type ExamSubject } from "@/lib/unified-answer-sheet";
import { renderUnifiedAnswerSvg } from "@/lib/unified-answer-svg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Download an A4 OMR page as SVG. Convert to PDF via a separate print/PDF pipeline.
 * This endpoint generates blank templates; it does not expose student information.
 */
export async function GET(request:NextRequest){
 const q=request.nextUrl.searchParams;
 const family=q.get("family"),subject=q.get("subject");
 const total=Number(q.get("questions")),page=Number(q.get("page")??"1");
 if(!family||!subject||!Number.isInteger(total)||!Number.isInteger(page)||page<1)
  return NextResponse.json({error:"Parámetros OMR inválidos"},{status:400});
 try{
  const sheet=createUnifiedAnswerSheet(family as ExamFamily,subject as ExamSubject,total);
  if(page>sheet.pages.length) return NextResponse.json({error:"Página OMR inexistente"},{status:400});
  const svg=renderUnifiedAnswerSvg(sheet.family,sheet.subject,total,page-1);
  return new NextResponse(svg,{
   status:200,
   headers:{
    "Content-Type":"image/svg+xml; charset=utf-8",
    "Content-Disposition":`attachment; filename="hoja-${family.toLowerCase()}-${page}.svg"`,
    "Cache-Control":"no-store",
    "X-Content-Type-Options":"nosniff",
    "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; sandbox"
   }
  });
 }catch{
  return NextResponse.json({error:"Evaluación o cantidad de preguntas inválida"},{status:400});
 }
}
