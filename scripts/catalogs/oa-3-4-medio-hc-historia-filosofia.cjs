// Formación Diferenciada HC 3° y 4° Medio · Historia/Geografía y Filosofía.
// Códigos y alcance contrastados con Currículum Nacional · MINEDUC. Descripciones concisas para el selector pedagógico.
const root="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
const block=(level,subject,slug,rows)=>({level,subject,expected:rows.length,sourceUrl:root+"/"+slug+"/"+(level.startsWith("3")?"3-medio-hc":"4-medio-hc"),objectives:rows});
const shared=(subject,slug,rows)=>[block("3° Medio HC",subject,slug,rows),block("4° Medio HC",subject,slug,rows)];
module.exports=[
...shared("Comprensión Histórica del Presente","comprension-historica-presente",[
["HI-CHDP-3y4-OAC-01","Analizar perspectivas historiográficas sobre cambios recientes de la sociedad chilena y su impacto local, considerando democratización, derechos humanos, desigualdad e inclusión de nuevos grupos y movimientos sociales."],
["HI-CHDP-3y4-OAC-02","Analizar perspectivas historiográficas sobre procesos de la historia reciente, considerando la importancia social del conocimiento histórico y el protagonismo de individuos y grupos como sujetos históricos."],
["HI-CHDP-3y4-OAC-03","Elaborar preguntas y explicaciones históricas a partir de problemas del presente local y nacional, utilizando categorías y metodologías propias de la disciplina."],
["HI-CHDP-3y4-OAC-04","Proponer iniciativas para mejorar la sociedad, considerando antecedentes y fundamentos históricos en el marco de una sociedad democrática e inclusiva."],
["HI-CHDP-3y4-OAC-05","Participar en iniciativas de historia local, recogiendo relatos y fuentes de la comunidad para relevar espacios de memoria."]
]),
...shared("Economía y Sociedad","economia-sociedad",[
["HI-ECSO-3y4-OAC-01","Explicar la economía como ciencia social que estudia decisiones de personas, familias, sector privado y Estado frente a la escasez, considerando método, principios y análisis positivo y normativo."],
["HI-ECSO-3y4-OAC-02","Analizar críticamente cómo los economistas estudian decisiones de los agentes considerando incentivos, escasez, costos y beneficios marginales y sociales, y aportes de la economía del comportamiento."],
["HI-ECSO-3y4-OAC-03","Investigar la interacción entre consumidores y productores considerando oferta, demanda, elasticidad, inflación, fijación de precios y rol del Estado."],
["HI-ECSO-3y4-OAC-04","Investigar sistemas económicos de mercado, mixto y centralizado, sus fundamentos, formas de resolver el problema económico y relaciones entre agentes."],
["HI-ECSO-3y4-OAC-05","Analizar críticamente imperfecciones del mercado, su dimensión ética y el rol regulador del Estado."],
["HI-ECSO-3y4-OAC-06","Analizar el comercio internacional considerando ventajas comparativas, términos de intercambio, tratados, impactos locales y desafíos de inserción global."],
["HI-ECSO-3y4-OAC-07","Explicar políticas económicas relacionadas con crecimiento y desarrollo en Chile aplicando conceptos de macroeconomía y considerando las necesidades públicas a las que responden."],
["HI-ECSO-3y4-OAC-08","Investigar desafíos de economías desarrolladas y en desarrollo para alcanzar bienestar, considerando crecimiento, interdependencia, sustentabilidad y equidad."]
]),
...shared("Geografía, Territorio y Desafíos Socioambientales","geografia-territorio-desafios-socioambientales",[
["HI-GTYD-3y4-OAC-01","Explicar el espacio geográfico como construcción social producto de interacciones entre grupos humanos y medio, y su influencia en distintas dimensiones de la vida social."],
["HI-GTYD-3y4-OAC-02","Reconocer dinámicas físico-naturales que configuran el territorio nacional, considerando interdependencia y fragilidad de los ambientes y su importancia para la vida social."],
["HI-GTYD-3y4-OAC-03","Analizar decisiones políticas, económicas y sociales sobre espacios locales y nacionales, actores involucrados e impactos en el entorno natural."],
["HI-GTYD-3y4-OAC-04","Evaluar la organización territorial y ambiental y sus instrumentos de planificación según accesibilidad, conectividad, conservación, riesgos, sustentabilidad y justicia socioespacial."],
["HI-GTYD-3y4-OAC-05","Reconocer el carácter social del riesgo de desastres en Chile considerando usos del espacio y condiciones territoriales y ambientales."],
["HI-GTYD-3y4-OAC-06","Recoger, sistematizar y comunicar información sobre procesos espaciales mediante metodologías geográficas como cartografía, georreferenciación, estadísticas, trabajo de campo y mapeos participativos."]
]),
...shared("Filosofía Política","filosofia-politica",[
["FI-FIPO-3y4-OAC-01","Formular preguntas e hipótesis sobre problemas políticos a partir de textos filosóficos fundamentales, considerando perspectivas y métodos de la disciplina."],
["FI-FIPO-3y4-OAC-02","Evaluar críticamente, desde el bien común, relaciones de poder y su expresión en instituciones políticas y en la vida cotidiana."],
["FI-FIPO-3y4-OAC-03","Examinar críticamente perspectivas filosóficas sobre justicia, libertad, responsabilidad, igualdad y felicidad y su relación con visiones del ser humano, ética y política."],
["FI-FIPO-3y4-OAC-04","Participar en diálogos filosóficos sobre organización del poder, fundamentos y finalidades, considerando posiciones sobre Estado, actores sociales e instituciones."],
["FI-FIPO-3y4-OAC-05","Investigar problemas sociales y desigualdad de género desde perspectivas filosóficas, con rigor argumentativo, propuestas de mejora y diversas formas de expresión."],
["FI-FIPO-3y4-OAC-06","Distinguir argumentos válidos y falaces para comparar razonamientos sobre poder y política desde distintas corrientes filosóficas y fundamentar una posición consistente."]
])
];