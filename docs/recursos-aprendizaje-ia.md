# Recursos de Aprendizaje IA — especificación inicial

Estado: propuesta técnica en rama de desarrollo; no desplegado.

## Módulos
1. Precursores de lectura, 2° básico: conciencia fonológica, correspondencia grafema-fonema, decodificación y vocabulario; actividades graduadas para rezago lector.
2. Cuadernillos de comprensión, 2° básico: textos originales literarios/no literarios, preguntas explícitas, inferenciales y reflexivas, solucionario y PDF.
3. Ensayos tipo SIMCE Lectura, 4° básico: diagnóstico, práctica y simulacro; preguntas originales con distractores plausibles y clave fundamentada.
4. Ensayos tipo SIMCE Matemática, 4° básico: números, patrones, geometría, medición y datos; resolución de problemas y explicaciones.
5. Fluidez lectora, 2° básico: registro docente de precisión, ritmo y evolución; análisis de audio solo con consentimiento y revisión humana.

## Flujo
Docente autenticado -> elegir módulo, OA, dificultad y extensión -> generación IA estructurada -> validación automática (estructura, clave única, coherencia) -> revisión/edición docente -> guardar borrador -> publicar/descargar PDF estudiante y PDF solucionario docente -> registrar resultados por habilidad.

## Datos sugeridos
Resource {id, ownerId, module, grade, subject, oaCodes, title, status, contentJson, answerKeyJson, createdAt, updatedAt}
ResourceVersion {id, resourceId, version, contentJson, createdAt}
Attempt {id, resourceId, studentId, answersJson, score, skillBreakdownJson, submittedAt}

## Criterios de aceptación
- Permisos por usuario/institución y protección de datos estudiantiles.
- No exponer claves ni solucionarios al estudiante antes de la entrega.
- Textos y preguntas originales; rotulación «ensayo tipo SIMCE, no oficial».
- Vista previa editable y guardado persistente en Mi Carpeta.
- Exportación separada estudiante/docente, sin alternativas duplicadas.
- Indicador de generación y errores recuperables.
- Instrumentación de costos y límites de generación.
- Pruebas de regresión en módulos existentes antes del despliegue.

## Fuentes curriculares
- https://www.curriculumnacional.cl/curriculum/1o-6o-basico/lenguaje-comunicacion/2-basico
- https://www.curriculumnacional.cl/curriculum/1o-6o-basico/lenguaje-comunicacion/4-basico

## Próximo paso
Inspeccionar rutas, autenticación, modelos Prisma, generador IA y Mi Carpeta antes de escribir código de producción. No modificar main ni desplegar sin pruebas.
