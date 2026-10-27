import {NextResponse} from "next/server";
import {bookYanayMeeting} from "../../../../lib/yanay-booking";
import {prisma} from "../../../../lib/prisma";
export const runtime="nodejs";
type Details={name?:string;institution?:string;email?:string;phone?:string;product?:string;startsAt?:string;consent?:boolean};
function spokenEmail(value:string){let s=value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();s=s.replace(/\b(?:arroba|at)\b/g,"@").replace(/\b(?:punto|dot)\b/g,".").replace(/\b(?:guion bajo|guion inferior|underscore)\b/g,"_").replace(/\b(?:guion|menos)\b/g,"-");s=s.replace(/\s*([@._-])\s*/g,"$1").replace(/\s+/g,"").replace(/[;,]+$/,"");return s;}
function chileDate(input:string){const s=input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");const m=s.match(/(?:el\s+)?(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+(?:de|del)\s+(\d{4}))?.*?(?:a\s+las?|a\s+la)\s+(\d{1,2})(?::(\d{2}))?/);if(!m)return null;const months=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];let year=m[3]?Number(m[3]):new Date().getUTCFullYear();const month=months.indexOf(m[2]==="setiembre"?"septiembre":m[2])+1;const day=Number(m[1]);let hour=Number(m[4]);const minute=Number(m[5]||0);if(/tarde|noche|pm/.test(s)&&hour<12)hour+=12;if(/manana|am/.test(s)&&hour===12)hour=0;if(month<1||day<1||day>31||hour>23||minute>59)return null;const date=new Date(year+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0")+"T"+String(hour).padStart(2,"0")+":"+String(minute).padStart(2,"0")+":00-03:00");if(!m[3]&&date.getTime()<Date.now())date.setUTCFullYear(year+1);return Number.isNaN(date.getTime())?null:date;}
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
 if(!next.name){if(!input||/agendar|reuni[oó]n|demostraci[oó]n|reservar/i.test(input))return ask("Con gusto coordino una reunión. ¿Cuál es tu nombre y apellido?",next);next.name=input;return ask("¿De qué colegio o institución nos contactas?",next);}
 if(!next.institution){next.institution=input||undefined;return ask(next.institution?"¿Cuál es tu correo electrónico para enviarte la invitación?":"¿De qué colegio o institución nos contactas?",next);}
 if(!next.email){next.email=spokenEmail(input)||undefined;if(!next.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email))return ask("Dime tu correo electrónico, por favor.",{...next,email:""});return ask("¿Cuál es tu número de teléfono?",next);}
 if(!next.phone){next.phone=input||undefined;if(!next.phone||next.phone.replace(/\D/g,"").length<8)return ask("Dime un teléfono de contacto con código de área, por favor.",{...next,phone:""});return ask("¿Qué día y hora te acomoda? Puedes decir, por ejemplo, 29 de octubre a las 11 de la mañana.",next);}
 if(!next.startsAt){const date=chileDate(input)||new Date(input);if(input&&!Number.isNaN(date.getTime())&&date.getTime()>Date.now()+1800000){next.startsAt=date.toISOString();return ask("¿Me autorizas a guardar tus datos y enviarte la invitación de Google Meet?",next);}return ask("Dime el día y la hora de manera natural, por ejemplo: el 29 de octubre a las 11 de la mañana.",next);}
 if(!next.consent){if(/^(s[ií]|autorizo|acepto|de acuerdo)$/i.test(input)){next.consent=true;}else return ask("¿Me autorizas a guardar tus datos y enviar la invitación al correo indicado?",next);}
 return ask("Ya tengo tus datos. Para reservar la reunión, confirma la fecha y hora indicada. Di «confirmo» para continuar.",next);
}
