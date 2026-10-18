import {OFFICIAL_PORTFOLIO_2026,validatedOfficialIndicators} from "../../../lib/portfolio-official-2026";
import {NextResponse} from "next/server";
import {getSession} from "../../../lib/auth";
import {prisma} from "../../../lib/prisma";
const groups: string[]=OFFICIAL_PORTFOLIO_2026.map(item=>item.group);
function output(x:any){if(typeof x?.output_text==="string")return x.output_text;return(x?.output||[]).flatMap((z:any)=>z.content||[]).filter((z:any)=>z.type==="output_text").map((z:any)=>z.text).join("")}
export async function POST(req:Request){
 const session=await getSession();if(!session?.id)return NextResponse.json({error:"Inicia sesión"},{status:401});
 const user=await prisma.user.findUnique({where:{id:String(session.id)},select:{active:true}});if(!user?.active)return NextResponse.json({error:"No autorizado"},{status:403});
 let b:any;try{b=await req.json()}catch{return NextResponse.json({error:"Solicitud inválida"},{status:400})}
 const group=String(b.group||"");const entries=Array.isArray(b.entries)?b.entries:[];if(!groups.includes(group)||entries.length!==9)return NextResponse.json({error:"Agrupación o secciones inválidas"},{status:400});
 const clean=entries.map((e:any)=>({module:Number(e.module),section:Number(e.section),notes:String(e.notes||"").slice(0,4000),rubric:String(e.rubric||"").slice(0,2500)}));
 if(clean.some((e:any)=>![0,1,2].includes(e.module)||![0,1,2].includes(e.section))||new Set(clean.map((e:any)=>e.module+"-"+e.section)).size!==9)return NextResponse.json({error:"Secciones duplicadas o inválidas"},{status:400});
 const official=OFFICIAL_PORTFOLIO_2026.find(v=>v.group===group);
 const verified=validatedOfficialIndicators(group);
 if(!official||verified.length===0)return NextResponse.json({error:"Aún no se han incorporado y verificado los indicadores oficiales 2026 para esta agrupación.",status:"PENDING_OFFICIAL_RUBRIC",source:official?.rubric},{status:422});
 // Never publish a numeric match until each official 2026 rubric indicator has been verified and mapped server-side.
 return NextResponse.json({error:"El porcentaje de match está temporalmente deshabilitado. Se habilitará cuando los indicadores y descriptores de la rúbrica oficial 2026 estén verificados y asociados a esta agrupación. No se permite calcular un porcentaje oficial a partir de texto pegado manualmente.",status:"PENDING_OFFICIAL_RUBRIC"},{status:422});
}
