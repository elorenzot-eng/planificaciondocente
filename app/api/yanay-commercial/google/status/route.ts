import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
export const runtime="nodejs";
export async function GET(){
 const session=await getSession();
 if(!session||!["SUPERADMIN","SUPER_ADMIN"].includes(String(session.role||"").toUpperCase()))return NextResponse.json({error:"Acceso restringido"},{status:403});
 const configured=Boolean(process.env.GOOGLE_CALENDAR_CLIENT_ID&&process.env.GOOGLE_CALENDAR_CLIENT_SECRET&&process.env.AUTH_SECRET);
 const connected=Boolean(await prisma.yanayGoogleCalendarConnection.findUnique({where:{id:"commercial"},select:{id:true}}));
 return NextResponse.json({configured,connected});
}
