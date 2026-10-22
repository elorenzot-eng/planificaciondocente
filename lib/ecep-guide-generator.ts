/**
 * Guías de práctica para todos los temarios ECEP cargados.
 * El indicador es la fuente; los ejercicios son elaboración EducAntay.
 * No genera explicaciones disciplinares ni inventa indicadores ausentes.
 */
export type GuideExercise = {objective:string; activity:string; evidence:string; checklist:string[]};
export function exerciseForIndicator(indicator:string):GuideExercise {
 const v=indicator.trim().toLocaleLowerCase("es");
 if(/^(identificar|reconocer|distinguir|señalar|describir)/.test(v))return {
  objective:"Reconocimiento y precisión conceptual",
  activity:"Extrae del indicador los conceptos y categorías que debes reconocer. Define cada uno, aporta un ejemplo y un contraejemplo y explica la diferencia.",
  evidence:"Cuadro de conceptos, criterios de clasificación y ejemplos justificados.",
  checklist:["Definiciones precisas","Criterios explícitos","Ejemplo y contraejemplo pertinentes"]};
 if(/^(comparar|contrastar|relacionar|vincular)/.test(v))return {
  objective:"Comparación y establecimiento de relaciones",
  activity:"Identifica los elementos que el indicador pide relacionar. Construye una matriz con semejanzas, diferencias y la evidencia que sustenta cada relación.",
  evidence:"Matriz comparativa y conclusión argumentada.",
  checklist:["Criterios de comparación claros","Relaciones justificadas","Conclusión coherente con la evidencia"]};
 if(/^(analizar|interpretar|inferir|explicar|fundamentar|evaluar)/.test(v))return {
  objective:"Análisis y argumentación",
  activity:"Formula una pregunta a partir del indicador, identifica factores o causas relevantes, revisa una fuente disciplinar confiable y redacta una explicación sustentada.",
  evidence:"Respuesta argumentada que cite o describa evidencia verificable.",
  checklist:["Conceptos correctamente utilizados","Explicación lógica","Evidencia pertinente y límites reconocidos"]};
 if(/^(calcular|resolver|determinar|estimar|predecir)/.test(v))return {
  objective:"Resolución y aplicación",
  activity:"Construye o selecciona un caso del contenido indicado. Identifica datos, procedimiento, supuestos y criterios para verificar el resultado o la predicción.",
  evidence:"Solución paso a paso con comprobación y explicación.",
  checklist:["Procedimiento adecuado","Supuestos declarados","Resultado comprobado e interpretado"]};
 if(/^(seleccionar|proponer|diseñar|implementar|elaborar|organizar|planificar)/.test(v))return {
  objective:"Diseño y toma de decisiones",
  activity:"Define el propósito que establece el indicador. Propón dos alternativas de intervención o solución, compáralas con criterios explícitos y justifica una elección.",
  evidence:"Propuesta fundamentada, secuencia de acciones y criterios de evaluación.",
  checklist:["Propósito alineado al indicador","Alternativas pertinentes","Decisión fundamentada y evaluable"]};
 return {
  objective:"Comprensión y transferencia",
  activity:"Subraya el verbo y los conceptos del indicador. Explica su significado con apoyo de una fuente confiable, desarrolla un ejemplo contextualizado y comprueba tu interpretación.",
  evidence:"Síntesis conceptual y ejemplo justificado.",
  checklist:["Cobertura del indicador","Ejemplo pertinente","Justificación con evidencia"]};
}
