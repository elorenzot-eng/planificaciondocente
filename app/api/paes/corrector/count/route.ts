import {NextRequest,NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export async function GET(req:NextRequest){
 const session=await getSession();
 if(typeof session?.id!=="string")return NextResponse.json({error:"Acceso denegado"},{status:401});
 const id=new URL(req.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Falta ensayo"},{status:400});
 const saved=await prisma.savedPaesExam.findFirst({where:{id,userId:session.id},select:{exam:true}});
 if(!saved)return NextResponse.json({error:"Ensayo no disponible"},{status:404});
 const items=(saved.exam as any)?.items;
 if(!Array.isArray(items)||items.length<1||items.length>100)return NextResponse.json({error:"Ensayo sin preguntas"},{status:422});
 return NextResponse.json({questionCount:items.length},{headers:{"Cache-Control":"private, no-store"}});
}
