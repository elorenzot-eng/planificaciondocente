import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
export async function POST(request:Request){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"Inicia sesión"},{status:401});
 const user=await prisma.user.findUnique({where:{id:String(session.id)},select:{active:true,role:true,accountType:true,organizationId:true,schoolId:true}});
 if(!user?.active||user.accountType!=="INSTITUTIONAL"||!["DIRECTOR","SOSTENEDOR","UTP","SUPERADMIN"].includes(user.role))return NextResponse.json({error:"Acceso denegado"},{status:403});
 const body=await request.json().catch(()=>null);
 const {schoolId,course,examId}=body||{};
 if(![schoolId,course,examId].every(x=>typeof x==="string"&&x.trim().length>0&&x.length<=200))return NextResponse.json({error:"Selección inválida"},{status:400});
 const school=await prisma.school.findUnique({where:{id:schoolId},select:{id:true,active:true,organizationId:true}});
 if(!school?.active||(user.role!=="SUPERADMIN"&&(user.role==="SOSTENEDOR"?school.organizationId!==user.organizationId:school.id!==user.schoolId||school.organizationId!==user.organizationId)))return NextResponse.json({error:"Colegio no autorizado"},{status:403});
 const results=await prisma.academicExamResult.findMany({where:{schoolId,course,examId,product:"SIMCE"},select:{correctAnswers:true,totalQuestions:true,skillResults:true,contentResults:true},take:500});
 if(!results.length)return NextResponse.json({error:"No existen resultados para este curso y ensayo"},{status:404});
 const summarize=(field:"skillResults"|"contentResults")=>{
  const map=new Map<string,{correct:number;total:number}>();
  for(const result of results){const rows=result[field];if(!Array.isArray(rows))continue;
   for(const item of rows){if(!item||typeof item!=="object")continue;const x=item as Record<string,unknown>;
    if(typeof x.name!=="string"||!x.name.trim()||x.name.length>120||!Number.isInteger(x.correct)||!Number.isInteger(x.total))continue;
    const correct=x.correct as number,total=x.total as number;if(total<1||correct<0||correct>total)continue;
    const name=x.name.trim(),prev=map.get(name)||{correct:0,total:0};
    map.set(name,{correct:prev.correct+correct,total:prev.total+total});
   }
  }
  return [...map.entries()].map(([name,v])=>({name,...v,percentage:Math.round(v.correct/v.total*1000)/10})).sort((a,b)=>a.percentage-b.percentage).slice(0,10);
 };
 const valid=results.filter(x=>x.totalQuestions>0);
 const mean=valid.length?Math.round(valid.reduce((s,x)=>s+100*x.correctAnswers/x.totalQuestions,0)/valid.length*10)/10:null;
 const key=process.env.OPENAI_API_KEY;
 if(!key)return NextResponse.json({error:"Servicio IA no configurado"},{status:503});
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
 try{
  const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},signal:controller.signal,cache:"no-store",body:JSON.stringify({model:process.env.SIMCE_REPORT_MODEL||"gpt-4.1-mini",temperature:0.25,response_format:{type:"json_object"},messages:[{role:"system",content:"Eres especialista chileno en evaluación educativa. Redacta un informe técnico-pedagógico de ENSAYOS internos SIMCE. Devuelve JSON con diagnostico:string, fortalezas:string[], prioridades:string[], acciones:array de objetos {foco,accion,responsable,plazo,indicador,meta,verificacion}, seguimiento:string. No inventes resultados, causas confirmadas ni niveles SIMCE oficiales. Las hipótesis requieren validación docente. Incluye acciones medibles de mejora y seguimiento."},{role:"user",content:JSON.stringify({curso:course,ensayo:examId,estudiantesEvaluados:results.length,logroPromedio:mean,habilidades:summarize("skillResults"),contenidos:summarize("contentResults")})}]})});
  if(!response.ok)throw Error("Proveedor IA");
  const payload=await response.json(),raw=payload?.choices?.[0]?.message?.content;
  if(typeof raw!=="string")throw Error("Sin contenido");
  const report:unknown=JSON.parse(raw);
  if(!report||typeof report!=="object")throw Error("Formato inválido");
  const data=report as Record<string,unknown>;
  const validText=(x:unknown)=>typeof x==="string"&&x.trim().length>0&&x.length<=5000;
  const validList=(x:unknown)=>Array.isArray(x)&&x.length<=12&&x.every(validText);
  const required=["foco","accion","responsable","plazo","indicador","meta","verificacion"];
  const validActions=Array.isArray(data.acciones)&&data.acciones.length>=1&&data.acciones.length<=10&&data.acciones.every((a:unknown)=>a!==null&&typeof a==="object"&&required.every(k=>validText((a as Record<string,unknown>)[k])));
  if(!validText(data.diagnostico)||!validText(data.seguimiento)||!validList(data.fortalezas)||!validList(data.prioridades)||!validActions)throw Error("Informe IA incompleto");
  return NextResponse.json({report,summary:{course,examId,students:results.length,mean}},{headers:{"Cache-Control":"private, no-store"}});
 }catch{return NextResponse.json({error:"No fue posible generar el informe IA"},{status:502})}finally{clearTimeout(timeout)}
}
