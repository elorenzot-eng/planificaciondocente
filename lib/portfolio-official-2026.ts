import { EXTRACTED_RUBRIC_CRITERIA_2026 } from "./portfolio-extracted-criteria-2026";
import { PORTFOLIO_INDICATOR_NAMES_2026 } from "./portfolio-indicator-names-2026";
export const OFFICIAL_PORTFOLIO_2026 = [
 {group:"Básica 1° a 6°",rubric:"https://www.docentemas.cl/download/rubricas-educacion-basica-1-a-6-basico-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Básica Generalista 1° a 4°",rubric:"https://www.docentemas.cl/download/rubricas-educacion-basica-generalista-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"7° y 8° Básico / Media HC",rubric:"https://www.docentemas.cl/download/rubricas-7o-basico-a-4o-medio-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Media Técnico-Profesional",rubric:"https://www.docentemas.cl/download/rubrica-educacion-media-tecnico-profesional-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Pueblos Originarios",rubric:"https://www.docentemas.cl/download/rubricas-lengua-y-cultura-de-los-pueblos-originarios-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"}
] as const;
export type OfficialRubricIndicator={id:string;group:string;year:2026;module:number;name:string;descriptors:{level:string;text:string}[];sourceUrl:string;sourcePage:number;verified:boolean};
// Populate only after reviewing the original 2026 PDF, including its exact descriptors and page numbers.
export const VERIFIED_INDICATORS_2026:OfficialRubricIndicator[]=[
 {id:"basica-1-6-m1-formulacion-objetivos",group:"Básica 1° a 6°",year:2026,module:1,name:"Formulación de objetivos de aprendizaje",sourceUrl:"https://www.docentemas.cl/download/rubricas-educacion-basica-1-a-6-basico-2026/",sourcePage:6,verified:true,descriptors:[
 {level:"Insatisfactorio",text:"No cumple con la condición del nivel Básico."},
 {level:"Básico",text:"La mayoría de los objetivos propuestos para las experiencias dan cuenta de las habilidades y conocimientos que el/la docente se propuso alcanzar con sus estudiantes.¹"},
 {level:"Competente",text:"Todos los objetivos propuestos para las experiencias dan cuenta de las habilidades y conocimientos que el/la docente se propuso alcanzar con sus estudiantes.¹"},
 {level:"Destacado",text:"Cumple con el nivel Competente y, además: Logra integrar conocimientos, habilidades y actitudes en los objetivos propuestos para sus experiencias."}
 ]},
 {id:"generalista-m1-objetivos",group:"Básica Generalista 1° a 4°",year:2026,module:1,name:"Formulación de objetivos de aprendizaje",sourceUrl:"https://www.docentemas.cl/download/rubricas-educacion-basica-generalista-2026/",sourcePage:6,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con la condición del nivel Básico."},{level:"Básico",text:"La mayoría de los objetivos propuestos para las experiencias dan cuenta de las habilidades y conocimientos que el/la docente se propuso alcanzar con sus estudiantes."},{level:"Competente",text:"Todos los objetivos propuestos para las experiencias dan cuenta de las habilidades y conocimientos que el/la docente se propuso alcanzar con sus estudiantes."},{level:"Destacado",text:"Cumple con el nivel Competente y, además: Logra integrar conocimientos, habilidades y actitudes en los objetivos propuestos para sus experiencias."} ]},
 {id:"media-hc-m1-objetivos",group:"7° y 8° Básico / Media HC",year:2026,module:1,name:"Formulación de objetivos de aprendizaje",sourceUrl:"https://www.docentemas.cl/download/rubricas-7o-basico-a-4o-medio-2026/",sourcePage:6,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con la condición del nivel Básico."},{level:"Básico",text:"La mayoría de los objetivos propuestos para las experiencias dan cuenta de las habilidades y conocimientos que el/la docente se propuso alcanzar con sus estudiantes."},{level:"Competente",text:"Todos los objetivos propuestos para las experiencias dan cuenta de las habilidades y conocimientos que el/la docente se propuso alcanzar con sus estudiantes."},{level:"Destacado",text:"Cumple con el nivel Competente y, además: Logra integrar conocimientos, habilidades y actitudes en los objetivos propuestos para sus experiencias."} ]},
 {id:"media-tp-m1-relacion",group:"Media Técnico-Profesional",year:2026,module:1,name:"Relación entre actividades y objetivos",sourceUrl:"https://www.docentemas.cl/download/rubrica-educacion-media-tecnico-profesional-2026/",sourcePage:6,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con alguna de las condiciones del nivel Básico."},{level:"Básico",text:"En la mayoría de las experiencias, todos los objetivos son abordados mediante actividades propuestas a estudiantes y todas las actividades se relacionan con los objetivos."},{level:"Competente",text:"En todas las experiencias, todos los objetivos son abordados mediante actividades propuestas a estudiantes y todas las actividades se relacionan con los objetivos."},{level:"Destacado",text:"Cumple con el nivel Competente y, además, en alguna experiencia propone al menos una actividad contextualizada que permite comprender el sentido, importancia o utilidad de los aprendizajes."} ]},
 {id:"pueblos-m1-objetivos-clases",group:"Pueblos Originarios",year:2026,module:1,name:"Formulación de objetivos de las clases",sourceUrl:"https://www.docentemas.cl/download/rubricas-lengua-y-cultura-de-los-pueblos-originarios-2026/",sourcePage:6,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con alguna de las condiciones del nivel Básico."},{level:"Básico",text:"Para la mayoría de las clases, todos los objetivos planteados dan cuenta de lo que se espera alcanzar con estudiantes y refieren a conocimientos y habilidades."},{level:"Competente",text:"Para todas las clases, todos los objetivos planteados dan cuenta de lo que se espera alcanzar con estudiantes y refieren a conocimientos y habilidades."},{level:"Destacado",text:"Cumple con el nivel Competente y, además, en cada una de las clases integra conocimientos, habilidades y actitudes interculturales en los objetivos."} ]},
 {id:"generalista-m1-relacion",group:"Básica Generalista 1° a 4°",year:2026,module:1,name:"Relación entre actividades y objetivos",sourceUrl:"https://www.docentemas.cl/download/rubricas-educacion-basica-generalista-2026/",sourcePage:7,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con la condición del nivel Básico."},{level:"Básico",text:"En la mayoría de las experiencias todos los objetivos se abordan mediante actividades y todas las actividades se relacionan con los objetivos."},{level:"Competente",text:"En todas las experiencias todos los objetivos se abordan mediante actividades y todas las actividades se relacionan con los objetivos."},{level:"Destacado",text:"Cumple con Competente y además propone en alguna experiencia una actividad contextualizada que permite comprender el sentido, importancia o utilidad de los aprendizajes."} ]},
 {id:"media-hc-m1-relacion",group:"7° y 8° Básico / Media HC",year:2026,module:1,name:"Relación entre actividades y objetivos",sourceUrl:"https://www.docentemas.cl/download/rubricas-7o-basico-a-4o-medio-2026/",sourcePage:7,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con la condición del nivel Básico."},{level:"Básico",text:"En la mayoría de las experiencias todos los objetivos se abordan mediante actividades y todas las actividades se relacionan con los objetivos."},{level:"Competente",text:"En todas las experiencias todos los objetivos se abordan mediante actividades y todas las actividades se relacionan con los objetivos."},{level:"Destacado",text:"Cumple con Competente y además propone en alguna experiencia una actividad contextualizada que permite comprender el sentido, importancia o utilidad de los aprendizajes."} ]},
 {id:"media-tp-m1-genericos",group:"Media Técnico-Profesional",year:2026,module:1,name:"Integración de aprendizajes genéricos en las experiencias",sourceUrl:"https://www.docentemas.cl/download/rubrica-educacion-media-tecnico-profesional-2026/",sourcePage:7,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con Básico o solo menciona el aprendizaje genérico sin evidenciar cómo lo abordó."},{level:"Básico",text:"En alguna experiencia ofrece oportunidades de practicar o reflexionar sobre un aprendizaje genérico, o en todas señala su sentido o importancia."},{level:"Competente",text:"En todas las experiencias ofrece oportunidades para poner en práctica algún aprendizaje genérico o reflexionar sobre su sentido o importancia."},{level:"Destacado",text:"Cumple con Competente y además en alguna experiencia combina la práctica de un aprendizaje genérico con la reflexión sobre su sentido o importancia."} ]},
 {id:"pueblos-m1-relacion",group:"Pueblos Originarios",year:2026,module:1,name:"Relación entre actividades y objetivos",sourceUrl:"https://www.docentemas.cl/download/rubricas-lengua-y-cultura-de-los-pueblos-originarios-2026/",sourcePage:8,verified:true,descriptors:[{level:"Insatisfactorio",text:"No cumple con alguna de las condiciones del nivel Básico."},{level:"Básico",text:"En la mayoría de las clases, todos los objetivos son abordados por actividades y todas las actividades se relacionan con los objetivos."},{level:"Competente",text:"En todas las clases, todos los objetivos son abordados por actividades y todas las actividades se relacionan con los objetivos."},{level:"Destacado",text:"Cumple con Competente y además en alguna clase propone actividades que responden a la diversidad cultural o distintas formas de abordar una misma situación mediante actividades, metodologías o recursos."} ]}
];
// Las rúbricas contienen notas, excepciones y ejemplos que deben consultarse en el PDF original antes de cualquier juicio evaluativo. Los descriptores de nuevos grupos están sintetizados, no son transcripciones literales completas.


/** A verified flag alone cannot authorize scoring. Every criterion must be traceable to the corresponding official source. */
export function validatedOfficialIndicators(group:string){
 const source=OFFICIAL_PORTFOLIO_2026.find(item=>item.group===group);
 if(!source)return [];
 return VERIFIED_INDICATORS_2026.filter(indicator=>
   indicator.verified===true &&
   indicator.year===2026 &&
   indicator.group===group &&
   Number.isInteger(indicator.module) && indicator.module>=1 && indicator.module<=3 &&
   indicator.id.trim().length>0 &&
   indicator.name.trim().length>0 &&
   Number.isInteger(indicator.sourcePage) && indicator.sourcePage>0 &&
   indicator.sourceUrl===source.rubric &&
   indicator.descriptors.length===4 &&
   indicator.descriptors.every(d=>d.level.trim().length>0&&d.text.trim().length>0) &&
   ["insatisfactorio","básico","competente","destacado"].every(level=>indicator.descriptors.some(d=>d.level.trim().toLocaleLowerCase("es-CL")===level))
 );
}

/** Report factual rubric readiness. A verified subset must never be mistaken for a complete rubric. */
export function officialRubricCoverage(){
 return OFFICIAL_PORTFOLIO_2026.map(source=>{
  const verified=validatedOfficialIndicators(source.group);
  const all=VERIFIED_INDICATORS_2026.filter(i=>i.group===source.group&&i.year===2026);
  const uniqueIds=new Set(verified.map(i=>i.id));
  return {
   group:source.group,
   sourceUrl:source.rubric,
   verifiedIndicators:uniqueIds.size,
   registeredIndicators:all.length,
   invalidIndicators:all.length-verified.length,
   status:"PENDING_COMPLETE_OFFICIAL_VERIFICATION" as const,
   matchEnabled:false
  };
 });
}

/** Full 2026 indicator inventory. Listing is not the same as validated scoring criteria. */
export const PORTFOLIO_INDICATOR_COVERAGE_2026=Object.entries(PORTFOLIO_INDICATOR_NAMES_2026).flatMap(([group,modules])=>modules.flatMap((names,moduleIndex)=>names.map((name,index)=>{
 const verified=validatedOfficialIndicators(group).find(item=>item.module===moduleIndex+1&&item.name===name);
 const extracted=EXTRACTED_RUBRIC_CRITERIA_2026.find(item=>item.group===group&&item.module===moduleIndex+1&&item.name.replace(/\s+/g," ").trim().toLocaleLowerCase("es-CL")===name.replace(/\s+/g," ").trim().toLocaleLowerCase("es-CL"));
 return {id:verified?.id||group+"-m"+(moduleIndex+1)+"-i"+(index+1),group,module:moduleIndex+1,name,sourceUrl:OFFICIAL_PORTFOLIO_2026.find(x=>x.group===group)?.rubric||"",status:verified?"descriptors_reviewed":extracted?"extracted_pending_validation":"descriptors_pending_validation",sourcePage:verified?.sourcePage||extracted?.page||null,canEstimateLevel:Boolean(verified)};
})));
/** Structural audit is not pedagogical validation. */
export function extractedRubricAudit2026(){
 const records=EXTRACTED_RUBRIC_CRITERIA_2026;
 const expected=["INSATISFACTORIO","BÁSICO","COMPETENTE","DESTACADO"];
 const complete=records.filter(x=>expected.every(level=>typeof x.levels[level as keyof typeof x.levels]==="string"&&x.levels[level as keyof typeof x.levels].trim().length>0));
 const conditional=records.filter(x=>x.conditional);
 const verified=PORTFOLIO_INDICATOR_COVERAGE_2026.filter(x=>x.canEstimateLevel);
 return {total:records.length,structurallyComplete:complete.length,conditionalReview:conditional.length,reviewedForEstimatedLevel:verified.length,pendingPedagogicalValidation:records.length-verified.length,readyForOfficialScoring:false};
}
export function indicatorCoverage2026(group:string,module:number,name:string){return PORTFOLIO_INDICATOR_COVERAGE_2026.find(x=>x.group===group&&x.module===module&&x.name===name)||null;}
