import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 const session=await getSession();
 if(!session||typeof session.id!=="string")return NextResponse.json({error:"Inicia sesión para recuperar tus ensayos."},{status:401});
 const jobs=await prisma.paesInternalJob.findMany({where:{userId:session.id,difficulty:{startsWith:"CIENCIAS"},nextPart:{gt:0}},select:{id:true,difficulty:true,nextPart:true,status:true,updatedAt:true},orderBy:{updatedAt:"desc"},take:30});
 const items=jobs.flatMap(job=>{const match=/^CIENCIAS(_FULL)?:(Biología|Física|Química):(Baja|Media|Alta|Mixta)$/.exec(job.difficulty);if(!match)return [];return [{id:job.id,full:Boolean(match[1]),elective:match[2],difficulty:match[3],completed:job.nextPart,status:job.status,updatedAt:job.updatedAt}];});
 return NextResponse.json({items},{headers:{"Cache-Control":"no-store"}});
}
