# EducAntay Android

Identificador oficial: `cl.educantay.app`.

## Requisitos
- Node.js compatible con el proyecto
- Android Studio
- JDK compatible con la versión de Android Gradle Plugin usada por Capacitor

## Crear el proyecto Android por primera vez
```bash
npm install
npm run android:add
npm run android:sync
npm run android:open
```

La app carga la versión productiva de EducAntay desde `https://educantay.cl`.

## Compilar APK
Desde Android Studio: **Build > Build APK(s)**.

También se puede usar Gradle después de crear/sincronizar Android:
```bash
cd android
./gradlew assembleDebug
```

APK debug esperada:
`android/app/build/outputs/apk/debug/app-debug.apk`

Antes de instalar una versión antigua de pruebas, desinstalar paquetes previos de EducAntay para evitar conflictos de firma o identificador.
