# BC3 Viewer

Visualizador web de archivos BC3 (FIEBDC-3) para presupuestos de construcción.

## Descripción

BC3 Viewer es una aplicación web que permite visualizar, editar, comparar, planificar y exportar archivos en formato BC3 (estándar FIEBDC-3 utilizado en España para el intercambio de presupuestos de construcción). La aplicación muestra una vista jerárquica del presupuesto con capítulos, subcapítulos, partidas y líneas de medición.

Echa un vistazo a las capturas en la carpeta **CAPTURAS**.

## Características

- **Visualización jerárquica**: Muestra la estructura del presupuesto en forma de árbol expandible, con modo drill-down para móvil, breadcrumb de navegación y botón de volver
- **Columnas de datos**: Código, Unidad, Resumen, Cantidad, Precio e Importe, redimensionables
- **Líneas de medición**: Tabla detallada con Uds, Largo, Ancho, Alto y cálculo de Parciales
- **Descripciones inline**: Texto descriptivo de cada partida visible al expandir
- **Detección de codificación**: Soporte para archivos ANSI, UTF-8 e ISO-8859-1
- **Búsqueda y filtros**: Búsqueda en tiempo real por título, código y medición; filtros por importe mínimo/máximo y tipo de recurso (MO, MAQ, MAT, SUB); expandir/contraer todo con un clic
- **Edición en línea**: Edición directa de resúmenes y precios unitarios desde la propia tabla, con historial de deshacer/rehacer (Ctrl+Z / Ctrl+Y) y guardado del BC3 modificado
- **Drag & Drop**: Arrastra y suelta archivos .bc3 directamente sobre la ventana del navegador
- **Dashboard de análisis visual**: Gráficos de distribución por capítulos y por tipo de recurso, con estadísticas globales del presupuesto
- **Coeficientes globales (PEM a PEC)**: Configuración de Gastos Generales, Beneficio Industrial y Baja/Alza general, con cálculo automático del PEC en tiempo real
- **Comparador de presupuestos**: Carga un segundo archivo BC3 y compara partida a partida, con desviaciones de precio resaltadas
- **Exportación**: A PDF (tabla formateada y totales) y a Excel (.xlsx), todo generado localmente sin dependencias externas
- **Planning – Diagrama de Gantt interactivo**: Generado a partir de los capítulos y subcapítulos (hasta 3 niveles), con distribución automática de fechas, barras arrastrables, capítulos colapsables, auto-guardado en localStorage y exportación a Excel/PDF
- **Modo oscuro**: Alternancia claro/oscuro con estilos adaptados en todos los módulos, incluido el Gantt

## Requisitos

- PHP 7.4 o superior, con la extensión `mbstring`
- Servidor web (Apache, nginx, o servidor PHP integrado)
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Sin dependencias de internet en producción: todas las librerías JS se incluyen localmente

## Instalación

1. Clonar o copiar los archivos a tu servidor web:

```
BC3php/
├── index.php
├── style.css
├── app.js
├── BC3Parser.php
├── upload.php
├── jspdf.umd.min.js
├── jspdf.plugin.autotable.min.js
├── xlsx.full.min.js
└── chart.min.js
```

2. Iniciar el servidor:

```bash
# Usando el servidor built-in de PHP
php -S localhost:8080

# O configurar en Apache/nginx
```

3. Acceder a `http://localhost:8080` en el navegador

## Uso

1. Carga el archivo BC3 arrastrándolo o con "Seleccionar archivo .bc3"
2. Haz clic en "Procesar"
3. Explora el árbol de presupuesto haciendo clic en los triángulos para expandir/colapsar
4. Edita directamente cualquier descripción o precio haciendo clic sobre la celda
5. Busca en tiempo real con la barra de búsqueda y aplica filtros
6. Exporta el presupuesto completo a PDF o Excel
7. Planifica con el botón "Planning" para abrir el diagrama de Gantt interactivo
8. Analiza con el botón "Dashboard" para ver los gráficos de distribución de costes
9. Guarda las modificaciones con "Guardar" para descargar el BC3 actualizado

## Estructura de Archivos

| Archivo                         | Descripción                                    |
| -------------------------------- | ----------------------------------------------- |
| `index.php`                    | Página principal (HTML + PHP)                  |
| `style.css`                    | Estilos CSS (tema claro, oscuro y Gantt)         |
| `app.js`                        | Lógica JavaScript del frontend                 |
| `BC3Parser.php`                 | Parser PHP para archivos BC3                    |
| `upload.php`                    | Endpoint para subir archivos                    |
| `jspdf.umd.min.js`              | Librería para generación de PDF (local)        |
| `jspdf.plugin.autotable.min.js` | Plugin de tablas para PDF (local)                |
| `xlsx.full.min.js`              | Librería para generación de Excel/SheetJS (local) |
| `chart.min.js`                  | Librería de gráficos para el Dashboard (local)  |

## Formato BC3

El parser soporta los siguientes registros del estándar FIEBDC-3:

- `~V` - Propiedades del archivo (versión, charset, owner)
- `~C` - Conceptos (capítulos, partidas, recursos)
- `~D` - Descomposición (relaciones padre-hijo con factores)
- `~T` - Textos descriptivos
- `~M` - Mediciones detalladas

## Tecnologías Utilizadas

- **PHP 7.4+** - Backend, parsing del formato BC3
- **JavaScript vanilla (ES6+)** - Frontend completo, sin frameworks
- **CSS3** - Diseño responsive, modo oscuro, animaciones
- **jsPDF + AutoTable** - Exportación a PDF
- **SheetJS (XLSX)** - Exportación a Excel
- **Chart.js** - Dashboard visual

Todas las librerías JS se sirven localmente, sin dependencia de CDN externos.

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
- Ninguna dependencia JavaScript externa en el visor base

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

## Colaboradores

Las funcionalidades de búsqueda y filtros avanzados, edición en línea, drag & drop, dashboard de análisis, coeficientes PEM/PEC, comparador de presupuestos, exportación a PDF/Excel, planning con diagrama de Gantt y modo oscuro fueron aportadas por **Jose Manuel Caamaño González**, Arquitecto Técnico & BIM Manager.

- LinkedIn: https://www.linkedin.com/in/jmcaamanog/
