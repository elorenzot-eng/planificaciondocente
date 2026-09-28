// Formación Diferenciada HC 3° y 4° Medio · Filosofía (continuación verificada).
const root="https://www.curriculumnacional.cl/curriculum/3o-4o-medio";
const block=(level,subject,slug,rows)=>({level,subject,expected:rows.length,sourceUrl:root+"/"+slug+"/"+(level.startsWith("3")?"3-medio-hc":"4-medio-hc"),objectives:rows});
const shared=(subject,slug,rows)=>[block("3° Medio HC",subject,slug,rows),block("4° Medio HC",subject,slug,rows)];
module.exports=[
...shared("Estética","estetica",[
["FI-ESTE-3y4-OAC-01","Analizar textos filosóficos sobre conceptos y problemas estéticos fundamentales como belleza, demarcación del arte, experiencia estética, percepción sensible y propósitos de la creación artística."],
["FI-ESTE-3y4-OAC-02","Evaluar posiciones de filósofos y escuelas sobre cuestiones de estética, contrastando métodos de razonamiento e implicancias en la vida cotidiana."],
["FI-ESTE-3y4-OAC-03","Explicar fenómenos que han influido en la historia de la estética, como creencias religiosas, cambios tecnológicos y procesos históricos, evaluando su impacto."],
["FI-ESTE-3y4-OAC-04","Investigar relaciones entre arte, moral y política mediante análisis de textos filosóficos y obras artísticas."],
["FI-ESTE-3y4-OAC-05","Interpretar obras artísticas considerando conceptos filosóficos, corrientes de teoría del arte y temas de la sociedad actual."],
["FI-ESTE-3y4-OAC-06","Dialogar desde conceptos filosóficos sobre la función del arte y la experiencia estética en cultura y sociedad, desarrollando visiones personales y colectivas."],
["FI-ESTE-3y4-OAC-07","Elaborar una visión personal sobre la influencia de sociedad y cultura actual en la experiencia y sensibilidad humanas, considerando perspectivas filosóficas y diversas formas de expresión."]
]),
...shared("Seminario de Filosofía","seminario-filosofia",[
["FI-SEFI-3y4-OAC-01","Explicar textos filosóficos sobre problemas de la historia de la filosofía considerando antecedentes, planteamientos, supuestos y contexto sociocultural."],
["FI-SEFI-3y4-OAC-02","Evaluar y contrastar métodos de razonamiento para abordar un concepto o problema filosófico."],
["FI-SEFI-3y4-OAC-03","Analizar el devenir de un problema filosófico en la historia de la filosofía, considerando continuidades, cambios e impactos sociales y utilizando diversas formas de expresión."],
["FI-SEFI-3y4-OAC-04","Participar activamente en diálogos filosóficos sobre preguntas o conceptos y su relación con la vida y fenómenos sociales y culturales contemporáneos."],
["FI-SEFI-3y4-OAC-05","Formular una tesis filosófica sobre un problema relevante para el contexto a partir de una investigación de diversas perspectivas presentes en la historia de la filosofía."]
])
];