// Catálogo referencial de códigos OA 3° y 4° Básico.
// Los textos oficiales se consultan en Currículum Nacional · MINEDUC.
const make=(level,subject,prefix,count,slug,n)=>({level,subject,expected:count,objectives:Array.from({length:count},(_,i)=>{const code=prefix+" OA "+String(i+1).padStart(2,"0");return [code,"Referencia curricular oficial "+code+". Consultar Currículum Nacional · MINEDUC."]}),sourceUrl:"https://www.curriculumnacional.cl/curriculum/1o-6o-basico/"+slug+"/"+n+"-basico"});
module.exports=[
make("3° Básico","Matemática","MA03",26,"matematica",3),
make("3° Básico","Lenguaje y Comunicación","LE03",31,"lenguaje-comunicacion",3),
make("3° Básico","Ciencias Naturales","CN03",13,"ciencias-naturales",3),
make("3° Básico","Historia, Geografía y Ciencias Sociales","HI03",16,"historia-geografia-ciencias-sociales",3),
make("3° Básico","Artes Visuales","AR03",5,"artes-visuales",3),
make("3° Básico","Música","MU03",8,"musica",3),
make("3° Básico","Educación Física y Salud","EF03",11,"educacion-fisica-salud",3),
make("3° Básico","Tecnología","TE03",7,"tecnologia",3),
make("3° Básico","Orientación","OR03",8,"orientacion",3),
make("4° Básico","Matemática","MA04",27,"matematica",4),
make("4° Básico","Lenguaje y Comunicación","LE04",30,"lenguaje-comunicacion",4),
make("4° Básico","Ciencias Naturales","CN04",17,"ciencias-naturales",4),
make("4° Básico","Historia, Geografía y Ciencias Sociales","HI04",18,"historia-geografia-ciencias-sociales",4),
make("4° Básico","Artes Visuales","AR04",5,"artes-visuales",4),
make("4° Básico","Música","MU04",8,"musica",4),
make("4° Básico","Educación Física y Salud","EF04",11,"educacion-fisica-salud",4),
make("4° Básico","Tecnología","TE04",7,"tecnologia",4),
make("4° Básico","Orientación","OR04",8,"orientacion",4)
];
