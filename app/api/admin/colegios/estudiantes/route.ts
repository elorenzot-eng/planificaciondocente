import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export const runtime="nodejs";
function rut(v:string){return v.replace(/[^0-9kK]/g,"").toUpperCase()}
function valid(v:string){const s=rut(v);if(!/^\d{7,8}[0-9K]$/.test(s))return false;let n=0,m=2;for(let i=s.length-2;i>=0;i--){n+=Number(s[i])*m;m=m===7?2:m+1}const d=11-n%11;return (d===11?"0":d===10?"K":String(d))===s.slice(-1)}
async function admin(){const s=await getSession();if(!s?.id)return false;const u=await prisma.user.findUnique({where:{id:String(s.id)},select:{role:true,active:true}});return u?.active&&u.role==="SUPERADMIN"}
export async function POST(req:Request){
 if(!await admin())return NextResponse.json({error:"Solo el superadministrador puede importar estudiantes."},{status:403});
 const b=await req.json().catch(()=>null);if(!b||typeof b.schoolId!=="string"||!Array.isArray(b.rows)||b.rows.length>2000||!b.rows.length)return NextResponse.json({error:"Solicitud inválida (máximo 2000 filas)"},{status:400});
 const school=await prisma.school.findUnique({where:{id:b.schoolId},select:{id:true,active:true}});if(!school?.active)return NextResponse.json({error:"Colegio no disponible"},{status:404});
 const rows=b.rows.map((r:Record<string,unknown>)=>({firstName:String(r.firstName||"").trim(),paternalSurname:String(r.paternalSurname||"").trim(),maternalSurname:String(r.maternalSurname||"").trim(),rut:rut(String(r.rut||"")),course:String(r.course||"").trim()}));
 const errors:string[]=[];const seen=new Set<string>();rows.forEach((r:{firstName:string;paternalSurname:string;maternalSurname:string;rut:string;course:string},i:number)=>{if(!r.firstName||!r.paternalSurname||!r.maternalSurname||!r.course||!valid(r.rut)||Object.values(r).some(v=>v.length>120))errors.push("Fila "+(i+2)+": datos incompletos o RUT inválido");if(seen.has(r.rut))errors.push("Fila "+(i+2)+": RUT repetido");seen.add(r.rut)});
 if(errors.length)return NextResponse.json({error:"Corrige la planilla",errors:errors.slice(0,100)},{status:400});
 const now=new Date();const licenses=await prisma.institutionalExamLicense.findMany({where:{schoolId:b.schoolId,active:true,startsAt:{lte:now},expiresAt:{gt:now}},select:{studentCount:true}});
 const capacity=licenses.reduce((max,l)=>Math.max(max,l.studentCount),0);
 if(capacity===0)return NextResponse.json({error:"No hay licencias institucionales vigentes. No se autoriza la carga."},{status:403});
 const existing=await prisma.licensedStudent.findMany({where:{schoolId:b.schoolId},select:{rut:true}});
 const existingRuts=new Set(existing.map(x=>rut(x.rut)));const newCount=rows.filter((r:{rut:string})=>!existingRuts.has(r.rut)).length;
 if(existing.length+newCount>capacity)return NextResponse.json({error:"La carga supera los cupos autorizados.",capacity,existing:existing.length,newCount},{status:409});
 if(b.confirm!==true)return NextResponse.json({preview:true,capacity,existing:existing.length,newCount,updates:rows.length-newCount});
 await prisma.$transaction(async tx=>{for(const r of rows)await tx.licensedStudent.upsert({where:{schoolId_rut:{schoolId:b.schoolId,rut:r.rut}},create:{schoolId:b.schoolId,...r},update:{firstName:r.firstName,paternalSurname:r.paternalSurname,maternalSurname:r.maternalSurname,course:r.course}})});
 return NextResponse.json({created:newCount,updated:rows.length-newCount,capacity});
}
