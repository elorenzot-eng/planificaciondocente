# Corrector SIMCE en papel — especificación v1

## Alcance
Integrar a `app/ensayos-simce` un corrector de hojas de respuestas impresas de ensayos creados en EducAntay, para 4°, 6°, 8° básico y 2° medio.

## Flujo
1. Ensayo guardado con ID inmutable, clave de respuestas, cantidad de preguntas y metadatos por eje/habilidad.
2. PDF de hoja de respuestas A-D con cuatro marcadores de esquina y código QR con ID de ensayo y versión de plantilla; NO incluir respuestas correctas en el QR.
3. Docente fotografía o carga imagen; backend rectifica perspectiva y lee burbujas con OMR determinístico.
4. Marcas ambiguas, en blanco o múltiples quedan como pendientes de revisión, sin adivinar.
5. Docente valida lectura antes de calificar y guardar resultados.
6. Resultados por alumno, pregunta, eje y habilidad; exportación PDF/Excel y guardado en Mi carpeta.

## Seguridad y privacidad
- Autenticación docente y autorización sobre ensayo, curso y resultados.
- No exponer pautas en hojas o QR.
- Validar tamaño/tipo de archivo, limitar tasa y evitar cargas peligrosas.
- Evitar almacenar fotografías innecesariamente; retención configurable.
- Identificador de estudiante mediante asignación docente o código opaco; no RUT en QR.
- Registrar cambios manuales y prevenir correcciones duplicadas.

## Criterios de aceptación
- Corrige una hoja nítida, inclinada y con iluminación desigual.
- Detecta y solicita revisión de dobles marcas y trazos tenues.
- No atribuye resultados a otro ensayo o estudiante.
- Reportes coherentes con tabla de especificaciones.
- Funciona desde celular y computador.
- Pruebas con hojas reales antes de publicar.

## Estado
Diseño funcional inicial. Aún no implementado ni desplegado.
