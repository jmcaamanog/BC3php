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
            <div class="left-header-section" style="display:flex; align-items:center; gap:16px;">
                <div class="logo">BC3 VIEWER</div>
                <!-- Contenedor PEM & PEC Widget (ahora segundo, a la derecha del nombre) -->
                <div class="project-info" id="projectInfo" style="display:none; flex-direction:column; align-items:flex-start;">
                    <div class="budget-widget" style="margin:0;">
                        <div class="budget-card pem-card" id="budgetTotal">
                            <span class="lbl">PEM</span>
                            <span class="val">0,00 €</span>
                        </div>
                        <div class="budget-card pec-card" id="budgetTotalPEC" style="display:none;">
                            <span class="lbl">PEC</span>
                            <span class="val">0,00 €</span>
                        </div>
                    </div>
                    <div id="stats" style="font-size: 0.68rem; color: #888; margin-top: 2px;"></div>
                </div>
            </div>

            <div class="upload-area">
                <form id="uploadForm">
                    <!-- Grupo 1: Carga y Procesado -->
                    <div class="control-container" id="uploadGroup">
                        <label for="bc3file" class="upload-btn">
                            <span id="fileName">SELECCIONAR ARCHIVO .BC3</span>
                            <input type="file" id="bc3file" name="bc3file" accept=".bc3" hidden>
                        </label>
                        <button type="submit" class="process-btn">PROCESA</button>
                    </div>

                    <!-- Grupo 2: Vistas Principales (Segmented Control) -->
                    <div class="control-container segmented-control" id="viewsGroup" style="display:none;">
                        <button type="button" id="presupuestoBtn" class="nav-tab active">🌳 PRESUPUESTO</button>
                        <button type="button" id="pricesBtn" class="nav-tab">🏷️ PRECIOS</button>
                    </div>

                    <!-- Grupo 3: Herramientas Auxiliares -->
                    <div class="control-container tools-group" id="toolsGroup" style="display:none;">
                        <button type="button" id="dashboardBtn" class="tool-btn">📊 DASHBOARD</button>
                        <button type="button" id="planningBtn" class="tool-btn">📅 PLANNING</button>
                        <button type="button" id="certObrasBtn" class="tool-btn">🏗️ CERTIF.</button>
                        <button type="button" id="compareBtn" class="tool-btn">🔍 COMPARAR</button>
                    </div>

                    <!-- Grupo 4: Guardar y Exportar -->
                    <div class="control-container export-group" id="exportGroup" style="display:none;">
                        <button type="button" id="saveBtn" class="save-btn" style="display:none;">💾 GUARDAR</button>
                        <div class="dropdown" id="exportDropdown">
                            <button type="button" class="export-btn dropdown-toggle">📤 EXPORTAR ▾</button>
                            <div class="dropdown-content">
                                <button type="button" id="exportPdfBtn">📄 EXPORTAR A PDF</button>
                                <button type="button" id="exportExcelBtn">📊 EXPORTAR A EXCEL</button>
                                <button type="button" id="exportBc3Btn" style="color: #059669; font-weight: 600;">⬇ GUARDAR COMO BC3</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Botones del extremo derecho: Menú Ajustes (Engranaje) -->
            <div class="right-controls">
                <div class="dropdown" id="settingsDropdown">
                    <button type="button" class="settings-toggle-btn" id="settingsBtn" aria-label="Ajustes" title="Ajustes">⚙️</button>
                    <div class="dropdown-content dropdown-content-right" style="right: 0; left: auto; min-width: 160px;">
                        <button type="button" id="toggleCoeffsBtn" style="display:none; justify-content:flex-start; gap:8px; width:100%; border:none; background:none; text-align:left; padding:8px 12px; cursor:pointer;"><span style="font-size:1rem;">⚙️</span> Coeficientes</button>
                        <button type="button" id="auditLogBtn" style="display:none; justify-content:flex-start; gap:8px; width:100%; border:none; background:none; text-align:left; padding:8px 12px; cursor:pointer;"><span style="font-size:1rem;">📜</span> Auditoría</button>
                        <button type="button" id="themeToggle" style="display:flex; justify-content:flex-start; gap:8px; width:100%; border:none; background:none; text-align:left; padding:8px 12px; cursor:pointer;"><span id="themeToggleIcon" style="font-size:1rem;">🌙</span> Tema Visual</button>
                        <button type="button" id="infoBtn" style="display:flex; justify-content:flex-start; gap:8px; width:100%; border:none; background:none; text-align:left; padding:8px 12px; cursor:pointer;"><span style="font-size:1rem;">ℹ️</span> Información</button>
                    </div>
                </div>
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

                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 0.8rem; color: var(--text-primary); font-weight: 500; margin-top: 4px; justify-content: center; background: var(--bg-hover); padding: 16px; border-radius: 8px; border: 1px dashed var(--border-color);">
                            <span>👉 Arrastra un archivo <strong>.bc3</strong> aquí, o haz clic en el botón de abajo para buscar:</span>
                            
                            <label for="bc3file" class="welcome-load-btn">
                                🚀 CARGAR ARCHIVO .BC3
                            </label>
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

                        <!-- Certificaciones Mensuales de Obra -->
                        <section class="section" id="detCertificationsSection" style="display:none; margin-top: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <h3 style="margin: 0;">Certificaciones de Obra</h3>
                                <button type="button" id="addCertificationBtn" class="gantt-action-btn" style="padding: 4px 10px; font-size: 0.8rem; margin: 0; background: var(--accent, #3b82f6); color: white; border: none;">➕ Certificar</button>
                            </div>
                            
                            <!-- KPIs Certificación -->
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px;">
                                <div style="background: var(--hover-bg, var(--bg-hover)); border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; text-align: center;">
                                    <span style="display: block; font-size: 0.72rem; color: var(--text-secondary);">Certificado Acum.</span>
                                    <span id="certTotalQty" style="font-size: 0.95rem; font-weight: bold; color: var(--text-primary);">0,00</span>
                                </div>
                                <div style="background: var(--hover-bg, var(--bg-hover)); border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; text-align: center;">
                                    <span style="display: block; font-size: 0.72rem; color: var(--text-secondary);">% Certificado</span>
                                    <span id="certPercentage" style="font-size: 0.95rem; font-weight: bold; color: var(--text-primary);">0,0%</span>
                                </div>
                                <div style="background: var(--hover-bg, var(--bg-hover)); border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; text-align: center;">
                                    <span style="display: block; font-size: 0.72rem; color: var(--text-secondary);">Importe Cert.</span>
                                    <span id="certTotalAmount" style="font-size: 0.95rem; font-weight: bold; color: var(--text-primary);">0,00 €</span>
                                </div>
                            </div>

                            <div style="border: 1px solid var(--border-color); border-radius: 6px; max-height: 180px; overflow-y: auto;">
                                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
                                    <thead>
                                        <tr style="background: var(--hover-bg, var(--bg-hover)); border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-weight: 600;">
                                            <th style="padding: 8px;">Mes</th>
                                            <th style="padding: 8px; text-align: right;">Cantidad</th>
                                            <th style="padding: 8px; text-align: right;">Importe</th>
                                            <th style="padding: 8px; width: 40px; text-align: center;"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="certTableBody">
                                        <!-- Injected by JS -->
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <!-- Modal para Añadir/Editar Certificación -->
                        <div id="certEditModal" class="modal" style="display:none; z-index: 10001;">
                            <div class="modal-content" style="max-width: 320px;">
                                <div class="modal-header">
                                    <h3>Añadir Certificación</h3>
                                    <button type="button" class="close-btn" id="closeCertEditBtn">✕</button>
                                </div>
                                <div class="modal-body" style="padding: 16px;">
                                    <form id="certEditForm" onsubmit="event.preventDefault();">
                                        <div style="margin-bottom: 12px;">
                                            <label style="display:block; margin-bottom: 4px; font-weight:500;">Mes de Certificación:</label>
                                            <select id="certMonthSelect" class="filter-select" style="width: 100%; padding: 6px; background: var(--bg-color); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px;">
                                                <option value="Mes 1">Mes 1</option>
                                                <option value="Mes 2">Mes 2</option>
                                                <option value="Mes 3">Mes 3</option>
                                                <option value="Mes 4">Mes 4</option>
                                                <option value="Mes 5">Mes 5</option>
                                                <option value="Mes 6">Mes 6</option>
                                                <option value="Mes 7">Mes 7</option>
                                                <option value="Mes 8">Mes 8</option>
                                                <option value="Mes 9">Mes 9</option>
                                                <option value="Mes 10">Mes 10</option>
                                                <option value="Mes 11">Mes 11</option>
                                                <option value="Mes 12">Mes 12</option>
                                            </select>
                                        </div>
                                        <div style="margin-bottom: 16px;">
                                            <label style="display:block; margin-bottom: 4px; font-weight:500;">Cantidad a Certificar: <span style="color:#ef4444;">*</span></label>
                                            <input type="number" id="certQtyInput" required step="any" min="0" placeholder="0.00" style="width:100%; padding:8px; border:1px solid var(--border-color); border-radius:6px; background-color:var(--bg-color); color:var(--text-primary); outline:none;">
                                            <span style="font-size:0.72rem; color:var(--text-secondary); display:block; margin-top:4px;" id="certMaxQtyHint">Cant. disponible: 0.00</span>
                                        </div>
                                        <div style="display:flex; justify-content:flex-end; gap:8px;">
                                            <button type="button" id="cancelCertEditBtn" class="gantt-action-btn" style="background:none; border:1px solid var(--border-color); color:var(--text-secondary); padding: 6px 12px;">Cancelar</button>
                                            <button type="submit" id="submitCertBtn" class="process-btn" style="padding: 6px 16px; margin: 0;">Aceptar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

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
            <span>&#169; Licencia Open Source - Software Libre y de Derechos Abiertos</span>
            <span>V1.3.0</span>
        </footer>
    </div>
    <!-- Dashboard Modal -->
    <div id="dashboardModal" class="modal" style="display:none;">
        <div class="modal-content dashboard-modal-content">
            <div class="modal-header">
                <h3>📊 Dashboard Técnico del Presupuesto</h3>
                <button type="button" id="closeDashboardBtn" class="close-btn">✕</button>
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

    <!-- Modal Certificaciones de Obra (Resumen Global) -->
    <div id="certObrasModal" class="modal" style="display:none;">
        <div class="modal-content" style="max-width: 900px; width: 95%; max-height: 92vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3>🏗️ Certificaciones de Obra — Resumen Global</h3>
                <div style="display:flex; align-items:center; gap:10px;">
                    <select id="certObrasMonthPdfSelect"
                        style="padding:5px 8px; border:1px solid var(--border-color); border-radius:6px; font-size:0.78rem; background:var(--bg-color); color:var(--text-primary); outline:none;">
                        <option value="all">Todos los meses</option>
                        <option value="Mes 1">Mes 1</option>
                        <option value="Mes 2">Mes 2</option>
                        <option value="Mes 3">Mes 3</option>
                        <option value="Mes 4">Mes 4</option>
                        <option value="Mes 5">Mes 5</option>
                        <option value="Mes 6">Mes 6</option>
                        <option value="Mes 7">Mes 7</option>
                        <option value="Mes 8">Mes 8</option>
                        <option value="Mes 9">Mes 9</option>
                        <option value="Mes 10">Mes 10</option>
                        <option value="Mes 11">Mes 11</option>
                        <option value="Mes 12">Mes 12</option>
                    </select>
                    <button type="button" id="exportCertPdfBtn"
                        style="padding:5px 12px; background:linear-gradient(135deg,#7c3aed,#8b5cf6); color:white; border:none; border-radius:6px; font-size:0.78rem; font-weight:600; cursor:pointer; white-space:nowrap;">
                        📄 Exportar PDF
                    </button>
                    <button type="button" id="closeCertObrasBtn" class="close-btn">&times;</button>
                </div>
            </div>

            <!-- Panel: Añadir nueva certificación (siempre visible arriba) -->
            <div id="certObrasAddPanel" style="padding: 14px 20px; border-bottom: 2px solid var(--accent, #3b82f6); background: linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.04));">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <span style="font-size: 1rem;">➕</span>
                    <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">Nueva Certificación</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 4px;">Busca una partida, indica el mes y la cantidad</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 110px 130px auto; gap: 8px; align-items: end;">
                    <!-- Buscador de partida -->
                    <div>
                        <label style="display: block; font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">Partida</label>
                        <div style="position: relative;">
                            <input type="text" id="certObrasSearchInput" placeholder="Buscar por código o descripción..."
                                autocomplete="off"
                                style="width: 100%; padding: 7px 10px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.82rem; background: var(--bg-color); color: var(--text-primary); outline: none; box-sizing: border-box;">
                            <div id="certObrasDropdown" style="display:none; position: absolute; top: 100%; left: 0; right: 0; max-height: 200px; overflow-y: auto; background: var(--bg-color); border: 1px solid var(--border-color); border-top: none; border-radius: 0 0 6px 6px; z-index: 100; box-shadow: 0 8px 20px rgba(0,0,0,0.12);"></div>
                        </div>
                        <div id="certObrasSelectedPartida" style="display:none; font-size: 0.75rem; color: #10b981; margin-top: 3px; font-weight: 600;"></div>
                    </div>
                    <!-- Mes -->
                    <div>
                        <label style="display: block; font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">Mes</label>
                        <select id="certObrasMonthSelect" style="width: 100%; padding: 7px 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.82rem; background: var(--bg-color); color: var(--text-primary); outline: none;">
                            <option value="Mes 1">Mes 1</option>
                            <option value="Mes 2">Mes 2</option>
                            <option value="Mes 3">Mes 3</option>
                            <option value="Mes 4">Mes 4</option>
                            <option value="Mes 5">Mes 5</option>
                            <option value="Mes 6">Mes 6</option>
                            <option value="Mes 7">Mes 7</option>
                            <option value="Mes 8">Mes 8</option>
                            <option value="Mes 9">Mes 9</option>
                            <option value="Mes 10">Mes 10</option>
                            <option value="Mes 11">Mes 11</option>
                            <option value="Mes 12">Mes 12</option>
                        </select>
                    </div>
                    <!-- Cantidad -->
                    <div>
                        <label style="display: block; font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px;">
                            Cantidad <span id="certObrasUnitLabel" style="color: var(--accent); font-style: italic;"></span>
                        </label>
                        <input type="number" id="certObrasQtyInput" placeholder="0.00" step="any" min="0"
                            style="width: 100%; padding: 7px 10px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.82rem; background: var(--bg-color); color: var(--text-primary); outline: none; text-align: right; box-sizing: border-box;">
                        <div id="certObrasQtyHint" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;"></div>
                    </div>
                    <!-- Botón Añadir -->
                    <div>
                        <button type="button" id="certObrasAddBtn"
                            style="padding: 7px 16px; background: linear-gradient(135deg, #059669, #10b981); color: white; border: none; border-radius: 6px; font-weight: 600; font-size: 0.82rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; height: 34px;">
                            ✅ Certificar
                        </button>
                    </div>
                </div>
            </div>

            <!-- KPI Strip Global -->
            <div id="certObrasKpiStrip" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 14px 20px; border-bottom: 1px solid var(--border-color); background: var(--hover-bg, var(--bg-hover));"></div>
            <!-- Barra de progreso global -->
            <div style="padding: 10px 20px 8px; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Avance Global de Certificación</span>
                    <span id="certObrasGlobalPct" style="font-size: 0.95rem; font-weight: 700; color: var(--accent);">0,0%</span>
                </div>
                <div style="height: 8px; background: var(--border-color); border-radius: 99px; overflow: hidden;">
                    <div id="certObrasProgressBar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 99px; transition: width 0.5s ease;"></div>
                </div>
            </div>
            <!-- Tabla de partidas certificadas -->
            <div class="modal-body" style="padding: 14px 20px; overflow-y: auto; flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 500;">Historial de certificaciones por partida</span>
                    <input type="text" id="certObrasFilter" placeholder="Filtrar partidas..." autocomplete="off"
                        style="padding: 5px 10px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.78rem; background: var(--bg-color); color: var(--text-primary); outline: none; width: 200px;">
                </div>
                <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
                        <thead>
                            <tr style="background: var(--hover-bg, var(--bg-hover)); color: var(--text-secondary); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.3px;">
                                <th style="padding: 10px 12px; text-align: left;">Código</th>
                                <th style="padding: 10px 12px; text-align: left;">Partida</th>
                                <th style="padding: 10px 8px; text-align: center;">Ud</th>
                                <th style="padding: 10px 8px; text-align: right;">Cant. Presup.</th>
                                <th style="padding: 10px 8px; text-align: right;">Certif. Acum.</th>
                                <th style="padding: 10px 8px; text-align: right;">% Avance</th>
                                <th style="padding: 10px 8px; text-align: right;">Imp. Certif.</th>
                                <th style="padding: 10px 8px; text-align: right;">Imp. Total</th>
                                <th style="padding: 10px 8px; width: 36px;"></th>
                            </tr>
                        </thead>
                        <tbody id="certObrasTableBody">
                            <tr><td colspan="9" style="text-align:center; padding: 24px; color: var(--text-secondary); font-style: italic;">No hay certificaciones registradas</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Compare Modal -->
    <div id="compareModal" class="modal" style="display:none;">
        <div class="modal-content compare-modal-content">
            <div class="modal-header">
                <h3>Comparador de Presupuestos</h3>
                <button type="button" id="closeCompareBtn" class="close-btn">✕</button>
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
                    <button type="button" id="exportGanttXmlBtn" class="gantt-action-btn gantt-xml-btn" title="Exportar a Microsoft Project (XML)" style="background-color: #2563eb; color: white;">⬇ MS Project XML</button>
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
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">Versión 1.3.0</span>
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
                        <!-- Versión 1.3.0 -->
                        <div style="margin-bottom: 1rem; border-left: 3px solid var(--accent); padding-left: 8px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary);">
                                <span>V1.3.0 (Actual)</span>
                                <span>03/07/2026</span>
                             </div>
                             <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 4px;">Autor: Jose Manuel Caamaño</div>
                             <ul style="margin: 0; padding-left: 1rem; color: var(--text-secondary); font-size: 0.75rem;">
                                 <li>Integración de % PEM y gráfico de desglose de recursos en las filas de capítulos del Presupuesto.</li>
                                 <li>Cabecera compacta y adaptativa con menú de ajustes unificado en engranaje ⚙️.</li>
                                 <li>Estadísticas económicas y de avance en tiempo real dentro del Planning Gantt.</li>
                                 <li>Indicadores de días restantes de obra y medias de certificación diaria, semanal y mensual.</li>
                                 <li>Exportación e importación completa en formato estándar FIEBDC-3 (.bc3).</li>
                                 <li>Exportación optimizada a PDF de certificaciones mensuales con área de firmas.</li>
                             </ul>
                        </div>
                        <!-- Versión 1.2.0 -->
                        <div style="margin-bottom: 1rem; border-left: 3px solid var(--border-color); padding-left: 8px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary);">
                                <span>V1.2.0</span>
                                <span>03/07/2026</span>
                             </div>
                             <div style="font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 4px;">Autor: Jose Manuel Caamaño</div>
                             <ul style="margin: 0; padding-left: 1rem; color: var(--text-secondary); font-size: 0.75rem;">
                                 <li>Módulo de Certificaciones Mensuales de Obra para certificar cantidades y avances por partida.</li>
                                 <li>Sincronización del progreso de tareas de Gantt basada en volúmenes certificados.</li>
                                 <li>Curva S dinámica en base a certificaciones de obra y cantidades reales.</li>
                                 <li>Indicador visual de Ruta Crítica en el árbol presupuestario con badge animado ⚡ CRÍTICO.</li>
                                 <li>Auditoría de cambios en sesión (PEM total, variaciones e impacto económico neto).</li>
                                 <li>Exportación del Diagrama de Gantt a formato estándar Microsoft Project XML.</li>
                             </ul>
                        </div>
                        <!-- Versión 1.1.0 -->
                        <div style="margin-bottom: 1rem; border-left: 3px solid var(--border-color); padding-left: 8px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--text-primary);">
                                <span>V1.1.0</span>
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

    <!-- Audit Log Modal (Auditoría de Cambios) -->
    <div id="auditModal" class="modal" style="display:none;">
        <div class="modal-content info-modal-content" style="max-width: 750px; width: 90%;">
            <header class="modal-header">
                <h3>📜 Auditoría de Cambios del Presupuesto</h3>
                <button type="button" id="closeAuditBtn" class="close-btn">&times;</button>
            </header>
            <div class="modal-body" style="padding: 16px;">
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; margin-top: 0;">
                    Registro en tiempo real de las modificaciones realizadas en la sesión actual e impacto económico estimado en el PEM total.
                </p>
                <!-- KPI Impact Card -->
                <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                    <div style="flex: 1; background: var(--hover-bg, var(--bg-hover)); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; text-align: center;">
                        <span style="display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Desviación PEM Acumulada</span>
                        <span id="auditTotalDeviation" style="display: block; font-size: 1.4rem; font-weight: bold; margin-top: 4px; color: var(--text-primary);">0,00 €</span>
                    </div>
                    <div style="flex: 1; background: var(--hover-bg, var(--bg-hover)); border: 1px solid var(--border-color); padding: 12px; border-radius: 8px; text-align: center;">
                        <span style="display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">Modificaciones Realizadas</span>
                        <span id="auditChangesCount" style="display: block; font-size: 1.4rem; font-weight: bold; margin-top: 4px; color: var(--text-primary);">0</span>
                    </div>
                </div>
                <!-- Audit Table -->
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
                        <thead>
                            <tr style="background: var(--hover-bg, var(--bg-hover)); border-bottom: 1px solid var(--border-color); color: var(--text-primary); font-weight: 600;">
                                <th style="padding: 10px; width: 80px;">Hora</th>
                                <th style="padding: 10px; width: 110px;">Partida</th>
                                <th style="padding: 10px;">Descripción del Cambio</th>
                                <th style="padding: 10px; width: 140px; text-align: right;">Impacto PEM</th>
                            </tr>
                        </thead>
                        <tbody id="auditTableBody" style="color: var(--text-secondary);">
                            <tr>
                                <td colspan="4" style="text-align: center; padding: 24px; font-style: italic;">No se han realizado modificaciones en esta sesión</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
                    <button type="button" id="clearAuditLogBtn" class="gantt-action-btn" style="background: none; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 6px 12px;">Limpiar Historial</button>
                    <button type="button" id="closeAuditOkBtn" class="process-btn" style="padding: 6px 16px; margin: 0;">Aceptar</button>
                </div>
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

    <!-- Área de impresión oculta para Certificación en PDF -->
    <div id="certPrintArea"></div>

    <script src="jspdf.umd.min.js"></script>
    <script src="jspdf.plugin.autotable.min.js"></script>
    <script src="chart.min.js"></script>
    <script src="xlsx.full.min.js"></script>
    <script src="app.js?v=<?php echo filemtime('app.js'); ?>"></script>
</body>

</html>