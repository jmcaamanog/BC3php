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
            <div class="logo">BC3 VIEWER</div>
            <div class="upload-area">
                <form id="uploadForm">
                    <!-- Contenedor: Carga y Procesado -->
                    <div class="control-container">
                        <label for="bc3file" class="upload-btn">
                            <span id="fileName">SELECCIONAR ARCHIVO .BC3</span>
                            <input type="file" id="bc3file" name="bc3file" accept=".bc3" hidden>
                        </label>
                        <button type="submit" class="process-btn">PROCESA</button>
                    </div>

                    <!-- Contenedor: DASHBOARD -->
                    <div class="control-container" id="dashboardContainer" style="display:none;">
                        <button type="button" id="dashboardBtn" class="dashboard-btn">DASHBOARD</button>
                    </div>

                    <!-- Contenedor: PRESUPUESTO, PRECIOS & PLANNING -->
                    <div class="control-container" id="vizContainer" style="display:none;">
                        <button type="button" id="presupuestoBtn" class="presupuesto-btn active">PRESUPUESTO</button>
                        <button type="button" id="pricesBtn" class="prices-btn">PRECIOS</button>
                        <button type="button" id="planningBtn" class="planning-btn">PLANNING</button>
                    </div>

                    <!-- Contenedor: COEFICIENTES -->
                    <div class="control-container ops-container" id="coeffsContainer" style="display:none;">
                        <button type="button" id="toggleCoeffsBtn" class="coeffs-toggle-btn">COEFICIENTES</button>
                    </div>

                    <!-- Contenedor: COMPARAR -->
                    <div class="control-container" id="compareContainer" style="display:none;">
                        <button type="button" id="compareBtn" class="compare-btn">COMPARAR</button>
                    </div>

                    <!-- Contenedor: GUARDAR & EXPORTAR -->
                    <div class="control-container" id="exportContainer" style="display:none;">
                        <button type="button" id="saveBtn" class="save-btn" style="display:none;">GUARDAR</button>
                        <div class="dropdown" id="exportDropdown">
                            <button type="button" class="export-btn dropdown-toggle">EXPORTAR ▾</button>
                            <div class="dropdown-content">
                                <button type="button" id="exportPdfBtn">EXPORTAR A PDF</button>
                                <button type="button" id="exportExcelBtn">EXPORTAR A EXCEL</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <!-- Contenedor 5: PEM & PEC Widget -->
            <div class="project-info" id="projectInfo" style="display:none;">
                <div class="budget-widget">
                    <div class="budget-card pem-card" id="budgetTotal">
                        <span class="lbl">PEM</span>
                        <span class="val">0,00 €</span>
                    </div>
                    <div class="budget-card pec-card" id="budgetTotalPEC" style="display:none;">
                        <span class="lbl">PEC</span>
                        <span class="val">0,00 €</span>
                    </div>
                </div>
                <div id="stats" style="font-size: 0.7em; color: #888; margin-top: 4px; text-align: center;"></div>
            </div>

            <!-- Botones de la derecha: Tema e Info -->
            <div class="right-controls">
                <button type="button" id="themeToggle" class="theme-toggle-btn" aria-label="Cambiar tema">🌙</button>
                <button type="button" id="infoBtn" class="info-btn" aria-label="Información">ℹ️</button>
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
                <!-- Welcome / Empty State Card -->
                <div class="empty-state" style="padding: 24px; font-style: normal; text-align: left; display: flex; flex-direction: column; justify-content: center; max-width: 680px; margin: 0 auto; height: 100%; box-sizing: border-box;">
                    <div style="background-color: var(--hover-bg, rgba(59, 130, 246, 0.03)); border: 1px solid var(--border-color); border-radius: 12px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 16px; width: 100%;">
                        <!-- Animated Construction Scene (SVG + CSS Keyframes) -->
                        <div class="construction-animation-container" style="display: flex; justify-content: center; height: 95px; width: 100%; position: relative; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 4px;">
                            <svg width="240" height="85" viewBox="0 0 240 85" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
                                <!-- Ground line -->
                                <line x1="0" y1="75" x2="240" y2="75" stroke="var(--text-secondary, #6b7280)" stroke-width="1.5" />
                                
                                <!-- Building structure under construction -->
                                <g class="building-struct" style="opacity: 0.8;">
                                    <!-- Scaffold grids -->
                                    <line x1="15" y1="75" x2="15" y2="30" stroke="var(--text-muted, #9ca3af)" stroke-width="1" stroke-dasharray="1 1" />
                                    <line x1="35" y1="75" x2="35" y2="30" stroke="var(--text-muted, #9ca3af)" stroke-width="1" stroke-dasharray="1 1" />
                                    <line x1="55" y1="75" x2="55" y2="30" stroke="var(--text-muted, #9ca3af)" stroke-width="1" stroke-dasharray="1 1" />
                                    <line x1="15" y1="52" x2="55" y2="52" stroke="var(--text-muted, #9ca3af)" stroke-width="1" stroke-dasharray="1 1" />
                                    <line x1="15" y1="30" x2="55" y2="30" stroke="var(--text-muted, #9ca3af)" stroke-width="1" stroke-dasharray="1 1" />
                                    
                                    <!-- Finished concrete bricks -->
                                    <rect x="17" y="54" width="16" height="20" fill="var(--accent-glow, rgba(59, 130, 246, 0.15))" stroke="var(--accent, #3b82f6)" stroke-width="1.5" />
                                    <rect x="35" y="54" width="18" height="20" fill="var(--accent-glow, rgba(59, 130, 246, 0.15))" stroke="var(--accent, #3b82f6)" stroke-width="1.5" />
                                    <rect x="25" y="32" width="18" height="20" fill="none" stroke="var(--text-secondary, #6b7280)" stroke-width="1" stroke-dasharray="2 2" />
                                </g>
                                
                                <!-- Tower Crane -->
                                <g class="crane">
                                    <!-- Mast base -->
                                    <path d="M 125 75 L 130 55 L 135 75 Z" fill="none" stroke="var(--text-secondary, #6b7280)" stroke-width="1.5" />
                                    <!-- Vertical Mast -->
                                    <line x1="130" y1="55" x2="130" y2="15" stroke="var(--text-secondary, #6b7280)" stroke-width="2" />
                                    <!-- Cabin -->
                                    <rect x="127" y="11" width="6" height="6" fill="var(--accent, #3b82f6)" rx="1" />
                                    
                                    <!-- Jib system -->
                                    <g class="jib" style="transform-origin: 130px 15px; animation: jib-swing 8s ease-in-out infinite;">
                                        <!-- Counter jib + weight -->
                                        <line x1="130" y1="15" x2="105" y2="15" stroke="var(--text-secondary, #6b7280)" stroke-width="1.5" />
                                        <rect x="109" y="12" width="8" height="5" fill="#f43f5e" rx="0.5" />
                                        <!-- Main Jib -->
                                        <line x1="130" y1="15" x2="185" y2="15" stroke="var(--text-secondary, #6b7280)" stroke-width="1.5" />
                                        
                                        <!-- Trolley + Cable + Hook Block -->
                                        <g class="trolley" style="animation: trolley-move 8s ease-in-out infinite;">
                                            <rect x="150" y="13" width="7" height="3" fill="var(--text-primary, #1f2937)" rx="0.5" />
                                            <!-- Hoist cable -->
                                            <line x1="153.5" y1="16" x2="153.5" y2="35" stroke="var(--text-primary, #1f2937)" stroke-width="0.8" class="cable" style="animation: cable-hoist 8s ease-in-out infinite;" />
                                            <!-- Hook load (Concrete bucket) -->
                                            <g class="lifting-block" style="animation: load-hoist 8s ease-in-out infinite;">
                                                <!-- Bucket trapezoid -->
                                                <polygon points="149,35 158,35 156,47 151,47" fill="var(--accent-glow, rgba(59, 130, 246, 0.2))" stroke="var(--accent, #3b82f6)" stroke-width="1.2" />
                                                <line x1="151.5" y1="41" x2="155.5" y2="41" stroke="var(--accent, #3b82f6)" stroke-width="1" />
                                            </g>
                                        </g>
                                    </g>
                                </g>
                                
                                <!-- Concrete Truck driving across -->
                                <g class="truck" style="animation: truck-drive 14s linear infinite;">
                                    <!-- Cab -->
                                    <rect x="22" y="52" width="10" height="10" fill="var(--accent, #3b82f6)" rx="1" />
                                    <!-- Mixer drum -->
                                    <path d="M 3 53 L 20 53 L 20 65 L 3 65 Z" fill="var(--text-secondary, #6b7280)" />
                                    <ellipse cx="3" cy="59" rx="2" ry="6" fill="#f59e0b" />
                                    <!-- Chassis -->
                                    <rect x="0" y="60" width="31" height="9" fill="var(--text-muted, #9ca3af)" rx="0.5" />
                                    <!-- Wheels -->
                                    <circle cx="6" cy="69" r="4" fill="#111827" stroke="var(--bg-color)" stroke-width="0.8" />
                                    <circle cx="25" cy="69" r="4" fill="#111827" stroke="var(--bg-color)" stroke-width="0.8" />
                                </g>
                            </svg>
                        </div>

                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                            <div style="font-size: 1.8rem;">🏢</div>
                            <div>
                                <h2 style="margin: 0; font-size: 1.25rem; color: var(--accent, #3b82f6); font-weight: 600;">BC3 Viewer Premium</h2>
                                <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Visualizador & Editor FIEBDC-3 de Código Abierto</span>
                            </div>
                        </div>

                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--text-primary);">
                            ¡Bienvenido al visualizador y editor interactivo de presupuestos <strong>FIEBDC-3 (.bc3)</strong> de referencia para profesionales y Arquitectos Técnicos! Una aplicación ligera, rápida y local para optimizar tu trabajo diario.
                        </p>

                        <div style="margin: 2px 0;">
                            <h4 style="margin: 0 0 6px 0; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary);">¿Qué puedes hacer con esta versión?</h4>
                            <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8rem; line-height: 1.5; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px;">
                                <li>🌳 Exploración y edición inline en árbol</li>
                                <li>📊 Dashboard interactivo con KPIs</li>
                                <li>📅 Planning Gantt con ruta crítica y HOY</li>
                                <li>📈 Curva S de avance acumulado</li>
                                <li>🔗 Enlazar tareas y propagar retrasos</li>
                                <li>➕ Crear nuevas partidas en caliente</li>
                                <li>📝 Visualización de mediciones detalladas</li>
                                <li>📥 Guardar BC3 y exportar a Excel y PDF</li>
                            </ul>
                        </div>

                        <div style="background-color: rgba(59, 130, 246, 0.04); border-left: 4px solid var(--accent, #3b82f6); padding: 12px; border-radius: 0 8px 8px 0; font-size: 0.78rem; line-height: 1.4; color: var(--text-secondary);">
                            <strong>🛠️ Herramienta en Desarrollo Activo:</strong> Este proyecto es de código abierto. Si tienes sugerencias, has detectado algún bug o deseas proponer mejoras, ponte en contacto con el creador original <strong>Rafael Roa</strong> (a través de <a href="https://www.linkedin.com/in/rafaroa/" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:600;">LinkedIn</a>, su web <a href="https://www.rafarq.com" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:600;">www.rafarq.com</a> o su <a href="https://rafarq.com/podcast" target="_blank" style="color:var(--accent); text-decoration:none; font-weight:600;">Podcast de Arquitectura</a>).
                        </div>

                        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-primary); font-weight: 500; margin-top: 4px; justify-content: center; background: var(--bg-hover); padding: 10px; border-radius: 8px; border: 1px dashed var(--border-color);">
                            <span>👉</span>
                            <span>Arrastra un archivo <strong>.bc3</strong> aquí o haz clic en <strong>"SELECCIONAR ARCHIVO .BC3"</strong> arriba para comenzar</span>
                        </div>
                    </div>
                </div>
                <div class="search-bar-container">
                    <input type="text" id="searchTerm" placeholder="Buscar partidas (título, código, medición...)"
                        autocomplete="off">
                </div>
                
                <!-- Barra de Filtros Avanzados -->
                <div class="filter-bar" style="display:none;" id="filterBar">
                    <div class="filter-group">
                        <button type="button" id="expandAllBtn" class="filter-btn">Expandir Todo</button>
                        <button type="button" id="collapseAllBtn" class="filter-btn">Contraer Todo</button>
                        <button type="button" id="undoBtn" class="filter-btn" disabled title="Deshacer (Ctrl+Z)">↩ Deshacer</button>
                        <button type="button" id="redoBtn" class="filter-btn" disabled title="Rehacer (Ctrl+Y)">↪ Rehacer</button>
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

                        <!-- Contenedor para añadir nueva partida -->
                        <div id="addPartidaContainer" style="display:none; margin-bottom: 16px;">
                            <button type="button" id="addPartidaBtn" class="add-partida-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border: none; border-radius: 8px; background-color: var(--accent, #3b82f6); color: white; font-weight: 500; cursor: pointer; transition: background-color 0.2s;">
                                ➕ Añadir Partida a este Capítulo
                            </button>
                        </div>

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

            <!-- Banco de Precios Unitarios View -->
            <div class="prices-panel" id="pricesPanel" style="display:none;">
                <div class="prices-header-box">
                    <h2>Banco de Precios Unitarios</h2>
                    
                    <div class="prices-actions">
                        <div class="prices-search-container">
                            <input type="text" id="pricesSearch" placeholder="Buscar por código o concepto..." autocomplete="off">
                        </div>
                        
                        <div class="prices-tabs">
                            <button type="button" class="tab-btn active" data-filter="all">TODOS</button>
                            <button type="button" class="tab-btn" data-filter="partida">PARTIDAS</button>
                            <button type="button" class="tab-btn" data-filter="partida_new">NUEVAS PARTIDAS</button>
                            <button type="button" class="tab-btn" data-filter="mo">MANO DE OBRA</button>
                            <button type="button" class="tab-btn" data-filter="mat">MATERIALES</button>
                            <button type="button" class="tab-btn" data-filter="maq">MAQUINARIA</button>
                        </div>
                    </div>
                </div>

                <div class="prices-table-container">
                    <table class="prices-table">
                        <thead>
                            <tr>
                                <th style="width: 140px;">Código</th>
                                <th style="width: 130px;">Tipo</th>
                                <th style="width: 60px;">Ud</th>
                                <th>Concepto (Resumen)</th>
                                <th style="width: 110px; text-align: center;">Uso</th>
                                <th style="width: 150px; text-align: right;">Precio Unitario</th>
                                <th style="width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody id="pricesTableBody">
                            <!-- Rows injected by JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
        <footer class="app-footer">
            <span>© Licencia Open Source - Software Libre y de Derechos Abiertos</span>
            <span>V1.0.0</span>
        </footer>
    </div>
    <!-- Dashboard Modal -->
    <div id="dashboardModal" class="modal" style="display:none;">
        <div class="modal-content dashboard-modal-content">
            <div class="modal-header">
                <h3>📊 Dashboard Técnico del Presupuesto</h3>
                <button type="button" id="closeDashboardBtn" class="close-btn">&times;</button>
            </div>
            <!-- KPI Strip -->
            <div class="db-kpi-strip" id="dbKpiStrip"></div>
            <!-- Charts Grid -->
            <div class="modal-body dashboard-grid">
                <div class="chart-card">
                    <h4>Distribución de Costes por Tipo de Recurso</h4>
                    <div class="chart-container">
                        <canvas id="resourceTypeChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h4>Top Capítulos por Peso Económico (€)</h4>
                    <div class="chart-container">
                        <canvas id="chaptersCostChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h4>Desglose MO / MAQ / MAT por Capítulo</h4>
                    <div class="chart-container">
                        <canvas id="chapterBreakdownChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h4>Precio Medio y Precio Máximo por Capítulo</h4>
                    <div class="chart-container">
                        <canvas id="priceAvgMaxChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h4>Distribución de Partidas por Rango de Precio</h4>
                    <div class="chart-container">
                        <canvas id="priceRangeChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h4>% Peso Económico por Capítulo (Treemap)</h4>
                    <div class="chart-container">
                        <canvas id="weightPieChart"></canvas>
                    </div>
                </div>
                <div class="chart-card chart-card--full">
                    <h4>📈 Curva S — Avance Económico Acumulado (Planificado vs. Ejecutado)</h4>
                    <div class="chart-container" style="height:220px;">
                        <canvas id="sCurveChart"></canvas>
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
                <button type="button" id="closeCompareBtn" class="close-btn">&times;</button>
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
                <div class="planning-modal-title">🗓 Planning — Diagrama de Gantt</div>
                <div class="planning-controls">
                    <label>Inicio:
                        <input type="date" id="ganttStartDate" class="gantt-control-input">
                    </label>
                    <label>Semanas:
                        <input type="number" id="ganttWeeks" class="gantt-control-input" value="26" min="4" max="156" style="width:60px;">
                    </label>

                    <!-- Botones de Escala (Días, Semanas, Meses) -->
                    <div class="gantt-mode-group">
                        <button type="button" id="ganttModeDaysBtn" class="gantt-mode-btn">Días</button>
                        <button type="button" id="ganttModeWeeksBtn" class="gantt-mode-btn active">Semanas</button>
                        <button type="button" id="ganttModeMonthsBtn" class="gantt-mode-btn">Meses</button>
                    </div>

                    <!-- Control de Zoom (Ancho de Celda) -->
                    <div class="gantt-zoom-group">
                        <span>🔍 Zoom:</span>
                        <input type="range" id="ganttZoom" min="20" max="150" value="44" style="width: 80px; vertical-align: middle;">
                    </div>

                    <button type="button" id="ganttLinkBtn" class="gantt-action-btn gantt-link-btn" title="Enlazar tareas (dependencia Fin→Inicio)">🔗 Enlazar</button>
                    <button type="button" id="ganttResetBtn" class="gantt-action-btn">↺ Reiniciar</button>
                    <button type="button" id="exportGanttExcelBtn" class="gantt-action-btn gantt-excel-btn">⬇ Excel</button>
                    <button type="button" id="exportGanttPdfBtn" class="gantt-action-btn gantt-pdf-btn">⬇ PDF</button>
                    <button type="button" id="closePlanningBtn" class="gantt-close-btn">✕ Cerrar</button>
                </div>
            </div>
            <div class="gantt-summary-bar" id="ganttSummaryBar"></div>
            <div id="ganttContainer" class="gantt-container"></div>
        </div>
    </div>

    <!-- Info Modal -->
    <div id="infoModal" class="modal" style="display:none;">
        <div class="modal-content info-modal-content">
            <div class="modal-header">
                <h3>Información del Visualizador BC3</h3>
                <button type="button" id="closeInfoBtn" class="close-btn">&times;</button>
            </div>
            <div class="modal-body" style="line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 1.2rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.25rem;">ℹ️</div>
                    <h4 style="font-size: 1.2rem; margin: 0; color: var(--accent);">Visualizador BC3 Premium</h4>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">Versión 1.1.0</span>
                </div>
                
                <p style="font-size: 0.85rem; margin-bottom: 1rem;">Esta herramienta permite la importación, visualización y análisis interactivo de presupuestos en formato <strong>Standard FIEBDC-3 (.bc3)</strong>.</p>
                
                <div style="background-color: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; margin-bottom: 1rem;">
                    <h5 style="margin-top: 0; margin-bottom: 0.4rem; font-size: 0.85rem;">Características Principales:</h5>
                    <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8rem; color: var(--text-secondary);">
                        <li>Navegación jerárquica en árbol de capítulos y partidas.</li>
                        <li>Dashboard con gráficos dinámicos de distribución de costes.</li>
                        <li>Diagrama de Gantt interactivo para la planificación temporal.</li>
                        <li>Ajuste de presupuesto mediante coeficientes globales (PEM a PEC).</li>
                        <li>Exportación completa a formatos Excel y PDF.</li>
                        <li>Comparador avanzado entre versiones de presupuestos.</li>
                    </ul>
                </div>

                <!-- Historial de Versiones (desplegable) -->
                <details class="version-history-details" style="margin-top: 1.2rem;">
                    <summary>Historial de Versiones</summary>
                    <div class="version-history-body">
                        <!-- Versión 1.1.0 -->
                        <div style="margin-bottom: 1rem; border-left: 3px solid var(--accent); padding-left: 8px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary);">
                                <span>V1.1.0 (Actual)</span>
                                <span>03/07/2026</span>
                             </div>
                             <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 4px;">Autor: Jose Manuel Caamaño</div>
                             <ul style="margin: 0; padding-left: 1rem; color: var(--text-secondary); font-size: 0.75rem;">
                                 <li>Editor interactivo de nuevas partidas integrado en la cabecera de la columna CÓDIGO.</li>
                                 <li>Control jerárquico del borrador de partidas mediante botonera de dirección (▲/▼/◀/▶).</li>
                                 <li>Validaciones visuales con resalte rojo e importes calculados en tiempo real.</li>
                                 <li>Enlaces y dependencias Gantt Fin→Inicio con propagación de retrasos en cascada.</li>
                                 <li>Eliminación rápida de dependencias con botón × en el centro de las flechas.</li>
                                 <li>Buscador Global Inteligente en el árbol (Ctrl+F) con resaltado y navegación.</li>
                                 <li>Curva S de Avance Económico Acumulado (Planificado vs. Real) en el Dashboard.</li>
                             </ul>
                        </div>
                        <!-- Versión 1.0.0 -->
                        <div style="margin-bottom: 1rem; border-left: 3px solid var(--border-color); padding-left: 8px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary);">
                                <span>V1.0.0</span>
                                <span>03/07/2026</span>
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 4px;">Autor: Jose Manuel Caamaño</div>
                            <ul style="margin: 0; padding-left: 1rem; color: var(--text-secondary); font-size: 0.75rem;">
                                <li>Reorganización de la cabecera en grupos de control.</li>
                                <li>Rediseño visual completo de tarjetas PEM y PEC.</li>
                                <li>Integración de tema claro/oscuro e información a la derecha.</li>
                                <li>Dashboard técnico con 6 gráficas y KPI strip para AT.</li>
                                <li>Planning Gantt con ruta crítica, línea de hoy y avance.</li>
                                <li>Arrastre libre de tareas con recálculo automático de capítulos.</li>
                            </ul>
                        </div>
                        <!-- Versión 0.1.0 -->
                        <div style="margin-bottom: 0.5rem; border-left: 3px solid var(--border-color); padding-left: 8px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary);">
                                <span>V0.1.0 (Inicial)</span>
                                <span>10/12/2025</span>
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 4px;">Autor: Jose Manuel Caamaño</div>
                            <ul style="margin: 0; padding-left: 1rem; color: var(--text-secondary); font-size: 0.75rem;">
                                <li>Lanzamiento del visualizador jerárquico FIEBDC-3.</li>
                                <li>Columnas de árbol unificadas y buscador.</li>
                                <li>Tabla de mediciones y descripción inline.</li>
                            </ul>
                        </div>
                    </div>
                </details>

                <p style="font-size: 0.75rem; color: var(--text-secondary); text-align: center; margin-top: 1.2rem; margin-bottom: 0; border-top: 1px solid var(--border-color); padding-top: 8px;">
                    © Licencia Open Source - Software Libre y de Derechos Abiertos
                </p>
            </div>
        </div>
    </div>

    <!-- Usage Modal (Dónde se usa) -->
    <div id="usageModal" class="modal" style="display:none;">
        <div class="modal-content info-modal-content" style="max-width: 500px;">
            <header class="modal-header">
                <h3>Impacto de Precios: ¿Dónde se usa?</h3>
                <button type="button" id="closeUsageBtn" class="close-btn">&times;</button>
            </header>
            <div class="modal-body" id="usageModalBody" style="max-height: 350px; overflow-y: auto; padding: 16px;">
                <!-- Populated by JS -->
            </div>
        </div>
    </div>

    <!-- Add Partida Modal -->
    <div id="addPartidaModal" class="modal" style="display:none;">
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <h3>➕ Añadir Nueva Partida</h3>
                <button type="button" class="close-btn" id="closeAddPartidaBtn">✕</button>
            </div>
            <div class="modal-body" style="padding: 16px;">
                <form id="addPartidaForm" onsubmit="event.preventDefault();">
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; margin-bottom: 4px; font-weight:500;">Capítulo de destino:</label>
                        <input type="text" id="addPartidaParentDisplay" readonly style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; background-color:var(--bg-hover); color:var(--text-secondary); outline:none;">
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; margin-bottom: 4px; font-weight:500;">Resumen / Concepto: <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="addPartidaSummary" required placeholder="Ej: Excavación de zanjas en terreno semiduro" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; background-color:var(--bg-color); color:var(--text-primary); outline:none;" autocomplete="off">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom: 16px;">
                        <div>
                            <label style="display:block; margin-bottom: 4px; font-weight:500;">Cantidad: <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="addPartidaQty" required step="any" min="0" placeholder="10.00" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; background-color:var(--bg-color); color:var(--text-primary); outline:none;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom: 4px; font-weight:500;">Precio (€): <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="addPartidaPrice" required step="any" min="0" placeholder="25.50" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; background-color:var(--bg-color); color:var(--text-primary); outline:none;">
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                        <button type="button" id="cancelAddPartidaBtn" class="gantt-action-btn" style="background:none; border:1px solid var(--border-color); color:var(--text-secondary); padding: 8px 16px;">Cancelar</button>
                        <button type="submit" id="submitAddPartidaBtn" class="process-btn" style="padding: 8px 16px; margin: 0;">Aceptar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="dragOverlay" class="drag-overlay" style="display: none;">
        <div class="drag-overlay-box">
            <div class="drag-overlay-icon">📁</div>
            <div class="drag-overlay-text">Suelte el archivo .bc3 aquí para cargarlo</div>
        </div>
    </div>
    <!-- Barra de Búsqueda Global (Ctrl+F) -->
    <div id="globalSearchBar" class="global-search-bar" style="display:none;" role="search" aria-label="Búsqueda global">
        <input type="text" id="globalSearchInput" class="global-search-input" placeholder="Buscar en el presupuesto…" autocomplete="off">
        <span id="globalSearchCount" class="global-search-count">0 resultados</span>
        <button type="button" id="globalSearchPrev" class="global-search-nav" title="Anterior (Shift+Enter)">▲</button>
        <button type="button" id="globalSearchNext" class="global-search-nav" title="Siguiente (Enter)">▼</button>
        <button type="button" id="globalSearchClose" class="global-search-close" title="Cerrar (Esc)">✕</button>
    </div>

    <script src="jspdf.umd.min.js"></script>
    <script src="jspdf.plugin.autotable.min.js"></script>
    <script src="chart.min.js"></script>
    <script src="xlsx.full.min.js"></script>
    <script src="app.js?v=<?php echo filemtime('app.js'); ?>"></script>
</body>

</html>