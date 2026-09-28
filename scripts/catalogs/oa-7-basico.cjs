// Catálogo referencial de códigos OA 7° Básico.
const make=(subject,prefix,count,slug)=>({level:"7° Básico",subject,expected:count,objectives:Array.from({length:count},(_,i)=>{const code=prefix+" OA "+String(i+1).padStart(2,"0");return [code,"Referencia curricular oficial "+code+". Consultar Currículum Nacional · MINEDUC."]}),sourceUrl:"https://www.curriculumnacional.cl/curriculum/7o-basico-2o-medio/"+slug+"/7-basico"});
module.exports=[
make("Matemática","MA07",19,"matematica"),
make("Lengua y Literatura","LE07",25,"lengua-literatura"),
make("Ciencias Naturales","CN07",15,"ciencias-naturales"),
make("Historia, Geografía y Ciencias Sociales","HI07",23,"historia-geografia-ciencias-sociales"),
make("Artes Visuales","AR07",6,"artes-visuales"),
make("Idioma Extranjero: Inglés","IN07",16,"ingles"),
make("Música","MU07",7,"musica"),
make("Educación Física y Salud","EF07",5,"educacion-fisica-salud"),
make("Tecnología","TE07",6,"tecnologia"),
make("Orientación","OR07",10,"orientacion")
];
