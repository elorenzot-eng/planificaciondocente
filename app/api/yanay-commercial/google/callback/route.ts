import {NextResponse} from "next/server";
import {jwtVerify} from "jose";
import {getSession} from "../../../../../lib/auth";
import {prisma} from "../../../../../lib/prisma";
import {createCipheriv,createHash,randomBytes} from "node:crypto";
export const runtime="nodejs";
export async function GET(req:Request){
 const url=new URL(req.url);
 const base=url.origin;
 const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
 if(process.env.NODE_ENV==="production"&&base!=="https://educantay.cl")return fail("Dominio no autorizado",403);
 const code=url.searchParams.get("code"),state=url.searchParams.get("state");
 if(!code||!state)return fail("Autorización incompleta");
 const auth=process.env.AUTH_SECRET,client=process.env.GOOGLE_CALENDAR_CLIENT_ID,secret=process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
 if(!auth||!client||!secret)return fail("Configuración OAuth incompleta",503);
 const session=await getSession();
 if(!session||!["SUPERADMIN","SUPER_ADMIN"].includes(String(session.role||"").toUpperCase()))return fail("Acceso restringido",403);
 try{
  const verified=await jwtVerify(state,new TextEncoder().encode(auth));
  if(verified.payload.purpose!=="yanay-calendar"||verified.payload.sub!==String(session.id))return fail("Estado OAuth inválido",403);
  const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:client,client_secret:secret,redirect_uri:base+"/api/yanay-commercial/google/callback",grant_type:"authorization_code"}),cache:"no-store"});
  if(!response.ok)return fail("Google no pudo completar la autorización",502);
  const tokens=await response.json() as {access_token?:string;refresh_token?:string};
  if(!tokens.refresh_token||!tokens.access_token)return fail("Google no entregó autorización persistente. Revoca el acceso anterior y vuelve a autorizar.",409);
  const profile=await fetch("https://www.googleapis.com/oauth2/v3/userinfo",{headers:{Authorization:"Bearer "+tokens.access_token},cache:"no-store"});
  if(!profile.ok)return fail("No se pudo verificar la cuenta de Google",502);
  const account=await profile.json() as {email?:string;email_verified?:boolean};
  if(account.email?.toLowerCase()!=="contacto@educantay.cl"||account.email_verified!==true)return fail("Autoriza exclusivamente contacto@educantay.cl",403);
  const iv=randomBytes(12),key=createHash("sha256").update(auth).digest(),cipher=createCipheriv("aes-256-gcm",key,iv);
  const encrypted=Buffer.concat([cipher.update(tokens.refresh_token,"utf8"),cipher.final()]);
  const stored=Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString("base64");
  await prisma.yanayGoogleCalendarConnection.upsert({where:{id:"commercial"},create:{id:"commercial",email:account.email,refreshTokenEncrypted:stored},update:{email:account.email,refreshTokenEncrypted:stored}});
  return NextResponse.redirect(new URL("/?yanay_calendar=connected",base));
 }catch{return fail("No fue posible completar la conexión de Google",500)}
}
