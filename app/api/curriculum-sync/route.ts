import {NextResponse} from "next/server";
import {prisma} from "../../../lib/prisma";
import {getSession} from "../../../lib/auth";
import {OA_CATALOG_SCOPE,expectedOASubjects,expectedOACount} from "../../../lib/oa-catalog-scope";

async function admin(){
 const s=await getSession(); if(!s?.id)return null;
 const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,role:true,active:true}});
 return u?.active&&u.role==="SUPERADMIN"?u:null;
}
export async function GET(){
 const u=await admin();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const duplicateGroups=await prisma.learningObjective.groupBy({by:["code","level","subject"],_count:{_all:true},having:{id:{_count:{gt:1}}}} as any);
 const rows=await prisma.learningObjective.groupBy({by:["level","subject"],where:{subject:{not:null}},_count:{_all:true},orderBy:[{level:"asc"},{subject:"asc"}]});
 const coverage=rows.map(x=>({level:x.level,subject:x.subject,count:x._count._all}));
 const matrix=OA_CATALOG_SCOPE.levels.flatMap(level=>expectedOASubjects(level).map(subject=>{
  const count=coverage.find(x=>x.level===level&&x.subject===subject)?.count??0;
  const expected=expectedOACount(level,subject);
  return {level,subject,count,expected,loaded:expected===null?count>0:count===expected};
 }));
 return NextResponse.json({catalogStatus:OA_CATALOG_SCOPE.catalogStatus,coverage,matrix,missing:matrix.filter(x=>!x.loaded),duplicates:duplicateGroups});
}
export async function POST(req:Request){
 const u=await admin();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json();const items=Array.isArray(b.objectives)?b.objectives:[];
 const allowedLevels=["1° Básico","2° Básico","3° Básico","4° Básico","5° Básico","6° Básico","7° Básico","8° Básico","1° Medio","2° Medio"];
 if(!items.length)return NextResponse.json({error:"No se recibieron OA"},{status:400});
 let created=0,updated=0;
 for(const raw of items){
  const code=String(raw.code||"").trim().replace(/\s+/g," "),text=String(raw.text||"").trim(),level=String(raw.level||"").trim(),subject=String(raw.subject||"").trim();
  if(!code||!text||!level||!subject||!allowedLevels.includes(level))continue;
   if(!/^[A-Z]{2,4}(?:0[1-9]|1[0-2]|[1-2]M) OA (?:[A-Z]{1,3})?[0-9]{2}$/.test(code))continue;
   const source=String(raw.source||"").trim();
   if(source!=="Currículum Nacional · MINEDUC")continue;
  const existing=await prisma.learningObjective.findFirst({where:{code,level,subject}});
  if(existing){await prisma.learningObjective.update({where:{id:existing.id},data:{text,source}});updated++}
  else{await prisma.learningObjective.create({data:{code,text,level,subject,source}});created++}
 }
 return NextResponse.json({ok:true,created,updated,total:created+updated});
}
