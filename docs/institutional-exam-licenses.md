# Licencias institucionales SIMCE y PAES

## Reglas comerciales
- Contrato por establecimiento, módulo, nivel y asignatura.
- Precio anual: CLP 6.100 netos por estudiante contratado; IVA 19%.
- Vigencia: 12 meses desde activación, con fecha exacta de inicio y término.
- 10 generaciones PDF por establecimiento y asignatura contratada.
- 10 revisiones IA por estudiante contratado y asignatura.
- Cada módulo/nivel/asignatura contratado tiene un cupo independiente.
- No permitir consumos sin contrato ACTIVE y fecha vigente.
- Los usuarios individuales no pueden contratar estos módulos.

## Seguridad y contabilidad de cupos
- Validar identidad, rol y pertenencia al establecimiento en el servidor.
- La licencia se activa manualmente por SUPERADMIN tras verificar el contrato institucional; no depende de Flow ni de webhooks de pago.
- Validar matrícula positiva y límites no negativos.
- Generación PDF: incrementar pdfUsed de forma atómica y solo cuando pdfUsed < pdfLimit.
- Revisión: en transacción contar InstitutionalExamUsage(kind=REVIEW, studentKey=...) y rechazar si >= reviewsPerStudent.
- Registrar requestKey único para idempotencia; los reintentos no descuentan nuevamente.
- studentKey debe ser un identificador opaco derivado del registro institucional; no guardar RUT en esta tabla.
- Revertir reserva de cupo cuando una generación falla de manera definitiva; evitar doble devolución.
- La verificación y reserva de cupo deben ocurrir antes de llamar al generador IA o PDF, en el servidor.
- La emisión del PDF o revisión exitosa debe confirmar el consumo; definir estados de reserva para fallas/reintentos antes de integrar.
- Conservar historial de usos y documentos al vencer una licencia.

## Pendiente de integración
1. Identificar rutas reales de generación SIMCE, PAES y corrección IA.
2. Integrar comprobación de licencias en todas las rutas, sin excepciones por interfaz.
3. Crear panel de superadministrador para altas, activación manual, cupos, renovaciones y auditoría.
4. Crear panel institucional de saldo por asignatura y estudiante.
5. Añadir pruebas de concurrencia, reintentos, permisos, expiración y activación manual.
6. Ejecutar validación de Prisma y pruebas en entorno de ensayo antes de fusionar o desplegar.

Nota: El esquema de datos agregado es la primera fase. No activar ventas ni aplicar db push en producción hasta completar integración y validaciones.
