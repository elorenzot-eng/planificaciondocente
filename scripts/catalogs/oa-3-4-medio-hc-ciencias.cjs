// Formación Diferenciada Humanístico-Científica 3° y 4° Medio · Ciencias.
// Códigos y alcance contrastados con Currículum Nacional · MINEDUC. Descripciones concisas para selector pedagógico.
const root="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
const block=(level,subject,slug,rows)=>({level,subject,expected:rows.length,sourceUrl:root+"/"+slug,objectives:rows});
const shared=(subject,slug,rows)=>[
 block("3° Medio HC",subject,slug+"/3-medio-hc",rows),
 block("4° Medio HC",subject,slug+"/4-medio-hc",rows)
];
module.exports=[
...shared("Biología Celular y Molecular","biologia-celular-molecular",[
["CN-BCMO-3y4-OAC-01","Investigar el desarrollo histórico del conocimiento en biología celular y molecular y su relación con disciplinas como química, física y matemática."],
["CN-BCMO-3y4-OAC-02","Explicar la estructura y organización celular a partir de biomoléculas, membranas y organelos, relacionándolas con metabolismo, motilidad, comunicación, reproducción y continuidad de la vida."],
["CN-BCMO-3y4-OAC-03","Analizar críticamente el dogma central de la biología molecular y el flujo de información genética desde ADN a ARN y proteínas."],
["CN-BCMO-3y4-OAC-04","Describir mecanismos de regulación génica y relacionarlos con diferenciación, proliferación celular, ambiente, envejecimiento y enfermedades como el cáncer."],
["CN-BCMO-3y4-OAC-05","Explicar relaciones entre estructura y función de proteínas en actividad enzimática, transporte de iones, motilidad celular y contracción muscular."],
["CN-BCMO-3y4-OAC-06","Analizar el desarrollo de la biología celular y molecular en Chile y el mundo y su relación con ciencia, tecnología y sociedad."],
["CN-BCMO-3y4-OAC-07","Analizar aplicaciones biotecnológicas y evaluar sus implicancias éticas, sociales y legales."]
]),
...shared("Ciencias de la Salud","ciencias-salud",[
["CN-CSAL-3y4-OAC-01","Analizar sistémicamente problemas complejos de salud pública a escala local y global, como infecciones, consumo de drogas, ITS, desequilibrios alimentarios y enfermedades laborales."],
["CN-CSAL-3y4-OAC-02","Explicar cómo la interacción entre genoma y ambiente influye en patologías y condiciones de la salud humana."],
["CN-CSAL-3y4-OAC-03","Analizar relaciones causales entre estilos de vida y salud integral mediante sus efectos sobre metabolismo, energética celular, fisiología y conducta."],
["CN-CSAL-3y4-OAC-04","Investigar y comunicar relaciones entre calidad del aire, aguas y suelos, salud humana y mecanismos biológicos involucrados."],
["CN-CSAL-3y4-OAC-05","Evaluar cómo innovaciones científicas y tecnológicas en biotecnología, nanomedicina, medicina nuclear, imagenología y farmacología influyen en la calidad de vida."]
]),
...shared("Física","fisica",[
["CN-FISI-3y4-OAC-01","Analizar, usando datos científicos actuales e históricos, el cambio climático global, sus patrones, causas probables, efectos y posibles consecuencias."],
["CN-FISI-3y4-OAC-02","Comprender, mediante estudio historiográfico, explicaciones científicas sobre el origen y la evolución del universo."],
["CN-FISI-3y4-OAC-03","Analizar el movimiento de cuerpos bajo la acción de una fuerza central en situaciones cotidianas y fenómenos naturales mediante modelos de mecánica clásica."],
["CN-FISI-3y4-OAC-04","Evaluar la contribución de la física moderna, incluyendo relatividad y mecánica cuántica, al conocimiento de la realidad y sus impactos sociales y tecnológicos."],
["CN-FISI-3y4-OAC-05","Investigar y aplicar conocimientos de mecánica de fluidos, electromagnetismo y termodinámica para comprender procesos de sistemas naturales."],
["CN-FISI-3y4-OAC-06","Valorar la integración de la física con otras ciencias para analizar y proponer soluciones a problemas actuales considerando implicancias éticas, sociales y ambientales."]
])
];