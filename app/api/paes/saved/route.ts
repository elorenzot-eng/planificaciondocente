import {NextRequest,NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
import {SCIENCE_SUBJECTS,validateSciencePractice,type ScienceExam} from "../../../../lib/paes/ciencias";
import {createSciencePrint} from "../../../../lib/paes/ciencias-print";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 const records=await prisma.savedPaesExam.findMany({where:{userId},orderBy:{createdAt:"desc"},select:{id:true,title:true,examType:true,createdAt:true}});
 return NextResponse.json({items:records},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:NextRequest){
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 let body:{jobId?:string};try{body=await request.json();}catch{return NextResponse.json({error:"JSON inválido."},{status:400});}
 if(typeof body.jobId!=="string"||body.jobId.length>100)return NextResponse.json({error:"Identificador inválido."},{status:400});
 const job=await prisma.paesInternalJob.findUnique({where:{id:body.jobId}});
 if(!job||job.userId!==userId||job.nextPart!==12||!job.difficulty.startsWith("CIENCIAS:"))return NextResponse.json({error:"Ensayo no completado."},{status:400});
 const elective=job.difficulty.split(":")[1];
 if(!SCIENCE_SUBJECTS.includes(elective as ScienceExam["elective"]))return NextResponse.json({error:"Electivo inválido."},{status:400});
 const exam:ScienceExam={version:"educantay-paes-ciencias-piloto-v1",elective:elective as ScienceExam["elective"],items:job.items as unknown as ScienceExam["items"]};
 if(validateSciencePractice(exam).length)return NextResponse.json({error:"Ensayo inválido."},{status:422});
 const saved=await prisma.savedPaesExam.upsert({where:{userId_sourceJobId:{userId,sourceJobId:job.id}},create:{userId,sourceJobId:job.id,title:`PAES Ciencias · ${elective} · 12 preguntas`,examType:"CIENCIAS",exam:exam as unknown as import("@prisma/client").Prisma.InputJsonValue},update:{},select:{id:true}});
 return NextResponse.json({savedId:saved.id});
}
export async function DELETE(request:NextRequest){
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 const id=new URL(request.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Identificador requerido."},{status:400});
 const deleted=await prisma.savedPaesExam.deleteMany({where:{id,userId}});
 return NextResponse.json({deleted:deleted.count});
}
