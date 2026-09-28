// Formación General 3° y 4° Medio (aplicable a trayectoria HC).
// Descripciones concisas basadas en Bases Curriculares vigentes MINEDUC; se conserva código oficial y referencia.
const root="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
const block=(level,subject,slug,rows)=>({level,subject,expected:rows.length,objectives:rows,sourceUrl:root+"/"+slug});
const science=[
["FG-CIBS-3y4-OAC-01","Analizar problemas de salud pública y bienestar considerando evidencia científica, factores biológicos, ambientales y sociales."],
["FG-CIBS-3y4-OAC-02","Investigar y comparar enfoques de medicina convencional, tradicional de pueblos originarios y complementaria para problemas cotidianos de salud."],
["FG-CIBS-3y4-OAC-03","Analizar relaciones entre estilos de vida, ambiente, funcionamiento del organismo y prevención de enfermedades para fundamentar decisiones de autocuidado."],
["FG-CISA-3y4-OAC-01","Investigar sustancias químicas de uso cotidiano, considerando composición, reactividad, riesgos y medidas seguras de manipulación, almacenamiento y eliminación."],
["FG-CISA-3y4-OAC-02","Diseñar y evaluar soluciones para disminuir amenazas del hogar y del trabajo asociadas a sistemas eléctricos, calefacción, radiaciones u otros riesgos."],
["FG-CISA-3y4-OAC-03","Analizar riesgos naturales o antrópicos del contexto local y evaluar capacidades de prevención, mitigación y adaptación de la escuela y comunidad."],
["FG-CIAS-3y4-OAC-01","Investigar el ciclo de vida de productos cotidianos y proponer estrategias de consumo sostenible que prevengan o mitiguen impactos ambientales."],
["FG-CIAS-3y4-OAC-02","Diseñar proyectos locales de protección y uso sostenible de recursos naturales considerando evidencia científica y dimensiones ambientales, sociales y económicas."],
["FG-CIAS-3y4-OAC-03","Modelar efectos del cambio climático y evaluar medidas de mitigación y adaptación para ecosistemas, comunidades y actividades humanas."],
["FG-CITS-3y4-OAC-01","Diseñar proyectos tecnológicos orientados a resolver problemas personales o locales en ámbitos como vivienda, transporte u otros."],
["FG-CITS-3y4-OAC-02","Explicar, con evidencia, cómo avances científicos y tecnológicos modifican la sociedad, el ambiente y la vida cotidiana, evaluando beneficios y riesgos."],
["FG-CITS-3y4-OAC-03","Evaluar alcances y controversias de aplicaciones científico-tecnológicas considerando dimensiones éticas, sociales, ambientales y económicas."]
];
const rows=[
block("3° Medio","Matemática","matematica-3o-medio/3-medio-fg",[
["FG-MATE-3M-OAC-01","Resolver problemas con números complejos mediante representaciones pictóricas, simbólicas y herramientas tecnológicas."],
["FG-MATE-3M-OAC-02","Tomar decisiones bajo incertidumbre mediante análisis estadístico, medidas de dispersión y probabilidades condicionales."],
["FG-MATE-3M-OAC-03","Modelar crecimiento y decrecimiento mediante funciones exponenciales y logarítmicas, apoyándose en herramientas tecnológicas y evaluación de información."],
["FG-MATE-3M-OAC-04","Resolver problemas de geometría euclidiana sobre relaciones métricas entre ángulos, arcos, cuerdas y secantes de una circunferencia."]
]),
block("4° Medio","Matemática","matematica-4o-medio/4-medio-fg",[
["FG-MATE-4M-OAC-01","Fundamentar decisiones financieras y económicas personales o comunitarias mediante porcentajes, tasas de interés e índices económicos."],
["FG-MATE-4M-OAC-02","Fundamentar decisiones en situaciones de incertidumbre mediante análisis crítico de datos y modelos binomial y normal."],
["FG-MATE-4M-OAC-03","Construir modelos de crecimiento, decrecimiento y fenómenos periódicos usando funciones potencia y trigonométricas, con apoyo tecnológico."],
["FG-MATE-4M-OAC-04","Resolver problemas de rectas y circunferencias en el plano mediante representación analítica, de forma manuscrita y tecnológica."]
]),
block("3° Medio","Idioma Extranjero: Inglés","ingles-3o-medio/3-medio-fg",[
["FG-INGL-3M-OAC-01","Comprender información central de textos orales y escritos vinculados con intereses e inquietudes, reconociendo perspectivas de otras culturas."],
["FG-INGL-3M-OAC-02","Producir textos orales y escritos breves y claros para expresar una postura crítica personal respetando perspectivas diferentes."],
["FG-INGL-3M-OAC-03","Utilizar el inglés al comprender y producir textos breves y claros para construir posturas críticas sobre temas de interés."],
["FG-INGL-3M-OAC-04","Comprender y producir con fluidez textos breves en situaciones que integran visiones de mundo diversas y favorecen conciencia de la propia identidad."]
]),
block("4° Medio","Idioma Extranjero: Inglés","ingles-4o-medio/4-medio-fg",[
["FG-INGL-4M-OAC-01","Comprender información relevante de textos orales y escritos vinculados con intereses, inquietudes y contextos interculturales."],
["FG-INGL-4M-OAC-02","Producir textos orales y escritos claros para expresar una postura crítica personal respetando otras posturas."],
["FG-INGL-4M-OAC-03","Aplicar conocimientos del inglés en comprensión y producción de textos para argumentar y comunicar perspectivas críticas."],
["FG-INGL-4M-OAC-04","Interactuar con fluidez mediante textos orales y escritos claros que integren diversas visiones de mundo y fortalezcan la identidad personal."]
]),
block("3° Medio","Lengua y Literatura","lengua-literatura-3o-medio/3-medio-fg",[
["FG-LELI-3M-OAC-01","Formular interpretaciones de obras literarias considerando recursos de construcción de sentido y relaciones intertextuales con otras obras y referentes culturales."],
["FG-LELI-3M-OAC-02","Reflexionar sobre el efecto estético de obras literarias considerando recursos, experiencia personal y contexto de producción y recepción."],
["FG-LELI-3M-OAC-03","Analizar críticamente textos no literarios orales, escritos y audiovisuales considerando propósitos, argumentos, evidencia, ideologías y recursos discursivos."],
["FG-LELI-3M-OAC-04","Analizar críticamente géneros discursivos de comunidades digitales, considerando identidad, participación, razonamientos y problemas éticos."],
["FG-LELI-3M-OAC-05","Evaluar textos argumentativos considerando tesis, argumentos, evidencias, relaciones lógicas y calidad del razonamiento."],
["FG-LELI-3M-OAC-06","Producir textos de diversos géneros para comunicar análisis e interpretaciones, adecuando estructura, propósito, audiencia y convenciones."],
["FG-LELI-3M-OAC-07","Usar recursos lingüísticos y no lingüísticos al producir textos, considerando su efecto en el posicionamiento, la audiencia y la construcción de sentido."],
["FG-LELI-3M-OAC-08","Dialogar argumentativamente, construyendo ideas con otros, evaluando razonamientos e incorporando o refutando posiciones de manera fundamentada."],
["FG-LELI-3M-OAC-09","Investigar temas para enriquecer lecturas y análisis, seleccionando fuentes confiables, procesando información, comunicando hallazgos y citando éticamente."]
]),
block("4° Medio","Lengua y Literatura","lengua-literatura-4o-medio/4-medio-fg",[
["FG-LELI-4M-OAC-01","Formular interpretaciones comparadas de obras literarias considerando criterios de análisis, recursos, contextos y evidencia textual."],
["FG-LELI-4M-OAC-02","Proponer distintas interpretaciones de una obra literaria a partir de criterios de análisis y fundamentarlas con evidencia pertinente del texto."],
["FG-LELI-4M-OAC-03","Evaluar críticamente textos no literarios orales, escritos y audiovisuales considerando intenciones, veracidad, ideologías, perspectivas y posicionamiento del enunciador."],
["FG-LELI-4M-OAC-04","Evaluar géneros discursivos de comunidades especializadas atendiendo a convenciones, razonamientos, calidad de evidencia y relaciones entre participantes."],
["FG-LELI-4M-OAC-05","Producir textos escritos, orales y audiovisuales de diversos géneros para comunicar análisis e interpretaciones con propósito y audiencia definidos."],
["FG-LELI-4M-OAC-06","Usar estratégicamente recursos lingüísticos y no lingüísticos para construir sentido, posicionamiento y relación con la audiencia."],
["FG-LELI-4M-OAC-07","Dialogar argumentativamente evaluando razonamientos, construyendo acuerdos y ampliando o refutando posiciones con fundamentos."],
["FG-LELI-4M-OAC-08","Investigar diversos temas seleccionando fuentes válidas y confiables, procesando información, comunicando hallazgos y utilizando citación ética."]
]),
block("3° Medio","Educación Ciudadana","educacion-ciudadana-3-medio/3-medio-fg",[
["FG-ECIU-3M-OAC-01","Identificar fundamentos, atributos y dimensiones de democracia y ciudadanía, relacionando libertades fundamentales con deberes del Estado y responsabilidades ciudadanas."],
["FG-ECIU-3M-OAC-02","Investigar mecanismos de acceso a la justicia y características del sistema judicial a partir de casos de interés público."],
["FG-ECIU-3M-OAC-03","Reflexionar sobre riesgos para la democracia en Chile y el mundo, como desafección política, desigualdad, corrupción, narcotráfico y violencia."],
["FG-ECIU-3M-OAC-04","Evaluar relaciones entre Estado y mercado considerando productividad, tributación, comercio justo, probidad, sustentabilidad, riqueza y pobreza."],
["FG-ECIU-3M-OAC-05","Promover reconocimiento, defensa y exigibilidad de los derechos humanos considerando sus principios fundamentales."],
["FG-ECIU-3M-OAC-06","Reflexionar sobre formas de participación y su aporte al bien común desde experiencias y distintas tradiciones políticas."],
["FG-ECIU-3M-OAC-07","Distinguir relaciones políticas, económicas y socioculturales que configuran el territorio y proponer alternativas de justicia social y ambiental."],
["FG-ECIU-3M-OAC-08","Participar en instancias escolares de ejercicio democrático para fortalecer convivencia, libertades fundamentales y bien común."]
]),
block("4° Medio","Educación Ciudadana","educacion-ciudadana-4m/4-medio-fg",[
["FG-ECIU-4M-OAC-01","Evaluar institucionalidad democrática, formas de representación y distribución del poder a la luz del bien común, cohesión y justicia social."],
["FG-ECIU-4M-OAC-02","Participar ética y corresponsablemente en soluciones a desafíos y conflictos que articulen desarrollo, democracia, equidad y sustentabilidad."],
["FG-ECIU-4M-OAC-03","Analizar impactos de modelos de desarrollo y políticas económicas en vida cotidiana y cambio climático desde criterios de sustentabilidad y justicia."],
["FG-ECIU-4M-OAC-04","Comprender la importancia de los derechos laborales en Chile, su evolución institucional y el aporte de movimientos y organizaciones sociales."],
["FG-ECIU-4M-OAC-05","Relacionar libertad, igualdad y solidaridad con desafíos democráticos como pobreza, género, inclusión y diversidad."],
["FG-ECIU-4M-OAC-06","Evaluar oportunidades y riesgos de medios masivos y tecnologías de información para democracia, participación ciudadana y vida privada."],
["FG-ECIU-4M-OAC-07","Proponer formas de organización territorial y del espacio público que favorezcan acción colectiva, interculturalidad, inclusión y vida comunitaria."],
["FG-ECIU-4M-OAC-08","Tomar decisiones ciudadanas fundadas en principios éticos, valores y virtudes públicas, resguardando dignidad y democracia."]
]),
block("3° Medio","Filosofía","filosofia-3m/3-medio-fg",[
["FG-FILO-3M-OAC-01","Describir características del quehacer filosófico, su origen y sentido, identificando grandes preguntas y temas."],
["FG-FILO-3M-OAC-02","Analizar y fundamentar perspectivas filosóficas relacionándolas con vida cotidiana, normas, valores, creencias y visiones de mundo."],
["FG-FILO-3M-OAC-03","Formular preguntas filosóficas sobre el ser y la naturaleza de la realidad a partir de conceptos y teorías ontológicas."],
["FG-FILO-3M-OAC-04","Formular preguntas filosóficas sobre conocimiento, ciencia y verdad a partir de conceptos y teorías epistemológicas."],
["FG-FILO-3M-OAC-05","Dialogar sobre problemas de ontología y epistemología confrontando perspectivas y fundamentando visiones personales."],
["FG-FILO-3M-OAC-06","Aplicar herramientas de argumentación en diálogo y escritura, evaluando consistencia lógica, validez de razonamientos y métodos filosóficos."]
]),
block("4° Medio","Filosofía","filosofia-4o-medio/4-medio-fg",[
["FG-FILO-4M-OAC-01","Explicar alcances, límites y fines del quehacer filosófico y su relación con otras disciplinas y formas de saber."],
["FG-FILO-4M-OAC-02","Formular preguntas filosóficas sobre la praxis considerando teorías éticas y conceptos como justicia, libertad e igualdad."],
["FG-FILO-4M-OAC-03","Dialogar sobre problemas contemporáneos de ética y política confrontando perspectivas filosóficas y fundamentando visiones personales."],
["FG-FILO-4M-OAC-04","Evaluar argumentos de textos filosóficos y fundamentar su validez o carácter falaz mediante referentes teóricos, empíricos y de sentido común."],
["FG-FILO-4M-OAC-05","Evaluar el impacto de ideas ontológicas, epistemológicas y éticas en asuntos actuales de cultura, trabajo, tecnología, política y artes."]
]),
block("3° Medio","Ciencias para la Ciudadanía","ciencias-para-la-ciudadania/3-medio-fg",science),
block("4° Medio","Ciencias para la Ciudadanía","ciencias-para-la-ciudadania/4-medio-fg",science)
];
module.exports=rows;
