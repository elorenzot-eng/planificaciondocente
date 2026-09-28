// Formación General electiva 3° y 4° Medio HC · bloques compartidos.
// Códigos/alcance contrastados con Bases Curriculares 3°-4° Medio, Currículum Nacional MINEDUC.
// Descripciones concisas para el selector pedagógico.
const root="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
const block=(level,subject,slug,rows)=>({level,subject,expected:rows.length,sourceUrl:root+"/"+slug+"/"+(level.startsWith("3")?"3-medio-fg":"4-medio-fg"),objectives:rows});
const shared=(subject,slug,rows)=>[block("3° Medio HC",subject,slug,rows),block("4° Medio HC",subject,slug,rows)];
module.exports=[
...shared("Artes Visuales","artes-visuales",[
["FG-ARTE-3y4-OAC-01","Experimentar con soportes, procedimientos y materiales de ilustración, artes audiovisuales y multimediales."],
["FG-ARTE-3y4-OAC-02","Crear obras y proyectos visuales, audiovisuales y multimediales para expresar ideas, sensaciones y emociones mediante decisiones creativas."],
["FG-ARTE-3y4-OAC-03","Crear proyectos visuales basados en imaginarios personales y referentes artísticos, usando medios y tecnologías pertinentes."],
["FG-ARTE-3y4-OAC-04","Analizar propósitos expresivos de obras visuales, audiovisuales y multimediales considerando criterios estéticos y contexto."],
["FG-ARTE-3y4-OAC-05","Argumentar juicios estéticos sobre obras visuales y multimediales a partir de análisis, interpretación y contexto."],
["FG-ARTE-3y4-OAC-06","Evaluar críticamente procesos y resultados de obras y proyectos propios y de pares según criterios estéticos y propósitos expresivos."],
["FG-ARTE-3y4-OAC-07","Diseñar y gestionar colaborativamente proyectos de difusión de obras visuales y multimediales mediante diversos medios y tecnologías."]
]),
...shared("Danza","danza",[
["FG-DANZ-3y4-OAC-01","Experimentar conscientemente las posibilidades expresivas del cuerpo mediante recursos y elementos del lenguaje de la danza."],
["FG-DANZ-3y4-OAC-02","Expresar y comunicar ideas, sensaciones, emociones y temas integrando técnica, espacio, tiempo, energía y otros recursos de la danza."],
["FG-DANZ-3y4-OAC-03","Crear obras y proyectos de danza individuales y colectivos considerando temas de interés, lenguaje de la danza y puesta en escena."],
["FG-DANZ-3y4-OAC-04","Interpretar propósitos expresivos de obras de danza considerando criterios estéticos y aspectos contextuales."],
["FG-DANZ-3y4-OAC-05","Evaluar críticamente procesos y resultados de obras y proyectos de danza propios y de pares con una postura fundada y respetuosa."],
["FG-DANZ-3y4-OAC-06","Diseñar y gestionar colaborativamente la difusión de obras y proyectos de danza mediante diversos medios y tecnologías."]
]),
...shared("Música","musica",[
["FG-MUSI-3y4-OAC-01","Experimentar con estilos musicales contemporáneos utilizando voz, objetos sonoros, instrumentos y tecnologías."],
["FG-MUSI-3y4-OAC-02","Crear música para expresar emociones e ideas aplicando recursos de producción y elementos del lenguaje musical."],
["FG-MUSI-3y4-OAC-03","Interpretar repertorio propio y de diversos estilos, individualmente o en conjunto, con trabajo técnico coherente con sus propósitos expresivos."],
["FG-MUSI-3y4-OAC-04","Analizar propósitos expresivos de obras musicales mediante criterios estéticos y conceptos disciplinarios."],
["FG-MUSI-3y4-OAC-05","Argumentar juicios estéticos sobre obras musicales considerando propósitos expresivos y aspectos contextuales."],
["FG-MUSI-3y4-OAC-06","Evaluar críticamente procesos y resultados musicales propios y de pares según criterios estéticos, técnicos y expresivos."],
["FG-MUSI-3y4-OAC-07","Diseñar y gestionar colaborativamente proyectos de difusión de obras e interpretaciones musicales mediante diversos medios y tecnologías."]
]),
...shared("Teatro","teatro",[
["FG-TEAT-3y4-OAC-01","Experimentar posibilidades expresivas y comunicativas del cuerpo, gesto y voz mediante juegos dramáticos e improvisaciones."],
["FG-TEAT-3y4-OAC-02","Crear ejercicios de expresión dramática individuales y colectivos usando recursos del lenguaje teatral y la puesta en escena."],
["FG-TEAT-3y4-OAC-03","Interpretar obras teatrales construyendo personajes y situaciones mediante habilidades actorales, recursos escénicos y tecnologías."],
["FG-TEAT-3y4-OAC-04","Inferir propósitos expresivos de obras teatrales y textos dramáticos considerando criterios estéticos, época y contexto."],
["FG-TEAT-3y4-OAC-05","Evaluar críticamente procesos y resultados teatrales propios, de pares y de artistas, con una postura fundada y respetuosa."],
["FG-TEAT-3y4-OAC-06","Diseñar y gestionar colaborativamente proyectos de difusión de obras e interpretaciones teatrales mediante diversos medios y tecnologías."]
]),
...shared("Educación Física y Salud 1","educacion-fisica-salud-1",[
["FG-EFS1-3y4-OAC-01","Aplicar individual y colectivamente habilidades motrices especializadas de manera creativa y segura en diversas actividades y entornos."],
["FG-EFS1-3y4-OAC-02","Evaluar estrategias y tácticas individuales y colectivas para resolver problemas en juego, deporte y recreación, asumiendo distintos roles."],
["FG-EFS1-3y4-OAC-03","Diseñar y aplicar un plan de entrenamiento para mejorar el rendimiento físico según características personales y funcionales."],
["FG-EFS1-3y4-OAC-04","Promover bienestar, autocuidado, vida activa y alimentación saludable mediante programas y proyectos comunitarios inclusivos."],
["FG-EFS1-3y4-OAC-05","Analizar cómo factores sociales, culturales, económicos y tecnológicos inciden en oportunidades para desarrollar estilos de vida activos y saludables."]
]),
...shared("Educación Física y Salud 2","educacion-fisica-salud-2",[
["FG-EFS2-3y4-OAC-01","Evaluar individual y colectivamente habilidades motrices especializadas utilizadas en diversas actividades físicas y entornos."],
["FG-EFS2-3y4-OAC-02","Organizar y aplicar estrategias y tácticas para resolver problemas en actividades deportivas, recreativas y de expresión motriz."],
["FG-EFS2-3y4-OAC-03","Aplicar responsablemente un plan de entrenamiento orientado a mejorar el rendimiento físico según características personales y funcionales."],
["FG-EFS2-3y4-OAC-04","Evaluar el impacto de programas y proyectos deportivos, recreativos y socioculturales que promueven bienestar, autocuidado y vida activa en la comunidad."],
["FG-EFS2-3y4-OAC-05","Evaluar factores y oportunidades del entorno que favorecen una vida activa y saludable, proponiendo acciones pertinentes a la comunidad."]
]),
...shared("Chile y la Región Latinoamericana","chile-region-latinoamericana",[
["FG-CHLA-3y4-OAC-01","Analizar procesos sociales y culturales recientes de Chile y América Latina, como migraciones, cambios demográficos y urbanización, desde la equidad, diversidad e interculturalidad."],
["FG-CHLA-3y4-OAC-02","Explicar procesos políticos recientes de los Estados latinoamericanos, considerando democracia, fuerzas armadas, transiciones y derechos humanos."],
["FG-CHLA-3y4-OAC-03","Investigar respuestas estatales latinoamericanas a desafíos de pobreza, desigualdad, crecimiento y desarrollo usando conceptos e indicadores económicos."],
["FG-CHLA-3y4-OAC-04","Analizar el presente de pueblos indígenas de Chile y Latinoamérica desde perspectivas diversas, considerando cultura, historia reciente y relaciones con los Estados."],
["FG-CHLA-3y4-OAC-05","Evaluar el estado ambiental de Chile y América Latina, los efectos de actividades humanas y las acciones estatales hacia la sustentabilidad."],
["FG-CHLA-3y4-OAC-06","Analizar oportunidades de integración y cooperación internacional latinoamericana en ámbitos económicos, sociales, científicos y de derechos."],
["FG-CHLA-3y4-OAC-07","Diseñar colaborativamente propuestas para abordar problemas locales vinculados con los temas estudiados."]
])
];