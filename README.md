# Institución Virtual — 0.1 Alpha

Primera alpha funcional de Institución Virtual.

## Incluye
- Web PWA instalable y funcional offline.
- Inicio de sesión local de demostración.
- Roles: Rector, Coordinador, Docente y Estudiante.
- Menú adaptado al rol.
- Libreta personal con guardado automático local.
- Creación y resolución de exámenes básicos.
- Calificaciones y planilla.
- Asistencia.
- Subida/listado de archivos en el almacenamiento local del navegador.
- Registro transparente de eventos de salida/cambio de pestaña durante un examen.
- Preparación para empaquetado desktop con Electron.

## Demo
Usuarios locales:
- rector / rector123
- coordinador / coord123
- docente / docente123
- estudiante / estudiante123

> Son cuentas de demostración. No se usan para producción.

## Ejecutar
La versión web puede abrirse mediante un servidor estático local. Para desarrollo:

```bash
npm install
npm run dev
```

Para desktop:

```bash
npm install
npm run desktop
```

La autenticación Google, base de datos remota, sincronización LAN/nube y seguridad de producción se incorporarán después.
