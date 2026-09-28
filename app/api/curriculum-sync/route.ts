import {NextResponse} from "next/server";
import {prisma} from "../../../lib/prisma";
import {getSession} from "../../../lib/auth";

async function admin(){
 const s=await getSession(); if(!s?.id)return null;
 const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{id:true,role:true,active:true}});
 return u?.active&&u.role==="SUPERADMIN"?u:null;
}
export async function GET(){
 const u=await admin();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const rows=await prisma.learningObjective.groupBy({by:["level","subject"],where:{subject:{not:null}},_count:{_all:true},orderBy:[{level:"asc"},{subject:"asc"}]});
 return NextResponse.json({coverage:rows.map(x=>({level:x.level,subject:x.subject,count:x._count._all}))});
}
export async function POST(req:Request){
 const u=await admin();if(!u)return NextResponse.json({error:"No autorizado"},{status:401});
 const b=await req.json();const items=Array.isArray(b.objectives)?b.objectives:[];
 if(!items.length)return NextResponse.json({error:"No se recibieron OA"},{status:400});
 let created=0,updated=0;
 for(const raw of items){
  const code=String(raw.code||"").trim(),text=String(raw.text||"").trim(),level=String(raw.level||"").trim(),subject=String(raw.subject||"").trim();
  if(!code||!text||!level||!subject)continue;
  const existing=await prisma.learningObjective.findFirst({where:{code,level,subject}});
  if(existing){await prisma.learningObjective.update({where:{id:existing.id},data:{text,source:String(raw.source||"Currículum Nacional · MINEDUC")}});updated++}
  else{await prisma.learningObjective.create({data:{code,text,level,subject,source:String(raw.source||"Currículum Nacional · MINEDUC")}});created++}
 }
 return NextResponse.json({ok:true,created,updated,total:created+updated});
}
