import {OFFICIAL_PORTFOLIO_2026,indicatorCoverage2026,validatedOfficialIndicators} from "../../../lib/portfolio-official-2026";
import {PORTFOLIO_INDICATOR_NAMES_2026} from "../../../lib/portfolio-indicator-names-2026";
import {NextResponse} from "next/server";
import {getSession} from "../../../lib/auth";
import {prisma} from "../../../lib/prisma";
const groups:string[]=OFFICIAL_PORTFOLIO_2026.map(x=>x.group);
export async function POST(req:Request){
 const session=await getSession();if(!session?.id)return NextResponse.json({error:"Inicia sesión"},{status:401});
 const user=await prisma.user.findUnique({where:{id:String(session.id)},select:{active:true}});
 if(!user?.active)return NextResponse.json({error:"No autorizado"},{status:403});
 let body:any;try{body=await req.json()}catch{return NextResponse.json({error:"Solicitud inválida"},{status:400})}
 const group=String(body.group||"");const entries=Array.isArray(body.entries)?body.entries:[];
 const expected=group==="Pueblos Originarios"?12:11;
 if(!groups.includes(group)||entries.length!==expected)return NextResponse.json({error:"La agrupación requiere "+expected+" subtareas oficiales.",status:"INVALID_STRUCTURE"},{status:400});
 const lengths=group==="Pueblos Originarios"?[6,2,4]:[5,2,4];
 const keys=new Set<string>();const diagnostics:any[]=[];
 for(const entry of entries){
  const module=Number(entry.module),section=Number(entry.section);
  if(!Number.isInteger(module)||module<0||module>2||!Number.isInteger(section)||section<10||section>=10+lengths[module])return NextResponse.json({error:"Subtarea inválida"},{status:400});
  const key=module+"-"+section;if(keys.has(key))return NextResponse.json({error:"Subtarea duplicada"},{status:400});keys.add(key);
  const notes=String(entry.notes||"").slice(0,16000);
  const requested=String(entry.rubric||"").split(" || ").map(x=>x.trim()).filter(Boolean);
  const names=PORTFOLIO_INDICATOR_NAMES_2026[group]?.[module]||[];
  const indicators=requested.map(name=>{
   const coverage=names.includes(name)?indicatorCoverage2026(group,module+1,name):null;
   const verified=validatedOfficialIndicators(group).some(x=>x.module===module+1&&x.name===name);
   return {name,recognized:Boolean(coverage),verification:coverage?.status||"not_in_catalog",verifiedDescriptors:verified,sourcePage:coverage?.sourcePage||null,canEstimateLevel:verified};
  });
  diagnostics.push({module,section,hasEvidence:notes.trim().length>=80,evidenceCharacters:notes.trim().length,indicators,missingEvidence:notes.trim().length<80,needsIndicator:indicators.length===0,readyForVerifiedComparison:notes.trim().length>=80&&indicators.some(x=>x.canEstimateLevel)});
 }
 if(keys.size!==expected)return NextResponse.json({error:"Faltan subtareas oficiales"},{status:400});
 return NextResponse.json({status:"FORMATIVE_AUDIT_ONLY",group,total:expected,withEvidence:diagnostics.filter(x=>x.hasEvidence).length,withVerifiedCriteria:diagnostics.filter(x=>x.readyForVerifiedComparison).length,verifiedIndicators:diagnostics.flatMap(x=>x.indicators).filter(x=>x.verifiedDescriptors).length,pendingValidationIndicators:diagnostics.flatMap(x=>x.indicators).filter(x=>!x.verifiedDescriptors).length,sections:diagnostics,officialScoring:false,numericMatch:null,message:"Diagnóstico documental por subtarea. Solo los descriptores revisados permiten contrastes formativos; no es una calificación oficial."});
}
