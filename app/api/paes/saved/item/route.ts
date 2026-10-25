import {NextRequest,NextResponse} from "next/server";
import {validateHistoryExam,type HistoryExam} from "../../../../../lib/paes/historia";
import {createHistoryPrint} from "../../../../../lib/paes/historia-print";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
import {validateScienceFull,SCIENCE_FULL_CONFIG} from "../../../../../lib/paes/ciencias-full";
import {validateSciencePractice,type ScienceExam} from "../../../../../lib/paes/ciencias";
import {createSciencePrint} from "../../../../../lib/paes/ciencias-print";
import {createM1Print} from "../../../../../lib/paes/m1-print";
import {createM2Print} from "../../../../../lib/paes/m2-print";
import type {M1Exam} from "../../../../../lib/paes/m1";
import type {M2Exam} from "../../../../../lib/paes/m2";
import type {LectoraExam} from "../../../../../lib/paes/lectora";
import {INTERNAL_65_MATRIX} from "../../../../../lib/paes/lectora-65-internal.server";
import {createLectoraPrintableHtml} from "../../../../../lib/paes/lectora-print";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const version=new URL(request.url).searchParams.get("version");
 const respond=(data:{title:string;studentHtml:string;teacherHtml:string;exam?:ScienceExam})=>{
  if(version==="estudiante"||version==="profesor"){
   return new NextResponse(version==="profesor"?data.teacherHtml:data.studentHtml,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; base-uri 'none'; frame-ancestors 'self'"}});
  }
  return NextResponse.json(data,{headers:{"Cache-Control":"private, no-store"}});
 };
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 const id=new URL(request.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Identificador requerido."},{status:400});
 const record=await prisma.savedPaesExam.findFirst({where:{id,userId}});
 if(!record)return NextResponse.json({error:"Ensayo no encontrado."},{status:404});
 if(record.examType==="HISTORIA"){const exam=record.exam as unknown as HistoryExam;if(validateHistoryExam(exam).length)return NextResponse.json({error:"Ensayo Historia guardado inválido."},{status:422});return respond({title:record.title,studentHtml:createHistoryPrint(exam,false),teacherHtml:createHistoryPrint(exam,true)});}
 if(record.examType==="LECTORA"){const exam=record.exam as unknown as LectoraExam;return respond({title:record.title,studentHtml:createLectoraPrintableHtml(exam,exam.items.length===10?{...INTERNAL_65_MATRIX,version:"educantay-paes-pilot-10-v1",questionCount:10,bySkill:{Localizar:2,Interpretar:6,Evaluar:2},byGenre:{Literario:5,"No literario":5}}:INTERNAL_65_MATRIX,"estudiante"),teacherHtml:createLectoraPrintableHtml(exam,exam.items.length===10?{...INTERNAL_65_MATRIX,version:"educantay-paes-pilot-10-v1",questionCount:10,bySkill:{Localizar:2,Interpretar:6,Evaluar:2},byGenre:{Literario:5,"No literario":5}}:INTERNAL_65_MATRIX,"profesor")});}
 if(record.examType==="M1"){const exam=record.exam as unknown as M1Exam;return respond({title:record.title,studentHtml:createM1Print(exam,false),teacherHtml:createM1Print(exam,true)});}
 if(record.examType==="M2"){const exam=record.exam as unknown as M2Exam;return respond({title:record.title,studentHtml:createM2Print(exam,false),teacherHtml:createM2Print(exam,true)});}
 if(record.examType!=="CIENCIAS")return NextResponse.json({error:"Formato aún no disponible."},{status:422});
 const exam=record.exam as unknown as ScienceExam;
 if((exam.version===SCIENCE_FULL_CONFIG.version?validateScienceFull(exam):validateSciencePractice(exam)).length)return NextResponse.json({error:"Ensayo guardado inválido."},{status:422});
 return respond({title:record.title,exam,studentHtml:createSciencePrint(exam,false),teacherHtml:createSciencePrint(exam,true)});
}
