# Changelog

Todos los cambios notables de este proyecto se documentan en este fichero.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.0.0/) y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

---

## [Unreleased]

### Añadido
- `CONTRIBUTING.md` con guía de instalación, ejecución y envío de PRs.
- `SECURITY.md` con política de reporte de vulnerabilidades.
- `CODE_OF_CONDUCT.md` basado en Contributor Covenant 1.4.
- `CHANGELOG.md` (este fichero).

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

[Unreleased]: https://github.com/rafarq/BC3php/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rafarq/BC3php/releases/tag/v0.1.0
