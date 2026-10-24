/** Converts a datetime-local string in Chile continental time to UTC.
 * Rejects nonexistent times around DST changes and resolves ambiguous times
 * to the earlier occurrence. No fixed UTC offset is assumed. */
export function chileLocalToIso(local:string):string|null{
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local))return null;
 const [date,time]=local.split("T");const [y,m,d]=date.split("-").map(Number);const [h,min]=time.split(":").map(Number);
 const naive=Date.UTC(y,m-1,d,h,min);if(!Number.isFinite(naive))return null;
 const fmt=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Santiago",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
 const target=date+"T"+time;const hits:string[]=[];
 for(let offset=-5;offset<=-2;offset++){
  const ts=naive-offset*3600000;const parts=Object.fromEntries(fmt.formatToParts(new Date(ts)).map(p=>[p.type,p.value]));
  if([parts.year,parts.month,parts.day].join("-")+"T"+parts.hour+":"+parts.minute===target)hits.push(new Date(ts).toISOString());
 }
 return hits.sort()[0]||null;
}
