// Estructura oficial verificada de Formación General 3°-4° Medio HC.
// Títulos tomados de Programas de Estudio UCE/MINEDUC. Los OA se vinculan solo cuando la asociación está comprobada.
const page=(level,subject,url,units)=>units.map((u,i)=>({level,subject,number:i+1,title:u.title,purpose:null,objectiveCodes:u.oa,sourceUrl:url,source:"Currículum Nacional · MINEDUC"}));
module.exports=[
...page("3° Medio HC","Matemática","https://www.curriculumnacional.cl/614/articles-133992_recurso_59.pdf",[
{title:"El uso de datos estadísticos y de modelos probabilísticos para la toma de decisiones",oa:["FG-MATE-3M-OAC-02"]},
{title:"Modelamiento de fenómenos con las funciones exponencial y logarítmica",oa:["FG-MATE-3M-OAC-03"]},
{title:"Relaciones métricas en la circunferencia",oa:["FG-MATE-3M-OAC-04"]},
{title:"Números complejos",oa:["FG-MATE-3M-OAC-01"]}
]),
...page("4° Medio HC","Matemática","https://www.curriculumnacional.cl/614/articles-133992_recurso_60.pdf",[
{title:"La toma de decisiones en situaciones de incerteza",oa:["FG-MATE-4M-OAC-02"]},
{title:"Modelamiento matemático para describir y predecir",oa:["FG-MATE-4M-OAC-03"]},
{title:"Geometría analítica: rectas y circunferencias en el plano",oa:["FG-MATE-4M-OAC-04"]},
{title:"Matemática financiera para la toma de decisiones",oa:["FG-MATE-4M-OAC-01"]}
]),
...page("3° Medio HC","Educación Ciudadana","https://www.curriculumnacional.cl/614/articles-140122_programa_feb_2021_final_s_disegno.pdf",[
{title:"Estado, democracia y ciudadanía",oa:null},
{title:"Justicia y derechos humanos",oa:null},
{title:"Participación y organización territorial",oa:null},
{title:"Relaciones entre Estado, mercado y sociedad",oa:null}
]),
...page("4° Medio HC","Educación Ciudadana","https://www.curriculumnacional.cl/614/articles-140124_programa_feb_2021_final_s_disegno.pdf",[
{title:"La participación ciudadana contribuye con soluciones a los desafíos, problemas y conflictos presentes en la sociedad",oa:null},
{title:"Medios de comunicación masivos, ciudadanía responsable y ética para una sociedad democrática",oa:null},
{title:"Principios éticos, valores democráticos y convivencia social",oa:null},
{title:"Modelos de desarrollo, sustentabilidad y democracia",oa:null}
]),
...page("3° Medio HC","Filosofía","https://www.curriculumnacional.cl/614/articles-140127_programa.pdf",[
{title:"La filosofía permite cuestionar el conocimiento y las acciones del ser humano",oa:null},
{title:"La realidad, el conocimiento y la existencia humana",oa:null},
{title:"El conocimiento, la ciencia y la verdad",oa:null},
{title:"Diálogo y argumentación filosófica",oa:null}
]),
...page("4° Medio HC","Filosofía","https://www.curriculumnacional.cl/614/articles-140125_programa.pdf",[
{title:"La filosofía como actividad humana",oa:null},
{title:"Problemas contemporáneos de la ética",oa:null},
{title:"Problemas contemporáneos de la política",oa:null},
{title:"El impacto de la filosofía en la vida cotidiana",oa:null}
]),
...page("3° Medio HC","Lengua y Literatura","https://www.curriculumnacional.cl/recursos/programa-fg-lengua-literatura-3-medio",[
{title:"Diálogo: literatura y efecto estético",oa:null},
{title:"Elaborar y comunicar interpretaciones literarias",oa:null},
{title:"Análisis crítico de géneros discursivos en comunidades digitales",oa:null},
{title:"Evaluar y producir géneros discursivos",oa:null}
]),
...page("4° Medio HC","Lengua y Literatura","https://www.curriculumnacional.cl/recursos/programa-fg-lengua-literatura-4-medio-0",[
{title:"Comparando lecturas literarias",oa:null},
{title:"Construyendo interpretaciones literarias colaborativas",oa:null},
{title:"Desafíos en el análisis crítico de los discursos",oa:null},
{title:"La escritura como forma de participación social",oa:null}
]),
...page("3° Medio HC","Idioma Extranjero: Inglés","https://www.curriculumnacional.cl/recursos/programa-fg-ingles-3-medio",[
{title:"My skills and achievements contribute to the society itself",oa:null},
{title:"My Reflections on Global Issues",oa:null},
{title:"The importance of the evolution of languages",oa:null},
{title:"English as a means to understand new trends",oa:null}
]),
...page("3° Medio HC","Ciencias para la Ciudadanía","https://www.curriculumnacional.cl/614/articles-140116_programa.pdf",[
{title:"Bienestar y Salud",oa:null},
{title:"Seguridad, Prevención y Autocuidado",oa:null},
{title:"Ambiente y Sostenibilidad",oa:null},
{title:"Tecnología y Sociedad",oa:null}
]),
...page("4° Medio HC","Ciencias para la Ciudadanía","https://www.curriculumnacional.cl/614/articles-140116_programa.pdf",[
{title:"Bienestar y Salud",oa:null},
{title:"Seguridad, Prevención y Autocuidado",oa:null},
{title:"Ambiente y Sostenibilidad",oa:null},
{title:"Tecnología y Sociedad",oa:null}
]),
...page("4° Medio HC","Idioma Extranjero: Inglés","https://www.curriculumnacional.cl/recursos/programa-fg-ingles-4-medio",[
{title:"The media and the message in today's globalized world",oa:null},
{title:"Communicating ideas through Science and Technology",oa:null},
{title:"It´s business time",oa:null},
{title:"Learning about sustainability and contributing with solutions",oa:null}
]),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Biología Celular y Molecular","https://www.curriculumnacional.cl/estudiante/621/w3-article-140138.html",[
{title:"Comprendiendo la estructura y función de la célula",oa:null},
{title:"Estudiando la versatilidad de las proteínas",oa:null},
{title:"Analizando la relación entre expresión y regulación génica",oa:null},
{title:"Analizando aplicaciones en biología celular y molecular",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Ciencias de la Salud","https://www.curriculumnacional.cl/estudiantes/Diferenciado-Humanista-Cientifico/Ciencias/Ciencias-de-la-salud/140139%3APrograma-HC-Ciencias-de-la-salud",[
{title:"Salud, sociedad y estilos de vida",oa:null},
{title:"Problemas en Salud Pública",oa:null},
{title:"Genética y salud",oa:null},
{title:"Ciencia y tecnología al servicio de la salud",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Biología de los Ecosistemas","https://www.curriculumnacional.cl/docente/629/w3-article-140136.html",[
{title:"Analizando el estado actual de la biodiversidad",oa:null},
{title:"Analizando la relación entre los servicios ecosistémicos y la sociedad",oa:null},
{title:"Investigando evidencias del cambio climático para generar conciencia ambiental",oa:null},
{title:"Integrando la biología con otras ciencias para dar solución a problemas",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Física","https://www.curriculumnacional.cl/docente/629/w3-article-140140.html",[
{title:"Cosmos: ¿en qué momento y lugar del universo nos encontramos?",oa:null},
{title:"Fuerzas centrales: ¿de qué tratan y cómo se manifiestan en mi vida?",oa:null},
{title:"Cambio climático: del saber a la acción sostenible",oa:null},
{title:"Física moderna: ¿qué sabemos de lo más pequeño y lo más grande de la naturaleza?",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Química","https://www.curriculumnacional.cl/docente/629/w3-article-140141.html",[
{title:"Fenómenos químicos del entorno y sus efectos",oa:null},
{title:"Química y tecnología: Aplicaciones para la vida",oa:null},
{title:"Reacciones químicas: espontaneidad y cinética",oa:null},
{title:"Química para la sustentabilidad",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Geometría 3D","https://www.curriculumnacional.cl/estudiante/621/w3-article-140147.html",[
{title:"Representación vectorial de situaciones y fenómenos",oa:null},
{title:"Rectas y planos en el espacio",oa:null},
{title:"Generación de cuerpos utilizando patrones geométricos",oa:null},
{title:"Los objetos con sus caras y perspectivas",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Límites, Derivadas e Integrales","https://www.curriculumnacional.cl/estudiante/621/w3-article-140143.html",[
{title:"Representar y modelar situaciones de cambio por medio de funciones",oa:null},
{title:"Reconociendo un patrón infinito y la noción de límite",oa:null},
{title:"Modelar situaciones de cambio con derivadas",oa:null},
{title:"Comprendiendo la Integral como proceso de reversibilidad y cálculo de áreas",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Pensamiento Computacional y Programación","https://www.curriculumnacional.cl/estudiante/621/w3-article-140146.html",[
{title:"La escritura como medio para comunicar y almacenar la información",oa:null},
{title:"La resolución de problemas y las máquinas",oa:null},
{title:"Ayuda de la computadora en problemas geométricos y estadísticos",oa:null},
{title:"Elaboración de Apps para dispositivos electrónicos móviles",oa:null}
])),
...["3° Medio HC","4° Medio HC"].flatMap(level=>page(level,"Probabilidades y Estadística Descriptiva e Inferencial","https://www.curriculumnacional.cl/estudiante/621/w3-article-140145.html",[
{title:"¿Qué dicen los gráficos? Análisis crítico de la información",oa:null},
{title:"Comprender la media muestral, las medidas de dispersión y la correlación",oa:null},
{title:"Modelaje de fenómenos mediante las probabilidades las distribuciones binomial o normal",oa:null},
{title:"Hacer inferencia estadística",oa:null}
]))
];