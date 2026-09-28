// Formación Diferenciada Humanístico-Científica 3° y 4° Medio · Matemática y Lengua y Literatura.
// Síntesis curriculares contrastadas con programas oficiales UCE/MINEDUC. Se comparten en ambos niveles HC.
const root="https://www.curriculumnacional.cl/portal/Curso/Educacion-General/3-y-4-Medio/";
const block=(level,subject,rows)=>({level,subject,expected:rows.length,sourceUrl:root,objectives:rows});
const shared=(subject,rows)=>[block("3° Medio HC",subject,rows),block("4° Medio HC",subject,rows)];
module.exports=[
...shared("Geometría 3D",[
["MA-GE3D-3y4-OAC-01","Argumentar la validez de soluciones que involucren isometrías y homotecias en el plano, usando vectores y representaciones digitales."],
["MA-GE3D-3y4-OAC-02","Resolver problemas con puntos, rectas y planos en el espacio tridimensional mediante vectores y representaciones digitales."],
["MA-GE3D-3y4-OAC-03","Resolver problemas que relacionen figuras 3D y 2D mediante vistas, cortes, proyecciones e inscripción de figuras tridimensionales."],
["MA-GE3D-3y4-OAC-04","Formular y verificar conjeturas sobre forma, área y volumen de figuras 3D generadas por rotación o traslación de figuras planas, usando herramientas digitales."],
["MA-GE3D-3y4-OAC-05","Diseñar propuestas y resolver problemas de perspectiva, proyección paralela y central, puntos de fuga y elevaciones aplicados al arte, arquitectura, diseño o construcción."]
]),
...shared("Límites, Derivadas e Integrales",[
["MA-LDEI-3y4-OAC-01","Utilizar distintas representaciones de la composición de funciones y de la existencia de la función inversa de una función dada."],
["MA-LDEI-3y4-OAC-02","Argumentar sobre la existencia de límites de funciones en el infinito y en un punto para estudiar convergencia y continuidad en contextos matemáticos, científicos y cotidianos."],
["MA-LDEI-3y4-OAC-03","Modelar situaciones que involucren rapidez instantánea de cambio y evaluar la necesidad de ajustar el modelo obtenido."],
["MA-LDEI-3y4-OAC-04","Resolver problemas de crecimiento, decrecimiento, concavidad, máximos, mínimos e inflexión mediante primera y segunda derivada, manualmente y con herramientas digitales."],
["MA-LDEI-3y4-OAC-05","Modelar situaciones mediante el concepto de integral como área bajo la curva en contextos matemáticos, científicos y cotidianos, evaluando el ajuste del modelo."]
]),
...shared("Probabilidades y Estadística Descriptiva e Inferencial",[
["MA-PEDI-3y4-OAC-01","Argumentar y comunicar decisiones a partir del análisis crítico de histogramas, polígonos de frecuencia, frecuencia acumulada, diagramas de cajón y nubes de puntos, incluyendo herramientas digitales."],
["MA-PEDI-3y4-OAC-02","Resolver problemas con media muestral, desviación estándar, varianza, coeficiente de variación y correlación muestral, manualmente y con herramientas digitales."],
["MA-PEDI-3y4-OAC-03","Modelar fenómenos cotidianos, científicos y sociales que requieran cálculo de probabilidades y distribuciones binomial y normal."],
["MA-PEDI-3y4-OAC-04","Argumentar inferencias sobre parámetros o características de una población a partir de una muestra aleatoria, usando intervalos de confianza o pruebas de hipótesis bajo supuesto de normalidad."]
]),
...shared("Lectura y Escritura Especializadas",[
["LE-LEES-3y4-OAC-01","Producir géneros discursivos académicos gestionando información de distintas fuentes y demostrando dominio especializado de un tema."],
["LE-LEES-3y4-OAC-02","Participar activamente como autor, lector y revisor en procesos colaborativos de producción de textos especializados dentro de comunidades de pares."],
["LE-LEES-3y4-OAC-03","Utilizar estrategias para registrar y procesar información de soportes impresos o digitales de acuerdo con tema, propósito y convenciones discursivas."],
["LE-LEES-3y4-OAC-04","Utilizar estrategias para construir y transformar conocimiento por escrito según temas, propósitos comunicativos y convenciones de los textos producidos."],
["LE-LEES-3y4-OAC-05","Buscar, evaluar y seleccionar rigurosamente fuentes impresas y digitales considerando validez, veracidad y responsabilidad de autoría."]
]),
...shared("Taller de Literatura",[
["LE-TALI-3y4-OAC-01","Producir géneros escritos y audiovisuales para desarrollar y comunicar interpretaciones de obras leídas."],
["LE-TALI-3y4-OAC-02","Producir textos de diversos géneros literarios que expresen proyectos personales y creativos."],
["LE-TALI-3y4-OAC-03","Contribuir con comentarios, sugerencias, interpretaciones y críticas a procesos colectivos de lectura y escritura creativa."],
["LE-TALI-3y4-OAC-04","Revisar y reescribir producciones propias a partir de comentarios, críticas y sugerencias de pares para enriquecer la creación."],
["LE-TALI-3y4-OAC-05","Construir trayectorias de lectura desde intereses e inquietudes personales, explicitando criterios de selección y compartiéndolas con pares."],
["LE-TALI-3y4-OAC-06","Producir textos y otras creaciones que comuniquen reflexiones personales y sobre el mundo surgidas de las obras y trayectorias de lectura."]
]),
...shared("Participación y Argumentación en Democracia",[
["LE-PARG-3y4-OAC-01","Construir colectivamente conclusiones, soluciones, preguntas, hipótesis o acuerdos surgidos de discusiones argumentadas sobre temas controversiales de la vida y la sociedad."],
["LE-PARG-3y4-OAC-02","Dialogar argumentativamente privilegiando el componente racional, estableciendo relaciones lógicas y extrayendo conclusiones razonadas."],
["LE-PARG-3y4-OAC-03","Evaluar formas de legitimación del conocimiento en los discursos según sus modos de generación, ámbito de participación y comunidad discursiva."],
["LE-PARG-3y4-OAC-04","Elaborar argumentos basados en evidencias o información pública legitimada y pertinente al tema o problema analizado."],
["LE-PARG-3y4-OAC-05","Utilizar formas de argumentación y legitimación del conocimiento pertinentes al ámbito, comunidad discursiva y propósito de la argumentación."],
["LE-PARG-3y4-OAC-06","Evaluar críticamente argumentaciones presentes en distintos ámbitos de participación, considerando su calidad, razonamiento, evidencia y efectos."],
["LE-PARG-3y4-OAC-07","Construir una postura personal sobre controversias y problemáticas sociales a partir de investigación y evaluación de argumentaciones y evidencias."]
])
];