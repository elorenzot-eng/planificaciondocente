import {NextRequest,NextResponse} from "next/server";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const allowedLevels=new Set(Array.from({length:8},(_,i)=>String(i+1)));
function grade(raw:string){const match=raw.match(/(?:^|\\D)([1-8])(?=\\D|$)/);return match?match[1]:null;}
export async function GET(request:NextRequest){
 const expected=process.env.EDUCANTAY_OA_SYNC_SECRET;
 const authorization=request.headers.get("authorization")||"";
 if(!expected||expected.length<24||authorization!=="Bearer "+expected)return NextResponse.json({error:"No autorizado"},{status:401});
 const level=request.nextUrl.searchParams.get("level");
 if(level&&!allowedLevels.has(level))return NextResponse.json({error:"Nivel inválido"},{status:400});
 const rows=await prisma.learningObjective.findMany({
  where:{},
  select:{code:true,text:true,level:true,subject:true,source:true,sourceUrl:true},
  orderBy:[{level:"asc"},{subject:"asc"},{code:"asc"}],take:20000
 });
 return NextResponse.json({objectives:rows.filter(row=>row.subject&&row.code&&row.text&&grade(row.level)&&(!level||grade(row.level)===level)).map(row=>({...row,level:grade(row.level)!,sourceUrl:row.sourceUrl||undefined})),count:rows.length},{headers:{"Cache-Control":"no-store"}});
}
