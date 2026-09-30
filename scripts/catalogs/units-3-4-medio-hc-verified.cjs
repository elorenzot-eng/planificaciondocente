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
])
];