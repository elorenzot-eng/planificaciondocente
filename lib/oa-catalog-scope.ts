export const OA_CATALOG_SCOPE = {
  source: "Currículum Nacional · MINEDUC",
  sourceUrls: {
    basic1to6: "https://www.curriculumnacional.cl/curriculum/1o-6o-basico",
    basic7to2m: "https://www.curriculumnacional.cl/curriculum/7o-basico-2-medio"
  },
  levels: ["1° Básico","2° Básico","3° Básico","4° Básico","5° Básico","6° Básico","7° Básico","8° Básico","1° Medio","2° Medio"],
  catalogPolicy: "Solo OA oficiales de Bases Curriculares MINEDUC; propuestas y Religión se gestionan separadamente.",
  catalogStatus: "IN_PROGRESS",
  subjects1to4: ["Artes Visuales","Ciencias Naturales","Educación Física y Salud","Historia, Geografía y Ciencias Sociales","Lenguaje y Comunicación","Matemática","Música","Orientación","Tecnología"],
  subjects5to6: ["Artes Visuales","Ciencias Naturales","Educación Física y Salud","Historia, Geografía y Ciencias Sociales","Idioma Extranjero: Inglés","Lenguaje y Comunicación","Matemática","Música","Orientación","Tecnología"],
  subjects7to2m: ["Artes Visuales","Ciencias Naturales","Educación Física y Salud","Historia, Geografía y Ciencias Sociales","Idioma Extranjero: Inglés","Lengua y Literatura","Matemática","Música","Orientación","Tecnología"]
} as const;

export function expectedOASubjects(level:string): readonly string[] {
 if(["1° Básico","2° Básico","3° Básico","4° Básico"].includes(level)) return OA_CATALOG_SCOPE.subjects1to4;
 if(["5° Básico","6° Básico"].includes(level)) return OA_CATALOG_SCOPE.subjects5to6;
 if(["7° Básico","8° Básico","1° Medio","2° Medio"].includes(level)) return OA_CATALOG_SCOPE.subjects7to2m;
 return [];
}

export const verifiedOATotals: Record<string,Record<string,number>> = {
 "1° Básico":{
  "Matemática":20,
  "Lenguaje y Comunicación":26,
  "Historia, Geografía y Ciencias Sociales":15,
  "Ciencias Naturales":12
 },
 "2° Básico":{
  "Matemática":22,
  "Lenguaje y Comunicación":30
 },
 "3° Básico":{
  "Matemática":26,
  "Lenguaje y Comunicación":31,
  "Ciencias Naturales":13,
  "Artes Visuales":5
 }
};
export function expectedOACount(level:string,subject:string){return verifiedOATotals[level]?.[subject]??null}
