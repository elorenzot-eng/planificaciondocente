// Unidades de 1° y 2° Medio verificadas contra fichas de Programa de Estudio de Currículum Nacional · MINEDUC.
// Los OA no se vinculan aquí salvo que la asociación OA→Unidad esté comprobada.
// Sin objectiveCodes, la plataforma conserva los OA del nivel disponibles para selección docente.
const page=(level,subject,url,titles)=>titles.map((title,i)=>({level,subject,number:i+1,title,purpose:null,sourceUrl:url,source:"Currículum Nacional · MINEDUC"}));
module.exports=[
...page("1° Medio","Matemática","https://www.curriculumnacional.cl/docente/629/w3-article-34359.html",[
"Productos notables. Potencias con exponente entero. El cono.",
"Sistemas de ecuaciones lineales. Área y perímetros de sectores y segmentos circulares.",
"Homotecia y sus aplicaciones",
"Nube de punto y gráficos xy. Regla aditiva y multiplicativa de probabilidades."
]),
...page("2° Medio","Matemática","https://www.curriculumnacional.cl/docentes/Educacion-General/Matematica/Matematica-2-medio/34360%3APrograma-de-Estudio-Matematica-2-Medio",[
"Aplicación de raíces, potencias y logaritmos. Área y superficie de la esfera",
"Funciones cuadráticas, ecuaciones cuadráticas y la inversa de una función",
"El cambio porcentual constante y razones trigonométricas",
"Variable aleatoria finita"
]),
...page("1° Medio","Lengua y Literatura","https://www.curriculumnacional.cl/docente/629/w3-article-34377.html",[
"La libertad como tema literario (narrativa y lírica)",
"Ciudadanos y opinión (texto argumentativo)",
"Relaciones humanas en el teatro y la literatura (género dramático)",
"Comunicación y sociedad (medios de comunicación)"
]),
...page("2° Medio","Lengua y Literatura","https://www.curriculumnacional.cl/docente/629/w3-article-34446.html",[
"Sobre la ausencia: exilio, migración e identidad (narrativa)",
"Ciudadanía y trabajo (medios de comunicación)",
"Lo divino y lo humano (género lírico)",
"Poder y ambición (género dramático)"
]),
...page("1° Medio","Historia, Geografía y Ciencias Sociales","https://www.curriculumnacional.cl/docentes/Educacion-General/Historia-geografia-y-ciencias-sociales/Historia-Geografia-y-Ciencias-Sociales-1-medio/34440%3APrograma-de-Estudio-Historia-Geografia-y-Ciencias-Sociales-1-Medio",[
"La construcción de estados naciones en Europa, América y Chile y los desafíos de su consolidación en el territorio nacional",
"Progreso, industrialización y crisis: conformación e impactos del nuevo orden contemporáneo en Chile y el mundo",
"La conformación del territorio chileno y de sus dinámicas geográficas: caracterización e impactos de las políticas estatales de expansión",
"Componentes y dinámicas del sistema económico y financiero: la ciudadanía como agente de consumo responsable"
]),
...page("2° Medio","Historia, Geografía y Ciencias Sociales","https://www.curriculumnacional.cl/docente/629/w3-article-34441.html",[
"Crisis, totalitarismo y guerra en la primera mitad del siglo XX: los desafíos para el Estado y la democracia en Chile y el mundo",
"El mundo bipolar: proyectos políticos, transformaciones estructurales y quiebre de la democracia en Chile",
"Dictadura militar, transición política y los desafíos de la democracia en Chile",
"Formación ciudadana: Estado de derecho, sociedad y diversidad"
]),
...page("1° Medio","Música","https://www.curriculumnacional.cl/docente/629/w3-article-34426.html",[
"Lo que la música nos muestra","Lo que la música nos cuenta","La música nos identifica","Compartiendo nuestras músicas"
]),
...page("1° Medio","Idioma Extranjero: Inglés","https://www.curriculumnacional.cl/docente/629/w3-article-34428.html",["Jobs","Education and lifelong learning","The arts","Traditions and festivities"]),
...page("2° Medio","Idioma Extranjero: Inglés","https://www.curriculumnacional.cl/estudiante/621/w3-article-34429.html",["Globalization and communication","Technology and its effects","Outstanding persons","Sustainable development"]),
...page("2° Medio","Música","https://www.curriculumnacional.cl/estudiante/621/w3-article-34433.html",["Música y tradición","Música y cultura","Música y otras artes","Compartiendo nuestras músicas"])
];