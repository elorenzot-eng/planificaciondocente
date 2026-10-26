# Carga masiva de estudiantes institucionales

## Plantilla descargable
Formato XLSX. Hoja "Estudiantes", fila 1 con encabezados exactos:
Nombres | Apellido paterno | Apellido materno | RUT | Curso

## Flujo
1. SUPERADMIN habilita licencia y define matrícula autorizada.
2. DIRECTOR o SOSTENEDOR autorizado descarga plantilla vacía desde su establecimiento.
3. Completa una fila por estudiante y carga archivo XLSX.
4. Servidor valida las cinco columnas, filas no vacías, curso perteneciente al colegio, RUT chileno válido (módulo 11) y duplicados dentro del archivo y del establecimiento.
5. Mostrar vista previa de filas válidas y errores con número de fila. No importar parcialmente sin confirmación explícita.
6. Verificar que el total de estudiantes activos no supere studentCount contratado; importación y cupos en transacción.
7. Guardar identificador interno opaco para revisión IA; no usar RUT en tablas de consumo.
8. Permitir corregir, trasladar de curso y desactivar estudiantes sin perder historial de revisiones.

## Privacidad y seguridad
- RUT y nombres son datos personales; proteger con autenticación y permisos por colegio.
- Limitar tamaño y cantidad de filas; no registrar el contenido del XLSX en logs.
- Evitar exposición de RUT en URLs, registros de consumo y exportaciones innecesarias.
- Eliminar archivos temporales después de procesarlos.
- No permitir acceso entre establecimientos de un mismo sostenedor sin autorización.
- Definir retención y eliminación de datos conforme a las obligaciones aplicables.

## Estado
Plantilla XLSX creada como artefacto de trabajo; su botón de descarga y el importador aún deben integrarse en la aplicación. No publicar hasta pruebas de autorización, validación RUT y límites de matrícula.
