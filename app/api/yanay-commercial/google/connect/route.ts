import {NextResponse} from "next/server";
import {getSession} from "../../../../../lib/auth";
import {SignJWT} from "jose";
export const runtime="nodejs";
export async function GET(req:Request){
 const session=await getSession();
 if(!session||!["SUPERADMIN","SUPER_ADMIN"].includes(String(session.role||"").toUpperCase()))return NextResponse.json({error:"Solo superadministración puede conectar el calendario."},{status:403});
 const client=process.env.GOOGLE_CALENDAR_CLIENT_ID, secret=process.env.GOOGLE_CALENDAR_CLIENT_SECRET, auth=process.env.AUTH_SECRET;
 if(!client||!secret||!auth)return NextResponse.json({error:"Faltan credenciales OAuth del servidor."},{status:503});
 const base=new URL(req.url).origin;
 if(base!=="https://educantay.cl"&&process.env.NODE_ENV==="production")return NextResponse.json({error:"Origen de autorización inválido."},{status:403});
 const redirect=base+"/api/yanay-commercial/google/callback";
 const state=await new SignJWT({purpose:"yanay-calendar",sub:String(session.id)}).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("10m").sign(new TextEncoder().encode(auth));
 const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
 url.searchParams.set("client_id",client);url.searchParams.set("redirect_uri",redirect);url.searchParams.set("response_type","code");
 url.searchParams.set("scope","openid email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy");
 url.searchParams.set("access_type","offline");url.searchParams.set("prompt","consent select_account");url.searchParams.set("state",state);
 return NextResponse.redirect(url);
}
