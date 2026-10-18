export const OFFICIAL_PORTFOLIO_2026 = [
 {group:"Básica 1° a 6°",rubric:"https://www.docentemas.cl/download/rubricas-educacion-basica-1-a-6-basico-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Básica Generalista 1° a 4°",rubric:"https://www.docentemas.cl/download/rubricas-educacion-basica-generalista-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"7° y 8° Básico / Media HC",rubric:"https://www.docentemas.cl/download/rubricas-7o-basico-a-4o-medio-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Media Técnico-Profesional",rubric:"https://www.docentemas.cl/download/rubrica-educacion-media-tecnico-profesional-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Pueblos Originarios",rubric:"https://www.docentemas.cl/download/rubricas-lengua-y-cultura-de-los-pueblos-originarios-2026/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"}
] as const;
export type OfficialRubricIndicator={id:string;group:string;year:2026;module:number;name:string;descriptors:{level:string;text:string}[];sourceUrl:string;sourcePage:number;verified:boolean};
// Populate only after reviewing the original 2026 PDF, including its exact descriptors and page numbers.
export const VERIFIED_INDICATORS_2026:OfficialRubricIndicator[]=[];

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
   indicator.descriptors.length>=2 &&
   indicator.descriptors.every(d=>d.level.trim().length>0&&d.text.trim().length>0) &&
   new Set(indicator.descriptors.map(d=>d.level.trim().toLowerCase())).size===indicator.descriptors.length
 );
}
