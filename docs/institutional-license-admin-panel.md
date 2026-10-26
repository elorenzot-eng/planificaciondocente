# Panel de licencias institucionales — especificación de integración

## Acceso
Solo SUPERADMIN puede crear, activar, suspender o renovar licencias. El backend debe verificar sesión y rol, no confiar en campos enviados por el navegador. DIRECTOR y SOSTENEDOR solo pueden consultar licencias de sus establecimientos autorizados.

## Alta y activación manual
Campos obligatorios: organizationId, schoolId, module (SIMCE/PAES), level, subject, studentCount (>0), startsAt, endsAt, estado. Verificar que School pertenece a Organization. La licencia se crea PENDING y SUPERADMIN la activa manualmente. No se conecta con Flow. Mantener historial y trazabilidad del administrador que realiza cada cambio.

## Panel
Tabla por establecimiento: módulo, nivel, asignatura, matrícula, fecha de inicio, vencimiento, estado, PDF usados/restantes, revisiones usadas por estudiante. Acciones administrativas: crear, activar, suspender, renovar. Mostrar avisos 30, 15 y 7 días antes del vencimiento.

## Controles obligatorios antes de habilitar producción
- Guardar los cambios de consumo dentro de una transacción de base de datos.
- Reservar cupos de forma atómica; prevenir solicitudes simultáneas que excedan los límites.
- requestKey idempotente para evitar doble consumo por reintentos.
- Una revisión requiere estudiante matriculado en el contrato y un identificador opaco estable.
- Aplicar comprobaciones en todas las rutas SIMCE/PAES, incluidos procesos de generación asincrónica y correctores.
- Los PDF históricos siguen disponibles después del vencimiento.
- No reutilizar estados de suscripciones individuales ni el sistema de pagos Flow.
- Ejecutar prisma validate, build y pruebas de autorización, concurrencia y caducidad en staging.

## Estado
El modelo Prisma y las funciones de reglas comerciales están en esta rama. Este documento no implica que exista un panel funcional o endpoints conectados. No fusionar antes de pruebas.
