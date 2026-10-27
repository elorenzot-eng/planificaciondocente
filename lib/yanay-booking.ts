import {accessToken,organizer} from "./yanay-google-calendar";
import {randomUUID} from "node:crypto";
export async function bookYanayMeeting(input:{name:string;email:string;institution?:string;product:string;startsAt:string}){
 const start=new Date(input.startsAt);
 if(!Number.isFinite(start.getTime())||start.getTime()<Date.now()+30*60000||start.getTime()>Date.now()+60*86400000)throw Error("Selecciona una fecha futura dentro de los próximos 60 días.");
 const end=new Date(start.getTime()+30*60000);
 const token=await accessToken();
 const headers={Authorization:"Bearer "+token,"Content-Type":"application/json"};
 const availability=await fetch("https://www.googleapis.com/calendar/v3/freeBusy",{method:"POST",headers,body:JSON.stringify({timeMin:start.toISOString(),timeMax:end.toISOString(),items:[{id:"primary"}]}),cache:"no-store"});
 if(!availability.ok)throw Error("No se pudo consultar la disponibilidad del calendario.");
 const slots=await availability.json() as {calendars?:Record<string,{busy?:unknown[];errors?:unknown[]}>};
 const calendar=slots.calendars?.primary;
 if(!calendar||calendar.errors?.length)throw Error("No se pudo verificar la disponibilidad.");
 if(calendar.busy?.length)throw Error("Ese horario está ocupado. Selecciona otro.");
 const event=await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",{method:"POST",headers,body:JSON.stringify({
 summary:"Demostración EducAntay - "+input.product,
 description:"Solicitud de "+input.name+" - "+(input.institution||"Institución no indicada"),
 start:{dateTime:start.toISOString(),timeZone:"America/Santiago"},
 end:{dateTime:end.toISOString(),timeZone:"America/Santiago"},
 attendees:[{email:input.email}],
 conferenceData:{createRequest:{requestId:randomUUID(),conferenceSolutionKey:{type:"hangoutsMeet"}}}
 }),cache:"no-store"});
 if(!event.ok)throw Error("Google Calendar no pudo crear la reunión.");
 const result=await event.json() as {id?:string;htmlLink?:string;hangoutLink?:string;conferenceData?:{entryPoints?:{entryPointType?:string;uri?:string}[]}};
 const meet=result.hangoutLink||result.conferenceData?.entryPoints?.find(e=>e.entryPointType==="video")?.uri;
 if(!result.id||!meet)throw Error("La reunión se creó pero Google no confirmó el enlace Meet. Contacta al equipo.");
 return {eventId:result.id,meetUrl:meet,calendarUrl:result.htmlLink,organizer,startsAt:start.toISOString()};
}

export async function availableYanaySlots(day:string){
 if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(day))throw Error("Fecha inválida");
 const token=await accessToken();
 const candidates:string[]=[];
 for(const hour of [9,10,11,12,15,16,17]){
  const utc=new Date(day+"T"+String(hour).padStart(2,"0")+":00:00-03:00");
  if(utc.getTime()>Date.now()+1800000)candidates.push(utc.toISOString());
 }
 if(!candidates.length)return [];
 const response=await fetch("https://www.googleapis.com/calendar/v3/freeBusy",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({timeMin:candidates[0],timeMax:new Date(new Date(candidates[candidates.length-1]).getTime()+1800000).toISOString(),items:[{id:"primary"}]}),cache:"no-store"});
 if(!response.ok)throw Error("No se pudo consultar disponibilidad");
 const result=await response.json() as {calendars?:Record<string,{busy?:{start:string;end:string}[];errors?:unknown[]}>};
 const calendar=result.calendars?.primary;
 if(!calendar||calendar.errors?.length)throw Error("Calendario no disponible");
 return candidates.filter(s=>!(calendar.busy||[]).some(b=>new Date(b.start).getTime()<new Date(s).getTime()+1800000&&new Date(b.end).getTime()>new Date(s).getTime())).slice(0,3);
}
