import {createHmac} from "crypto";
/** Use only a trusted reverse-proxy header. Do not accept arbitrary forwarded chains. */
export function registrationIpHash(request:Request){
 const secret=process.env.REGISTRATION_IP_HASH_SECRET;
 if(!secret||secret.length<32)return null;
 const raw=request.headers.get("cf-connecting-ip")||request.headers.get("x-real-ip");
 if(!raw||raw.length>64||!/^[0-9a-fA-F:.]+$/.test(raw))return null;
 return createHmac("sha256",secret).update(raw).digest("hex");
}
