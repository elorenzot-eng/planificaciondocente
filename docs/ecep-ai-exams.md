# Ensayos ECEP con IA

El catálogo ofrece generación para las 50 especialidades cargadas en lib/ecep-topics.ts. Entradas desde /ecep-ia/temarios, /ecep-ia/ensayos y Mi carpeta → Ensayos ECEP.

- 10, 30 o 60 preguntas, cuatro alternativas y una clave por ítem.
- Complejidad seleccionable. Mixta: 30% baja, 40% media, 30% alta; para 60 ítems, 18/24/18.
- Dos dimensiones: disciplinar y pedagógica. La alternancia 1:1 es una decisión interna de práctica; no representa una proporción oficial.
- Asignación determinista a dominios, subdominios e indicadores disponibles. Nunca se inventan indicadores ausentes. Se puede seleccionar un dominio.
- El plan curricular se guarda junto con el ensayo para conservar documentos aunque cambie el catálogo.
- Una solicitud crea el proceso; otras generan grupos de cinco y conservan el avance. Las claves se verifican estructuralmente, no psicométricamente. El fundamento disciplinar requiere criterio docente.
- El modelo se configura con ECEP_OPENAI_MODEL; usa PAES_OPENAI_MODEL o gpt-4.1-mini como alternativa. Requiere OPENAI_API_KEY.
- Cada grupo admite dos intentos de 55 segundos. Las concesiones de ejecución caducan a los 180 segundos y usan un token único para impedir que una solicitud antigua sobrescriba otro proceso.
- Al validar el ensayo completo, el cambio a COMPLETED y el descuento de un crédito comparten una transacción. Reintentar la finalización es idempotente. Los fallos e incompletos no consumen; se exige saldo antes de seguir generando.
- Las cuentas institucionales conservan la política existente del control de IA. Las individuales usan cuota y período vigente, con límite de cinco para TRIAL.
- Los documentos se consultan con sesión y propiedad verificadas; no permiten ejecutar código generado. La versión de práctica excluye claves, fundamentos y tabla docente.
- Las preguntas son material original de práctica, sin atribuir oficialidad CPEIP ni validación psicométrica.

## Validación

Node 22.18+ o Node 24: node --test tests/ecep-exams.test.cjs

Pruebas sintéticas de las 50 especialidades, distribución 18/24/18, pertenencia a indicadores, formato y claves, preguntas repetidas, aislamiento de respuestas en el documento del estudiante, escape HTML, reintentos del proveedor y concurrencia del contador. Las pruebas no llaman OpenAI ni consumen saldo.

Migración aditiva: prisma/migrations/20261025020000_ecep_exams/migration.sql. El arranque del repositorio también sincroniza Prisma mediante db push.
