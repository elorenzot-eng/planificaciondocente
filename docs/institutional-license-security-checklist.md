# Control transaccional de licencias institucionales SIMCE / PAES

## Bloqueadores antes de fusionar PR #134 y #135

1. **No eliminar el cobro sin reemplazo.** En `chargeCompletedPaes`, la rama institucional del PR #134 retorna después de marcar `aiChargedAt` y no incrementa un contador institucional. El comprobante de finalización y el consumo deben confirmarse en **la misma transacción**.
2. **Unificar modelo y estados.** PR #134 filtra `active: true` mientras PR #135 define `status: ACTIVE`. Alinear el esquema y las migraciones; no asumir que son equivalentes.
3. **Identidad y aislamiento.** Obtener organización y establecimiento desde sesión autenticada, nunca desde campos controlados por cliente. Verificar que el establecimiento pertenezca a la organización y que el rol pueda usar el módulo.
4. **Cupos por asignatura y nivel.** Una licencia anual por módulo, nivel y asignatura contratada. Hasta 10 ensayos PDF por asignatura; 10 revisiones por estudiante autorizado, con registro por estudiante y ensayo según reglas comerciales.
5. **Consumo atómico.** Usar una transacción PostgreSQL con incremento condicional `used < limit`, resultado comprobado, y registro único de idempotencia por operación. Si falla cualquier paso, revertir todos. Nunca incrementar por reintentos.
6. **Reserva y fallo.** Definir claramente si se reserva antes de llamar a OpenAI y cuándo se confirma o libera. Fallos de OpenAI/PDF no deben descontar un ensayo completado; reintentos y solicitudes paralelas no pueden superar el límite.
7. **Aplicación en servidor.** Proteger todos los endpoints de creación, generación, corrección, descarga y recuperación según permisos y pertenencia. La interfaz sola no es control de seguridad.
8. **Pruebas obligatorias.** Sin licencia; licencia pendiente/suspendida/vencida; usuario ajeno; límite 10/10; estudiante no contratado; concurrencia en último cupo; reintento con misma clave; fallo externo; reversión; renovación anual y año bisiesto; acceso legítimo de docente/sostenedor.

## Condición de integración
Mantener PR #134 y #135 sin fusionar hasta que se hayan armonizado las migraciones y se hayan ejecutado pruebas de integración sobre PostgreSQL, además de compilación y pruebas funcionales. La compilación o una prueba sintética no demuestra generación real con OpenAI ni validez de PDF.

## Bloqueo de endpoint de consumo directo (PR #135)

La ruta `POST /api/institutional/usage` de PR #135 recibe `kind`, `requestKey` y `studentId` desde el navegador y descuenta cupos sin comprobar un trabajo de generación o corrección completado. **No fusionar ni publicar esa ruta.** El descuento debe ser ejecutado exclusivamente por el manejador servidor que haya persistido el resultado final; `requestKey` debe derivarse de un ID de trabajo verificable, no de una afirmación del cliente. En el mismo proceso validar sesión, establecimiento, asignatura y licencia y usar `chargeInstitutionalExam`. Probar que POST manual no puede gastar cupos.

## Resultado de CI y publicación

El commit `d7eefffc420fb6e8d417fe0b6080260c3316766a` pasó los cinco workflows (build SEO, controles institucionales, migración Recursos IA, OMR SIMCE y Yanay comercial). **Estas comprobaciones no sustituyen las pruebas de integración de licencias** ni autorizan fusionar PR #135. Pendientes: conectar `chargeInstitutionalExam` con finalización real y persistida de PDF/revisión, deshabilitar endpoint de consumo arbitrario, validar simultaneidad en PostgreSQL real y probar una licencia completa de colegio antes del despliegue.

## Riesgo contractual adicional: padrón por licencia

`InstitutionalStudent` pertenece al colegio, no a una licencia específica. El control actual de `REVIEW` compara la matrícula activa completa del nivel con `studentCount` contratado. Esto puede rechazar a un colegio que compró cupos para una parte de su matrícula, y tampoco identifica inequívocamente qué estudiantes están contratados. Antes de publicar, agregar una relación de inscripción explícita entre `InstitutionalExamLicense` e `InstitutionalStudent` con unicidad por licencia/estudiante, validar escuela y nivel al inscribir y hacer cumplir el máximo de cupos contratados de forma transaccional. La revisión debe exigir inscripción activa a esa licencia y contabilizar consumos por estudiante inscrito; no usar el tamaño total del curso como sustituto. Agregar pruebas de matrícula parcial, alumno no inscrito, inscripción concurrente en último cupo y renovación de licencia.
