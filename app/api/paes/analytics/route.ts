import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const PAES=["PAES","ENSAYOS_PAES"];
export async function GET(request:Request){
 const session=await getSession();
 if(!session||typeof session.id!=="string")return NextResponse.json({error:"Inicia sesión."},{status:401});
 const user=await prisma.user.findUnique({where:{id:session.id},select:{schoolId:true,role:true,active:true}});
 if(!user?.active||!user.schoolId||!["SUPERADMIN","SOSTENEDOR","DIRECTOR","UTP","DOCENTE"].includes(user.role))return NextResponse.json({error:"Se requiere una cuenta institucional vinculada a un establecimiento."},{status:403});
 const url=new URL(request.url),course=url.searchParams.get("course"),subject=url.searchParams.get("subject");
 const rows=await prisma.academicExamResult.findMany({where:{schoolId:user.schoolId,product:{in:PAES},...(course?{course}:{}),...(subject?{subject}:{})},select:{id:true,studentId:true,course:true,subject:true,examTitle:true,correctAnswers:true,totalQuestions:true,score:true,skillResults:true,contentResults:true,takenAt:true},orderBy:{takenAt:"desc"},take:2000});
 const grouped=new Map<string,{course:string;subject:string;count:number;total:number;sum:number;students:Set<string>}>();
 for(const r of rows){const key=r.course+"|"+r.subject;let g=grouped.get(key);if(!g){g={course:r.course,subject:r.subject,count:0,total:0,sum:0,students:new Set()};grouped.set(key,g);}if(r.totalQuestions>0){g.count++;g.total+=r.totalQuestions;g.sum+=r.correctAnswers;}g.students.add(r.studentId);}
 // Las dimensiones se agregan solo cuando existe un formato verificable.
 // No se interpretan estructuras JSON desconocidas como niveles oficiales.
 const dimensions=new Map<string,{kind:string;name:string;correct:number;total:number}>();
 for(const r of rows){
  for(const [kind,raw] of [["Habilidad",r.skillResults],["Contenido",r.contentResults]] as const){
   if(!Array.isArray(raw))continue;
   for(const entry of raw){
    if(!entry||typeof entry!=="object"||Array.isArray(entry))continue;
    const e=entry as Record<string,unknown>;
    const name=typeof e.name==="string"?e.name.trim():"";
    const correct=e.correct, total=e.total;
    if(!name||name.length>120||typeof correct!=="number"||typeof total!=="number"||!Number.isInteger(correct)||!Number.isInteger(total)||total<=0||correct<0||correct>total)continue;
    const key=kind+":"+name;
    const d=dimensions.get(key)||{kind,name,correct:0,total:0};
    d.correct+=correct;d.total+=total;dimensions.set(key,d);
   }
  }
 }
 const dimensionSummary=[...dimensions.values()].map(d=>({kind:d.kind,name:d.name,questions:d.total,accuracyPercent:Math.round(d.correct/d.total*1000)/10})).sort((a,b)=>a.accuracyPercent-b.accuracyPercent);
 const summary=[...grouped.values()].map(g=>({course:g.course,subject:g.subject,attempts:g.count,students:g.students.size,accuracyPercent:g.total?Math.round(g.sum/g.total*1000)/10:null})).sort((a,b)=>a.course.localeCompare(b.course,"es")||a.subject.localeCompare(b.subject,"es"));
 return NextResponse.json({totalAttempts:rows.length,uniqueStudents:new Set(rows.map(r=>r.studentId)).size,summary,dimensionSummary,rows:rows.map(r=>({id:r.id,course:r.course,subject:r.subject,examTitle:r.examTitle,correctAnswers:r.correctAnswers,totalQuestions:r.totalQuestions,accuracyPercent:r.totalQuestions?Math.round(r.correctAnswers/r.totalQuestions*1000)/10:null,score:r.score,takenAt:r.takenAt}))},{headers:{"Cache-Control":"private, no-store"}});
}
