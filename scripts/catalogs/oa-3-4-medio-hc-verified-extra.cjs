// Formación Diferenciada HC 3° y 4° Medio · bloques verificados en Currículum Nacional MINEDUC.
const root="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
const block=(level,subject,slug,rows)=>({level,subject,expected:rows.length,sourceUrl:root+"/"+slug+"/"+(level.startsWith("3")?"3-medio-hc":"4-medio-hc"),objectives:rows});
const shared=(subject,slug,rows)=>[block("3° Medio HC",subject,slug,rows),block("4° Medio HC",subject,slug,rows)];
module.exports=[
...shared("Biología de los Ecosistemas","biologia-ecosistemas",[
["CN-BECO-3y4-OAC-01","Explicar el estado de la biodiversidad actual a partir de teorías y evidencias científicas sobre el origen de la vida, la evolución y la intervención humana."],
["CN-BECO-3y4-OAC-02","Comprender la relación entre biodiversidad, funcionamiento de los sistemas naturales y servicios ecosistémicos, considerando bioenergética, dinámica de poblaciones y flujos de materia y energía."],
["CN-BECO-3y4-OAC-03","Explicar efectos del cambio climático sobre biodiversidad, productividad biológica y resiliencia de los ecosistemas, y sus consecuencias para recursos naturales, personas y desarrollo sostenible."],
["CN-BECO-3y4-OAC-04","Investigar y comunicar cómo la ciencia y la tecnología pueden prevenir, mitigar o reparar efectos del cambio climático sobre componentes y procesos biológicos de sistemas naturales."],
["CN-BECO-3y4-OAC-05","Valorar la integración de la biología con otras ciencias para analizar y proponer soluciones a problemas actuales de sistemas naturales, considerando implicancias éticas, sociales y ambientales."]
]),
...shared("Química","quimica",[
["CN-QUIM-3y4-OAC-01","Evaluar el desarrollo científico y tecnológico en nanoquímica y química de polímeros, considerando aplicaciones y consecuencias ambientales, médicas, agrícolas e industriales."],
["CN-QUIM-3y4-OAC-02","Explicar mediante investigaciones fenómenos ácido-base, de óxido-reducción y de polimerización-despolimerización presentes en sistemas naturales y aplicaciones tecnológicas."],
["CN-QUIM-3y4-OAC-03","Argumentar con evidencia cómo la termodinámica y la cinética de reacciones químicas contribuyen a comprender sistemas naturales y sus respuestas a cambios."],
["CN-QUIM-3y4-OAC-04","Explicar efectos del cambio climático sobre ciclos biogeoquímicos y equilibrios químicos en océanos, atmósfera, aguas dulces y suelos, y sus consecuencias."],
["CN-QUIM-3y4-OAC-05","Analizar origen, vías de exposición, efectos y propiedades de contaminantes químicos domésticos e industriales sobre sistemas naturales y servicios ecosistémicos."],
["CN-QUIM-3y4-OAC-06","Evaluar la contribución de la química y sus aplicaciones tecnológicas en la comprensión, prevención y mitigación del cambio climático y restauración de sistemas naturales."],
["CN-QUIM-3y4-OAC-07","Valorar la integración de la química con otras ciencias para analizar y proponer soluciones a problemas actuales considerando implicancias éticas, sociales y ambientales."]
]),
...shared("Pensamiento Computacional y Programación","pensamiento-computacional-programacion",[
["MA-PCPR-3y4-OAC-01","Aplicar conceptos de Ciencias de la Computación —abstracción, organización lógica de datos, análisis de soluciones alternativas y generalización— al crear código para una solución computacional."],
["MA-PCPR-3y4-OAC-02","Representar diferentes tipos de datos en diversas formas, incluyendo textos, sonidos, imágenes y números."],
["MA-PCPR-3y4-OAC-03","Desarrollar y programar algoritmos para ejecutar procedimientos matemáticos, realizar cálculos y obtener términos definidos por una regla o patrón."],
["MA-PCPR-3y4-OAC-04","Crear aplicaciones y realizar análisis mediante procesadores simbólicos, geometría dinámica y análisis estadístico."],
["MA-PCPR-3y4-OAC-05","Desarrollar aplicaciones para dispositivos móviles y para dispositivos provistos de sensores y mecanismos de control."]
])
];