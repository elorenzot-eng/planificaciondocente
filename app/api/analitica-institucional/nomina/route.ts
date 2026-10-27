import {NextResponse} from "next/server";
import {getSession} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
export async function GET(){
 const session=await getSession();
 if(!session?.id)return NextResponse.json({error:"Debes iniciar sesión"},{status:401});
 const user=await prisma.user.findUnique({where:{id:String(session.id)},select:{active:true,role:true,accountType:true,organizationId:true,schoolId:true}});
 if(!user?.active||user.accountType!=="INSTITUTIONAL"||!["DIRECTOR","UTP","SOSTENEDOR","SUPERADMIN"].includes(user.role))return NextResponse.json({error:"No autorizado"},{status:403});
 const schools=await prisma.school.findMany({where:{active:true,...(user.role==="SUPERADMIN"?{}:user.role==="SOSTENEDOR"?{organizationId:user.organizationId}:{id:user.schoolId||"__none__",organizationId:user.organizationId})},select:{id:true,name:true,licensedStudents:{select:{id:true,firstName:true,paternalSurname:true,maternalSurname:true,course:true},orderBy:[{course:"asc"},{paternalSurname:"asc"}]}}});
 return NextResponse.json({schools},{headers:{"Cache-Control":"private, no-store"}});
}
