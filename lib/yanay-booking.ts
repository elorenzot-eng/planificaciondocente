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
