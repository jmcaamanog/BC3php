<?php
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualizador BC3 Premium</title>
    <link rel="stylesheet" href="style.css?v=<?php echo filemtime('style.css'); ?>">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>

<body>
    <div class="app-container">
        <header class="main-header">
            <div class="logo">BC3 Viewer</div>
            <div class="upload-area">
                <form id="uploadForm">
                    <button type="button" id="dashboardBtn" class="dashboard-btn" data-icon="bar-chart-3" style="display:none;">Dashboard</button>
                    <button type="button" id="planningBtn" class="planning-btn" data-icon="calendar-days" style="display:none;">Planning</button>
                    <label for="bc3file" class="upload-btn">
                        <span id="fileName">Seleccionar archivo .bc3</span>
                        <input type="file" id="bc3file" name="bc3file" accept=".bc3" hidden>
                    </label>
                    <button type="submit" class="process-btn">Procesar</button>
                    <button type="button" id="saveBtn" class="save-btn" style="display:none;">Guardar</button>
                    
                    <!-- Dropdown de exportación unificado -->
                    <div class="dropdown" id="exportDropdown" style="display:none;">
                        <button type="button" class="export-btn dropdown-toggle" data-icon="download" data-trailing-icon="chevron-down">Exportar</button>
                        <div class="dropdown-content">
                            <button type="button" id="exportPdfBtn" data-icon="file-text">Exportar a PDF</button>
                            <button type="button" id="exportExcelBtn" data-icon="file-spreadsheet">Exportar a Excel</button>
                        </div>
                    </div>
                    
                    <button type="button" id="compareBtn" class="compare-btn" style="display:none;">Comparar</button>
                    <button type="button" id="themeToggle" class="theme-toggle-btn" data-icon-only="moon" aria-label="Cambiar tema"></button>
                </form>
            </div>
            <div class="project-info" id="projectInfo" style="display:none;">
                <div class="budget-totals-container">
                    <div class="budget-total" id="budgetTotal">PEM: 0,00 €</div>
                    <div class="budget-total pec-total" id="budgetTotalPEC" style="display:none;">PEC: 0,00 €</div>
                    <button type="button" id="toggleCoeffsBtn" class="coeffs-toggle-btn" data-icon="settings" style="display:none;">Coeficientes</button>
                </div>
                <div id="stats" style="font-size: 0.8em; color: #888; margin-top: 5px;"></div>
            </div>
        </header>

        <!-- Panel de Coeficientes Globales -->
        <div id="coeffsPanel" class="coeffs-panel" style="display:none;">
            <div class="coeffs-container">
                <h4>Ajustes de Presupuesto por Coeficientes</h4>
                <div class="coeffs-row">
                    <div class="coeff-field">
                        <label for="coeffGG">Gastos Generales (GG %):</label>
                        <input type="number" id="coeffGG" value="13" min="0" max="100" step="1">
                    </div>
                    <div class="coeff-field">
                        <label for="coeffBI">Beneficio Industrial (BI %):</label>
                        <input type="number" id="coeffBI" value="6" min="0" max="100" step="1">
                    </div>
                    <div class="coeff-field">
                        <label for="coeffBaja">Baja/Alza General (%):</label>
                        <input type="number" id="coeffBaja" value="0" min="-100" max="100" step="0.1">
                    </div>
                    <div class="coeff-actions">
                        <button type="button" id="applyCoeffsBtn" class="process-btn">Aplicar</button>
                    </div>
                </div>
            </div>
        </div>

        <main class="content-area">
            <div class="tree-panel" id="treePanel">
                <div class="empty-state">Sube un fichero para ver el árbol</div>
                <div class="search-bar-container">
                    <input type="text" id="searchTerm" placeholder="Buscar partidas (título, código, medición...)"
                        autocomplete="off">
                </div>
                
                <!-- Barra de Filtros Avanzados -->
                <div class="filter-bar" style="display:none;" id="filterBar">
                    <div class="filter-group">
                        <button type="button" id="expandAllBtn" class="filter-btn">Expandir Todo</button>
                        <button type="button" id="collapseAllBtn" class="filter-btn">Contraer Todo</button>
                        <button type="button" id="undoBtn" class="filter-btn" data-icon="undo-2" disabled title="Deshacer (Ctrl+Z)">Deshacer</button>
                        <button type="button" id="redoBtn" class="filter-btn" data-icon="redo-2" disabled title="Rehacer (Ctrl+Y)">Rehacer</button>
                    </div>
                    <div class="filter-group">
                        <label for="costFilter">Filtrar por importe:</label>
                        <select id="costFilter" class="filter-select">
                            <option value="all">Todas las partidas</option>
                            <option value="1000">Importe > 1.000 €</option>
                            <option value="5000">Importe > 5.000 €</option>
                            <option value="10000">Importe > 10.000 €</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="resourceFilter">Filtrar por recurso:</label>
                        <select id="resourceFilter" class="filter-select">
                            <option value="all">Todos los recursos</option>
                            <option value="mo">Mano de Obra (MO)</option>
                            <option value="mat">Materiales (MAT)</option>
                            <option value="maq">Maquinaria (MAQ)</option>
                            <option value="sub">Subcontratas (SUB)</option>
                        </select>
                    </div>
                </div>

                <div class="breadcrumb-container" id="breadcrumbContainer" style="display:none;">
                    <button class="breadcrumb-back" id="breadcrumbBack">← Volver</button>
                    <div class="breadcrumb-path" id="breadcrumbPath"></div>
                </div>
                <div id="treeContent"></div>
            </div>

            <div class="details-panel" id="detailsPanel">
                <div class="empty-state">Selecciona una partida para ver detalles</div>
                <div id="detailsContent" style="display:none;">
                    <header class="details-header">
                        <div class="code-badge" id="detCode"></div>
                        <h2 id="detSummary"></h2>
                        <div class="price-tag" id="detPrice"></div>
                    </header>

                    <div class="details-body">
                        <section class="section">
                            <h3>Descripción</h3>
                            <div class="description-box" id="detDescription"></div>
                        </section>

                        <section class="section" id="detMeasurementsSection" style="display:none;">
                            <h3>Mediciones</h3>
                            <div id="detMeasurements"></div>
                        </section>

                        <section class="section">
                            <h3>Descomposición</h3>
                            <div class="decomposition-table-wrapper">
                                <table class="decomposition-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Factor</th>
                                            <th>Concepto</th>
                                            <th>Precio</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody id="detDecomposition">
                                        <!-- Rows injected by JS -->
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="4" style="text-align:right">Total Partida</td>
                                            <td id="detTotalCost"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
        <footer class="app-footer">
            <span>© Licencia Open Source - Software Libre y de Derechos Abiertos</span>
            <span>V.1 by Jose Manuel Caamaño</span>
        </footer>
    </div>
    <!-- Dashboard Modal -->
    <div id="dashboardModal" class="modal" style="display:none;">
        <div class="modal-content dashboard-modal-content">
            <div class="modal-header">
                <h3>Dashboard del Presupuesto</h3>
                <button type="button" id="closeDashboardBtn" class="close-btn" data-icon-only="x" aria-label="Cerrar dashboard"></button>
            </div>
            <div class="modal-body dashboard-grid">
                <div class="chart-card">
                    <h4>Distribución por Tipo de Coste (Mano de Obra, Materiales, etc)</h4>
                    <div class="chart-container">
                        <canvas id="resourceTypeChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h4>Capítulos Principales por Peso Económico (PEM)</h4>
                    <div class="chart-container">
                        <canvas id="chaptersCostChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Compare Modal -->
    <div id="compareModal" class="modal" style="display:none;">
        <div class="modal-content compare-modal-content">
            <div class="modal-header">
                <h3>Comparador de Presupuestos</h3>
                <button type="button" id="closeCompareBtn" class="close-btn" data-icon-only="x" aria-label="Cerrar comparador"></button>
            </div>
            <div class="modal-body">
                <p>Selecciona un segundo archivo <strong>.bc3</strong> para comparar y detectar desviaciones de precios e importes.</p>
                <div class="compare-upload-area">
                    <input type="file" id="compareFileInput" accept=".bc3" class="compare-file-input">
                    <button type="button" id="runCompareBtn" class="process-btn">Cargar y Comparar</button>
                </div>
                <div id="compareResults" class="compare-results" style="display:none;">
                    <div class="compare-stats">
                        <div class="stat-card">
                            <span class="stat-label">Diferencia Total</span>
                            <span id="compareTotalDiff" class="stat-value">0,00 € (0,00 %)</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Partidas con Cambios</span>
                            <span id="compareModifiedCount" class="stat-value">0</span>
                        </div>
                    </div>
                    <button type="button" id="clearCompareBtn" class="clear-compare-btn">Quitar Comparación</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Planning / Gantt -->
    <div id="planningModal" class="planning-modal-overlay" style="display:none;">
        <div class="planning-modal-content">
            <div class="planning-modal-header">
                <div class="planning-modal-title" data-icon="calendar-days">Planning - Diagrama de Gantt</div>
                <div class="planning-controls">
                    <label>Inicio:
                        <input type="date" id="ganttStartDate" class="gantt-control-input">
                    </label>
                    <label>Semanas:
                        <input type="number" id="ganttWeeks" class="gantt-control-input" value="26" min="4" max="156" style="width:60px;">
                    </label>
                    <button type="button" id="ganttResetBtn" class="gantt-action-btn" data-icon="rotate-ccw">Reiniciar</button>
                    <button type="button" id="exportGanttExcelBtn" class="gantt-action-btn gantt-excel-btn" data-icon="file-spreadsheet">Excel</button>
                    <button type="button" id="exportGanttPdfBtn" class="gantt-action-btn gantt-pdf-btn" data-icon="file-text">PDF</button>
                    <button type="button" id="closePlanningBtn" class="gantt-close-btn" data-icon="x">Cerrar</button>
                </div>
            </div>
            <div id="ganttContainer" class="gantt-container"></div>
        </div>
    </div>

    <div id="dragOverlay" class="drag-overlay" style="display: none;">
        <div class="drag-overlay-box">
            <div class="drag-overlay-icon" data-icon-only="folder-up"></div>
            <div class="drag-overlay-text">Suelte el archivo .bc3 aquí para cargarlo</div>
        </div>
    </div>
    <script src="jspdf.umd.min.js"></script>
    <script src="jspdf.plugin.autotable.min.js"></script>
    <script src="chart.min.js"></script>
    <script src="xlsx.full.min.js"></script>
    <script src="app.js?v=<?php echo filemtime('app.js'); ?>"></script>
</body>

</html>
