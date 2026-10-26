// DEMRE PAES de Invierno, Admisión 2027. Índice = respuestas correctas oficiales.
// Solo convertir ensayos completos con exactamente el número de preguntas puntuables.
export const demreTables:Record<string,number[]> = {
 LECTORA: [100,149,172,193,214,234,253,269,284,298,313,330,347,361,373,383,393,404,417,432,447,461,472,480,487,495,504,516,531,546,560,571,580,587,594,603,614,629,644,659,671,680,689,699,711,725,741,758,772,786,799,814,832,852,871,892,913,936,963,991,1000],
 M1: [100,173,196,216,236,255,273,290,305,318,331,345,360,375,389,399,408,417,426,438,452,467,480,490,498,504,511,519,530,543,558,571,582,590,597,603,611,622,635,650,664,676,685,694,704,716,730,746,761,775,789,804,821,840,860,880,903,927,955,986,1000],
 CIENCIAS: [100,127,144,165,185,204,221,236,250,264,278,293,306,318,327,335,345,355,368,381,393,402,409,415,420,426,435,445,458,470,481,489,494,499,503,507,513,521,533,545,558,568,575,581,585,589,593,600,610,621,634,646,656,663,669,674,681,690,701,714,728,739,749,759,769,780,795,810,825,840,856,874,893,915,938,1000],
 M2: [100,181,212,240,265,287,308,327,347,365,381,396,409,424,439,455,469,481,491,502,514,528,542,556,567,577,586,596,609,623,637,651,662,672,683,695,710,725,740,755,768,783,800,818,837,856,877,900,926,1000],
 HISTORIA: [100,132,158,181,203,224,244,263,279,294,308,324,341,357,372,383,393,402,413,426,441,457,471,482,490,497,504,513,525,539,555,569,581,590,597,604,612,623,637,653,668,681,692,701,711,722,736,753,770,785,799,814,829,848,868,888,910,932,957,985,1000],
};
export const demreSources:Record<string,string>={
 LECTORA:"https://portaldemre.demre.cl/paes/factores-seleccion/tabla-transformacion-puntajes-paes-invierno-p2027-competencia-lectora",
 M1:"https://portaldemre.demre.cl/paes/factores-seleccion/tabla-transformacion-puntajes-paes-invierno-p2027-m1",
 CIENCIAS:"https://portaldemre.demre.cl/paes/factores-seleccion/tabla-transformacion-puntajes-paes-invierno-p2027-ciencias",
 M2:"https://portaldemre.demre.cl/paes/factores-seleccion/tabla-transformacion-puntajes-paes-invierno-p2025-m2",
 HISTORIA:"https://portaldemre.demre.cl/paes/factores-seleccion/tabla-transformacion-puntajes-paes-invierno-p2027-hycsoc"
};
export function demreReferenceScore(examType:string,total:number,correct:number){
 const table=demreTables[examType];
 if(!table || total!==table.length-1 || !Number.isInteger(correct) || correct<0 || correct>total) return null;
 return {score:table[correct],source:demreSources[examType],process:examType==="M2"?"Admisión 2025 · PAES Invierno (referencia histórica)":"Admisión 2027 · PAES Invierno",method:"Tabla DEMRE aplicada referencialmente a ensayo EducAntay; no es puntaje oficial"};
}
