# EducAntay Mobile — Android

Base móvil aislada de la web de producción.

## Objetivo
Crear la aplicación Android de EducAntay con Capacitor, conservando el backend, las cuentas, suscripciones y datos de la plataforma web.

## Principio de arquitectura
La app móvil no debe duplicar Prisma ni acceder directamente a la base de datos. Consumirá endpoints HTTPS de EducAntay. La web actual continúa funcionando de forma independiente.

## Preparación local
1. Instalar Node.js 22+ y Android Studio.
2. Entrar a `mobile/`.
3. Ejecutar `npm install`.
4. Ejecutar `npm run cap:android`.
5. Ejecutar `npm run cap:open`.

## Próximas etapas
- Cliente de autenticación móvil.
- Navegación Inicio / Planificación IA / Evaluaciones IA / Material IA / Mi Carpeta / Suscripción / Soporte.
- Descarga y compartir PDF.
- Estado de conectividad y carga IA.
- Icono y splash EducAntay.
- Pruebas Android y generación AAB para Google Play.

No usar `server.url` apuntando a educantay.cl como solución de producción: la documentación de Capacitor reserva esa opción para live reload/desarrollo.
