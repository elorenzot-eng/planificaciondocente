// Catálogo referencial de códigos OA 5° y 6° Básico.
const make=(level,subject,prefix,count,slug,n)=>({level,subject,expected:count,objectives:Array.from({length:count},(_,i)=>{const code=prefix+" OA "+String(i+1).padStart(2,"0");const focus=({MA:"Números, álgebra, geometría, medición, probabilidad y datos",LE:"Lectura, escritura y comunicación",CN:"Ciencias de la vida, físicas, químicas, Tierra y ambiente",HI:"Historia, geografía, ciudadanía y sociedad",AR:"Creación y apreciación visual",MU:"Escucha, interpretación y creación musical",EF:"Habilidades motrices, vida activa y autocuidado",TE:"Diseño, creación y uso de tecnología",OR:"Desarrollo personal, convivencia y participación",IN:"Comprensión y comunicación en inglés",EN:"Comprensión y comunicación en inglés"})[prefix.slice(0,2)]||"Aprendizaje curricular";return [code,focus+" · "+code+". Consultar descripción oficial MINEDUC."]}),sourceUrl:"https://www.curriculumnacional.cl/curriculum/1o-6o-basico/"+slug+"/"+n+"-basico"});
module.exports=[
make("5° Básico","Matemática","MA05",24,"matematica",5),
make("5° Básico","Lenguaje y Comunicación","LE05",30,"lenguaje-comunicacion",5),
make("5° Básico","Ciencias Naturales","CN05",14,"ciencias-naturales",5),
make("5° Básico","Historia, Geografía y Ciencias Sociales","HI05",22,"historia-geografia-ciencias-sociales",5),
make("5° Básico","Artes Visuales","AR05",5,"artes-visuales",5),
make("5° Básico","Música","MU05",8,"musica",5),
make("5° Básico","Educación Física y Salud","EF05",11,"educacion-fisica-salud",5),
make("5° Básico","Tecnología","TE05",7,"tecnologia",5),
make("5° Básico","Orientación","OR05",9,"orientacion",5),
make("5° Básico","Idioma Extranjero: Inglés","IN05",16,"ingles",5),
make("6° Básico","Matemática","MA06",24,"matematica",6),
make("6° Básico","Lenguaje y Comunicación","LE06",31,"lenguaje-comunicacion",6),
make("6° Básico","Ciencias Naturales","CN06",18,"ciencias-naturales",6),
make("6° Básico","Historia, Geografía y Ciencias Sociales","HI06",26,"historia-geografia-ciencias-sociales",6),
make("6° Básico","Artes Visuales","AR06",5,"artes-visuales",6),
make("6° Básico","Música","MU06",8,"musica",6),
make("6° Básico","Educación Física y Salud","EF06",11,"educacion-fisica-salud",6),
make("6° Básico","Tecnología","TE06",7,"tecnologia",6),
make("6° Básico","Orientación","OR06",9,"orientacion",6),
make("6° Básico","Idioma Extranjero: Inglés","IN06",16,"ingles",6)
];
