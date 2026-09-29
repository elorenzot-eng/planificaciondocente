import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";

export async function GET(req:Request){
 const s=await getSession();
 if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:401});
 const url=new URL(req.url);
 const level=String(url.searchParams.get("level")||"").trim();
 const subject=String(url.searchParams.get("subject")||"").trim();
 const where:any={active:true};
 if(level)where.level=level;
 if(subject)where.subject=subject;
 const units=await prisma.curriculumUnit.findMany({
  where,
  include:{objectives:{include:{objective:true}}},
  orderBy:[{level:"asc"},{subject:"asc"},{number:"asc"}]
 });
 return NextResponse.json({units:units.map((u:any)=>({...u,objectives:u.objectives.map((x:any)=>x.objective)}))});
}

// Deployment refresh: curriculum unit bank
