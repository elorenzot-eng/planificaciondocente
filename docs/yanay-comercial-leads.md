# Yanay Comercial — implementación inicial

## Objetivo
Captar solicitudes de demostración de EducAntay sin modificar el comportamiento pedagógico actual de Yanay.

## Flujo
1. Visitante elige perfil: docente, directivo, sostenedor, OTEC u otro.
2. Yanay informa sobre módulos: Planificación IA, SIMCE, PAES, ECEP, Portafolio, LMS y gestión institucional.
3. Ante intención comercial, ofrecer formulario: nombre, institución, cargo, correo, teléfono opcional, módulos de interés, mensaje y horario preferido.
4. Solicitar consentimiento explícito para usar los datos exclusivamente para responder la consulta comercial.
5. Crear oportunidad con estado NUEVO y fecha de creación.
6. Panel privado para responsables autorizados: NUEVO, CONTACTADO, DEMOSTRACION, PROPUESTA, CERRADO, DESCARTADO.

## Requisitos de seguridad
- Persistencia en servidor; nunca guardar leads solamente en el navegador.
- Validación estricta de campos, protección antispam y límites de solicitudes.
- Autenticación y autorización de administrador en panel y endpoints.
- No incluir datos personales en logs, respuestas de IA ni analíticas públicas.
- Evitar acceso público a listados de contactos.
- Política de retención y eliminación de datos.
- No enviar correos ni reservar reuniones automáticamente sin consentimiento.

## Criterios de aceptación
- Se puede enviar una solicitud válida y verla en panel autorizado.
- Errores de validación comprensibles y sin duplicación por doble clic.
- Funciona en móvil y escritorio.
- Yanay conserva su función pedagógica.
- Sin despliegue a producción hasta aprobar pruebas.

## Estado
Diseño funcional registrado. API, esquema de datos, formulario, panel y pruebas: pendientes.
