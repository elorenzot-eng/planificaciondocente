export const OA_CATALOG_SCOPE = {
  source: "Currículum Nacional · MINEDUC",
  sourceUrls: {
    basic1to6: "https://www.curriculumnacional.cl/curriculum/1o-6o-basico",
    basic7to2m: "https://www.curriculumnacional.cl/curriculum/7o-basico-2-medio"
  },
  levels: ["1° Básico","2° Básico","3° Básico","4° Básico","5° Básico","6° Básico","7° Básico","8° Básico","1° Medio","2° Medio"],
  catalogPolicy: "OA de Bases Curriculares MINEDUC en catálogo oficial; Inglés 1°-4° (Propuesta) y Religión se identifican y gestionan separadamente.",
  optionalPrograms1to4: ["Inglés (Propuesta)"],
  separatePrograms: ["Religión"],
  catalogStatus: "IN_PROGRESS",
  subjects1to4: ["Artes Visuales","Ciencias Naturales","Educación Física y Salud","Historia, Geografía y Ciencias Sociales","Lenguaje y Comunicación","Matemática","Música","Orientación","Tecnología","Lengua y Cultura de los Pueblos Originarios Ancestrales"],
  subjects5to6: ["Artes Visuales","Ciencias Naturales","Educación Física y Salud","Historia, Geografía y Ciencias Sociales","Idioma Extranjero: Inglés","Lenguaje y Comunicación","Matemática","Música","Orientación","Tecnología","Lengua y Cultura de los Pueblos Originarios Ancestrales"],
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
  "Artes Visuales":5,
  "Música":8,
  "Tecnología":7
 },
 "4° Básico":{
  "Matemática":27,
  "Lenguaje y Comunicación":30,
  "Ciencias Naturales":17,
  "Historia, Geografía y Ciencias Sociales":18,
  "Música":8,
  "Tecnología":7
 },
 "5° Básico":{
  "Matemática":24,
  "Lenguaje y Comunicación":30,
  "Ciencias Naturales":14,
  "Historia, Geografía y Ciencias Sociales":22
 }
};
export function expectedOACount(level:string,subject:string){return verifiedOATotals[level]?.[subject]??null}
