import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "../../../lib/prisma";
import {getSession} from "../../../lib/auth";
export async function PATCH(req:Request){
 const s=await getSession();if(!s?.id)return NextResponse.json({error:"No autorizado"},{status:401});
 const u=await prisma.user.findUnique({where:{id:String(s.id)}});if(!u?.active||u.accountType!=="INDIVIDUAL")return NextResponse.json({error:"Cuenta no habilitada"},{status:403});
 const b=await req.json();const name=String(b.name||"").trim();const currentPassword=String(b.currentPassword||"");const newPassword=String(b.newPassword||"");
 if(name.length<2)return NextResponse.json({error:"Ingresa un nombre válido"},{status:400});
 const data:any={name};
 if(newPassword){
  if(newPassword.length<8)return NextResponse.json({error:"La nueva contraseña debe tener al menos 8 caracteres"},{status:400});
  if(!u.passwordHash||!currentPassword||!(await bcrypt.compare(currentPassword,u.passwordHash)))return NextResponse.json({error:"La contraseña actual no es correcta"},{status:400});
  data.passwordHash=await bcrypt.hash(newPassword,12);
 }
 await prisma.user.update({where:{id:u.id},data});
 return NextResponse.json({ok:true,name});
}