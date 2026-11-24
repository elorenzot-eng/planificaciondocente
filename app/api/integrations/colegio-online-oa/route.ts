import {NextResponse} from "next/server";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
export async function GET(request:Request){
 const secret=process.env.EDUCANTAY_OA_SYNC_SECRET;
 if(!secret||secret.length<24||request.headers.get("x-oa-sync-secret")!==secret)return NextResponse.json({error:"No autorizado"},{status:401});
 const url=new URL(request.url);
 const grade=Number(url.searchParams.get("grade"));
 const subjects=["Matemática","Lenguaje y Comunicación","Lengua y Literatura","Ciencias Naturales","Historia, Geografía y Ciencias Sociales"];
 const subject=url.searchParams.get("subject")||"";
 if(!Number.isInteger(grade)||grade<1||grade>8||!(subjects.includes(subject)||(subject==="Inglés"&&grade>=5)))return NextResponse.json({error:"Filtro inválido"},{status:400});
 const rows=await prisma.learningObjective.findMany({where:{level:grade+"° Básico",subject:subject==="Inglés"?{in:["Inglés","Idioma Extranjero: Inglés","Idioma Extranjero Inglés"]}:subject},select:{code:true,level:true,subject:true,text:true,source:true,sourceUrl:true},orderBy:{code:"asc"},take:100});
 return NextResponse.json({source:"EducAntay",count:rows.length,objectives:rows},{headers:{"Cache-Control":"no-store"}});
}
