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
   return {name,recognized:Boolean(coverage),verification:coverage?.status||"not_in_catalog",verifiedDescriptors:verified,sourcePage:coverage?.sourcePage||null,canEstimateLevel:Boolean(coverage&&(coverage.canEstimateLevel||coverage.status==="extracted_pending_validation")),transcriptionAvailable:coverage?.status==="extracted_pending_validation"||verified};
  });
  diagnostics.push({module,section,hasEvidence:notes.trim().length>=80,evidenceCharacters:notes.trim().length,indicators,missingEvidence:notes.trim().length<80,needsIndicator:indicators.length===0,readyForFormativeComparison:notes.trim().length>=80&&indicators.some(x=>x.canEstimateLevel)});
 }
 const saved=await prisma.portfolioReview.findMany({where:{userId:String(session.id),year:2026,grouping:group},select:{module:true,section:true,result:true,evidenceSnapshot:true,indicatorSnapshot:true,updatedAt:true}});
 const savedByKey=new Map(saved.map(row=>[row.module+"-"+row.section,row]));
 for(const item of diagnostics){
  const row=savedByKey.get(item.module+"-"+item.section);
  const current=entries.find((e:any)=>Number(e.module)===item.module&&Number(e.section)===item.section);
  const evidence=String(current?.notes||"").trim();
  const review:any=row?.result||null;
  const validSnapshot=Boolean(row&&row.evidenceSnapshot.trim()===evidence&&evidence.length>=80);
  const details=validSnapshot&&Array.isArray(review?.individualResults)?review.individualResults:[];
  const reviewedNames=new Set(details.map((v:any)=>String(v.rubric||"")));
  const selectionMatches=Boolean(validSnapshot&&item.indicators.length>0&&item.indicators.every((v:any)=>reviewedNames.has(v.name))&&details.every((v:any)=>item.indicators.some((x:any)=>x.name===v.rubric)));
  const requested=new Set(item.indicators.map((v:any)=>v.name));
  const officialByName=new Map(validatedOfficialIndicators(group).filter(x=>x.module===item.module+1).map(x=>[x.name,x]));
  item.pedagogicalReview=selectionMatches?{
   updatedAt:row?.updatedAt,
   strengths:Array.isArray(review?.fortalezas)?review.fortalezas.slice(0,4):[],
   improvements:Array.isArray(review?.mejoras)?review.mejoras.slice(0,4):[],
   evidence:Array.isArray(review?.evidencias)?review.evidencias.slice(0,4):[],
   reflectionQuestions:Array.isArray(review?.preguntas)?review.preguntas.slice(0,4):[],
   indicatorFindings:details.filter((v:any)=>requested.has(v.rubric)).map((v:any)=>({name:v.rubric,level:v.indicatorEvaluation?.level||null,rubricReference:(()=>{const criterion=officialByName.get(v.rubric);if(!criterion)return null;const level=String(v.indicatorEvaluation?.level||"").toLocaleLowerCase("es-CL");const descriptor=criterion.descriptors.find(d=>d.level.toLocaleLowerCase("es-CL")===level);return descriptor?{level:descriptor.level,text:descriptor.text,sourcePage:criterion.sourcePage,sourceUrl:criterion.sourceUrl}:null})(),evidenceBasis:Array.isArray(review?.evidencias)?review.evidencias.slice(0,4):[],reason:v.indicatorEvaluation?.reason||null,gap:v.indicatorEvaluation?.gap||null,nextStep:v.indicatorEvaluation?.nextStep||null,preliminary:Boolean(v.indicatorEvaluation?.preliminary),verified:!v.indicatorEvaluation?.preliminary&&Boolean(item.indicators.find((x:any)=>x.name===v.rubric&&x.verifiedDescriptors)),transcribed:!!item.indicators.find((x:any)=>x.name===v.rubric&&x.transcriptionAvailable)})),
   source:"saved_ai_review",reusesGeneration:true
  }:null;
  item.reviewStatus=!row?"not_reviewed":!validSnapshot?"outdated_evidence":!selectionMatches?"outdated_indicators":"review_available";
  item.nextAction=!item.hasEvidence?"Completar evidencia auténtica y contextualizada":item.needsIndicator?"Seleccionar el indicador de la rúbrica correspondiente":!row?"Ejecutar revisión IA por indicador para obtener orientación pedagógica":!validSnapshot?"Actualizar revisión IA porque cambió el borrador":!selectionMatches?"Actualizar revisión IA porque cambiaron los indicadores seleccionados":item.pedagogicalReview?.indicatorFindings.length===0?"Revisar los indicadores seleccionados con IA":"Aplicar las mejoras señaladas en el informe IA y documentar evidencias";
 }
 if(keys.size!==expected)return NextResponse.json({error:"Faltan subtareas oficiales"},{status:400});
 return NextResponse.json({status:"FORMATIVE_AUDIT_ONLY",group,total:expected,withEvidence:diagnostics.filter(x=>x.hasEvidence).length,withVerifiedCriteria:diagnostics.filter(x=>x.hasEvidence&&x.indicators.some((v:any)=>v.verifiedDescriptors)).length,withFormativeCriteria:diagnostics.filter(x=>x.readyForFormativeComparison).length,withTranscribedCriteria:diagnostics.filter(x=>x.indicators.some((v:any)=>v.transcriptionAvailable)).length,withSavedPedagogicalReviews:diagnostics.filter(x=>x.reviewStatus==="review_available").length,withIndicatorFindings:diagnostics.filter(x=>x.pedagogicalReview?.indicatorFindings?.length>0).length,verifiedIndicators:diagnostics.flatMap(x=>x.indicators).filter(x=>x.verifiedDescriptors).length,pendingValidationIndicators:diagnostics.flatMap(x=>x.indicators).filter(x=>!x.verifiedDescriptors).length,sections:diagnostics,officialScoring:false,numericMatch:null,message:"Match pedagógico formativo: contrasta evidencia auténtica con indicadores transcritos y revisiones IA guardadas. Si cambian las evidencias o la selección de indicadores, exige una revisión actualizada. Los niveles orientativos no equivalen a una calificación oficial."});
}
