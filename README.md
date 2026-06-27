# BC3 Viewer

Visualizador web de archivos BC3 (FIEBDC-3) para presupuestos de construcción.

## Descripción

BC3 Viewer es una aplicación web que permite visualizar archivos en formato BC3 (estándar FIEBDC-3 utilizado en España para el intercambio de presupuestos de construcción). La aplicación muestra una vista jerárquica del presupuesto con capítulos, subcapítulos, partidas y líneas de medición.

## Características

- **Visualización jerárquica**: Muestra la estructura del presupuesto en forma de árbol expandible
- **Columnas de datos**: Código, Unidad, Resumen, Cantidad, Precio e Importe
- **Líneas de medición**: Tabla detallada con Uds, Largo, Ancho, Alto y cálculo de Parciales
- **Descripciones inline**: Texto descriptivo de cada partida visible al expandir
- **Detección de codificación**: Soporte para archivos ANSI, UTF-8 e ISO-8859-1

## Requisitos

- PHP 7.4 o superior
- Servidor web (Apache, nginx, o PHP built-in server)

## Instalación

1. Clonar o copiar los archivos a tu servidor web:

```
BC3php/
├── index.html
├── style.css
├── app.js
├── BC3Parser.php
└── upload.php
```

2. Iniciar el servidor:

```bash
# Usando el servidor built-in de PHP
php -S localhost:8080

# O configurar en Apache/nginx
```

3. Acceder a `http://localhost:8080` en el navegador

## Uso

1. Haz clic en "Seleccionar archivo .bc3"
2. Elige un archivo BC3 de tu ordenador
3. Haz clic en "Procesar"
4. Explora el árbol de presupuesto haciendo clic en los triángulos para expandir/colapsar

## Estructura de Archivos

| Archivo           | Descripción                    |
| ----------------- | ------------------------------- |
| `index.html`    | Página HTML principal          |
| `style.css`     | Estilos CSS (tema claro)        |
| `app.js`        | Lógica JavaScript del frontend |
| `BC3Parser.php` | Parser PHP para archivos BC3    |
| `upload.php`    | Endpoint para subir archivos    |

## Formato BC3

El parser soporta los siguientes registros del estándar FIEBDC-3:

- `~V` - Propiedades del archivo (versión, charset)
- `~C` - Conceptos (capítulos, partidas)
- `~D` - Descomposición (relaciones padre-hijo)
- `~T` - Textos descriptivos
- `~M` - Mediciones detalladas

## Integración en Otro Proyecto

Para integrar este visor BC3 en un proyecto existente:

### Archivos Requeridos

Copia estos archivos a tu proyecto:

```
tu-proyecto/
├── BC3Parser.php      # Parser PHP (backend)
├── upload.php         # Endpoint de subida
├── app.js             # Lógica del visor
└── style.css          # Estilos (adaptar según necesidad)
```

### HTML Mínimo Requerido

Añade estos elementos a tu página:

```html
<!-- En el HEAD -->
<link rel="stylesheet" href="style.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<!-- En el BODY -->
<div class="app-container">
    <header class="main-header">
        <form id="uploadForm">
            <label for="bc3file" class="upload-btn">
                <span id="fileName">Seleccionar archivo .bc3</span>
                <input type="file" id="bc3file" name="bc3file" accept=".bc3" hidden>
            </label>
            <button type="submit" class="process-btn">Procesar</button>
        </form>
        <div class="project-info" id="projectInfo" style="display:none;">
            <h1 id="projectTitle"></h1>
            <div id="stats"></div>
        </div>
    </header>

    <main class="content-area">
        <div class="tree-panel" id="treePanel">
            <div class="empty-state">Sube un fichero para ver el árbol</div>
            <div id="treeContent"></div>
        </div>
    </main>
</div>

<script src="app.js"></script>
```

### Personalización

- **Estilos**: Modifica las variables CSS en `:root` de `style.css` para adaptar colores
- **Columnas**: Ajusta `grid-template-columns` en `.tree-header` y `.tree-node-row`
- **Endpoint**: Si cambias la ruta de `upload.php`, actualiza el fetch en `app.js`

### Dependencias

- PHP 7.4+ con extensión `mbstring`
- Ninguna dependencia JavaScript externa

## Creado por

BC3php es una herramienta creada por [System Arquitectura](https://www.systemarquitectura.com), empresa con sede en Málaga especializada en proyectos de arquitectura industrial, logística, corporativa y residencial.

Su enfoque combina diseño, tecnología y sostenibilidad desde las fases tempranas del proyecto, con una visión técnica y estratégica orientada a mejorar el rendimiento de las organizaciones y su relación con el entorno.

## Licencia

Este proyecto se distribuye bajo la licencia GNU Affero General Public License v3.0 (AGPLv3).

## Autor

- LinkedIn: https://www.linkedin.com/in/rafaroa/
- Blog: https://rafarq.com
- Podcast: https://rafarq.com/podcast
- X: https://x.com/rafaelroa
- Instagram: https://www.instagram.com/r4f4r04/
