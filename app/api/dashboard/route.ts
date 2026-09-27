import {NextResponse} from "next/server";
import {prisma} from "../../../lib/prisma";
import {getSession} from "../../../lib/auth";

async function user(){const s=await getSession();if(!s?.id)return null;return prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,role:true,active:true,organizationId:true,schoolId:true}})}
export async function GET(){
 const u=await user();if(!u?.active)return NextResponse.json({error:"No autorizado"},{status:401});
 const year=2027;let courseWhere:any={academicYear:{year}};
 if(u.role==="DOCENTE"){if(!u.schoolId)return NextResponse.json({error:"Sin establecimiento"},{status:403});courseWhere.schoolId=u.schoolId;courseWhere.teachingAssignments={some:{teacherId:u.id}}}
 else if(u.role==="DIRECTOR"||u.role==="UTP"){if(!u.schoolId)return NextResponse.json({error:"Sin establecimiento"},{status:403});courseWhere.schoolId=u.schoolId}
 else if(u.role==="SOSTENEDOR")courseWhere.school={organizationId:u.organizationId};
 const courses=await prisma.course.findMany({where:courseWhere,select:{id:true,name:true,level:true,teachingAssignments:{select:{subject:true}}}});
 const ids=courses.map(c=>c.id);if(!ids.length)return NextResponse.json({year,kpis:{planned:0,implemented:0,evaluated:0,achievement:null,courses:0},rows:[]});
 const [plans,assessments]=await Promise.all([
  prisma.planning.findMany({where:{courseId:{in:ids}},select:{courseId:true,implementation:true,objectives:{select:{objectiveId:true,objective:{select:{subject:true}}}}}}),
  prisma.assessment.findMany({where:{courseId:{in:ids}},select:{courseId:true,result:true,objectives:{select:{objectiveId:true,objective:{select:{subject:true}}}}}})
 ]);
 const keys=(xs:any[],implemented=false)=>new Set(xs.flatMap(x=>(!implemented||x.implementation)?x.objectives.map((o:any)=>x.courseId+"|"+(o.objective.subject||"")+"|"+o.objectiveId):[]));
 const planned=keys(plans),implemented=keys(plans,true),evaluated=keys(assessments);
 const results=assessments.map(a=>a.result?.achievement).filter((x):x is number=>typeof x==="number");const plannedOnly=[...planned].filter(k=>!implemented.has(k));const implementedNotEvaluated=[...implemented].filter(k=>!evaluated.has(k));const evaluatedWithoutResult=assessments.filter(a=>!a.result).flatMap(a=>a.objectives.map(o=>a.courseId+"|"+(o.objective.subject||"")+"|"+o.objectiveId));const alerts=[...(plannedOnly.length?[{severity:"warning",title:plannedOnly.length+" OA planificados aún no registran implementación",action:"Revisar implementación docente"}]:[]),...(implementedNotEvaluated.length?[{severity:"warning",title:implementedNotEvaluated.length+" OA implementados aún no registran evaluación",action:"Planificar evidencia evaluativa"}]:[]),...(evaluatedWithoutResult.length?[{severity:"info",title:new Set(evaluatedWithoutResult).size+" OA evaluados aún no tienen resultado de logro",action:"Registrar resultados"}]:[])];
 const rows=courses.map(c=>{const subjects=[...new Set(c.teachingAssignments.map(t=>t.subject))];const total=[...planned].filter(k=>k.startsWith(c.id+"|")).length;const imp=[...implemented].filter(k=>k.startsWith(c.id+"|")).length;const eva=[...evaluated].filter(k=>k.startsWith(c.id+"|")).length;return{id:c.id,course:c.name,subjects:subjects.length,plannedOA:total,implementedOA:imp,evaluatedOA:eva,implementationPct:total?Math.round(imp/total*100):0,evaluationPct:total?Math.round(eva/total*100):0}});
 return NextResponse.json({year,kpis:{planned:planned.size,implemented:implemented.size,evaluated:evaluated.size,achievement:results.length?Math.round(results.reduce((a,b)=>a+b,0)/results.length):null,courses:courses.length},alerts,rows});
}