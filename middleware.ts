import {NextResponse, type NextRequest} from "next/server";
import {jwtVerify} from "jose";

export async function middleware(request:NextRequest){
  const isApi=request.nextUrl.pathname.startsWith("/api/");
  const deny=(status:number)=>isApi
    ?NextResponse.json({error:"Este módulo requiere una cuenta institucional autorizada."},{status,headers:{"Cache-Control":"no-store"}})
    :NextResponse.redirect(new URL("/?institutionalAccess=required",request.url));
  const token=request.cookies.get("pd_session")?.value;
  const secret=process.env.AUTH_SECRET;
  if(!token||!secret)return deny(401);
  try{
    const {payload}=await jwtVerify(token,new TextEncoder().encode(secret),{algorithms:["HS256"]});
    if(payload.accountType==="INDIVIDUAL")return deny(403);
    if(typeof payload.organizationId!=="string"||!payload.organizationId.trim()||typeof payload.role!=="string")return deny(403);
    return NextResponse.next();
  }catch{return deny(401)}
}

export const config={matcher:["/ensayos-simce/:path*","/ensayos-paes/:path*","/api/paes/:path*","/api/simce/:path*"]};
