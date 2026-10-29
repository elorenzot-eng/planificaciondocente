import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){
 const session=await getSession();
 if(typeof session?.id!=="string")return NextResponse.json({error:"Acceso denegado"},{status:401});
 const user=await prisma.user.findUnique({where:{id:session.id},select:{schoolId:true,active:true,role:true}});
 if(!user?.active||!user.schoolId||!["SUPERADMIN","SOSTENEDOR","DIRECTOR","UTP","DOCENTE"].includes(user.role))return NextResponse.json({items:[],institutional:false},{headers:{"Cache-Control":"private, no-store"}});
 const students=await prisma.licensedStudent.findMany({where:{schoolId:user.schoolId},select:{id:true,firstName:true,paternalSurname:true,maternalSurname:true,course:true},orderBy:[{course:"asc"},{paternalSurname:"asc"}],take:3000});
 return NextResponse.json({items:students,institutional:true},{headers:{"Cache-Control":"private, no-store"}});
}
