import {NextRequest,NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
import {validateSciencePractice,type ScienceExam} from "../../../../../lib/paes/ciencias";
import {createSciencePrint} from "../../../../../lib/paes/ciencias-print";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const session=await getSession(),userId=session?.id;
 if(typeof userId!=="string")return NextResponse.json({error:"Acceso denegado."},{status:401});
 const id=new URL(request.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Identificador requerido."},{status:400});
 const record=await prisma.savedPaesExam.findFirst({where:{id,userId}});
 if(!record)return NextResponse.json({error:"Ensayo no encontrado."},{status:404});
 if(record.examType!=="CIENCIAS")return NextResponse.json({error:"Formato aún no disponible."},{status:422});
 const exam=record.exam as unknown as ScienceExam;
 if(validateSciencePractice(exam).length)return NextResponse.json({error:"Ensayo guardado inválido."},{status:422});
 return NextResponse.json({title:record.title,exam,studentHtml:createSciencePrint(exam,false),teacherHtml:createSciencePrint(exam,true)},{headers:{"Cache-Control":"no-store"}});
}
