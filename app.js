const UI_ICONS = {
    'bar-chart-3': '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    'calendar-days': '<svg viewBox="0 0 24 24"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
    'chevron-down': '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
    'download': '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>',
    'file-spreadsheet': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M10 9H8"/></svg>',
    'file-text': '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>',
    'folder-up': '<svg viewBox="0 0 24 24"><path d="M12 10v6"/><path d="m9 13 3-3 3 3"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
    'moon': '<svg viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3Z"/></svg>',
    'redo-2': '<svg viewBox="0 0 24 24"><path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h1"/></svg>',
    'rotate-ccw': '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    'settings': '<svg viewBox="0 0 24 24"><path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.2a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.3a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.5a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.3a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.2a2 2 0 0 1 1 1.7v.2a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.2a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.3a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.5a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.3a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.2a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/></svg>',
    'sun': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    'undo-2': '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-1"/></svg>',
    'x': '<svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
};

function iconSvg(name, className = 'ui-icon') {
    const svg = UI_ICONS[name] || '';
    return svg ? `<span class="${className}" aria-hidden="true">${svg}</span>` : '';
}

function applyIcon(el) {
    const icon = el.dataset.icon || el.dataset.iconOnly;
    if (!icon) return;

    const label = el.textContent.trim();
    const trailingIcon = el.dataset.trailingIcon;

    if (el.dataset.iconOnly) {
        el.innerHTML = iconSvg(icon);
        el.title = el.title || el.getAttribute('aria-label') || '';
        return;
    }

    el.innerHTML = `${iconSvg(icon)}<span>${label}</span>${trailingIcon ? iconSvg(trailingIcon, 'ui-icon trailing-icon') : ''}`;
}

function setThemeIcon(isDark) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.innerHTML = iconSvg(isDark ? 'sun' : 'moon');
}

document.querySelectorAll('[data-icon], [data-icon-only]').forEach(applyIcon);

// 1. File Input Change
const fileInput = document.getElementById('bc3file');
let currentFileName = "presupuesto.bc3";
let isProcessingFile = false;
if (fileInput) {
    fileInput.addEventListener('change', function (e) {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            currentFileName = file.name;
            document.getElementById('fileName').textContent = currentFileName;
            processBc3File(file);
        }
    });
}

// 2. Search Box
const searchInput = document.getElementById('searchTerm');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const term = e.target.value.trim();
        filterTree(term);
    });
}

// Window resize handler - re-render when switching between mobile/desktop
let resizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (parsedData) {
            renderCurrentLevel();
        }
    }, 250);
});

// 3. Upload Form Submit
const uploadForm = document.getElementById('uploadForm');
async function processBc3File(file) {
    if (!file || isProcessingFile) return;

    if (!file.name.toLowerCase().endsWith('.bc3')) {
        alert('Por favor, selecciona un archivo con extensión .bc3');
        return;
    }

    isProcessingFile = true;

    const formData = new FormData();
    formData.append('bc3file', file);

    const btn = uploadForm ? uploadForm.querySelector('.process-btn') : document.querySelector('.process-btn');
    const originalText = btn ? btn.textContent : 'Procesar';
    if (btn) {
        btn.textContent = 'Procesando...';
        btn.disabled = true;
    }

    try {
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            renderApp(result.data);
        } else {
            alert('Error: ' + (result.error || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert('Error procesando el archivo');
    } finally {
        if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
        }
        isProcessingFile = false;
    }
}

if (uploadForm) {
    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const fileInput = document.getElementById('bc3file');

        if (!fileInput.files.length) {
            alert("Por favor selecciona un archivo");
            return;
        }

        processBc3File(fileInput.files[0]);
    });
}

let parsedData = null;
let originalFileText = "";
const expandedNodes = new Set();

// Historial para Deshacer/Rehacer (Ctrl+Z / Ctrl+Y)
let stateHistory = [];
let historyIndex = -1;

// Estado de Comparación y Coeficientes
let compareData = null;
let compareActive = false;
let globalCoeffs = { gg: 13, bi: 6, baja: 0 };
let typeChartInstance = null;
let chaptersChartInstance = null;

// Drill-down navigation state
let navigationStack = []; // Stack of { code, title } objects
let currentLevel = null; // null = root level, or code of current parent

// Obtener la descomposición de un concepto con factores
function getConceptDecomposition(concept) {
    if (!concept) return [];
    if (Array.isArray(concept.decomposition) && concept.decomposition.length > 0) {
        return concept.decomposition;
    }
    if (Array.isArray(concept.children) && concept.children.length > 0) {
        return concept.children.map(c => ({ code: c, factor: 1 }));
    }
    return [];
}

// Check if we're in mobile mode
function isMobileMode() {
    return window.innerWidth <= 768;
}

// Update breadcrumb display
function updateBreadcrumbs() {
    const container = document.getElementById('breadcrumbContainer');
    const path = document.getElementById('breadcrumbPath');
    const backBtn = document.getElementById('breadcrumbBack');

    if (!isMobileMode() || navigationStack.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    path.innerHTML = '';

    // Add root
    const rootItem = document.createElement('span');
    rootItem.className = 'breadcrumb-item';
    rootItem.textContent = 'Inicio';
    rootItem.onclick = () => navigateToLevel(null);
    path.appendChild(rootItem);

    // Add navigation stack items
    navigationStack.forEach((item, index) => {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '›';
        path.appendChild(separator);

        const breadcrumbItem = document.createElement('span');
        breadcrumbItem.className = index === navigationStack.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item';
        breadcrumbItem.textContent = item.title;

        if (index < navigationStack.length - 1) {
            breadcrumbItem.onclick = () => navigateToLevel(item.code);
        }

        path.appendChild(breadcrumbItem);
    });

    // Back button handler
    backBtn.onclick = () => {
        if (navigationStack.length > 0) {
            navigationStack.pop();
            const newLevel = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1].code : null;
            navigateToLevel(newLevel, false); // false = don't push to stack
        }
    };
}

// Navigate to a specific level
function navigateToLevel(parentCode, pushToStack = true) {
    currentLevel = parentCode;

    // Update stack
    if (pushToStack) {
        if (parentCode === null) {
            navigationStack = [];
        } else {
            // Find index of this code in stack
            const index = navigationStack.findIndex(item => item.code === parentCode);
            if (index >= 0) {
                // Going back to an existing level
                navigationStack = navigationStack.slice(0, index + 1);
            }
        }
    }

    updateBreadcrumbs();
    renderCurrentLevel();
}

// Render the current level based on navigation state
function renderCurrentLevel() {
    if (!parsedData) return;

    const treeContainer = document.getElementById('treeContent');
    if (!treeContainer) return;
    treeContainer.innerHTML = '';

    // Add mobile class if in mobile mode
    if (isMobileMode()) {
        treeContainer.classList.add('mobile-drilldown');
    } else {
        treeContainer.classList.remove('mobile-drilldown');
    }

    // Create Header
    const header = document.createElement('div');
    header.className = 'tree-header';
    header.innerHTML = `
        <div>Código</div>
        <div>Ud</div>
        <div>Resumen</div>
        <div>Cantidad</div>
        <div>Precio</div>
        <div>Importe</div>
    `;
    treeContainer.appendChild(header);

    const rootList = document.createElement('div');
    rootList.className = 'tree-roots';

    if (isMobileMode()) {
        // Mobile: Show only current level
        if (currentLevel === null) {
            // Show root nodes
            const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
            roots.forEach(code => {
                const rootNode = createNode(code, true, 0, 1, true); // true = mobile mode
                if (rootNode) {
                    rootList.appendChild(rootNode);
                }
            });
        } else {
            // Show children of current level
            const concept = parsedData.concepts[currentLevel];
            if (concept) {
                const decomposition = getConceptDecomposition(concept);

                decomposition.forEach(item => {
                    const childNode = createNode(item.code, false, 0, item.factor, true, item.type || 0); // true = mobile mode
                    if (childNode) {
                        rootList.appendChild(childNode);
                    }
                });
            }
        }
    } else {
        // Desktop: Show full tree
        const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
        roots.forEach(code => {
            const rootNode = createNode(code, true, 0, 1, false); // false = desktop mode
            if (rootNode) {
                rootList.appendChild(rootNode);
            }
        });
    }

    treeContainer.appendChild(rootList);

    // Re-apply filter if exists
    const searchTerm = (document.getElementById('searchTerm')?.value || '').trim();
    if (searchTerm) {
        filterTree(searchTerm);
    }

    updateExpandAllButtonState();
}



// Initialize resize on mousedown
function initResize(e) {
    e.preventDefault();
    const col = e.target.parentElement;
    resizeState.isResizing = true;
    resizeState.colIdx = parseInt(col.dataset.colIdx);
    resizeState.startX = e.pageX;
    resizeState.startWidth = window.columnWidths[resizeState.colIdx];

    e.target.classList.add('resizing');

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

// Resize during mousemove
function doResize(e) {
    if (!resizeState.isResizing) return;

    const diff = e.pageX - resizeState.startX;
    const newWidth = Math.max(30, resizeState.startWidth + diff);

    window.columnWidths[resizeState.colIdx] = newWidth;
    updateGridTemplate();
}

// Stop resizing on mouseup
function stopResize(e) {
    if (!resizeState.isResizing) return;

    resizeState.isResizing = false;
    document.querySelectorAll('.resize-handle.resizing').forEach(el => el.classList.remove('resizing'));

    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
}

// Update grid template for all rows
function updateGridTemplate() {
    const template = window.columnWidths.map(w => w + 'px').join(' ');

    // Update header
    const header = document.getElementById('treeHeader');
    if (header) {
        header.style.gridTemplateColumns = template;
        // Update individual header column widths
        const cols = header.children;
        for (let i = 0; i < cols.length; i++) {
            cols[i].style.width = window.columnWidths[i] + 'px';
        }
    }

    // Update all tree node rows
    document.querySelectorAll('.tree-node-row').forEach(row => {
        row.style.gridTemplateColumns = template;
    });
}

function renderApp(data) {
    parsedData = data;
    originalFileText = data.original_text || "";
    expandedNodes.clear();

    // Inicializar historial
    stateHistory = [JSON.stringify(parsedData)];
    historyIndex = 0;
    updateUndoRedoButtonsState();

    // Reset navigation state
    navigationStack = [];
    currentLevel = null;

    // Show control buttons
    const sBtn = document.getElementById('saveBtn');
    const exportDrop = document.getElementById('exportDropdown');
    const cBtn = document.getElementById('compareBtn');
    const dBtn = document.getElementById('dashboardBtn');
    if (sBtn) sBtn.style.display = 'inline-block';
    if (exportDrop) exportDrop.style.display = 'inline-block';
    if (cBtn) cBtn.style.display = 'inline-block';
    if (dBtn) dBtn.style.display = 'inline-block';
    const pBtn = document.getElementById('planningBtn');
    if (pBtn) pBtn.style.display = 'inline-block';

    // Resetear comparador y coeficientes al cargar un nuevo presupuesto
    compareData = null;
    compareActive = false;
    const compResults = document.getElementById('compareResults');
    if (compResults) compResults.style.display = 'none';
    const totalPecDisplay = document.getElementById('budgetTotalPEC');
    if (totalPecDisplay) totalPecDisplay.style.display = 'none';
    const toggleCoeffs = document.getElementById('toggleCoeffsBtn');
    if (toggleCoeffs) toggleCoeffs.style.display = 'inline-block';
    const coeffsPanel = document.getElementById('coeffsPanel');
    if (coeffsPanel) coeffsPanel.style.display = 'none';

    // Restablecer valores de inputs de coeficientes a los valores por defecto
    const ggIn = document.getElementById('coeffGG');
    const biIn = document.getElementById('coeffBI');
    const bajaIn = document.getElementById('coeffBaja');
    if (ggIn) ggIn.value = 13;
    if (biIn) biIn.value = 6;
    if (bajaIn) bajaIn.value = 0;
    globalCoeffs = { gg: 13, bi: 6, baja: 0 };

    // Mostrar barra de filtros
    const filterBar = document.getElementById('filterBar');
    if (filterBar) filterBar.style.display = 'flex';

    // Recalcular todo el presupuesto de abajo hacia arriba inmediatamente al cargar
    recalculateAll();

    updateTotalBudgetDisplay();

    // Render Project Info (only if elements exist - for standalone viewer)
    const info = document.getElementById('projectInfo');
    if (info) {
        const title = document.getElementById('projectTitle');
        const owner = document.getElementById('projectOwner');
        const stats = document.getElementById('stats');

        if (title) {
            // Try to find a good title. Usually from ~V properties or root node.
            // Improve title display by removing trailing # if present
            const rawTitle = data.properties.description || (data.properties.owner + ' Project');
            title.textContent = rawTitle.replace(/#+\s*$/, '');
        }

        if (owner) {
            // Display metadata
            const metaText = [
                data.properties.owner ? `Propietario: ${data.properties.owner}` : '',
                data.properties.format ? `Formato: ${data.properties.format}` : '',
                data.properties.charset ? `(${data.properties.charset})` : ''
            ].filter(Boolean).join(' | ');
            owner.textContent = metaText;
        }

        if (stats) {
            // Show debug stats
            const conceptCount = Object.keys(data.concepts).length;
            const rootCount = data.root_nodes.length;
            stats.textContent = `Cargado: ${conceptCount} partidas | Raíces: ${rootCount}`;
        }

        info.style.display = 'block';
    }

    // Hide empty state
    const emptyState = document.querySelector('#treePanel .empty-state');
    if (emptyState) emptyState.style.display = 'none';

    try {
        // Render using new navigation system
        renderCurrentLevel();

    } catch (e) {
        console.error(e);
        document.getElementById('stats').textContent += ' | ERROR RENDER: ' + e.message;
    }
}


/**
 * Filter the tree view based on search text
 * @param {string} text 
 */
function filterTree(text) {
    const rootContainer = document.getElementById('treeContent');
    const nodes = rootContainer.querySelectorAll('.tree-node-container');
    const lowerText = text.toLowerCase();

    // Helper to get text content of a concept for searching
    function getSearchContent(code) {
        const c = parsedData.concepts[code];
        if (!c) return '';
        let str = c.code + ' ' + c.summary + ' ' + (c.description || '');
        if (c.measurements && c.measurements.length) {
            str += ' ' + c.measurements.map(m => (m.label || '') + ' ' + (m.units || '')).join(' ');
        }
        return str.toLowerCase();
    }

    // Pass 1: Mark matches
    // We can't just iterate flat list easily because visual hierarchy matters.
    // Actually, iterating DOM nodes depth-first or checking logic?
    // Easiest: Recursive function acting on DOM nodes has issues if we select 'all' nodes flatly.
    // Better: Select top-level nodes and recurse.

    // Instead of complex DOM recursion, let's use the flat querySelectorAll but handle logic carefully?
    // No, hierarchy matters: Parent visible if Child visible.

    // Recursive approach on DOM structure:
    function processElement(el) {
        // el is .tree-node-container
        const code = el.dataset.code;
        const childrenContainer = el.querySelector('.tree-node-children');

        let isMatch = false;

        // 1. Check self
        if (code && getSearchContent(code).includes(lowerText)) {
            isMatch = true;
        }

        // 2. Check children
        let childVisible = false;
        if (childrenContainer) {
            const children = childrenContainer.querySelectorAll(':scope > .tree-node-container');
            children.forEach(child => {
                if (processElement(child)) {
                    childVisible = true;
                }
            });
        }

        // Decision
        if (text === '') {
            el.style.display = '';
            // Optional: Collapse everything? Or leave as is. 
            // Leaving as is allows user to clear search and see context.
            return true;
        }

        if (isMatch || childVisible) {
            el.style.display = '';
            // If child matched, expand self
            if (childVisible && childrenContainer) {
                childrenContainer.classList.add('visible');
                const toggle = el.querySelector('.toggle-icon');
                if (toggle) toggle.classList.add('expanded');
            }
            return true;
        } else {
            el.style.display = 'none';
            return false;
        }
    }

    // Start with root nodes in the tree container (skipping header)
    // The roots are inside a div (rootList) or directly appended?
    // In renderApp: treeContainer.appendChild(rootList);
    // rootList contains headers? No, header is separate.
    // rootList contains createNode outputs.
    // Actually renderApp does: 
    // rootList = div
    // rootList.appendChild(rootNode)

    // So we need to select children of rootList.
    // Since we don't have a distinct ID for rootList, let's just select .tree-node-container inside treeContent
    // But `querySelectorAll` is flat.
    // ...
    // treeContainer.appendChild(rootList);

    // We need top-level containers. 
    // Let's modify renderApp to give rootList a class or ID, OR just use :scope > div > .tree-node-container?

    // Re-reading renderApp:
    // const rootList = document.createElement('div');
    // rootList.className = 'tree-roots';
    // ...
    // treeContainer.appendChild(rootList);

    const rootList = rootContainer.querySelector('.tree-roots');
    if (rootList) {
        const roots = rootList.children; // These are top level containers
        Array.from(roots).forEach(root => {
            if (root.classList.contains('tree-node-container')) {
                processElement(root);
            }
        });
    }
}

/**
 * createNode
 * @param {string} code 
 * @param {boolean} isRoot 
 * @param {number} depth 
 * @param {number} qty - Quantity of this node in the parent context (factor)
 * @param {boolean} mobileMode - Whether to render in mobile drill-down mode
 */
function createNode(code, isRoot = false, depth = 0, qty = 1, mobileMode = false, type = 0) {
    // Validar si el nodo debe mostrarse según filtros activos
    if (typeof shouldShowNode === 'function' && !shouldShowNode(code)) {
        return null;
    }

    const concept = parsedData.concepts[code];
    if (!concept) {
        console.warn('Missing concept:', code);
        return document.createTextNode('');
    }

    const container = document.createElement('div');
    container.className = 'tree-node-container';
    container.dataset.code = code;

    const row = document.createElement('div');

    // Determine styling class
    let hasChildren = false;
    let decomposition = [];

    // Helper to get decomposition with factors
    decomposition = getConceptDecomposition(concept);
    if (decomposition.length > 0) {
        hasChildren = true;
    }

    // Also check for measurements (~M)
    let hasMeasurements = false;
    if (Array.isArray(concept.measurements) && concept.measurements.length > 0) {
        hasMeasurements = true;
        hasChildren = true;
    }

    // Check for Description (~T)
    let hasDescription = false;
    if (concept.description && concept.description.trim().length > 0) {
        hasDescription = true;
        hasChildren = true; // Description makes it expandable
    }

    // Determine if it's a chapter/folder structurally
    // In BC3, codes ending in '#' are typically chapters.
    // Also if it has children, treat as chapter.
    const isChapter = concept.code.endsWith('#') || hasChildren;

    row.className = 'tree-node-row';

    if (isChapter) {
        if (depth === 0) {
            row.classList.add('node-chapter');
        } else {
            row.classList.add('node-subchapter');
        }
    } else {
        row.classList.add('node-item');
    }

    // 1. Column: Code (Merged with Hierarchy/Toggle)
    const colCode = document.createElement('div');
    colCode.className = 'col-code';
    // Style applied in CSS (flex), but padding for depth here
    colCode.style.paddingLeft = (depth * 20 + 8) + 'px';

    const toggle = document.createElement('span');
    toggle.className = 'toggle-icon';
    toggle.innerHTML = iconSvg('chevron-right', 'ui-icon toggle-svg');
    // Hide if no children, but keep space? Or just opacity 0? 
    // User said "remove column", if simple node, maybe no triangle at all?
    // "ponerlos al lado del código".
    // Usually leaves don't have arrows.
    if (hasChildren) {
        toggle.style.opacity = '1';
        if (isRoot || expandedNodes.has(code)) toggle.classList.add('expanded');
    } else {
        toggle.style.opacity = '0'; // Invisible but keeps alignment if fixed width
        // Or display none? If display none, text shifts left. Better to keep placeholder or use opacity.
        // Let's use opacity 0 for alignment.
    }

    colCode.appendChild(toggle);

    // Code Text
    const codeSpan = document.createElement('span');
    codeSpan.textContent = concept.code.replace(/#+\s*$/, '');
    colCode.appendChild(codeSpan);

    // Add resource type badge if type is defined (1=MO, 2=MAQ, 3=MAT, 4=SUB)
    if (type > 0 && type <= 4) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        if (type === 1) {
            badge.classList.add('badge-mo');
            badge.textContent = 'MO';
            badge.title = 'Mano de obra';
        } else if (type === 2) {
            badge.classList.add('badge-maq');
            badge.textContent = 'MAQ';
            badge.title = 'Maquinaria';
        } else if (type === 3) {
            badge.classList.add('badge-mat');
            badge.textContent = 'MAT';
            badge.title = 'Material';
        } else if (type === 4) {
            badge.classList.add('badge-sub');
            badge.textContent = 'SUB';
            badge.title = 'Subcontrato';
        }
        colCode.appendChild(badge);
    }

    // 2. Column: Unit

    // 3. Column: Unit
    const colUnit = document.createElement('div');
    colUnit.className = 'col-unit';
    colUnit.textContent = concept.unit;

    // 4. Column: Summary (Editable)
    const colSummary = document.createElement('div');
    colSummary.className = 'col-summary';
    colSummary.textContent = concept.summary || '(Sin título)';
    
    colSummary.contentEditable = "true";
    colSummary.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar expandir/contraer la fila al editar
    });

    colSummary.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evitar salto de línea
            
            const newSummary = colSummary.textContent.trim();
            if (newSummary && concept.summary !== newSummary) {
                concept.summary = newSummary;
                
                // Actualizar panel de detalles si coincide el código
                const detCodeEl = document.getElementById('detCode');
                const detSummaryEl = document.getElementById('detSummary');
                if (detCodeEl && detSummaryEl && detCodeEl.textContent === concept.code.replace(/#+\s*$/, '')) {
                    detSummaryEl.textContent = newSummary;
                }
            }
            colSummary.blur();
        }
    });

    colSummary.addEventListener('blur', () => {
        const newSummary = colSummary.textContent.trim();
        if (newSummary && newSummary !== concept.summary) {
            concept.summary = newSummary;
            saveHistoryState();
        } else {
            colSummary.textContent = concept.summary || '(Sin título)';
        }
    });

    // Values
    const priceVal = parseFloat(concept.price);
    const qtyVal = parseFloat(qty);
    const amountVal = (isNaN(priceVal) || isNaN(qtyVal)) ? 0 : (priceVal * qtyVal);

    // 5. Column: Quantity
    const colQty = document.createElement('div');
    colQty.className = 'col-quantity';
    colQty.textContent = isNaN(qtyVal) ? '' : qtyVal.toLocaleString('es-ES', { minimumFractionDigits: 3 });

    // 6. Column: Price (Editable solo para partidas, no capítulos/raíces)
    const colPrice = document.createElement('div');
    colPrice.className = 'col-price';
    colPrice.textContent = isNaN(priceVal) ? '' : priceVal.toLocaleString('es-ES', { minimumFractionDigits: 2 });

    // Agregar desviación si el comparador está activo
    if (compareActive && compareData && compareData[code]) {
        const compConcept = compareData[code];
        const mainPrice = parseFloat(concept.price) || 0;
        const compPrice = parseFloat(compConcept.price) || 0;
        if (mainPrice !== compPrice) {
            const diffPrice = mainPrice - compPrice;
            const pct = compPrice === 0 ? 0 : (diffPrice / compPrice) * 100;
            const badge = document.createElement('span');
            badge.className = 'dev-badge ' + (diffPrice >= 0 ? 'dev-up' : 'dev-down');
            badge.textContent = `${diffPrice >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
            colPrice.appendChild(badge);
        }
    }
    
    const isEditablePrice = !concept.code.endsWith('#');
    if (isEditablePrice) {
        colPrice.contentEditable = "true";
        colPrice.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar expandir/contraer la fila al editar
        });

        colPrice.addEventListener('focus', () => {
            // Mostrar número simple sin formatear para edición cómoda
            const rawPrice = parseFloat(concept.price) || 0;
            colPrice.textContent = rawPrice;
            
            // Seleccionar todo el texto
            const range = document.createRange();
            range.selectNodeContents(colPrice);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });

        colPrice.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evitar salto de línea
                
                const valText = colPrice.textContent.trim().replace(',', '.');
                const newVal = parseFloat(valText);

                if (!isNaN(newVal) && newVal >= 0) {
                    if (parseFloat(concept.price) !== newVal) {
                        concept.price = newVal;
                        concept.isManualPrice = true; // Bloquear precio manual
                        recalculateAll();
                        
                        const scrollPos = document.getElementById('treeContent').scrollTop;
                        renderCurrentLevel();
                        document.getElementById('treeContent').scrollTop = scrollPos;
                        
                        updateTotalBudgetDisplay();
                        saveHistoryState();
                        return; // Retornar ya que re-renderiza y destruye el foco
                    }
                }
                colPrice.blur();
            }
        });

        colPrice.addEventListener('blur', () => {
            const valText = colPrice.textContent.trim().replace(',', '.');
            const newVal = parseFloat(valText);

            if (!isNaN(newVal) && newVal >= 0) {
                if (parseFloat(concept.price) !== newVal) {
                    concept.price = newVal;
                    concept.isManualPrice = true; // Bloquear precio manual
                    recalculateAll();
                    
                    const scrollPos = document.getElementById('treeContent').scrollTop;
                    renderCurrentLevel();
                    document.getElementById('treeContent').scrollTop = scrollPos;
                    
                    updateTotalBudgetDisplay();
                    saveHistoryState();
                }
            } else {
                // Revertir al valor original si no es número válido
                const prevPrice = parseFloat(concept.price) || 0;
                colPrice.textContent = prevPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 });
            }
        });
    } else {
        colPrice.contentEditable = "false";
    }

    // 7. Column: Amount (Importe)
    const colAmount = document.createElement('div');
    colAmount.className = 'col-amount';
    colAmount.textContent = amountVal === 0 ? '' : amountVal.toLocaleString('es-ES', { minimumFractionDigits: 2 });


    // Append columns
    // No colHier anymore
    row.appendChild(colCode);
    row.appendChild(colUnit);
    row.appendChild(colSummary);
    row.appendChild(colQty);
    row.appendChild(colPrice);
    row.appendChild(colAmount);

    // Add mobile navigation indicator
    if (mobileMode && hasChildren) {
        row.classList.add('has-children-mobile');
    }

    // Click handlers
    row.onclick = (e) => {
        // Prevent triggering if we clicked a link, input or editable price
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'A' || e.target.classList.contains('col-price')) return;

        // Mobile mode behavior
        if (mobileMode) {
            // Check if this item has decomposition children (not just measurements/description)
            const hasDecompositionChildren = decomposition && decomposition.length > 0;

            if (hasDecompositionChildren) {
                // Navigate to next level for items with children
                navigationStack.push({
                    code: code,
                    title: concept.summary || concept.code.replace(/#+\s*$/, '')
                });
                navigateToLevel(code);
            } else {
                // Show inline details for leaf items (partidas)
                showMobileDetails(code, container);
            }
            return;
        }

        // Desktop mode: Select and toggle expand/collapse
        document.querySelectorAll('.tree-node-row').forEach(el => el.classList.remove('active'));
        row.classList.add('active');
        showDetails(code);

        // Toggle Expand/Collapse
        if (hasChildren) {
            const childrenContainer = container.querySelector('.tree-node-children');
            if (childrenContainer) {
                const isVisible = childrenContainer.classList.contains('visible');

                if (isVisible) {
                    childrenContainer.classList.remove('visible');
                    toggle.classList.remove('expanded');
                    expandedNodes.delete(code); // Guardar estado
                } else {
                    childrenContainer.classList.add('visible');
                    toggle.classList.add('expanded');
                    expandedNodes.add(code); // Guardar estado
                }
                updateExpandAllButtonState();
            }
        }
    };



    container.appendChild(row);

    // Children Container
    if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-node-children';
        
        const isNodeExpanded = isRoot || expandedNodes.has(code);
        if (isNodeExpanded) {
            childrenContainer.classList.add('visible');
        }

        // 0. Render Description (Top of children)
        if (hasDescription) {
            const descRow = document.createElement('div');
            descRow.className = 'node-description-row';
            // Style it: Indented, full text
            descRow.style.paddingLeft = ((depth + 1) * 20 + 8) + 'px';
            descRow.style.paddingRight = '10px';
            descRow.style.paddingTop = '8px';
            descRow.style.paddingBottom = '8px';
            descRow.style.whiteSpace = 'pre-wrap'; // Preserve formatting
            descRow.style.color = 'var(--text-secondary)';
            descRow.style.fontSize = '0.9rem';
            descRow.textContent = concept.description;
            descRow.style.borderBottom = '1px solid var(--border-color)';
            childrenContainer.appendChild(descRow);
        }

        // 1. Render Measurements Table
        if (hasMeasurements) {
            const msTable = createMeasurementTable(concept.measurements);
            childrenContainer.appendChild(msTable);
        }

        // 2. Render Decomposition/Children (Sub-items)
        // Usually items with measurements don't have further sub-items, but chapters do.
        // Only render children in desktop mode (in mobile, we navigate to them)
        if (!mobileMode) {
            decomposition.forEach(item => {
                const childNode = createNode(item.code, false, depth + 1, item.factor, mobileMode, item.type || 0);
                if (childNode) {
                    childrenContainer.appendChild(childNode);
                }
            });
        }


        container.appendChild(childrenContainer);
    }

    return container;
}

/**
 * createMeasurementTable
 * Renders a full HTML table for measurements with calculations.
 */
function createMeasurementTable(measurements, concept = null) {
    const container = document.createElement('div');
    container.className = 'measurements-container';

    const table = document.createElement('table');
    table.className = 'measurements-table';

    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Descripción</th>
            <th class="numeric">Uds</th>
            <th class="numeric">Largo</th>
            <th class="numeric">Ancho</th>
            <th class="numeric">Alto</th>
            <th class="numeric">Parcial</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    let total = 0;

    measurements.forEach((m, idx) => {
        const tr = document.createElement('tr');

        const u = m.units === '' ? 1 : parseFloat(m.units.toString().replace(',', '.'));
        const l = m.l === '' ? 1 : parseFloat(m.l.toString().replace(',', '.'));
        const w = m.w === '' ? 1 : parseFloat(m.w.toString().replace(',', '.'));
        const h = m.h === '' ? 1 : parseFloat(m.h.toString().replace(',', '.'));

        const vU = isNaN(u) ? 1 : u;
        const vL = isNaN(l) ? 1 : l;
        const vW = isNaN(w) ? 1 : w;
        const vH = isNaN(h) ? 1 : h;

        const partial = vU * vL * vW * vH;
        total += partial;

        // Celdas Editables (Solo si concept está presente y es editable)
        const isEditable = concept && !concept.code.endsWith('#');

        // Descripción
        const tdLabel = document.createElement('td');
        tdLabel.textContent = m.label || '';
        if (isEditable) {
            tdLabel.className = 'm-cell-editable';
            tdLabel.contentEditable = 'true';
            tdLabel.addEventListener('blur', () => {
                m.label = tdLabel.textContent.trim();
            });
            tdLabel.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    tdLabel.blur();
                }
            });
        }

        // Celdas numéricas editables
        function createNumericCell(fieldValue, fieldName) {
            const td = document.createElement('td');
            td.className = 'numeric';
            td.textContent = fieldValue === '' ? '' : parseFloat(fieldValue).toLocaleString('es-ES');
            
            if (isEditable) {
                td.className += ' m-cell-editable';
                td.contentEditable = 'true';
                
                td.addEventListener('focus', () => {
                    // Cargar número crudo sin formatear para editar cómodamente
                    td.textContent = fieldValue === '' ? '' : parseFloat(fieldValue);
                });

                td.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        td.blur();
                    }
                });

                td.addEventListener('blur', () => {
                    const rawText = td.textContent.trim().replace(',', '.');
                    let val = parseFloat(rawText);

                    if (rawText === '') {
                        m[fieldName] = '';
                    } else if (!isNaN(val)) {
                        m[fieldName] = val;
                    } else {
                        // Revertir
                        td.textContent = fieldValue === '' ? '' : parseFloat(fieldValue).toLocaleString('es-ES');
                        return;
                    }

                    // Recalcular
                    recalculateMeasurements(concept);
                });
            }

            return td;
        }

        const tdUnits = createNumericCell(m.units, 'units');
        const tdL = createNumericCell(m.l, 'l');
        const tdW = createNumericCell(m.w, 'w');
        const tdH = createNumericCell(m.h, 'h');

        const tdPartial = document.createElement('td');
        tdPartial.className = 'numeric';
        tdPartial.innerHTML = `<b>${partial.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</b>`;

        tr.appendChild(tdLabel);
        tr.appendChild(tdUnits);
        tr.appendChild(tdL);
        tr.appendChild(tdW);
        tr.appendChild(tdH);
        tr.appendChild(tdPartial);

        tbody.appendChild(tr);
    });

    // Total Row
    const trTotal = document.createElement('tr');
    trTotal.className = 'total-row';
    trTotal.innerHTML = `
        <td colspan="5" style="text-align: right;">TOTAL:</td>
        <td class="numeric"><b>${total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</b></td>
    `;
    tbody.appendChild(trTotal);

    table.appendChild(tbody);
    container.appendChild(table);

    return container;
}

/**
 * Show details inline for mobile view
 * @param {string} code - The code of the concept to show
 * @param {HTMLElement} container - The container element for this node
 */
function showMobileDetails(code, container) {
    const concept = parsedData.concepts[code];
    if (!concept) return;

    // Check if details are already shown
    let detailsContainer = container.querySelector('.mobile-details-container');

    if (detailsContainer) {
        // Toggle visibility
        if (detailsContainer.style.display === 'none') {
            detailsContainer.style.display = 'block';
        } else {
            detailsContainer.style.display = 'none';
        }
        return;
    }

    // Create details container
    detailsContainer = document.createElement('div');
    detailsContainer.className = 'mobile-details-container';
    detailsContainer.style.padding = '1rem';
    detailsContainer.style.backgroundColor = '#f8fafc';
    detailsContainer.style.borderBottom = '1px solid var(--border-color)';

    // Title
    const title = document.createElement('h3');
    title.style.margin = '0 0 0.5rem 0';
    title.style.fontSize = '1rem';
    title.style.fontWeight = '600';
    title.style.color = 'var(--text-primary)';
    title.textContent = concept.summary || concept.code.replace(/#+\s*$/, '');
    detailsContainer.appendChild(title);

    // Description
    if (concept.description && concept.description.trim()) {
        const description = document.createElement('div');
        description.style.marginBottom = '1rem';
        description.style.fontSize = '0.9rem';
        description.style.color = 'var(--text-secondary)';
        description.style.whiteSpace = 'pre-wrap';
        description.textContent = concept.description;
        detailsContainer.appendChild(description);
    }

    // Measurements table
    if (concept.measurements && concept.measurements.length > 0) {
        const tableTitle = document.createElement('h4');
        tableTitle.style.margin = '1rem 0 0.5rem 0';
        tableTitle.style.fontSize = '0.9rem';
        tableTitle.style.fontWeight = '600';
        tableTitle.style.color = 'var(--text-primary)';
        tableTitle.textContent = 'Líneas de Medición';
        detailsContainer.appendChild(tableTitle);

        const msTable = createMeasurementTable(concept.measurements, concept);
        detailsContainer.appendChild(msTable);
    }

    // Insert after the row
    container.appendChild(detailsContainer);
}

function showDetails(code) {

    const concept = parsedData.concepts[code];
    const panel = document.getElementById('detailsContent');
    const emptyState = document.querySelector('#detailsPanel .empty-state');

    emptyState.style.display = 'none';
    panel.style.display = 'block';

    document.getElementById('detCode').textContent = concept.code.replace(/#+\s*$/, '');
    document.getElementById('detSummary').textContent = concept.summary;
    document.getElementById('detPrice').textContent = parseFloat(concept.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

    // Description: Prefer ~T description, fallback to Summary
    document.getElementById('detDescription').innerHTML = (concept.description || concept.summary).replace(/\n/g, '<br>');

    // Mediciones en Panel de Escritorio
    const msSection = document.getElementById('detMeasurementsSection');
    const msDiv = document.getElementById('detMeasurements');
    if (msSection && msDiv) {
        if (concept.measurements && concept.measurements.length > 0) {
            msSection.style.display = 'block';
            msDiv.innerHTML = '';
            msDiv.appendChild(createMeasurementTable(concept.measurements, concept));
        } else {
            msSection.style.display = 'none';
        }
    }

    // Decomposition Table
    const tbody = document.getElementById('detDecomposition');
    tbody.innerHTML = '';

    let totalCalc = 0;

    if (concept.decomposition && concept.decomposition.length > 0) {
        concept.decomposition.forEach(item => {
            const childNode = parsedData.concepts[item.code];
            const row = document.createElement('tr');

            const childPrice = childNode ? parseFloat(childNode.price) : 0;
            const factor = parseFloat(item.factor);
            const total = childPrice * factor;
            totalCalc += total;

            row.innerHTML = `
                <td>${item.code.replace(/#+\s*$/, '')}</td>
                <td>${factor.toLocaleString('es-ES')} ${childNode ? childNode.unit : ''}</td>
                <td>${childNode ? childNode.summary : '???'}</td>
                <td>${childPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</td>
                <td><strong>${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</strong></td>
            `;
            tbody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align:center; color: #94a3b8;">Sin descomposición (Partida simple o Capítulo)</td>`;
        tbody.appendChild(row);
    }

    // Check if calculated matches stated
    const statedPrice = parseFloat(concept.price);
    // Usually they match. If not, maybe show warning or just stated.
    document.getElementById('detTotalCost').textContent = statedPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

/* ==========================================================================
   Lógica de Recálculo, Modo Oscuro, Drag & Drop y Exportación BC3
   ========================================================================== */

// Recálculo recursivo de precios ascendente
function recalculateConceptPrice(code, visited = new Set()) {
    if (visited.has(code)) {
        return parseFloat(parsedData.concepts[code].price) || 0;
    }
    visited.add(code);

    const concept = parsedData.concepts[code];
    if (!concept) return 0;

    let decomposition = getConceptDecomposition(concept);

    if (decomposition.length > 0 && !concept.isManualPrice) {
        let sum = 0;
        decomposition.forEach(item => {
            const childPrice = recalculateConceptPrice(item.code, visited);
            sum += childPrice * parseFloat(item.factor);
        });
        concept.price = sum;
    }
    
    return parseFloat(concept.price) || 0;
}

function recalculateAll() {
    if (!parsedData) return;
    const visited = new Set();
    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    roots.forEach(rootCode => {
        recalculateConceptPrice(rootCode, visited);
    });
}

function calculateTotalBudget() {
    if (!parsedData) return 0;
    let total = 0;
    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    roots.forEach(code => {
        const concept = parsedData.concepts[code];
        if (concept) {
            total += parseFloat(concept.price) || 0;
        }
    });
    return total;
}

function updateTotalBudgetDisplay() {
    const totalEl = document.getElementById('budgetTotal');
    const totalPecEl = document.getElementById('budgetTotalPEC');
    const toggleCoeffsBtn = document.getElementById('toggleCoeffsBtn');
    
    if (totalEl) {
        const pem = calculateTotalBudget();
        
        // Actualizar PEM
        totalEl.textContent = `PEM: ${pem.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
        
        // Mostrar botón de coeficientes
        if (toggleCoeffsBtn) toggleCoeffsBtn.style.display = 'inline-block';
        
        // Calcular PEC
        const gg = globalCoeffs.gg / 100;
        const bi = globalCoeffs.bi / 100;
        const baja = globalCoeffs.baja / 100;
        
        // PEC = (PEM * (1 + GG + BI)) * (1 + Baja)
        const pemWithCoeffs = pem * (1 + gg + bi);
        const pec = pemWithCoeffs * (1 + baja);
        
        if (totalPecEl) {
            totalPecEl.textContent = `PEC: ${pec.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
            totalPecEl.style.display = 'inline-block';
        }
    }
}

// Reconstrucción del archivo BC3
function generateModifiedBC3() {
    if (!originalFileText) return "";

    const lines = originalFileText.split(/\r?\n/);
    const modifiedLines = [];
    let skipLinesUntilNonSlash = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (skipLinesUntilNonSlash) {
            if (trimmed.startsWith('\\')) {
                // Saltar las líneas de medición originales
                continue;
            } else {
                skipLinesUntilNonSlash = false;
            }
        }

        if (trimmed.startsWith('~C|')) {
            const parts = trimmed.split('|');
            const code = parts[1];
            if (code && parsedData.concepts[code]) {
                const concept = parsedData.concepts[code];
                parts[4] = parseFloat(concept.price).toFixed(2);
                parts[3] = concept.summary || "";
                modifiedLines.push(parts.join('|'));
            } else {
                modifiedLines.push(line);
            }
        } else if (trimmed.startsWith('~D|')) {
            const parts = trimmed.split('|');
            const parentCode = parts[1];
            const parentConcept = parsedData.concepts[parentCode];
            if (parentConcept && parentConcept.decomposition && parentConcept.decomposition.length > 0) {
                const decompParts = [];
                parentConcept.decomposition.forEach(item => {
                    decompParts.push(item.code);
                    decompParts.push(parseFloat(item.factor).toFixed(3));
                    decompParts.push(item.type || 0);
                });
                parts[2] = decompParts.join('\\') + '\\';
                modifiedLines.push(parts.join('|'));
            } else {
                modifiedLines.push(line);
            }
        } else if (trimmed.startsWith('~M|')) {
            const parts = trimmed.split('|');
            // Formato: ~M|PARENT\CHILD|1\1\1\1\|TOTAL_SUM|
            const parentChild = parts[1]; // e.g. "01#\01.01"
            const childCode = parentChild.split('\\')[1];
            const concept = parsedData.concepts[childCode];

            if (concept && concept.measurements && concept.measurements.length > 0) {
                // Escribir la línea principal ~M
                const totalSum = parseFloat(concept.quantity) || 0;
                parts[3] = totalSum.toFixed(3);
                modifiedLines.push(parts.join('|'));

                // Escribir las sublíneas de mediciones editadas
                concept.measurements.forEach(m => {
                    const label = m.label || "";
                    const units = m.units === '' ? "" : parseFloat(m.units).toFixed(3);
                    const l = m.l === '' ? "" : parseFloat(m.l).toFixed(3);
                    const w = m.w === '' ? "" : parseFloat(m.w).toFixed(3);
                    const h = m.h === '' ? "" : parseFloat(m.h).toFixed(3);
                    
                    // Formato FIEBDC: \Label\Units\L\W\H\
                    modifiedLines.push(`\\${label}\\${units}\\${l}\\${w}\\${h}\\`);
                });

                // Activar el salto de las líneas de medición originales que siguen
                skipLinesUntilNonSlash = true;
            } else {
                modifiedLines.push(line);
            }
        } else if (trimmed.startsWith('~V|')) {
            // Actualizar la codificación a UTF-8 para garantizar legibilidad
            const parts = trimmed.split('|');
            if (parts.length >= 6) {
                parts[5] = "UTF-8";
            }
            modifiedLines.push(parts.join('|'));
        } else {
            modifiedLines.push(line);
        }
    }

    return modifiedLines.join('\r\n');
}

// Botón Guardar
const saveBtn = document.getElementById('saveBtn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (!parsedData) {
            alert("No hay datos de archivo cargados.");
            return;
        }
        const content = generateModifiedBC3();
        if (!content) {
            alert("Error al generar el archivo modificado.");
            return;
        }

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        
        const baseName = currentFileName.replace(/\.[^/.]+$/, "");
        link.href = URL.createObjectURL(blob);
        link.download = `${baseName}_modificado.bc3`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// Función para exportar a PDF (DIN A4 esquematizado)
function exportToPdf() {
    if (!parsedData) {
        alert("No hay datos de archivo cargados.");
        return;
    }

    // Importar jsPDF y jspdf-autotable (desde window)
    let jsPDFConstructor = null;
    if (window.jspdf && window.jspdf.jsPDF) {
        jsPDFConstructor = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
        jsPDFConstructor = window.jsPDF;
    }

    if (!jsPDFConstructor) {
        alert("La librería PDF no se cargó correctamente. Por favor verifica tu conexión a internet.");
        return;
    }

    // Crear documento A4 (p = portrait, mm = milímetros, a4 = DIN A4)
    const doc = new jsPDFConstructor({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Validar extensión AutoTable
    if (typeof doc.autoTable !== 'function') {
        alert("La extensión de tablas para PDF (AutoTable) no está disponible. Por favor recarga la página.");
        return;
    }

    // Título del presupuesto
    const budgetTitle = parsedData.properties.description || "Presupuesto sin título";
    const budgetOwner = parsedData.properties.owner || "";
    const totalBudgetAmount = calculateTotalBudget();

    // 1. Título y bloque de metadatos en la primera página
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(128, 0, 32); // Granate
    doc.text("PRESUPUESTO DE OBRA", 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Proyecto: ${budgetTitle}`, 15, 26);
    if (budgetOwner) {
        doc.text(`Propietario: ${budgetOwner}`, 15, 31);
        doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}`, 15, 36);
    } else {
        doc.text(`Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}`, 15, 31);
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 163, 74); // Verde para el total
    const formattedTotalStr = totalBudgetAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
    doc.text(`TOTAL PRESUPUESTO: ${formattedTotalStr}`, 15, budgetOwner ? 41 : 36);

    // Línea divisoria en granate
    doc.setDrawColor(128, 0, 32); // Granate
    doc.setLineWidth(0.5);
    doc.line(15, budgetOwner ? 44 : 39, 195, budgetOwner ? 44 : 39);

    // 2. Extraer datos del presupuesto en un formato plano
    const dataRows = [];
    
    // Función recursiva para recorrer solo Capítulos, Subcapítulos y Partidas
    function extractRowsRecursively(code, depth = 0, qty = 1) {
        const concept = parsedData.concepts[code];
        if (!concept) return;

        const isChapter = concept.code.endsWith('#') || concept.is_root;
        const priceVal = parseFloat(concept.price) || 0;
        const qtyVal = parseFloat(qty) || 0;
        const amountVal = priceVal * qtyVal;

        // Sangrar el resumen visualmente según la profundidad
        const indent = "   ".repeat(depth);
        const summaryText = indent + (concept.summary || '(Sin título)');

        const qtyStr = (qtyVal === 0 || isChapter) ? '' : qtyVal.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
        const priceStr = (priceVal === 0 || isChapter) ? '' : priceVal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        const amountStr = (amountVal === 0) ? '' : amountVal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

        dataRows.push({
            code: concept.code.replace(/#+\s*$/, ''),
            unit: concept.unit || '',
            summary: summaryText,
            qty: qtyStr,
            price: priceStr,
            amount: amountStr,
            depth: depth
        });

        // Recorrer los hijos si es un capítulo
        if (isChapter) {
            const children = getConceptDecomposition(concept);
            children.forEach(child => {
                extractRowsRecursively(child.code, depth + 1, child.factor);
            });
        }
    }

    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    roots.forEach(rootCode => {
        extractRowsRecursively(rootCode, 0, 1);
    });

    // 3. Generar la tabla usando AutoTable
    doc.autoTable({
        startY: budgetOwner ? 48 : 43,
        margin: { left: 15, right: 15, bottom: 20 },
        theme: 'plain',
        styles: {
            fontSize: 7.5,
            cellPadding: 2,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
            textColor: [40, 40, 40],
            font: 'helvetica'
        },
        columnStyles: {
            0: { cellWidth: 20 }, // Código
            1: { cellWidth: 10, halign: 'center' }, // Unidad
            2: { cellWidth: 'auto' }, // Resumen/Descripción
            3: { cellWidth: 18, halign: 'right' }, // Cantidad
            4: { cellWidth: 22, halign: 'right' }, // Precio
            5: { cellWidth: 25, halign: 'right' }  // Importe
        },
        head: [['Código', 'Ud', 'Resumen', 'Cant.', 'Precio', 'Importe']],
        headStyles: {
            fillColor: [128, 0, 32], // Granate institucional
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8.5,
            lineWidth: 0
        },
        body: dataRows.map(r => [r.code, r.unit, r.summary, r.qty, r.price, r.amount]),
        
        // Estilos específicos por fila (Capítulos vs Partidas)
        didParseCell: function (data) {
            if (data.row.section !== 'body') return;
            
            const rowIndex = data.row.index;
            const rowData = dataRows[rowIndex];
            
            if (rowData) {
                // Si es capítulo raíz (depth = 0)
                if (rowData.depth === 0) {
                    data.cell.styles.fillColor = [240, 240, 240];
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = [0, 0, 0];
                }
                // Si es un capítulo intermedio (depth = 1)
                else if (rowData.depth === 1) {
                    data.cell.styles.fillColor = [248, 248, 248];
                    data.cell.styles.fontStyle = 'bold';
                }
                // Si es un subcapítulo/partida sangrado
                else if (rowData.depth >= 2 && data.column.index === 2) {
                    // Solo el texto del resumen en negrita si no tiene precio (es decir, es un subcapítulo)
                    if (rowData.price === '') {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        }
    });

    // 4. Estampar encabezados y pies de página (Página X de Y) en todas las hojas creadas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Dibujar encabezado en páginas después de la primera
        if (i > 1) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(budgetTitle.substring(0, 50) + (budgetTitle.length > 50 ? '...' : ''), 15, 10);
            doc.text("PRESUPUESTO DE OBRA", 195 - doc.getTextWidth("PRESUPUESTO DE OBRA"), 10);
            
            // Línea superior de cabecera
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(15, 12, 195, 12);
        }

        // Pie de página (Footer)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        
        // Línea inferior de pie
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.line(15, 282, 195, 282);
        
        // Textos pie de página
        doc.text("© Licencia Open Source - Software Libre y de Derechos Abiertos | V.1 by Jose Manuel Caamaño", 15, 287);
        
        const pageStr = `Página ${i} de ${totalPages}`;
        doc.text(pageStr, 195 - doc.getTextWidth(pageStr), 287);
    }

    // Guardar/Descargar el PDF
    const baseName = currentFileName.replace(/\.[^/.]+$/, "");
    doc.save(`${baseName}_presupuesto.pdf`);
}

// Modo Oscuro
const themeToggleBtn = document.getElementById('themeToggle');
if (themeToggleBtn) {
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
        setThemeIcon(true);
    } else {
        document.body.classList.remove('dark-theme');
        setThemeIcon(false);
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        setThemeIcon(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// Drag & Drop
const dragOverlay = document.getElementById('dragOverlay');

window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    if (dragOverlay) dragOverlay.style.display = 'flex';
});

window.addEventListener('dragover', (e) => {
    e.preventDefault();
});

if (dragOverlay) {
    dragOverlay.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null || !dragOverlay.contains(e.relatedTarget)) {
            dragOverlay.style.display = 'none';
        }
    });

    dragOverlay.addEventListener('drop', async (e) => {
        e.preventDefault();
        dragOverlay.style.display = 'none';

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (!file.name.endsWith('.bc3')) {
                alert('Por favor, selecciona un archivo con extensión .bc3');
                return;
            }

            currentFileName = file.name;
            const fileNameEl = document.getElementById('fileName');
            if (fileNameEl) fileNameEl.textContent = currentFileName;

            processBc3File(file);
        }
    });
}

/* ==========================================================================
   Nuevas Funcionalidades: Dashboard, Mediciones, Excel, Comparar y Coeficientes
   ========================================================================== */

// 1. Auxiliar para actualizar factores de descomposición del padre al cambiar mediciones
function updateParentDecompositionFactor(childCode, newFactor) {
    Object.values(parsedData.concepts).forEach(parentConcept => {
        if (parentConcept.decomposition && parentConcept.decomposition.length > 0) {
            parentConcept.decomposition.forEach(item => {
                if (item.code === childCode) {
                    item.factor = newFactor;
                }
            });
        }
    });
}

// 2. Recalcular cantidad del concepto basado en mediciones y actualizar
function recalculateMeasurements(concept) {
    if (!concept || !concept.measurements) return;

    let total = 0;
    concept.measurements.forEach(m => {
        const u = m.units === '' ? 1 : parseFloat(m.units.toString().replace(',', '.'));
        const l = m.l === '' ? 1 : parseFloat(m.l.toString().replace(',', '.'));
        const w = m.w === '' ? 1 : parseFloat(m.w.toString().replace(',', '.'));
        const h = m.h === '' ? 1 : parseFloat(m.h.toString().replace(',', '.'));

        const vU = isNaN(u) ? 1 : u;
        const vL = isNaN(l) ? 1 : l;
        const vW = isNaN(w) ? 1 : w;
        const vH = isNaN(h) ? 1 : h;

        total += vU * vL * vW * vH;
    });

    // Actualizar el factor en el padre
    updateParentDecompositionFactor(concept.code, total);

    // Guardar cantidad del concepto
    concept.quantity = total;

    // Recalcular todo en cascada
    recalculateAll();

    // Actualizar el árbol visual
    const scrollPos = document.getElementById('treeContent').scrollTop;
    renderCurrentLevel();
    document.getElementById('treeContent').scrollTop = scrollPos;

    // Refrescar panel de detalles para ver reflejado el nuevo TOTAL
    showDetails(concept.code);
    updateTotalBudgetDisplay();
    saveHistoryState();
}

// 3. Exportación a Excel con SheetJS y Fórmulas
function exportToExcel() {
    if (!parsedData) {
        alert("No hay datos de archivo cargados.");
        return;
    }

    if (typeof XLSX === 'undefined') {
        alert("La librería de Excel (SheetJS) no se cargó correctamente. Por favor verifica tu conexión a internet.");
        return;
    }

    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    const excelRows = [];
    let currentRow = 2; // Fila 1 es cabecera
    const rowChildrenMap = {};

    function collectRows(code, depth = 0, qty = 1, parentRowIndex = null) {
        const concept = parsedData.concepts[code];
        if (!concept) return;

        const isChapter = concept.code.endsWith('#') || concept.is_root;
        const myRowIndex = currentRow++;

        if (parentRowIndex !== null) {
            if (!rowChildrenMap[parentRowIndex]) rowChildrenMap[parentRowIndex] = [];
            rowChildrenMap[parentRowIndex].push(myRowIndex);
        }

        const priceVal = parseFloat(concept.price) || 0;
        const qtyVal = parseFloat(qty) || 0;

        excelRows.push({
            rowIndex: myRowIndex,
            code: concept.code.replace(/#+\s*$/, ''),
            unit: concept.unit || '',
            summary: "   ".repeat(depth) + (concept.summary || '(Sin título)'),
            qty: isChapter ? '' : qtyVal,
            price: isChapter ? '' : priceVal,
            isChapter: isChapter,
            depth: depth
        });

        if (isChapter) {
            const children = getConceptDecomposition(concept);
            children.forEach(child => {
                collectRows(child.code, depth + 1, child.factor, myRowIndex);
            });
        }
    }

    roots.forEach(rootCode => {
        collectRows(rootCode, 0, 1, null);
    });

    const wb = XLSX.utils.book_new();
    const wsData = [
        ['Código', 'Ud', 'Resumen', 'Cantidad', 'Precio', 'Importe']
    ];

    excelRows.forEach(row => {
        wsData.push([
            row.code,
            row.unit,
            row.summary,
            row.qty,
            row.price,
            '' // Fórmula
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Inyectar fórmulas y formatos
    excelRows.forEach(row => {
        const cellRef = `F${row.rowIndex}`;
        if (row.isChapter) {
            const childRows = rowChildrenMap[row.rowIndex];
            if (childRows && childRows.length > 0) {
                const sumTerms = childRows.map(rIndex => `F${rIndex}`).join('+');
                ws[cellRef] = { f: sumTerms };
            } else {
                ws[cellRef] = { v: 0 };
            }
        } else {
            ws[cellRef] = { f: `D${row.rowIndex}*E${row.rowIndex}` };
        }
    });

    // Formatear números
    for (let r = 2; r <= excelRows.length + 1; r++) {
        if (ws[`D${r}`] && ws[`D${r}`].v !== '') ws[`D${r}`].z = '#,##0.000';
        if (ws[`E${r}`] && ws[`E${r}`].v !== '') ws[`E${r}`].z = '#,##0.00 €';
        if (ws[`F${r}`]) ws[`F${r}`].z = '#,##0.00 €';
    }

    ws['!cols'] = [
        { wch: 15 }, // Código
        { wch: 6 },  // Ud
        { wch: 60 }, // Resumen
        { wch: 12 }, // Cantidad
        { wch: 12 }, // Precio
        { wch: 15 }  // Importe
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Presupuesto");

    // Guardar/Descargar el Excel
    const baseName = currentFileName.replace(/\.[^/.]+$/, "");
    XLSX.writeFile(wb, `${baseName}_presupuesto.xlsx`);
}

// 4. Lógica de Dashboard y Gráficos
function calculateResourceDistribution() {
    const distribution = { MO: 0, MAQ: 0, MAT: 0, SUB: 0 };

    function traverse(code, accumulatedQty) {
        const concept = parsedData.concepts[code];
        if (!concept) return;

        const isChapter = concept.code.endsWith('#') || concept.is_root;
        const children = getConceptDecomposition(concept);

        if (isChapter) {
            children.forEach(child => {
                traverse(child.code, accumulatedQty * (parseFloat(child.factor) || 1));
            });
        } else {
            if (concept.decomposition && concept.decomposition.length > 0) {
                concept.decomposition.forEach(item => {
                    const childConcept = parsedData.concepts[item.code];
                    const childPrice = childConcept ? (parseFloat(childConcept.price) || 0) : 0;
                    const itemFactor = parseFloat(item.factor) || 0;
                    const itemType = item.type; // 1=MO, 2=MAQ, 3=MAT, 4=SUB
                    const totalCost = itemFactor * childPrice * accumulatedQty;

                    if (itemType === 1) distribution.MO += totalCost;
                    else if (itemType === 2) distribution.MAQ += totalCost;
                    else if (itemType === 3) distribution.MAT += totalCost;
                    else distribution.SUB += totalCost;
                });
            } else {
                const price = parseFloat(concept.price) || 0;
                const totalCost = price * accumulatedQty;
                distribution.SUB += totalCost;
            }
        }
    }

    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    roots.forEach(rootCode => {
        traverse(rootCode, 1.0);
    });

    return distribution;
}

function getTopChapters() {
    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    const chapters = [];

    roots.forEach(rootCode => {
        const concept = parsedData.concepts[rootCode];
        if (concept) {
            const children = getConceptDecomposition(concept);

            children.forEach(child => {
                const childConcept = parsedData.concepts[child.code];
                if (childConcept) {
                    chapters.push({
                        summary: childConcept.summary || childConcept.code,
                        cost: (parseFloat(childConcept.price) || 0) * (parseFloat(child.factor) || 1)
                    });
                }
            });
        }
    });

    if (chapters.length === 0) {
        roots.forEach(rootCode => {
            const concept = parsedData.concepts[rootCode];
            if (concept) {
                chapters.push({
                    summary: concept.summary || concept.code,
                    cost: parseFloat(concept.price) || 0
                });
            }
        });
    }

    return chapters.sort((a, b) => b.cost - a.cost).slice(0, 5);
}

function renderCharts() {
    const dist = calculateResourceDistribution();
    const topCaps = getTopChapters();

    if (typeChartInstance) typeChartInstance.destroy();
    if (chaptersChartInstance) chaptersChartInstance.destroy();

    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#e2e8f0' : '#1e293b';

    const ctx1 = document.getElementById('resourceTypeChart').getContext('2d');
    typeChartInstance = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Mano de Obra (MO)', 'Maquinaria (MAQ)', 'Materiales (MAT)', 'Otros/Subcontratas (SUB)'],
            datasets: [{
                data: [dist.MO, dist.MAQ, dist.MAT, dist.SUB],
                backgroundColor: ['#ef4444', '#d97706', '#3b82f6', '#a855f7'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: labelColor }
                }
            }
        }
    });

    const ctx2 = document.getElementById('chaptersCostChart').getContext('2d');
    chaptersChartInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: topCaps.map(c => c.summary.substring(0, 25) + (c.summary.length > 25 ? '...' : '')),
            datasets: [{
                label: 'Coste en Euros (€)',
                data: topCaps.map(c => c.cost),
                backgroundColor: '#800020',
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: labelColor } },
                y: { ticks: { color: labelColor } }
            }
        }
    });
}

// 5. Comparador: Estadísticas de Diferencias
function calculateCompareStats() {
    if (!parsedData || !compareData) return;

    let modifiedCount = 0;
    const totalMain = calculateTotalBudget();
    let totalCompare = 0;

    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    roots.forEach(code => {
        const compConcept = compareData[code];
        if (compConcept) {
            totalCompare += parseFloat(compConcept.price) || 0;
        }
    });

    const diffTotal = totalMain - totalCompare;
    const pctDiff = totalCompare === 0 ? 0 : (diffTotal / totalCompare) * 100;

    Object.keys(parsedData.concepts).forEach(code => {
        const mainConcept = parsedData.concepts[code];
        const compConcept = compareData[code];
        if (mainConcept && compConcept) {
            if (parseFloat(mainConcept.price) !== parseFloat(compConcept.price) || mainConcept.summary !== compConcept.summary) {
                modifiedCount++;
            }
        }
    });

    const resultsDiv = document.getElementById('compareResults');
    if (resultsDiv) resultsDiv.style.display = 'block';

    const diffValEl = document.getElementById('compareTotalDiff');
    if (diffValEl) {
        const formattedDiff = diffTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        const formattedPct = pctDiff.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
        diffValEl.textContent = `${diffTotal >= 0 ? '+' : ''}${formattedDiff} (${diffTotal >= 0 ? '+' : ''}${formattedPct})`;
        diffValEl.className = 'stat-value ' + (diffTotal >= 0 ? 'pec-total' : 'clear-compare-btn');
    }

    const modCountEl = document.getElementById('compareModifiedCount');
    if (modCountEl) modCountEl.textContent = modifiedCount;
}

function getActiveFilterValue(id) {
    return document.getElementById(id)?.value || 'all';
}

// 6. Filtros: Comprobación de visibilidad de nodos y expansión
function shouldShowNode(code) {
    if (!parsedData) return true;
    const concept = parsedData.concepts[code];
    if (!concept) return true;

    const isChapter = concept.code.endsWith('#') || concept.is_root;
    if (isChapter) {
        return hasVisibleChildren(code);
    }

    // Filtro por Importe
    const costFilterVal = getActiveFilterValue('costFilter');
    if (costFilterVal !== 'all') {
        const limit = parseFloat(costFilterVal);
        const price = parseFloat(concept.price) || 0;
        const quantity = parseFloat(concept.quantity) || 1.0;
        const cost = price * quantity;
        if (cost <= limit) return false;
    }

    // Filtro por Tipo de Recurso
    const resourceFilterVal = getActiveFilterValue('resourceFilter');
    if (resourceFilterVal !== 'all') {
        if (concept.decomposition && concept.decomposition.length > 0) {
            const hasResourceType = concept.decomposition.some(item => {
                if (resourceFilterVal === 'mo' && item.type === 1) return true;
                if (resourceFilterVal === 'maq' && item.type === 2) return true;
                if (resourceFilterVal === 'mat' && item.type === 3) return true;
                if (resourceFilterVal === 'sub' && item.type === 4) return true;
                return false;
            });
            if (!hasResourceType) return false;
        } else {
            if (resourceFilterVal !== 'sub') return false; // Tratar sin descomposición como subcontrata
        }
    }

    return true;
}

function hasVisibleChildren(code) {
    const concept = parsedData.concepts[code];
    if (!concept) return false;

    const isChapter = concept.code.endsWith('#') || concept.is_root;
    if (!isChapter) {
        // Para nodos hoja (partidas), validamos el filtro en sí
        const costFilterVal = getActiveFilterValue('costFilter');
        const resourceFilterVal = getActiveFilterValue('resourceFilter');
        if (costFilterVal === 'all' && resourceFilterVal === 'all') return true;

        const price = parseFloat(concept.price) || 0;
        const quantity = parseFloat(concept.quantity) || 1.0;
        const cost = price * quantity;

        if (costFilterVal !== 'all' && cost <= parseFloat(costFilterVal)) return false;

        if (resourceFilterVal !== 'all') {
            if (concept.decomposition && concept.decomposition.length > 0) {
                return concept.decomposition.some(item => {
                    if (resourceFilterVal === 'mo' && item.type === 1) return true;
                    if (resourceFilterVal === 'maq' && item.type === 2) return true;
                    if (resourceFilterVal === 'mat' && item.type === 3) return true;
                    if (resourceFilterVal === 'sub' && item.type === 4) return true;
                    return false;
                });
            } else {
                return resourceFilterVal === 'sub';
            }
        }
        return true;
    }

    const children = getConceptDecomposition(concept);

    return children.some(child => hasVisibleChildren(child.code));
}

// 7. Enlazar Eventos de Nuevas Funcionalidades (Dropdown de Exportación)
const exportDropdown = document.getElementById('exportDropdown');
if (exportDropdown) {
    const toggleBtn = exportDropdown.querySelector('.dropdown-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdown.classList.toggle('show');
        });
    }
}

// Cerrar dropdown al hacer click fuera
window.addEventListener('click', (e) => {
    const expDrop = document.getElementById('exportDropdown');
    if (expDrop && !expDrop.contains(e.target)) {
        expDrop.classList.remove('show');
    }
});

const exportPdfBtn = document.getElementById('exportPdfBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');

if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
        const expDrop = document.getElementById('exportDropdown');
        if (expDrop) expDrop.classList.remove('show');
        exportToPdf();
    });
}

if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
        const expDrop = document.getElementById('exportDropdown');
        if (expDrop) expDrop.classList.remove('show');
        exportToExcel();
    });
}

// Dashboard modal toggling
const dashboardBtn = document.getElementById('dashboardBtn');
const dashboardModal = document.getElementById('dashboardModal');
const closeDashboardBtn = document.getElementById('closeDashboardBtn');

if (dashboardBtn && dashboardModal && closeDashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
        dashboardModal.style.display = 'flex';
        setTimeout(renderCharts, 50);
    });

    closeDashboardBtn.addEventListener('click', () => {
        dashboardModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === dashboardModal) {
            dashboardModal.style.display = 'none';
        }
    });
}

// Compare modal toggling and upload
const compareBtn = document.getElementById('compareBtn');
const compareModal = document.getElementById('compareModal');
const closeCompareBtn = document.getElementById('closeCompareBtn');
const runCompareBtn = document.getElementById('runCompareBtn');
const compareFileInput = document.getElementById('compareFileInput');
const clearCompareBtn = document.getElementById('clearCompareBtn');

if (compareBtn && compareModal && closeCompareBtn) {
    compareBtn.addEventListener('click', () => {
        compareModal.style.display = 'flex';
    });

    closeCompareBtn.addEventListener('click', () => {
        compareModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === compareModal) {
            compareModal.style.display = 'none';
        }
    });
}

if (runCompareBtn && compareFileInput) {
    runCompareBtn.addEventListener('click', async () => {
        if (!compareFileInput.files.length) {
            alert("Por favor selecciona un archivo .bc3 para comparar");
            return;
        }

        const formData = new FormData();
        formData.append('bc3file', compareFileInput.files[0]);

        runCompareBtn.textContent = 'Comparando...';
        runCompareBtn.disabled = true;

        try {
            const response = await fetch('upload.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                compareData = result.data.concepts;
                compareActive = true;

                calculateCompareStats();
                renderCurrentLevel();
                updateTotalBudgetDisplay();

                compareModal.style.display = 'none';
            } else {
                alert("Error al cargar el archivo de comparación: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor");
        } finally {
            runCompareBtn.textContent = 'Cargar y Comparar';
            runCompareBtn.disabled = false;
        }
    });
}

if (clearCompareBtn) {
    clearCompareBtn.addEventListener('click', () => {
        compareActive = false;
        compareData = null;
        document.getElementById('compareResults').style.display = 'none';
        renderCurrentLevel();
        updateTotalBudgetDisplay();
    });
}

// Filtros avanzados y expansión
const expandAllBtn = document.getElementById('expandAllBtn');
const costFilter = document.getElementById('costFilter');
const resourceFilter = document.getElementById('resourceFilter');

function getExpandableChapterCodes() {
    if (!parsedData) return [];
    return Object.keys(parsedData.concepts).filter(code => code.endsWith('#'));
}

function areAllExpandableChaptersExpanded() {
    const expandableCodes = getExpandableChapterCodes();
    return expandableCodes.length > 0 && expandableCodes.every(code => expandedNodes.has(code));
}

function updateExpandAllButtonState() {
    const btn = document.getElementById('expandAllBtn');
    if (!btn) return;

    const allExpanded = areAllExpandableChaptersExpanded();
    btn.textContent = allExpanded ? 'Contraer Todo' : 'Expandir Todo';
    btn.setAttribute('aria-pressed', allExpanded ? 'true' : 'false');
}

if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
        if (!parsedData) return;

        if (areAllExpandableChaptersExpanded()) {
            expandedNodes.clear();
        } else {
            getExpandableChapterCodes().forEach(code => expandedNodes.add(code));
        }

        renderCurrentLevel();
    });
}

if (costFilter) {
    costFilter.addEventListener('change', () => {
        renderCurrentLevel();
    });
}

if (resourceFilter) {
    resourceFilter.addEventListener('change', () => {
        renderCurrentLevel();
    });
}

// Coeficientes globales (PEM vs PEC)
const toggleCoeffsBtn = document.getElementById('toggleCoeffsBtn');
const coeffsPanel = document.getElementById('coeffsPanel');
const applyCoeffsBtn = document.getElementById('applyCoeffsBtn');

if (toggleCoeffsBtn && coeffsPanel) {
    toggleCoeffsBtn.addEventListener('click', () => {
        if (coeffsPanel.style.display === 'none') {
            coeffsPanel.style.display = 'block';
        } else {
            coeffsPanel.style.display = 'none';
        }
    });
}

if (applyCoeffsBtn) {
    applyCoeffsBtn.addEventListener('click', () => {
        const ggVal = parseFloat(document.getElementById('coeffGG').value) || 0;
        const biVal = parseFloat(document.getElementById('coeffBI').value) || 0;
        const bajaVal = parseFloat(document.getElementById('coeffBaja').value) || 0;

        globalCoeffs.gg = ggVal;
        globalCoeffs.bi = biVal;
        globalCoeffs.baja = bajaVal;

        updateTotalBudgetDisplay();
        coeffsPanel.style.display = 'none';
    });
}

/* ==========================================================================
   Historial de Cambios: Deshacer (Ctrl+Z) y Rehacer (Ctrl+Y)
   ========================================================================== */

function saveHistoryState() {
    if (!parsedData) return;
    
    // Si el usuario hace un cambio nuevo estando en medio del historial, cortamos los estados futuros
    if (historyIndex < stateHistory.length - 1) {
        stateHistory = stateHistory.slice(0, historyIndex + 1);
    }
    
    // Clonar el estado actual de parsedData
    stateHistory.push(JSON.stringify(parsedData));
    
    // Limitar el historial a los últimos 50 estados para evitar consumo excesivo de memoria
    if (stateHistory.length > 50) {
        stateHistory.shift();
    }
    
    historyIndex = stateHistory.length - 1;
    updateUndoRedoButtonsState();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        parsedData = JSON.parse(stateHistory[historyIndex]);
        
        // Recalcular todo en cascada y repintar
        recalculateAll();
        renderCurrentLevel();
        updateTotalBudgetDisplay();
        
        // Si hay una partida activa en el panel de detalles, refrescarla
        const detCodeEl = document.getElementById('detCode');
        if (detCodeEl && detCodeEl.textContent) {
            const rawCode = Object.keys(parsedData.concepts).find(c => c.replace(/#+\s*$/, '') === detCodeEl.textContent);
            if (rawCode) showDetails(rawCode);
        }
        
        updateUndoRedoButtonsState();
        showNotification("Deshacer: Cambio revertido");
    }
}

function redo() {
    if (historyIndex < stateHistory.length - 1) {
        historyIndex++;
        parsedData = JSON.parse(stateHistory[historyIndex]);
        
        // Recalcular todo en cascada y repintar
        recalculateAll();
        renderCurrentLevel();
        updateTotalBudgetDisplay();
        
        // Si hay una partida activa en el panel de detalles, refrescarla
        const detCodeEl = document.getElementById('detCode');
        if (detCodeEl && detCodeEl.textContent) {
            const rawCode = Object.keys(parsedData.concepts).find(c => c.replace(/#+\s*$/, '') === detCodeEl.textContent);
            if (rawCode) showDetails(rawCode);
        }
        
        updateUndoRedoButtonsState();
        showNotification("Rehacer: Cambio restaurado");
    }
}

function updateUndoRedoButtonsState() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = (historyIndex <= 0);
    }
    if (redoBtn) {
        redoBtn.disabled = (historyIndex >= stateHistory.length - 1);
    }
}

// Mostrar notificación en pantalla estilo Toast flotante
function showNotification(message) {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.backgroundColor = 'var(--text-primary)';
    toast.style.color = 'var(--bg-color)';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '6px';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.2)';
    toast.style.fontSize = '0.85rem';
    toast.style.fontWeight = '500';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease-out';
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => {
            toast.remove();
        }, 200);
    }, 2000);
}

// Atajos de teclado (Ctrl+Z y Ctrl+Y)
window.addEventListener('keydown', (e) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl) {
        if (e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undo();
        } else if (e.key.toLowerCase() === 'y') {
            e.preventDefault();
            redo();
        }
    }
});

// Enlazar clics de botones
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

if (undoBtn) {
    undoBtn.addEventListener('click', undo);
}

// ============================================================
// MÓDULO PLANNING — DIAGRAMA DE GANTT INTERACTIVO
// ============================================================

// Estado Gantt: { taskId: { startWeek, durationWeeks, collapsed } }
let ganttState = {};
let ganttTasks = [];
let ganttStartDate = new Date();
let ganttTotalWeeks = 26;
const GANTT_WEEK_PX = 44; // ancho de cada semana en px
let ganttLeftColWidth = 280;  // ancho columna tareas en px (redimensionable)
let ganttColDrag = null;       // estado drag de la columna

// Clave localStorage basada en el nombre del fichero cargado
function ganttStorageKey() {
    return 'gantt_' + currentFileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.]/g, '');
}

// Guardar estado en localStorage
function ganttSave() {
    try {
        localStorage.setItem(ganttStorageKey(), JSON.stringify({
            startDate: ganttStartDate.toISOString(),
            totalWeeks: ganttTotalWeeks,
            state: ganttState
        }));
    } catch (e) { /* cuota excedida — ignorar */ }
}

// Cargar estado desde localStorage
function ganttLoad() {
    try {
        const raw = localStorage.getItem(ganttStorageKey());
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (saved.startDate) ganttStartDate = new Date(saved.startDate);
        if (saved.totalWeeks) ganttTotalWeeks = saved.totalWeeks;
        if (saved.state) ganttState = saved.state;
        return true;
    } catch (e) { return false; }
}

// Extraer tareas hasta nivel 3 desde parsedData
function getGanttTasks() {
    const tasks = [];
    if (!parsedData) return tasks;
    const roots = Array.isArray(parsedData.root_nodes)
        ? parsedData.root_nodes
        : Object.values(parsedData.root_nodes);

    function addTask(code, depth, parentId) {
        if (depth > 3) return;
        const concept = parsedData.concepts[code];
        if (!concept) return;
        const id = code;
        const price = parseFloat(concept.price) || 0;
        const children = getConceptDecomposition(concept);
        const hasKids = children.length > 0 && depth < 3;

        tasks.push({
            id,
            code: concept.code.replace(/#+\s*$/, ''),
            summary: concept.summary || concept.code,
            depth,
            parentId,
            price,
            hasKids
        });

        if (hasKids) {
            children.forEach(child => addTask(child.code, depth + 1, id));
        }
    }

    roots.forEach(code => addTask(code, 1, null));
    return tasks;
}

// Distribución inicial automática (proporcional al coste)
function initGanttStateAuto(tasks, totalWeeks) {
    const total = tasks.filter(t => t.depth === 1).reduce((s, t) => s + t.price, 0) || 1;
    let cursor = 1;

    tasks.forEach(task => {
        if (ganttState[task.id]) return; // ya guardado
        if (task.depth === 1) {
            const proportion = task.price / total;
            const dur = Math.max(1, Math.round(proportion * totalWeeks));
            ganttState[task.id] = { startWeek: cursor, durationWeeks: dur, collapsed: false };
            cursor += dur;
        }
    });

    // Subcapítulos: distribuidos dentro del padre
    tasks.forEach(task => {
        if (ganttState[task.id]) return;
        if (task.depth > 1 && task.parentId && ganttState[task.parentId]) {
            const parent = ganttState[task.parentId];
            const siblings = tasks.filter(t => t.parentId === task.parentId);
            const idx = siblings.indexOf(task);
            const dur = Math.max(1, Math.round(parent.durationWeeks / siblings.length));
            const start = parent.startWeek + idx * dur;
            ganttState[task.id] = {
                startWeek: Math.min(start, parent.startWeek + parent.durationWeeks - 1),
                durationWeeks: dur,
                collapsed: false
            };
        }
    });
}

// Calcular fecha de una semana relativa a ganttStartDate
function weekToDate(weekNum) {
    const d = new Date(ganttStartDate);
    d.setDate(d.getDate() + (weekNum - 1) * 7);
    return d;
}

function formatDate(d) {
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Generar cabecera del timeline (meses + semanas)
function buildGanttHeader(totalWeeks) {
    const monthRow = document.createElement('div');
    monthRow.className = 'gantt-header-months';
    const weekRow = document.createElement('div');
    weekRow.className = 'gantt-header-weeks';

    let lastMonth = null;
    let monthSpan = 0;
    let monthCells = [];

    for (let w = 1; w <= totalWeeks; w++) {
        const date = weekToDate(w);
        const month = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

        const wCell = document.createElement('div');
        wCell.className = 'gantt-week-cell';
        wCell.textContent = 'S' + w;
        wCell.title = formatDate(date);
        weekRow.appendChild(wCell);

        if (month !== lastMonth) {
            if (lastMonth !== null) {
                const mCell = document.createElement('div');
                mCell.className = 'gantt-month-cell';
                mCell.textContent = lastMonth;
                mCell.style.width = (monthSpan * GANTT_WEEK_PX) + 'px';
                monthCells.push(mCell);
            }
            lastMonth = month;
            monthSpan = 1;
        } else {
            monthSpan++;
        }
    }
    if (lastMonth) {
        const mCell = document.createElement('div');
        mCell.className = 'gantt-month-cell';
        mCell.textContent = lastMonth;
        mCell.style.width = (monthSpan * GANTT_WEEK_PX) + 'px';
        monthCells.push(mCell);
    }
    monthCells.forEach(c => monthRow.appendChild(c));

    return { monthRow, weekRow };
}

// Renderizar el modal completo del Gantt
function renderPlanningModal() {
    if (!parsedData) { alert('Carga primero un presupuesto BC3.'); return; }

    ganttTasks = getGanttTasks();
    const loaded = ganttLoad();
    if (!loaded || Object.keys(ganttState).length === 0) {
        ganttState = {};
        initGanttStateAuto(ganttTasks, ganttTotalWeeks);
        ganttSave();
    }

    const modal = document.getElementById('planningModal');
    if (!modal) return;
    modal.style.display = 'flex';

    rebuildGanttDOM();
}

function rebuildGanttDOM() {
    const container = document.getElementById('ganttContainer');
    if (!container) return;
    container.innerHTML = '';

    const totalWeeks = ganttTotalWeeks;

    // ---- Cabecera grid ----
    const tableWrap = document.createElement('div');
    tableWrap.className = 'gantt-table-wrap';

    // Columna izquierda: nombres de tarea (ancho redimensionable)
    const leftCol = document.createElement('div');
    leftCol.className = 'gantt-left-col';
    leftCol.style.width = ganttLeftColWidth + 'px';
    leftCol.style.minWidth = ganttLeftColWidth + 'px';

    const leftHeader = document.createElement('div');
    leftHeader.className = 'gantt-left-header';
    leftHeader.textContent = 'Tarea';
    leftCol.appendChild(leftHeader);

    // Handle de resize en el borde derecho de la columna
    const colResizeHandle = document.createElement('div');
    colResizeHandle.className = 'gantt-col-resize-handle';
    colResizeHandle.title = 'Arrastrar para cambiar el ancho de la columna';
    colResizeHandle.addEventListener('mousedown', e => {
        e.preventDefault();
        ganttColDrag = { startX: e.clientX, startWidth: ganttLeftColWidth };
        document.addEventListener('mousemove', doGanttColResize);
        document.addEventListener('mouseup', stopGanttColResize);
    });
    leftCol.appendChild(colResizeHandle);

    // Columna derecha: timeline
    const rightCol = document.createElement('div');
    rightCol.className = 'gantt-right-col';

    const { monthRow, weekRow } = buildGanttHeader(totalWeeks);
    const headerWrap = document.createElement('div');
    headerWrap.className = 'gantt-header-wrap';
    headerWrap.appendChild(monthRow);
    headerWrap.appendChild(weekRow);
    rightCol.appendChild(headerWrap);

    // Filas de tareas
    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'gantt-body';

    ganttTasks.forEach(task => {
        const st = ganttState[task.id];
        if (!st) return;

        // Verificar si el padre está colapsado
        if (task.parentId && ganttState[task.parentId] && ganttState[task.parentId].collapsed) {
            return;
        }

        // Fila nombre
        const nameRow = document.createElement('div');
        nameRow.className = 'gantt-name-row gantt-depth-' + task.depth;
        nameRow.dataset.taskId = task.id;

        if (task.hasKids) {
            const toggle = document.createElement('span');
            toggle.className = 'gantt-toggle';
            toggle.innerHTML = iconSvg('chevron-right', 'ui-icon toggle-svg');
            toggle.classList.toggle('expanded', !st.collapsed);
            toggle.addEventListener('click', () => {
                ganttState[task.id].collapsed = !ganttState[task.id].collapsed;
                ganttSave();
                rebuildGanttDOM();
            });
            nameRow.appendChild(toggle);
        } else {
            const spacer = document.createElement('span');
            spacer.className = 'gantt-toggle-spacer';
            nameRow.appendChild(spacer);
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'gantt-task-name';
        nameSpan.title = task.summary + ' — ' + task.price.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
        nameSpan.textContent = task.summary;
        nameRow.appendChild(nameSpan);
        leftCol.appendChild(nameRow);

        // Fila barra
        const barRow = document.createElement('div');
        barRow.className = 'gantt-bar-row';
        barRow.style.width = (totalWeeks * GANTT_WEEK_PX) + 'px';
        barRow.dataset.taskId = task.id;

        // Grid de fondo
        for (let w = 1; w <= totalWeeks; w++) {
            const cell = document.createElement('div');
            cell.className = 'gantt-bg-cell' + (w % 4 === 0 ? ' gantt-bg-month-end' : '');
            barRow.appendChild(cell);
        }

        // Barra de la tarea
        const bar = document.createElement('div');
        bar.className = 'gantt-bar gantt-bar-depth-' + task.depth;
        bar.dataset.taskId = task.id;
        positionBar(bar, st.startWeek, st.durationWeeks, totalWeeks);

        const resizeL = document.createElement('div');
        resizeL.className = 'gantt-resize gantt-resize-l';
        resizeL.addEventListener('mousedown', e => startGanttDrag(e, task.id, 'left'));

        const barLabel = document.createElement('span');
        barLabel.className = 'gantt-bar-label';
        barLabel.textContent = task.summary.length > 18 ? task.summary.slice(0, 16) + '…' : task.summary;

        const resizeR = document.createElement('div');
        resizeR.className = 'gantt-resize gantt-resize-r';
        resizeR.addEventListener('mousedown', e => startGanttDrag(e, task.id, 'right'));

        bar.appendChild(resizeL);
        bar.appendChild(barLabel);
        bar.appendChild(resizeR);
        bar.addEventListener('mousedown', e => {
            if (e.target === resizeL || e.target === resizeR) return;
            startGanttDrag(e, task.id, 'move');
        });

        barRow.appendChild(bar);
        bodyWrap.appendChild(barRow);
    });

    rightCol.appendChild(bodyWrap);
    tableWrap.appendChild(leftCol);
    tableWrap.appendChild(rightCol);
    container.appendChild(tableWrap);

    // Sincronizar scroll vertical entre columnas
    const rightScroll = rightCol.querySelector('.gantt-body') || rightCol;
    leftCol.addEventListener('scroll', () => { rightCol.scrollTop = leftCol.scrollTop; });
}

function positionBar(barEl, startWeek, durationWeeks, totalWeeks) {
    const left = (startWeek - 1) * GANTT_WEEK_PX;
    const width = Math.max(GANTT_WEEK_PX * 0.5, durationWeeks * GANTT_WEEK_PX - 2);
    barEl.style.left = left + 'px';
    barEl.style.width = width + 'px';
}

// ---- Resize columna izquierda ----
function doGanttColResize(e) {
    if (!ganttColDrag) return;
    const newWidth = Math.max(140, Math.min(520, ganttColDrag.startWidth + (e.clientX - ganttColDrag.startX)));
    ganttLeftColWidth = newWidth;
    // Actualizar columna izquierda en vivo sin rerenderizar
    const leftColEl = document.querySelector('#ganttContainer .gantt-left-col');
    if (leftColEl) {
        leftColEl.style.width = newWidth + 'px';
        leftColEl.style.minWidth = newWidth + 'px';
    }
}
function stopGanttColResize() {
    ganttColDrag = null;
    document.removeEventListener('mousemove', doGanttColResize);
    document.removeEventListener('mouseup', stopGanttColResize);
}

// ---- Drag & Drop del Gantt ----
let ganttDrag = null;

function startGanttDrag(e, taskId, mode) {
    e.preventDefault();
    e.stopPropagation();
    const st = ganttState[taskId];
    if (!st) return;

    // Buscar el parentId de esta tarea para aplicar clamping jerárquico
    const taskObj = ganttTasks.find(t => t.id === taskId);
    const parentId = taskObj ? taskObj.parentId : null;

    ganttDrag = {
        taskId, mode, parentId,
        startX: e.clientX,
        origStart: st.startWeek,
        origDur: st.durationWeeks
    };

    document.addEventListener('mousemove', doGanttDrag);
    document.addEventListener('mouseup', stopGanttDrag);
}

function doGanttDrag(e) {
    if (!ganttDrag) return;
    const { taskId, mode, parentId, startX, origStart, origDur } = ganttDrag;
    const dx = e.clientX - startX;
    const weeksDelta = Math.round(dx / GANTT_WEEK_PX);
    const st = ganttState[taskId];
    const total = ganttTotalWeeks;

    // Límites del padre (si existe) — la tarea hija nunca puede salir de ellos
    const pst = parentId && ganttState[parentId];
    const pMin = pst ? pst.startWeek : 1;
    const pMax = pst ? pst.startWeek + pst.durationWeeks - 1 : total;

    if (mode === 'move') {
        const raw = Math.max(pMin, Math.min(pMax - origDur + 1, origStart + weeksDelta));
        st.startWeek = raw;
        st.durationWeeks = Math.min(origDur, pMax - raw + 1);
    } else if (mode === 'right') {
        const maxDur = pMax - st.startWeek + 1;
        st.durationWeeks = Math.max(1, Math.min(maxDur, origDur + weeksDelta));
    } else if (mode === 'left') {
        const newStart = Math.max(pMin, Math.min(origStart + origDur - 1, origStart + weeksDelta));
        const newDur = origStart + origDur - newStart;
        st.startWeek = newStart;
        st.durationWeeks = Math.max(1, Math.min(newDur, pMax - newStart + 1));
    }

    // Actualizar barra en DOM sin rerenderizar todo
    const bar = document.querySelector(`.gantt-bar[data-task-id="${taskId}"]`);
    if (bar) positionBar(bar, st.startWeek, st.durationWeeks, total);
}

function stopGanttDrag() {
    if (!ganttDrag) return;
    ganttSave();
    ganttDrag = null;
    document.removeEventListener('mousemove', doGanttDrag);
    document.removeEventListener('mouseup', stopGanttDrag);
}

// ---- Exportar Gantt a Excel (tabla estructurada) ----
function exportGanttToExcel() {
    if (typeof XLSX === 'undefined') { alert('Librería Excel no disponible.'); return; }
    const wb = XLSX.utils.book_new();

    const rows = [['Nivel', 'Código', 'Tarea', 'Semana Inicio', 'Fecha Inicio', 'Semana Fin', 'Fecha Fin', 'Duración (sem.)', 'Duración (días)', 'Importe (€)']];

    ganttTasks.forEach(task => {
        const st = ganttState[task.id];
        if (!st) return;
        const startDate = weekToDate(st.startWeek);
        const endDate = weekToDate(st.startWeek + st.durationWeeks);
        rows.push([
            task.depth,
            task.code,
            task.summary,
            st.startWeek,
            formatDate(startDate),
            formatDate(endDate),
            st.startWeek + st.durationWeeks - 1,
            st.durationWeeks,
            st.durationWeeks * 7,
            parseFloat(task.price.toFixed(2))
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
        { wch: 6 }, { wch: 14 }, { wch: 45 }, { wch: 14 }, { wch: 14 },
        { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 }
    ];
    // Cabecera en negrita
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) cell.s = { font: { bold: true } };
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Planning Gantt');
    const baseName = currentFileName.replace(/\.[^/.]+$/, '');
    XLSX.writeFile(wb, baseName + '_planning.xlsx');
}

// ---- Exportar Gantt a PDF (A4 landscape, 26 sem/página) ----
function exportGanttToPdf() {
    const JsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
    if (!JsPDF) { alert('Librería PDF no disponible.'); return; }

    const doc = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const WEEKS_PER_PAGE = 26;
    const TASK_COL_W = 65;    // mm columna tareas
    const WEEK_W = (297 - TASK_COL_W - 20) / WEEKS_PER_PAGE; // mm por semana
    const ROW_H = 7;          // mm por fila
    const HEADER_H = 14;      // mm cabecera
    const MARGIN = 10;        // mm márgenes
    const PAGE_W = 297;
    const PAGE_H = 210;

    const totalPages = Math.ceil(ganttTotalWeeks / WEEKS_PER_PAGE);

    for (let page = 0; page < totalPages; page++) {
        if (page > 0) doc.addPage();
        const weekStart = page * WEEKS_PER_PAGE + 1;
        const weekEnd = Math.min(weekStart + WEEKS_PER_PAGE - 1, ganttTotalWeeks);

        // Título
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const projectTitle = (parsedData.properties && parsedData.properties.description) || currentFileName.replace(/\.[^/.]+$/, '');
        doc.text('PLANNING: ' + projectTitle, MARGIN, MARGIN - 2);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Semanas ' + weekStart + '–' + weekEnd + '   |   Página ' + (page + 1) + ' de ' + totalPages, PAGE_W - MARGIN, MARGIN - 2, { align: 'right' });

        let y = MARGIN;

        // Cabecera: columna tareas + semanas
        doc.setFillColor(80, 20, 40);
        doc.rect(MARGIN, y, TASK_COL_W, HEADER_H / 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('Tarea', MARGIN + 2, y + HEADER_H / 2 - 2);

        // Cabecera semanas
        for (let w = weekStart; w <= weekEnd; w++) {
            const x = MARGIN + TASK_COL_W + (w - weekStart) * WEEK_W;
            doc.setFillColor(80, 20, 40);
            doc.rect(x, y, WEEK_W, HEADER_H / 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(5.5);
            doc.text('S' + w, x + WEEK_W / 2, y + HEADER_H / 2 - 2, { align: 'center' });
        }
        // Subrow: meses
        let mX = MARGIN + TASK_COL_W;
        let mMonth = null; let mStart = mX;
        for (let w = weekStart; w <= weekEnd; w++) {
            const dt = weekToDate(w);
            const mon = dt.toLocaleDateString('es-ES', { month: 'short' });
            if (mon !== mMonth) {
                if (mMonth) {
                    doc.setFillColor(120, 40, 60);
                    doc.rect(mStart, y + HEADER_H / 2, mX - mStart, HEADER_H / 2, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(5.5);
                    doc.text(mMonth, mStart + (mX - mStart) / 2, y + HEADER_H - 2, { align: 'center' });
                }
                mMonth = mon; mStart = mX;
            }
            mX += WEEK_W;
        }
        if (mMonth) {
            doc.setFillColor(120, 40, 60);
            doc.rect(mStart, y + HEADER_H / 2, mX - mStart, HEADER_H / 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(5.5);
            doc.text(mMonth, mStart + (mX - mStart) / 2, y + HEADER_H - 2, { align: 'center' });
        }

        y += HEADER_H;

        // Filas de tareas
        doc.setFont('helvetica', 'normal');
        let rowIdx = 0;
        ganttTasks.forEach(task => {
            const st = ganttState[task.id];
            if (!st) return;
            if (task.parentId && ganttState[task.parentId] && ganttState[task.parentId].collapsed) return;

            const ry = y + rowIdx * ROW_H;
            if (ry + ROW_H > PAGE_H - MARGIN) return;

            // Fondo alternado
            doc.setFillColor(rowIdx % 2 === 0 ? 252 : 245, rowIdx % 2 === 0 ? 252 : 245, rowIdx % 2 === 0 ? 252 : 245);
            doc.rect(MARGIN, ry, PAGE_W - 2 * MARGIN, ROW_H, 'F');

            // Texto tarea (sangría por nivel)
            const indent = (task.depth - 1) * 3;
            doc.setFontSize(task.depth === 1 ? 6.5 : 5.5);
            doc.setFont('helvetica', task.depth === 1 ? 'bold' : 'normal');
            doc.setTextColor(30, 30, 30);
            const label = task.summary.length > 38 ? task.summary.slice(0, 36) + '…' : task.summary;
            doc.text(label, MARGIN + 2 + indent, ry + ROW_H - 2);

            // Barra
            const barStart = st.startWeek;
            const barDur = st.durationWeeks;
            const visStart = Math.max(weekStart, barStart);
            const visEnd = Math.min(weekEnd, barStart + barDur - 1);

            if (visEnd >= visStart) {
                const bx = MARGIN + TASK_COL_W + (visStart - weekStart) * WEEK_W;
                const bw = (visEnd - visStart + 1) * WEEK_W - 1;
                const bh = ROW_H - 2;
                const colors = [[128, 0, 32], [180, 60, 80], [200, 100, 110]];
                const c = colors[Math.min(task.depth - 1, 2)];
                doc.setFillColor(c[0], c[1], c[2]);
                doc.roundedRect(bx, ry + 1, bw, bh, 1, 1, 'F');
            }

            // Grid vertical de semanas
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            for (let w = weekStart; w <= weekEnd; w++) {
                const wx = MARGIN + TASK_COL_W + (w - weekStart) * WEEK_W;
                doc.line(wx, ry, wx, ry + ROW_H);
            }

            rowIdx++;
        });

        // Borde general
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.3);
        doc.rect(MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN);

        // Pie de página
        doc.setFontSize(6);
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por BC3 Viewer — ' + new Date().toLocaleDateString('es-ES'), MARGIN, PAGE_H - MARGIN + 4);
    }

    const baseName = currentFileName.replace(/\.[^/.]+$/, '');
    doc.save(baseName + '_planning.pdf');
}

// ---- Inicializar eventos del modal Planning ----
const planningBtn = document.getElementById('planningBtn');
const planningModal = document.getElementById('planningModal');
const closePlanningBtn = document.getElementById('closePlanningBtn');
const ganttStartDateInput = document.getElementById('ganttStartDate');
const ganttWeeksInput = document.getElementById('ganttWeeks');
const ganttResetBtn = document.getElementById('ganttResetBtn');
const exportGanttPdfBtn = document.getElementById('exportGanttPdfBtn');
const exportGanttExcelBtn = document.getElementById('exportGanttExcelBtn');

if (planningBtn) {
    planningBtn.addEventListener('click', () => {
        // Inicializar fecha y semanas antes de renderizar
        if (ganttStartDateInput && ganttStartDateInput.value) {
            ganttStartDate = new Date(ganttStartDateInput.value);
        } else if (ganttStartDateInput) {
            ganttStartDate = new Date();
            const iso = ganttStartDate.toISOString().split('T')[0];
            ganttStartDateInput.value = iso;
        }
        if (ganttWeeksInput && ganttWeeksInput.value) {
            ganttTotalWeeks = parseInt(ganttWeeksInput.value) || 26;
        }
        renderPlanningModal();
    });
}

if (closePlanningBtn && planningModal) {
    closePlanningBtn.addEventListener('click', () => {
        planningModal.style.display = 'none';
    });
}

if (planningModal) {
    planningModal.addEventListener('click', e => {
        if (e.target === planningModal) planningModal.style.display = 'none';
    });
}

if (ganttStartDateInput) {
    ganttStartDateInput.addEventListener('change', () => {
        ganttStartDate = new Date(ganttStartDateInput.value);
        if (planningModal && planningModal.style.display !== 'none') rebuildGanttDOM();
        ganttSave();
    });
}

if (ganttWeeksInput) {
    ganttWeeksInput.addEventListener('change', () => {
        ganttTotalWeeks = Math.max(4, Math.min(156, parseInt(ganttWeeksInput.value) || 26));
        ganttWeeksInput.value = ganttTotalWeeks;
        if (planningModal && planningModal.style.display !== 'none') rebuildGanttDOM();
        ganttSave();
    });
}

if (ganttResetBtn) {
    ganttResetBtn.addEventListener('click', () => {
        if (!confirm('¿Reiniciar el planning? Se perderá la distribución actual.')) return;
        ganttState = {};
        initGanttStateAuto(ganttTasks, ganttTotalWeeks);
        ganttSave();
        rebuildGanttDOM();
    });
}

if (exportGanttPdfBtn) {
    exportGanttPdfBtn.addEventListener('click', exportGanttToPdf);
}
if (exportGanttExcelBtn) {
    exportGanttExcelBtn.addEventListener('click', exportGanttToExcel);
}
