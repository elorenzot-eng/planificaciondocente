export type YanayProduct = "SIMCE"|"PAES"|"ECEP"|"PORTAFOLIO"|"PLANIFICACION"|"LICENCIA"|"OTRO";
export type YanayLeadInput = {name:string;institution?:string;role?:string;phone:string;email:string;product:YanayProduct;preferredTime?:string;notes?:string;consent:boolean};
const products:YanayProduct[]=["SIMCE","PAES","ECEP","PORTAFOLIO","PLANIFICACION","LICENCIA","OTRO"];
const clean=(v:unknown,n:number)=>typeof v==="string"?v.trim().slice(0,n):"";
export function parseYanayLead(v:unknown):{ok:true;data:YanayLeadInput}|{ok:false;errors:string[]}{
 if(!v||typeof v!=="object"||Array.isArray(v))return {ok:false,errors:["Datos inválidos"]};
 const b=v as Record<string,unknown>;
 const data:YanayLeadInput={name:clean(b.name,120),institution:clean(b.institution,180),role:clean(b.role,100),phone:clean(b.phone,32),email:clean(b.email,254).toLowerCase(),product:products.includes(b.product as YanayProduct)?b.product as YanayProduct:"OTRO",preferredTime:clean(b.preferredTime,120),notes:clean(b.notes,1000),consent:b.consent===true};
 const errors:string[]=[];
 if(data.name.length<2)errors.push("Ingresa tu nombre");
 if(!/^\+?[0-9 ()-]{8,32}$/.test(data.phone)||data.phone.replace(/\D/g,"").length<8)errors.push("Teléfono inválido");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))errors.push("Correo inválido");
 if(!data.consent)errors.push("Autoriza el registro de datos y el contacto comercial");
 return errors.length?{ok:false,errors}:{ok:true,data};
}
