export const subjectsByLevel: Record<string,string[]> = {
"1° Básico":["Lenguaje y Comunicación","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"2° Básico":["Lenguaje y Comunicación","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"3° Básico":["Lenguaje y Comunicación","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"4° Básico":["Lenguaje y Comunicación","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"5° Básico":["Lenguaje y Comunicación","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Idioma Extranjero: Inglés","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"6° Básico":["Lenguaje y Comunicación","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Idioma Extranjero: Inglés","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"7° Básico":["Lengua y Literatura","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Idioma Extranjero: Inglés","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"8° Básico":["Lengua y Literatura","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Idioma Extranjero: Inglés","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"1° Medio":["Lengua y Literatura","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Idioma Extranjero: Inglés","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"2° Medio":["Lengua y Literatura","Matemática","Historia, Geografía y Ciencias Sociales","Ciencias Naturales","Idioma Extranjero: Inglés","Artes Visuales","Música","Educación Física y Salud","Tecnología","Orientación","Religión"],
"3° Medio":["Lengua y Literatura","Matemática","Idioma Extranjero: Inglés","Ciencias para la Ciudadanía","Educación Ciudadana","Filosofía","Religión"],
"4° Medio":["Lengua y Literatura","Matemática","Idioma Extranjero: Inglés","Ciencias para la Ciudadanía","Educación Ciudadana","Filosofía","Religión"]
};
export function curricularSubjects(level:string){return subjectsByLevel[level]||[]}
