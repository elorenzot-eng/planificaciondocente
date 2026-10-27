import {NextResponse} from "next/server";
import {bookYanayMeeting} from "../../../../lib/yanay-booking";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
type Details={name?:string;institution?:string;email?:string;phone?:string;product?:string;startsAt?:string;consent?:boolean};
const ask=(message:string,details:Details,confirmed=false,meetUrl?:string)=>NextResponse.json({answer:message,details,confirmed,meetUrl});
export async function POST(req:Request){
 const origin=req.headers.get("origin"),host=req.headers.get("host");
 if(!origin||!host||(()=>{try{return new URL(origin).host!==host}catch{return true}})())return NextResponse.json({error:"Origen no autorizado"},{status:403});
 const body=await req.json() as {details?:Details;input?:string;confirm?:boolean};
 const details:Details={};
 for(const k of ["name","institution","email","phone","product","startsAt"] as const){const v=body.details?.[k];if(typeof v==="string")details[k]=v.slice(0,180);}
 details.consent=body.details?.consent===true;
 const input=String(body.input||"").trim().slice(0,500);
 if(body.confirm===true){
  if(!details.consent)return ask("Antes de reservar, necesito tu autorización para guardar tus datos y enviarte la invitación. ¿Me autorizas?",details);
  if(!details.name||!details.email||!details.phone||!details.startsAt)return ask("Aún faltan datos para confirmar la reunión.",details);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email))return ask("El correo no parece válido. ¿Puedes repetirlo?",{...details,email:""});
  if(!/^\+?[0-9 ()-]{8,32}$/.test(details.phone))return ask("Necesito un teléfono de contacto válido.",{...details,phone:""});
  const recent=await prisma.yanayCommercialLead.count({where:{email:details.email,createdAt:{gte:new Date(Date.now()-3600000)}}});
  if(recent>=3)return ask("Ya recibimos varias solicitudes. Contacta al equipo para continuar.",details);
  try{
   const result=await bookYanayMeeting({name:details.name,email:details.email,institution:details.institution,product:details.product||"DEMOSTRACION",startsAt:details.startsAt});
   await prisma.yanayCommercialLead.create({data:{name:details.name,institution:details.institution,phone:details.phone,email:details.email,product:"LICENCIA",preferredTime:details.startsAt,consentAt:new Date(),status:"CONFIRMADO",confirmedMeetingAt:new Date(result.startsAt)}});
   return ask("Tu reunión está confirmada. Te envié una invitación a "+details.email+". Nos vemos en Google Meet.",details,true,result.meetUrl);
  }catch(e){return ask("No pude confirmar la reunión: "+(e instanceof Error?e.message:"Error de calendario")+". Podemos elegir otro horario.",details);}
 }
 const next={...details};
 if(!next.name){next.name=input||undefined;return ask(next.name?"¿De qué colegio o institución nos contactas?":"¿Cuál es tu nombre y apellido?",next);}
 if(!next.institution){next.institution=input||undefined;return ask(next.institution?"¿Cuál es tu correo electrónico para enviarte la invitación?":"¿De qué colegio o institución nos contactas?",next);}
 if(!next.email){next.email=input||undefined;if(!next.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email))return ask("Dime tu correo electrónico, por favor.",{...next,email:""});return ask("¿Cuál es tu número de teléfono?",next);}
 if(!next.phone){next.phone=input||undefined;if(!next.phone||next.phone.replace(/\D/g,"").length<8)return ask("Dime un teléfono de contacto con código de área, por favor.",{...next,phone:""});return ask("¿Qué día y hora te acomoda? Puedes decir, por ejemplo, 29 de octubre a las 11 de la mañana.",next);}
 if(!next.startsAt)return ask("¿Qué día y hora te acomoda? Dime una fecha concreta.",next);
 if(!next.consent){if(/^(s[ií]|autorizo|acepto|de acuerdo)$/i.test(input)){next.consent=true;}else return ask("¿Me autorizas a guardar tus datos y enviar la invitación al correo indicado?",next);}
 return ask("Ya tengo tus datos. Para reservar la reunión, confirma la fecha y hora indicada. Di «confirmo» para continuar.",next);
}
