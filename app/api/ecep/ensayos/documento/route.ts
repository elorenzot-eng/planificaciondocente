import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
import {validateCompletedEcep,type PlannedItem} from "../../../../../lib/ecep/exam";
import {ecepPrintable} from "../../../../../lib/ecep/print";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const session=await getSession();if(typeof session?.id!=="string")return NextResponse.json({error:"Inicia sesión."},{status:401});
 const active=await prisma.user.findFirst({where:{id:session.id,active:true},select:{id:true}});
 if(!active)return NextResponse.json({error:"Acceso denegado."},{status:403});
 const params=new URL(request.url).searchParams,id=params.get("id"),version=params.get("version");
 if(!id||!["estudiante","profesor"].includes(version||""))return NextResponse.json({error:"Documento inválido."},{status:400});
 const exam=await prisma.ecepExam.findFirst({where:{id,userId:session.id,status:"COMPLETED",aiChargedAt:{not:null}}});
 if(!exam)return NextResponse.json({error:"Ensayo no encontrado."},{status:404});
 try{
  const plan=exam.planSnapshot as unknown as PlannedItem[];
  if(!Array.isArray(plan)||plan.length!==exam.quantity)throw Error("Matriz no disponible.");
  const questions=validateCompletedEcep(exam.questions,plan);
  return new NextResponse(ecepPrintable(exam.title,exam.level,questions,version==="profesor"),{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'self'"}});
 }catch{return NextResponse.json({error:"No se pudo preparar el documento guardado."},{status:422});}
}
