import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "");
export async function createSession(payload:{id:string;name:string;email:string;role:string;organizationId:string;schoolId:string|null}){
  if(!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET no configurado");
  const token=await new SignJWT(payload).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("12h").sign(key());
  const store=await cookies();store.set("pd_session",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:43200});
}
export async function getSession(){
  const store=await cookies();const token=store.get("pd_session")?.value;if(!token||!process.env.AUTH_SECRET)return null;
  try{return (await jwtVerify(token,key())).payload}catch{return null}
}
export async function clearSession(){const store=await cookies();store.delete("pd_session")}
