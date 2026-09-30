// Unidades de 1° y 2° Medio verificadas contra fichas de Programa de Estudio de Currículum Nacional · MINEDUC.
// Los OA no se vinculan aquí salvo que la asociación OA→Unidad esté comprobada.
// Sin objectiveCodes, la plataforma conserva los OA del nivel disponibles para selección docente.
const page=(level,subject,url,titles,objectiveCodes=[])=>titles.map((title,i)=>({level,subject,number:i+1,title,purpose:null,sourceUrl:url,source:"Currículum Nacional · MINEDUC",...(Array.isArray(objectiveCodes[i])?{objectiveCodes:objectiveCodes[i]}:{})}));
module.exports=[
...page("1° Medio","Matemática","https://www.curriculumnacional.cl/docente/629/w3-article-34359.html",[
"Productos notables. Potencias con exponente entero. El cono.",
"Sistemas de ecuaciones lineales. Área y perímetros de sectores y segmentos circulares.",
"Homotecia y sus aplicaciones",
"Nube de punto y gráficos xy. Regla aditiva y multiplicativa de probabilidades."
],[["MA1M OA 01","MA1M OA 02","MA1M OA 03","MA1M OA 07"],["MA1M OA 04","MA1M OA 05","MA1M OA 06"],["MA1M OA 08","MA1M OA 09","MA1M OA 10","MA1M OA 11"],["MA1M OA 12","MA1M OA 13","MA1M OA 14","MA1M OA 15"]]),
...page("2° Medio","Matemática","https://www.curriculumnacional.cl/docentes/Educacion-General/Matematica/Matematica-2-medio/34360%3APrograma-de-Estudio-Matematica-2-Medio",[
"Aplicación de raíces, potencias y logaritmos. Área y superficie de la esfera",
"Funciones cuadráticas, ecuaciones cuadráticas y la inversa de una función",
"El cambio porcentual constante y razones trigonométricas",
"Variable aleatoria finita"
],[["MA2M OA 01","MA2M OA 02","MA2M OA 07"],["MA2M OA 03","MA2M OA 04","MA2M OA 05"],["MA2M OA 06","MA2M OA 08","MA2M OA 09"],["MA2M OA 10","MA2M OA 11","MA2M OA 12"]]),
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
...page("2° Medio","Música","https://www.curriculumnacional.cl/estudiante/621/w3-article-34433.html",["Música y tradición","Música y cultura","Música y otras artes","Compartiendo nuestras músicas"]),
...page("1° Medio","Tecnología","https://www.curriculumnacional.cl/estudiantes/Educacion-General/Tecnologia/Tecnologia-1-medio/34449%3APrograma-de-Estudio-Educacion-Tecnologica-1-Medio",["Desarrollo e Implementación de un Servicio","Evaluación e Impacto de una Solución"]),
...page("2° Medio","Educación Física y Salud","https://www.curriculumnacional.cl/portal/Documentos-Curriculares/Programas/34437%3APrograma-de-Estudio-Educacion-Fisica-2-Medio",["Ejercicio físico y salud","Deportes de colaboración y oposición","Deportes y actividades individuales de autosuperación","Actividad física y motora al aire libre"]),
...page("1° Medio","Artes Visuales","https://www.curriculumnacional.cl/docente/629/w3-article-34354.html",["Grabado y libro de artista","Arquitectura","Diseño urbano y pintura mural","Arte digital"]),
...page("2° Medio","Artes Visuales","https://www.curriculumnacional.cl/docentes/Educacion-General/Artes-visuales/Artes-Visuales-2-medio/34355%3APrograma-de-Estudio-Artes-Visuales-2-Medio",["Problemáticas juveniles y medios contemporáneos","Problemáticas sociales y escultura","Instalación multimedial","Diseño y difusión"]),
...page("1° Medio","Ciencias Naturales","https://www.curriculumnacional.cl/estudiantes/Educacion-General/Ciencias-naturales/Ciencias-Naturales-1-medio/34456%3APrograma-de-Estudio-Ciencias-Naturales-1-Medio",["Biología · Unidad 1: Evolución y biodiversidad","Biología · Unidad 2: Organismos en ecosistemas","Biología · Unidad 3: Materia y energía en ecosistema","Biología · Unidad 4: Impactos en ecosistema y sustentabilidad","Física · Unidad 1: Ondas y sonido","Física · Unidad 2: Luz y óptica geométrica","Física · Unidad 3: Percepción sonora y visual y ondas sísmicas","Física · Unidad 4: Estructuras cósmicas","Química · Unidad 1: Reacciones químicas cotidianas","Química · Unidad 2: Reacciones químicas","Química · Unidad 3: Nomenclatura inorgánica","Química · Unidad 4: Estequiometría de reacción"]),
...page("2° Medio","Ciencias Naturales","https://www.curriculumnacional.cl/docente/629/w3-article-135424.html",["Biología · Unidad 1: Coordinación y regulación","Biología · Unidad 2: Sexualidad y reproducción","Biología · Unidad 3: Genética","Biología · Unidad 4: Manipulación genética","Física · Unidad 1: Movimiento rectilíneo","Física · Unidad 2: Fuerza","Física · Unidad 3: Energía mecánica y cantidad de movimiento","Física · Unidad 4: El Universo","Química · Unidad 1: Soluciones químicas","Química · Unidad 2: Propiedades coligativas de las soluciones","Química · Unidad 3: Química orgánica","Química · Unidad 4: Química orgánica: estereoquímica e isomería"]),
...page("2° Medio","Tecnología","https://www.curriculumnacional.cl/estudiante/621/w3-article-34450.html",["Mejorando el uso de los recursos","Oportunidades y desafios de la tecnologia en la actualidad"]),
...page("1° Medio","Educación Física y Salud","https://www.curriculumnacional.cl/docentes/Educacion-General/Educacion-fisica-y-salud/Ed-Fisica-y-Salud-1-medio/34436%3APrograma-de-Estudio-Educacion-Fisica-y-Salud-1-Medio",["Desarrollar resistencia cardiovascular, fuerza muscular, flexibilidad y velocidad","Aplicar habilidades motrices específicas","Practicar actividad física en forma segura","Aplicar conductas de autocuidado y seguridad"]),
...page("1° Medio","Orientación","https://www.curriculumnacional.cl/docente/629/w3-article-37198.html",["Crecimiento personal","Bienestar y autocuidado","Relaciones interpersonales","Pertenencia y participación democrática","Gestión y proyección del aprendizaje"]),
...page("2° Medio","Orientación","https://www.curriculumnacional.cl/docente/629/w3-article-42645.html",["Crecimiento personal","Bienestar y autocuidado","Relaciones interpersonales","Pertenencia y participación democrática","Gestión y proyección del aprendizaje"])
];