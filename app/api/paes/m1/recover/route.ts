import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 const session=await getSession();
 if(!session||typeof session.id!=="string")return NextResponse.json({error:"Inicia sesión para recuperar tus ensayos."},{status:401});
 const jobs=await prisma.paesInternalJob.findMany({
  where:{userId:session.id,difficulty:{startsWith:"M1:"},nextPart:{gt:0}},
  select:{id:true,difficulty:true,nextPart:true,status:true,updatedAt:true},
  orderBy:{updatedAt:"desc"},take:30
 });
 return NextResponse.json({items:jobs.map(job=>({id:job.id,difficulty:job.difficulty.slice(3),completed:job.nextPart,status:job.status,updatedAt:job.updatedAt}))},{headers:{"Cache-Control":"no-store"}});
}
