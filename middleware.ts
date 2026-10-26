import {NextResponse, type NextRequest} from "next/server";
import {jwtVerify} from "jose";

export async function middleware(request:NextRequest){
  const token=request.cookies.get("pd_session")?.value;
  const secret=process.env.AUTH_SECRET;
  if(!token||!secret)return NextResponse.redirect(new URL("/?institutionalAccess=required",request.url));
  try{
    const {payload}=await jwtVerify(token,new TextEncoder().encode(secret));
    // Only institutional accounts; a personal subscription must never grant access.
    if(payload.accountType==="INDIVIDUAL")return NextResponse.redirect(new URL("/?institutionalAccess=required",request.url));
    if(!payload.organizationId || typeof payload.role!=="string")return NextResponse.redirect(new URL("/?institutionalAccess=required",request.url));
    return NextResponse.next();
  }catch{return NextResponse.redirect(new URL("/?institutionalAccess=required",request.url))}
}

export const config={matcher:["/ensayos-simce/:path*","/ensayos-paes/:path*"]};
