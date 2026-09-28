// Formación General 3° y 4° Medio HC.
// Códigos y alcance contrastados con Currículum Nacional · MINEDUC (Bases 3°-4° Medio).
// Las descripciones son síntesis curriculares concisas para uso del selector pedagógico.
const sourceUrl="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
const block=(level,subject,slug,objectives)=>({level,subject,expected:objectives.length,sourceUrl:sourceUrl+"/"+slug,objectives});
module.exports=[
block("3° Medio","Matemática","matematica/3-medio-fg",[
["FG-MATE-3M-OAC-01","Resolver problemas con números complejos, representándolos de forma pictórica y simbólica y apoyándose en herramientas tecnológicas."],
["FG-MATE-3M-OAC-02","Tomar decisiones en situaciones de incerteza que involucren el análisis de datos estadísticos con medidas de dispersión y probabilidades condicionales."],
["FG-MATE-3M-OAC-03","Aplicar modelos matemáticos que describen fenómenos o situaciones de crecimiento y decrecimiento, involucrando funciones exponencial y logarítmica, de forma manuscrita y con herramientas tecnológicas."],
["FG-MATE-3M-OAC-04","Resolver problemas de geometría euclidiana que involucren relaciones métricas entre ángulos, arcos, cuerdas y secantes en la circunferencia, de forma manuscrita y con herramientas tecnológicas."]
]),
block("4° Medio","Matemática","matematica/4-medio-fg",[
["FG-MATE-4M-OAC-01","Fundamentar decisiones financieras y económicas personales o comunitarias mediante porcentajes, tasas de interés e índices económicos."],
["FG-MATE-4M-OAC-02","Fundamentar decisiones en situaciones de incertidumbre mediante análisis crítico de datos y los modelos binomial y normal."],
["FG-MATE-4M-OAC-03","Construir modelos de situaciones o fenómenos de crecimiento, decrecimiento y periódicos que involucren funciones potencia de exponente entero y trigonométricas seno y coseno, de forma manuscrita y con herramientas tecnológicas."],
["FG-MATE-4M-OAC-04","Resolver problemas acerca de rectas y circunferencias en el plano mediante su representación analítica, de forma manuscrita y con herramientas tecnológicas."]
]),
block("3° Medio","Lengua y Literatura","lengua-literatura/3-medio-fg",[
["FG-LELI-3M-OAC-01","Formular interpretaciones literarias considerando recursos de la obra y relaciones intertextuales con otros referentes culturales y artísticos."],
["FG-LELI-3M-OAC-02","Reflexionar sobre el efecto estético de obras literarias considerando experiencias, conocimientos y recursos empleados en su construcción."],
["FG-LELI-3M-OAC-03","Analizar críticamente textos no literarios orales, escritos y audiovisuales considerando contexto, género discursivo, razonamientos y veracidad de la información."],
["FG-LELI-3M-OAC-04","Analizar argumentaciones presentes en distintos ámbitos, evaluando tesis, evidencias, razonamientos y recursos discursivos."],
["FG-LELI-3M-OAC-05","Evaluar recursos lingüísticos y no lingüísticos y su incidencia en el posicionamiento, los roles ante la audiencia y la construcción del sentido."],
["FG-LELI-3M-OAC-06","Producir textos orales, escritos o audiovisuales coherentes y cohesionados para comunicar análisis, interpretaciones y posturas con propósitos definidos."],
["FG-LELI-3M-OAC-07","Usar procesos de investigación para explorar temas, seleccionar y evaluar fuentes, organizar información y comunicar hallazgos responsablemente."],
["FG-LELI-3M-OAC-08","Dialogar argumentativamente para construir y ampliar ideas, fundamentando posturas, evaluando razonamientos e integrando perspectivas de otros."],
["FG-LELI-3M-OAC-09","Investigar y comunicar temas de interés aplicando criterios éticos, rigurosos y responsables en el uso de información y fuentes."]
]),
block("4° Medio","Lengua y Literatura","lengua-literatura/4-medio-fg",[
["FG-LELI-4M-OAC-01","Formular interpretaciones de obras literarias considerando perspectivas, recursos, contexto y relaciones con otros textos y manifestaciones culturales."],
["FG-LELI-4M-OAC-02","Proponer distintas interpretaciones de una obra literaria fundamentándolas con evidencia textual y marcos de análisis pertinentes."],
["FG-LELI-4M-OAC-03","Evaluar críticamente textos no literarios orales, escritos y audiovisuales considerando intenciones, veracidad, ideologías, puntos de vista y posicionamiento del enunciador."],
["FG-LELI-4M-OAC-04","Evaluar críticamente argumentaciones de diversos ámbitos atendiendo a la calidad de evidencias, razonamientos, supuestos y recursos persuasivos."],
["FG-LELI-4M-OAC-05","Producir textos orales, escritos o audiovisuales coherentes y cohesionados, aplicando procesos de escritura y adecuándose al género y la audiencia."],
["FG-LELI-4M-OAC-06","Usar creativamente el lenguaje para comunicar reflexiones e interpretaciones surgidas de lecturas y experiencias personales."],
["FG-LELI-4M-OAC-07","Dialogar argumentativamente para construir conocimiento, fundamentando posiciones, evaluando argumentos y considerando perspectivas diversas."],
["FG-LELI-4M-OAC-08","Investigar temas de interés evaluando rigurosamente fuentes impresas y digitales y comunicando resultados de manera ética y pertinente."]
]),
block("3° Medio","Educación Ciudadana","educacion-ciudadana/3-medio-fg",[
["FG-ECIU-3M-OAC-01","Identificar fundamentos, atributos y dimensiones de democracia y ciudadanía, relacionándolos con libertades, deberes del Estado y responsabilidades ciudadanas."],
["FG-ECIU-3M-OAC-02","Investigar mecanismos de acceso a la justicia y garantías de derechos en un Estado democrático."],
["FG-ECIU-3M-OAC-03","Reflexionar sobre riesgos para la democracia y formas de fortalecer la convivencia, participación y respeto de los derechos humanos."],
["FG-ECIU-3M-OAC-04","Evaluar relaciones entre Estado, mercado y sociedad y sus efectos en el bienestar, la desigualdad y las oportunidades."],
["FG-ECIU-3M-OAC-05","Promover el reconocimiento y defensa de derechos humanos mediante análisis de situaciones contemporáneas y acciones ciudadanas."],
["FG-ECIU-3M-OAC-06","Reflexionar sobre principios y desafíos de una sociedad democrática, pluralista e inclusiva."],
["FG-ECIU-3M-OAC-07","Distinguir relaciones políticas, económicas y socioculturales que configuran el territorio y la vida de las comunidades."],
["FG-ECIU-3M-OAC-08","Participar en proyectos y acciones ciudadanas orientadas al bien común mediante deliberación, colaboración y uso responsable de información."]
]),
block("4° Medio","Educación Ciudadana","educacion-ciudadana/4-medio-fg",[
["FG-ECIU-4M-OAC-01","Evaluar características y funcionamiento de la institucionalidad democrática y su relación con ciudadanía, derechos y responsabilidades."],
["FG-ECIU-4M-OAC-02","Participar fundadamente en debates sobre justicia, democracia y derechos humanos considerando distintas perspectivas."],
["FG-ECIU-4M-OAC-03","Analizar problemas y desafíos de la democracia contemporánea, incluyendo participación, representación y convivencia social."],
["FG-ECIU-4M-OAC-04","Comprender relaciones entre desarrollo, economía, sustentabilidad y bienestar para evaluar decisiones públicas y privadas."],
["FG-ECIU-4M-OAC-05","Relacionar derechos laborales, económicos y sociales con instituciones, políticas y mecanismos de protección."],
["FG-ECIU-4M-OAC-06","Evaluar oportunidades y riesgos de medios digitales, información y tecnologías para la participación y convivencia democrática."],
["FG-ECIU-4M-OAC-07","Analizar relaciones territoriales y ambientales desde perspectivas de justicia, sustentabilidad y responsabilidad ciudadana."],
["FG-ECIU-4M-OAC-08","Diseñar y participar en iniciativas ciudadanas orientadas a resolver problemas de interés público mediante colaboración y deliberación informada."]
]),
block("3° Medio","Filosofía","filosofia/3-medio-fg",[
["FG-FILO-3M-OAC-01","Describir características del quehacer filosófico y formular preguntas filosóficas vinculadas con la experiencia y problemas humanos."],
["FG-FILO-3M-OAC-02","Analizar y fundamentar problemas filosóficos mediante conceptos, argumentos y perspectivas de distintos autores."],
["FG-FILO-3M-OAC-03","Formular preguntas y tesis filosóficas, desarrollando argumentos y evaluando razones y objeciones."],
["FG-FILO-3M-OAC-04","Dialogar filosóficamente confrontando perspectivas de manera argumentada, respetuosa y abierta a la revisión de ideas."],
["FG-FILO-3M-OAC-05","Analizar problemas de conocimiento, realidad, verdad y experiencia mediante perspectivas filosóficas diversas."],
["FG-FILO-3M-OAC-06","Aplicar herramientas de argumentación filosófica para examinar críticamente problemas personales, sociales y culturales."]
]),
block("4° Medio","Filosofía","filosofia/4-medio-fg",[
["FG-FILO-4M-OAC-01","Analizar problemas éticos y políticos contemporáneos mediante conceptos y perspectivas filosóficas diversas."],
["FG-FILO-4M-OAC-02","Evaluar fundamentos y consecuencias de distintas concepciones sobre justicia, libertad, responsabilidad y vida en común."],
["FG-FILO-4M-OAC-03","Dialogar y argumentar sobre problemas filosóficos, evaluando supuestos, razones, objeciones y consecuencias."],
["FG-FILO-4M-OAC-04","Formular posiciones filosóficas propias fundamentadas mediante análisis de textos, conceptos y problemas relevantes."],
["FG-FILO-4M-OAC-05","Aplicar herramientas filosóficas para examinar críticamente dilemas y controversias de la sociedad contemporánea."]
]),
block("3° Medio","Ciencias para la Ciudadanía","ciencias-ciudadania/3-medio-fg",[
["FG-CICI-3y4-OAC-01","Analizar, a partir de evidencias, situaciones de transmisión de agentes infecciosos a nivel nacional y mundial y evaluar críticamente posibles medidas de prevención."],
["FG-CICI-3y4-OAC-02","Investigar y comparar diversas medicinas considerando su origen, conocimientos y prácticas para comprender su contribución a la salud."],
["FG-CICI-3y4-OAC-03","Analizar, a partir de modelos, riesgos de origen natural o provocados por la acción humana en el contexto local y evaluar capacidades de prevención, mitigación y adaptación."],
["FG-CICI-3y4-OAC-04","Investigar amenazas naturales y antrópicas, evaluando sus riesgos para la sociedad y el ambiente mediante evidencia científica y tecnológica."],
["FG-CICI-3y4-OAC-05","Analizar cómo el desarrollo científico y tecnológico influye en la calidad de vida, la sociedad y el ambiente, considerando beneficios, riesgos e implicancias."],
["FG-CICI-3y4-OAC-06","Evaluar críticamente información científica y tecnológica de diversas fuentes, distinguiendo evidencia, interpretación, alcances y limitaciones."],
["FG-CICI-3y4-OAC-07","Diseñar proyectos para encontrar soluciones a problemas de interés científico y ciudadano, integrando creatividad, evidencia y herramientas tecnológicas."],
["FG-CICI-3y4-OAC-08","Analizar críticamente implicancias sociales, económicas, éticas y ambientales de controversias públicas que involucran ciencia y tecnología."]
]),
block("4° Medio","Ciencias para la Ciudadanía","ciencias-ciudadania/4-medio-fg",[
["FG-CICI-3y4-OAC-01","Analizar, a partir de evidencias, situaciones de transmisión de agentes infecciosos a nivel nacional y mundial y evaluar críticamente posibles medidas de prevención."],
["FG-CICI-3y4-OAC-02","Investigar y comparar diversas medicinas considerando su origen, conocimientos y prácticas para comprender su contribución a la salud."],
["FG-CICI-3y4-OAC-03","Analizar, a partir de modelos, riesgos de origen natural o provocados por la acción humana en el contexto local y evaluar capacidades de prevención, mitigación y adaptación."],
["FG-CICI-3y4-OAC-04","Investigar amenazas naturales y antrópicas, evaluando sus riesgos para la sociedad y el ambiente mediante evidencia científica y tecnológica."],
["FG-CICI-3y4-OAC-05","Analizar cómo el desarrollo científico y tecnológico influye en la calidad de vida, la sociedad y el ambiente, considerando beneficios, riesgos e implicancias."],
["FG-CICI-3y4-OAC-06","Evaluar críticamente información científica y tecnológica de diversas fuentes, distinguiendo evidencia, interpretación, alcances y limitaciones."],
["FG-CICI-3y4-OAC-07","Diseñar proyectos para encontrar soluciones a problemas de interés científico y ciudadano, integrando creatividad, evidencia y herramientas tecnológicas."],
["FG-CICI-3y4-OAC-08","Analizar críticamente implicancias sociales, económicas, éticas y ambientales de controversias públicas que involucran ciencia y tecnología."]
]),
block("3° Medio","Idioma Extranjero: Inglés","ingles/3-medio-fg",[
["FG-INGL-3M-OAC-01","Comprender textos orales y audiovisuales en inglés sobre temas actuales, identificando ideas, detalles, relaciones y puntos de vista."],
["FG-INGL-3M-OAC-02","Comprender textos escritos y multimodales en inglés, evaluando propósito, información relevante y perspectivas."],
["FG-INGL-3M-OAC-03","Comunicar oralmente ideas, experiencias y opiniones en inglés mediante interacciones y presentaciones adecuadas al propósito y audiencia."],
["FG-INGL-3M-OAC-04","Producir textos escritos y multimodales en inglés, organizando ideas y utilizando recursos lingüísticos apropiados."]
]),
block("4° Medio","Idioma Extranjero: Inglés","ingles/4-medio-fg",[
["FG-INGL-4M-OAC-01","Comprender críticamente textos orales y audiovisuales en inglés sobre temas académicos, culturales y globales."],
["FG-INGL-4M-OAC-02","Comprender y evaluar textos escritos y multimodales en inglés, integrando información, propósito, evidencia y perspectivas."],
["FG-INGL-4M-OAC-03","Interactuar y presentar oralmente en inglés con creciente autonomía, adecuando recursos lingüísticos al contexto, propósito y audiencia."],
["FG-INGL-4M-OAC-04","Producir textos escritos y multimodales en inglés para informar, argumentar y comunicar ideas con coherencia y adecuación."]
])
];