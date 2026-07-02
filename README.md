# BC3 Viewer — Visualizador Premium de Presupuestos BC3

Visualizador web avanzado de archivos BC3 (FIEBDC-3) para presupuestos de construccion.
**Mejora libre y gratuita para cualquier Arquitecto Tecnico, Arquitecto o profesional de la construccion by JMC.**

hecha un vistazo a las capturas en la carpeta ---> **CAPTURAS**.

---

## Creditos y Origen

Este proyecto **no seria posible sin el trabajo de Rafael Roa (www.rafarq.com)**, quien creo la base original del parser y visualizador BC3 en PHP.

- **Repositorio original:** https://github.com/rafarq/BC3php
- **Web del autor Original:** https://www.rafarq.com
- LinkedIn: https://www.linkedin.com/in/rafaroa/
- Podcast: https://rafarq.com/podcast
- X: https://x.com/rafaelroa
- Instagram: https://www.instagram.com/r4f4r04/
- Y yo (Jose Manuel Caamaño) con mi granito de arena: https://www.linkedin.com/in/jmcaamanog/

Esta version ampliada ha sido desarrollada sobre su base, anadiendo funcionalidades avanzadas manteniendo el espiritu del proyecto original: **abierto, libre y util para la profesion**.

---

## Descripcion

BC3 Viewer es una aplicacion web que permite **visualizar, editar, comparar, planificar y exportar** archivos en formato BC3 (estandar FIEBDC-3 utilizado en Espana para el intercambio de presupuestos de construccion). La aplicacion muestra una vista jerarquica del presupuesto con capitulos, subcapitulos, partidas y lineas de medicion.

---

## Caracteristicas Completas

### Visualizacion
- **Arbol jerarquico expandible/colapsable** con capitulos, subcapitulos y partidas
- **Columnas redimensionables**: Codigo, Unidad, Resumen, Cantidad, Precio e Importe
- **Lineas de medicion** (~M): Tabla detallada con Uds, Largo, Ancho, Alto y Parciales
- **Descripciones inline** (~T): Texto descriptivo de cada partida al expandir
- **Deteccion de codificacion**: Soporte ANSI, UTF-8 e ISO-8859-1
- **Modo movil drill-down**: Navegacion tactil por niveles en dispositivos pequenos
- **Breadcrumb de navegacion**: Rastro de migas para saber siempre en que nivel estas
- **Boton Volver** para retroceder en la jerarquia

### Busqueda y Filtros
- **Busqueda en tiempo real** por titulo, codigo y medicion
- **Filtros avanzados**: por importe minimo/maximo, tipo de recurso (MO, MAQ, MAT, SUB)
- **Expandir / Contraer Todo** con un solo clic
- **Badges de tipo de recurso**: etiquetas visuales MO / MAQ / MAT / SUB

### Edicion en Linea
- **Edicion directa de resumenes** haciendo clic en cualquier celda de descripcion
- **Edicion de precios unitarios** directamente en la tabla
- **Historial Deshacer/Rehacer** (Ctrl+Z / Ctrl+Y) con hasta 50 estados
- **Guardar archivo** modificado como nuevo BC3 con nombre automatico

### Drag & Drop
- **Arrastrar y soltar** archivos .bc3 directamente sobre la ventana del navegador
- Overlay visual de carga al arrastrar

### Dashboard de Analisis Visual
- **Grafico de distribucion por capitulos** (Chart.js - local, sin internet)
- **Grafico de tipos de recurso** (MO / Maquinaria / Material / Subcontrata)
- Estadisticas globales del presupuesto

### Coeficientes Globales (PEM a PEC)
- Configuracion de **Gastos Generales (GG %)**, **Beneficio Industrial (BI %)** y **Baja/Alza general**
- Calculo automatico del **PEC** (Precio de Ejecucion por Contrata) en tiempo real

### Comparador de Presupuestos
- Cargar un segundo archivo BC3 para **comparar partida a partida**
- Visualizacion de **desviaciones de precio** en color (positivo/negativo)
- Resumen de diferencias globales

### Exportacion del Presupuesto
- **Exportar a PDF**: Presupuesto completo en A4, con tabla formateada y totales (local, sin internet)
- **Exportar a Excel (.xlsx)**: Presupuesto estructurado con columnas y anchos optimizados (local, sin internet)

### PLANNING - Diagrama de Gantt Interactivo (NUEVO)
- Diagrama de Gantt interactivo a partir de los capitulos y subcapitulos del presupuesto (hasta **3 niveles**)
- **Distribucion automatica inicial** proporcional al coste de cada capitulo
- **Cabecera de meses y semanas** (semanas de 7 dias) con scroll horizontal
- **Barras completamente arrastrables**:
  - Borde izquierdo: cambiar fecha de inicio
  - Centro: mover toda la tarea
  - Borde derecho: cambiar duracion
- **Capitulos colapsables** para mostrar/ocultar subcapitulos
- **Auto-guardado en localStorage**: El planning se recupera automaticamente al abrir el mismo fichero BC3
- **Exportar Planning a Excel**: Tabla estructurada con Nivel, Codigo, Tarea, Fecha Inicio, Fecha Fin, Duracion (sem.), Importe
- **Exportar Planning a PDF**: A4 landscape, barras visuales en color, paginado automatico cada 26 semanas
- Control de **fecha de inicio del proyecto** y **numero de semanas total** configurable

### Modo Oscuro
- Alternancia modo claro / modo oscuro con boton en la cabecera
- Estilos adaptativos en todos los modulos incluyendo el Gantt

---

## Requisitos

- **PHP 7.4 o superior** con extension `mbstring`
- Servidor web (Apache, nginx, o servidor PHP integrado)
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- **Sin dependencias de internet** en produccion - todas las librerias JS incluidas localmente

---

## Instalacion

1. Clona o copia los archivos a tu servidor web:

```
BC3php/
+-  index.php                       <- Pagina principal (PHP)
+-  style.css                       <- Estilos (tema claro + oscuro + Gantt)
+-  app.js                          <- Logica JavaScript completa
+-  BC3Parser.php                   <- Parser PHP del formato FIEBDC-3
+-  upload.php                      <- Endpoint de subida de archivos
+-  jspdf.umd.min.js                <- Libreria PDF (local)
+-  jspdf.plugin.autotable.min.js   <- Plugin de tablas para PDF (local)
+-  xlsx.full.min.js                <- Libreria Excel/SheetJS (local)
+-  chart.min.js                    <- Libreria graficos Chart.js (local)
```

2. Inicia el servidor:

```bash
php -S localhost:8080
```

3. Accede a http://localhost:8080 en el navegador

---

## Uso

1. **Carga** el archivo BC3: arrastra y suelta o haz clic en "Seleccionar archivo .bc3"
2. **Procesa** el archivo con el boton "Procesar"
3. **Explora** el arbol jerarquico: haz clic en los triangulos para expandir/colapsar
4. **Edita** directamente haciendo clic en cualquier descripcion o precio
5. **Busca** en tiempo real con la barra de busqueda
6. **Exporta** con el menu "Exportar" PDF o Excel del presupuesto completo
7. **Planifica** con el boton "Planning" -> Diagrama Gantt interactivo
8. **Analiza** con el boton "Dashboard" -> Graficos de distribucion de costes
9. **Guarda** las modificaciones con "Guardar" -> descarga el BC3 modificado

---

## Estructura de Archivos

| Archivo | Descripcion |
|---------|-------------|
| index.php | Pagina HTML+PHP principal |
| style.css | Estilos CSS completos (claro, oscuro, Gantt) |
| app.js | Logica JavaScript completa (~3100 lineas) |
| BC3Parser.php | Parser PHP para el estandar FIEBDC-3 |
| upload.php | Endpoint de subida y procesado |
| jspdf.umd.min.js | Generacion de PDF en el navegador |
| jspdf.plugin.autotable.min.js | Tablas formateadas en PDF |
| xlsx.full.min.js | Generacion de Excel (.xlsx) |
| chart.min.js | Graficos del Dashboard |

---

## Formato BC3 Soportado

| Registro | Descripcion |
|----------|-------------|
| ~V | Propiedades del archivo (version, charset, owner) |
| ~C | Conceptos (capitulos, partidas, recursos) |
| ~D | Descomposicion (relaciones padre-hijo con factores) |
| ~T | Textos descriptivos de partidas |
| ~M | Mediciones detalladas (tabla de medicion) |

---

## Tecnologias Utilizadas

- **PHP 7.4+** - Backend, parsing del formato BC3
- **JavaScript Vanilla (ES6+)** - Frontend completo, sin frameworks
- **CSS3** - Diseno responsive, modo oscuro, animaciones
- **jsPDF + AutoTable** - Exportacion a PDF
- **SheetJS (XLSX)** - Exportacion a Excel
- **Chart.js** - Dashboard visual

Todas las librerias JS se sirven **localmente**, sin dependencia de CDN externos.

---

## Licencia

GNU Affero General Public License v3.0 (AGPLv3).

---

## Sobre el Proyecto Original

BC3php fue creado por **System Arquitectura** (https://www.systemarquitectura.com), empresa con sede en Malaga especializada en proyectos de arquitectura industrial, logistica, corporativa y residencial.

Esta version ampliada mantiene todos los creditos del autor original y anade funcionalidades avanzadas orientadas al uso profesional diario del Arquitecto Tecnico y Director de Obra.

## 👨‍💻 Autor de la versión mejorada

Jose Manuel Caamaño González | Arquitecto Técnico & BIM Manager.
Digital Product Lead | ConTech & Digital Twin SaaS | BIM, Energy Modeling & Sustainability | Data Analytics (SQL, Power BI)

Hecho con código y café desde A Coruña. ☕

Jose Manuel Caamaño González | [LinkedIn](https://www.linkedin.com/in/jmcaamanog/)
