export const OFFICIAL_PORTFOLIO_2026 = [
 {group:"Básica 1° a 6°",rubric:"https://www.docentemas.cl/documentos-descargables/rubricas/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Básica Generalista 1° a 4°",rubric:"https://www.docentemas.cl/documentos-descargables/rubricas/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"7° y 8° Básico / Media HC",rubric:"https://www.docentemas.cl/documentos-descargables/rubricas/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"},
 {group:"Media Técnico-Profesional",rubric:"https://www.docentemas.cl/documentos-descargables/rubricas/",manuals:"https://www.docentemas.cl/documentos-descargables/manuales-de-instrumentos/",status:"pending_transcription"}
] as const;
export type OfficialRubricIndicator={id:string;group:string;year:2026;module:number;name:string;descriptors:{level:string;text:string}[];sourceUrl:string;sourcePage:number;verified:boolean};
// Populate only after reviewing the original 2026 PDF, including its exact descriptors and page numbers.
export const VERIFIED_INDICATORS_2026:OfficialRubricIndicator[]=[];
