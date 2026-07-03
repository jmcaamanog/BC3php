# Changelog

Todos los cambios notables de este proyecto se documentan en este fichero.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

---

## [Unreleased]

---

## [0.2.0] — 2026-07-03

### Añadido
- `CONTRIBUTING.md` con guía de instalación, ejecución y envío de PRs.
- `SECURITY.md` con política de reporte de vulnerabilidades.
- `CODE_OF_CONDUCT.md` basado en Contributor Covenant 1.4.
- `CHANGELOG.md` (este fichero).
- Modo oscuro con alternancia claro/oscuro y estilos adaptados en todos los módulos, incluido el Gantt.
- Edición en línea de resúmenes y precios unitarios desde la propia tabla, con historial de deshacer/rehacer (Ctrl+Z / Ctrl+Y) y guardado del BC3 modificado.
- Dashboard de análisis visual con gráficos de distribución por capítulos y por tipo de recurso, y estadísticas globales del presupuesto.
- Panel de coeficientes globales (PEM a PEC): Gastos Generales, Beneficio Industrial y Baja/Alza general, con cálculo automático del PEC en tiempo real.
- Comparador de presupuestos: carga de un segundo archivo BC3 y comparación partida a partida con desviaciones de precio resaltadas.
- Exportación a PDF (tabla formateada y totales) y a Excel (`.xlsx`), generada localmente sin dependencias externas.
- Planning – diagrama de Gantt interactivo generado a partir de capítulos y subcapítulos (hasta 3 niveles), con distribución automática de fechas, barras arrastrables, capítulos colapsables y auto-guardado en `localStorage`.
- Capturas de pantalla de las funcionalidades del proyecto en la carpeta `CAPTURAS/`, junto con ejemplos de presupuesto exportado en PDF y Excel.
- Procesado automático del archivo `.bc3` al seleccionarlo, sin necesidad de pulsar manualmente el botón `Procesar`.
- Iconos SVG inline de estilo Lucide para acciones de dashboard, planning, exportación, tema, coeficientes, deshacer/rehacer, cierres de modal y controles del Gantt.
- Estilos globales para enlaces (`a`) y botones deshabilitados, con nuevas variables de contraste (`--accent-contrast`, `--link-color`, `--link-hover`) adaptadas a modo claro y oscuro.

### Cambiado
- Sustituidos emojis y símbolos sueltos de la interfaz por iconos SVG locales sin dependencias externas.
- Centralizada la lógica de carga de BC3 para que el selector de archivo, el botón manual y el arrastre de archivos usen el mismo flujo de procesado.
- Actualizado el pie de página con el crédito a Rafael Roa como coautor junto a Jose Manuel Caamaño, y ajustada la versión mostrada a V0.2.0.
- Eliminado el subrayado en el hover de los elementos del breadcrumb para un estilo más limpio.

### Corregido
- Corregidos selectores CSS del modo oscuro (`.dark-mode` → `body.dark-theme`) que impedían aplicar los estilos oscuros a filas, celdas y columnas del diagrama de Gantt.

---

## [0.1.0] — 2025-12-10

### Añadido
- Visualizador jerárquico de archivos BC3 (FIEBDC-3) en forma de árbol expandible.
- Columnas: Código, Unidad, Resumen, Cantidad, Precio e Importe.
- Tabla de líneas de medición con Uds, Largo, Ancho, Alto y Parciales.
- Descripciones *inline* de cada partida al expandir el nodo.
- Detección automática de codificación: ANSI, UTF-8 e ISO-8859-1.
- Funcionalidad de búsqueda en la vista de árbol.
- Columna jerárquica y de código unificadas en una sola columna.
- `README.md` con guía de instalación y uso.

### Corregido
- Eliminación del carácter `#` al final de códigos de concepto y partida.
- Limpieza de símbolos `#` y espacios sobrantes en los campos de texto mostrados.

[Unreleased]: https://github.com/rafarq/BC3php/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/rafarq/BC3php/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/rafarq/BC3php/releases/tag/v0.1.0
