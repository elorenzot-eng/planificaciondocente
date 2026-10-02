# Compilación Android — EducAntay

## Requisitos
- Node.js 22+
- Android Studio compatible con Capacitor 8
- Android SDK 36

## Identidad
- Nombre: EducAntay
- Application ID: cl.educantay.app

## APK de prueba
Desde mobile/:
1. npm ci
2. npx cap add android
3. npx cap sync android
4. cd android
5. ./gradlew assembleDebug

Salida: android/app/build/outputs/apk/debug/app-debug.apk

## AAB
Para Google Play debe generarse y firmarse un Android App Bundle de release. La clave de firma nunca debe guardarse en GitHub.

La automatización de GitHub Actions genera un APK debug y un AAB release sin credenciales privadas. Antes de publicar se configurará la firma de release mediante secretos seguros.

## Importante
Cada cambio en mobile/www debe sincronizarse con npx cap sync android antes de compilar.
