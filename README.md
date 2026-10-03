# Institución Virtual — 0.2 Alpha

Primera alpha funcional de Institución Virtual.

## Plataformas
- Web/PWA desplegada automáticamente con GitHub Pages.
- Windows: instalador **.exe** generado por GitHub Actions.
- Android: **APK** generado por GitHub Actions.
- Las tres plataformas salen del mismo código de `main`: cada cambio publicado vuelve a construir web, EXE y APK.

## Incluye
- Inicio de sesión local de demostración.
- Roles: Rector, Coordinador, Docente y Estudiante.
- Menú adaptado al rol.
- Libreta personal con guardado automático local.
- Creación y resolución de exámenes básicos.
- Calificaciones y planilla.
- Asistencia.
- Archivos en Alpha.
- Registro transparente de cambios de visibilidad durante un examen.
- PWA/offline y empaquetado desktop/mobile.

## Demo
- rector / rector123
- coordinador / coord123
- docente / docente123
- estudiante / estudiante123

Son cuentas de demostración; no son para producción.

## Desarrollo
```bash
npm install
npm run dev
```

## Builds locales
```bash
npm run dist:win
npm run mobile:sync
```

El flujo oficial de CI está en `.github/workflows/build.yml`. Cada push a `main` genera el despliegue web y los artefactos de Windows y Android.

> Todavía no hay sincronización real nube/LAN ni cuentas remotas. La Alpha conserva datos localmente; la siguiente etapa conectará una API y una base de datos para que los cambios de contenido/datos se compartan entre dispositivos.


## 0.2
La Alpha añade cuentas locales, cola de sincronización preparada, constructor de preguntas de varios tipos, duración de examen y protección frente a pérdida de visibilidad/foco. Google OAuth y la nube real requieren configurar un backend; no se simulan como conectados. El modo de pantalla dividida no puede detectarse de forma universal en todos los dispositivos.
