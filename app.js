// 1. File Input Change
const fileInput = document.getElementById('bc3file');
let currentFileName = "presupuesto.bc3";
let draftActive = false;
let draftNode = {
    parentCode: null,
    index: 0,
    depth: 0,
    unit: 'ud',
    summary: '',
    qty: '',
    price: ''
};
if (fileInput) {
    fileInput.addEventListener('change', function (e) {
        if (this.files && this.files.length > 0) {
            currentFileName = this.files[0].name;
            document.getElementById('fileName').textContent = currentFileName;
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
if (uploadForm) {
    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const fileInput = document.getElementById('bc3file');

        if (!fileInput.files.length) {
            alert("Por favor selecciona un archivo");
            return;
        }

        const formData = new FormData();
        formData.append('bc3file', fileInput.files[0]);

        const btn = this.querySelector('.process-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Procesando...';
        btn.disabled = true;

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
            btn.textContent = originalText;
            btn.disabled = false;
        }
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

// Column resizing state and defaults (Code, Unit, Qty, Price, Amount)
window.columnWidths = [190, 45, 80, 100, 110];

// Calcular anchos óptimos para cada columna basándose en el contenido real
function calculateOptimalColumnWidths(data) {
    if (!data) return [190, 45, 80, 100, 110];
    
    // 1. Calcular profundidades de todos los conceptos para tabular el Código correctamente
    const depths = {};
    function traverse(code, d) {
        depths[code] = Math.max(depths[code] || 0, d);
        const concept = data.concepts[code];
        if (concept && Array.isArray(concept.children)) {
            concept.children.forEach(childCode => {
                traverse(childCode, d + 1);
            });
        }
    }
    
    const roots = Array.isArray(data.root_nodes) ? data.root_nodes : Object.values(data.root_nodes);
    roots.forEach(code => traverse(code, 0));

    let maxCodeWidth = 150;
    let maxUnitWidth = 40;
    let maxQtyWidth = 80;
    let maxPriceWidth = 100;
    let maxAmountWidth = 110;

    // Crear un canvas temporal para medir texto usando la fuente del visor
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.font = '600 0.9rem Inter, system-ui, sans-serif';
    }

    Object.values(data.concepts).forEach(concept => {
        const codeText = concept.code.replace(/#+\s*$/, '');
        const depth = depths[concept.code] || 0;
        
        // Medida del código: texto + indentación (depth * 20px) + expand-arrow/paddings
        const textWidth = ctx ? ctx.measureText(codeText).width : (codeText.length * 8);
        const totalCodeWidth = textWidth + (depth * 20) + 60; // 60px para el botón expandir y padding
        if (totalCodeWidth > maxCodeWidth) maxCodeWidth = totalCodeWidth;

        // Medida de unidad
        const unitText = concept.unit || '';
        const unitWidth = ctx ? ctx.measureText(unitText).width + 24 : (unitText.length * 8 + 24);
        if (unitWidth > maxUnitWidth) maxUnitWidth = unitWidth;

        // Medida de precio
        const priceVal = parseFloat(concept.price) || 0;
        const priceText = priceVal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
        const priceWidth = ctx ? ctx.measureText(priceText).width + 24 : (priceText.length * 8 + 24);
        if (priceWidth > maxPriceWidth) maxPriceWidth = priceWidth;
    });

    // Límites para evitar anchos extremos y asegurar un diseño limpio y equilibrado
    maxCodeWidth = Math.min(350, Math.max(160, Math.ceil(maxCodeWidth)));
    maxUnitWidth = Math.min(80, Math.max(45, Math.ceil(maxUnitWidth)));
    maxQtyWidth = Math.min(110, Math.max(80, Math.ceil(maxQtyWidth)));
    maxPriceWidth = Math.min(160, Math.max(100, Math.ceil(maxPriceWidth)));
    maxAmountWidth = Math.min(180, Math.max(110, Math.ceil(maxAmountWidth)));

    return [maxCodeWidth, maxUnitWidth, maxQtyWidth, maxPriceWidth, maxAmountWidth];
}

/**
 * Transforma un elemento de texto en un campo editable con mini lápiz azul y confirmación (OK/Cancelar).
 * @param {HTMLElement} textEl El nodo de texto (ej. td, div, h2).
 * @param {Function} onSave Callback al guardar cambios. Retorna true si tiene éxito.
 * @param {Object} options Configuración adicional (isNumeric, multiLine, onFocus).
 */
function setupExplicitEdit(textEl, onSave, options = {}) {
    if (!textEl) return;
    
    if (textEl.dataset.explicitEditSetup) return;
    textEl.dataset.explicitEditSetup = "true";
    
    // Guardar el contenido original
    const originalHTML = textEl.innerHTML;
    textEl.innerHTML = '';
    
    // Crear el span interno que será editable
    const valEl = document.createElement('span');
    valEl.className = 'editable-val';
    valEl.contentEditable = "false";
    valEl.innerHTML = originalHTML;
    
    // Crear el contenedor de alineación flexible interno
    const container = document.createElement('div');
    container.className = 'editable-container';
    container.appendChild(valEl);
    
    const actions = document.createElement('div');
    actions.className = 'edit-actions';
    
    const btnPencil = document.createElement('button');
    btnPencil.type = 'button';
    btnPencil.className = 'btn-edit-pencil';
    btnPencil.textContent = '✏️';
    btnPencil.title = 'Editar';
    
    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.className = 'btn-edit-ok';
    btnOk.textContent = '✔️';
    btnOk.title = 'Aceptar';
    btnOk.style.display = 'none';
    
    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'btn-edit-cancel';
    btnCancel.textContent = '❌';
    btnCancel.title = 'Cancelar';
    btnCancel.style.display = 'none';
    
    actions.appendChild(btnPencil);
    actions.appendChild(btnOk);
    actions.appendChild(btnCancel);
    container.appendChild(actions);
    
    // Inyectar el contenedor dentro del elemento original sin romper su etiqueta o jerarquía en el DOM
    textEl.appendChild(container);
    
    let originalVal = "";
    
    function startEdit() {
        originalVal = valEl.innerHTML;
        if (options.isNumeric) {
            const valText = valEl.textContent.trim().replace(/[^\d.,-]/g, '').replace(',', '.');
            const numVal = parseFloat(valText);
            valEl.textContent = isNaN(numVal) ? '' : numVal;
        }
        
        valEl.contentEditable = "true";
        valEl.focus();
        
        btnPencil.style.display = 'none';
        btnOk.style.display = 'inline-flex';
        btnCancel.style.display = 'inline-flex';
        
        if (options.onFocus) options.onFocus();
    }
    
    function saveEdit() {
        let newValText = valEl.textContent.trim();
        if (options.multiLine) {
            newValText = valEl.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<div\b[^>]*>/gi, '')
                .replace(/<\/div>/gi, '\n')
                .replace(/&nbsp;/g, ' ')
                .replace(/<[^>]*>/g, '')
                .trim();
        }
        
        let success = true;
        if (onSave) {
            success = onSave(newValText);
        }
        
        if (success !== false) {
            valEl.contentEditable = "false";
            btnPencil.style.display = 'inline-flex';
            btnOk.style.display = 'none';
            btnCancel.style.display = 'none';
        }
    }
    
    function cancelEdit() {
        valEl.innerHTML = originalVal;
        valEl.contentEditable = "false";
        btnPencil.style.display = 'inline-flex';
        btnOk.style.display = 'none';
        btnCancel.style.display = 'none';
    }
    
    btnPencil.addEventListener('click', (e) => {
        e.stopPropagation();
        startEdit();
    });
    
    btnOk.addEventListener('click', (e) => {
        e.stopPropagation();
        saveEdit();
    });
    
    btnCancel.addEventListener('click', (e) => {
        e.stopPropagation();
        cancelEdit();
    });
    
    valEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !options.multiLine) {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
    
    valEl.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

/**
 * Actualiza el texto de un elemento editable de manera segura sin destruir sus botones e icono de lápiz.
 */
function updateEditableText(el, text, isHTML = false) {
    if (!el) return;
    const valEl = el.querySelector('.editable-val') || el;
    if (isHTML) {
        valEl.innerHTML = text;
    } else {
        valEl.textContent = text;
    }
}

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
    header.id = 'treeHeader';
    if (window.columnWidths && window.columnWidths.length >= 5) {
        const w = window.columnWidths;
        header.style.gridTemplateColumns = `${w[0]}px ${w[1]}px 1fr ${w[2]}px ${w[3]}px ${w[4]}px`;
    }
    
    const colHCode = document.createElement('div');
    colHCode.style.display = 'flex';
    colHCode.style.alignItems = 'center';
    colHCode.style.justifyContent = 'space-between';
    colHCode.style.gap = '8px';
    colHCode.innerHTML = `<span>Código</span>`;
    
    const toggleDraftBtn = document.createElement('button');
    toggleDraftBtn.type = 'button';
    toggleDraftBtn.id = 'toggleDraftBtn';
    toggleDraftBtn.style.cssText = `
        padding: 3px 8px;
        font-size: 11px;
        margin: 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s;
    `;
    if (draftActive) {
        toggleDraftBtn.textContent = '✕ Cerrar';
        toggleDraftBtn.style.backgroundColor = '#ef4444';
        toggleDraftBtn.style.color = 'white';
    } else {
        toggleDraftBtn.textContent = '➕ Nueva Partida';
        toggleDraftBtn.style.backgroundColor = 'var(--accent, #3b82f6)';
        toggleDraftBtn.style.color = 'white';
    }
    toggleDraftBtn.onclick = (e) => {
        e.stopPropagation();
        draftActive = !draftActive;
        if (draftActive) {
            draftNode = {
                parentCode: null,
                index: 0,
                depth: 0,
                unit: 'ud',
                summary: '',
                qty: '',
                price: ''
            };
        }
        renderCurrentLevel();
    };
    colHCode.appendChild(toggleDraftBtn);

    const colHUnit = document.createElement('div');
    colHUnit.textContent = 'Ud';
    const colHSummary = document.createElement('div');
    colHSummary.textContent = 'Resumen';
    const colHQty = document.createElement('div');
    colHQty.textContent = 'Cantidad';
    const colHPrice = document.createElement('div');
    colHPrice.textContent = 'Precio';
    const colHAmount = document.createElement('div');
    colHAmount.textContent = 'Importe';

    header.appendChild(colHCode);
    header.appendChild(colHUnit);
    header.appendChild(colHSummary);
    header.appendChild(colHQty);
    header.appendChild(colHPrice);
    header.appendChild(colHAmount);
    
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
        roots.forEach((code, idx) => {
            if (draftActive && draftNode.parentCode === null && draftNode.index === idx) {
                rootList.appendChild(createDraftNodeRow(0));
            }
            const rootNode = createNode(code, true, 0, 1, false); // false = desktop mode
            if (rootNode) {
                rootList.appendChild(rootNode);
            }
        });
        if (draftActive && draftNode.parentCode === null && draftNode.index >= roots.length) {
            rootList.appendChild(createDraftNodeRow(0));
        }
    }

    treeContainer.appendChild(rootList);

    // Re-apply filter if exists
    const searchTerm = document.getElementById('searchTerm').value.trim();
    if (searchTerm) {
        filterTree(searchTerm);
    }
    
    // Apply current column width template
    updateGridTemplate();
}



// Update grid template for all rows
function updateGridTemplate() {
    if (!window.columnWidths || window.columnWidths.length < 5) return;
    
    const w = window.columnWidths;
    const template = `${w[0]}px ${w[1]}px 1fr ${w[2]}px ${w[3]}px ${w[4]}px`;

    // Update header
    const header = document.getElementById('treeHeader');
    if (header) {
        header.style.gridTemplateColumns = template;
        
        // Update individual header column widths (excluding summary 1fr)
        const cols = header.children;
        if (cols.length >= 6) {
            cols[0].style.width = w[0] + 'px';
            cols[1].style.width = w[1] + 'px';
            // cols[2] is Resumen (1fr), we don't set a fixed width on it
            cols[3].style.width = w[2] + 'px';
            cols[4].style.width = w[3] + 'px';
            cols[5].style.width = w[4] + 'px';
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

    // Calcular anchos de columna automáticos óptimos
    window.columnWidths = calculateOptimalColumnWidths(data);

    // Inicializar historial
    stateHistory = [JSON.stringify(parsedData)];
    historyIndex = 0;
    updateUndoRedoButtonsState();

    // Reset navigation state
    navigationStack = [];
    currentLevel = null;

    // Show control containers and buttons
    const dashboardContainer = document.getElementById('dashboardContainer');
    const vizContainer = document.getElementById('vizContainer');
    const coeffsContainer = document.getElementById('coeffsContainer');
    const compareContainer = document.getElementById('compareContainer');
    const exportContainer = document.getElementById('exportContainer');
    if (dashboardContainer) dashboardContainer.style.display = 'flex';
    if (vizContainer) vizContainer.style.display = 'flex';
    if (coeffsContainer) coeffsContainer.style.display = 'flex';
    if (compareContainer) compareContainer.style.display = 'flex';
    if (exportContainer) exportContainer.style.display = 'flex';

    const sBtn = document.getElementById('saveBtn');
    if (sBtn) sBtn.style.display = 'inline-block';

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

        // Reset to active Presupuesto view tab
        const presupuestoBtn = document.getElementById('presupuestoBtn');
        if (presupuestoBtn) {
            presupuestoBtn.click();
        }
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
    if (window.columnWidths && window.columnWidths.length >= 5) {
        const w = window.columnWidths;
        row.style.gridTemplateColumns = `${w[0]}px ${w[1]}px 1fr ${w[2]}px ${w[3]}px ${w[4]}px`;
    }

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
    toggle.textContent = '▶';
    // Hide if no children, but keep space? Or just opacity 0? 
    // User said "remove column", if simple node, maybe no triangle at all?
    // "ponerlos al lado del código".
    if (hasChildren || (draftActive && draftNode.parentCode === code)) {
        toggle.style.opacity = '1';
        if (isRoot || expandedNodes.has(code) || (draftActive && draftNode.parentCode === code)) toggle.classList.add('expanded');
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
    
    setupExplicitEdit(colSummary, (newSummary) => {
        if (newSummary && newSummary !== concept.summary) {
            concept.summary = newSummary;
            saveHistoryState();
            
            // Actualizar panel de detalles si coincide el código
            const detCodeEl = document.getElementById('detCode');
            const detSummaryEl = document.getElementById('detSummary');
            if (detCodeEl && detSummaryEl && detCodeEl.textContent === concept.code.replace(/#+\s*$/, '')) {
                const valEl = detSummaryEl.classList.contains('editable-val') ? detSummaryEl : detSummaryEl.querySelector('.editable-val');
                if (valEl) valEl.textContent = newSummary;
                else detSummaryEl.textContent = newSummary;
            }
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
        setupExplicitEdit(colPrice, (newPriceText) => {
            const rawText = newPriceText.trim().replace(',', '.');
            const newVal = parseFloat(rawText);
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
                    return true;
                }
            }
            const prevPrice = parseFloat(concept.price) || 0;
            colPrice.textContent = prevPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 });
            return false;
        }, {
            isNumeric: true
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
            }
        }
    };



    container.appendChild(row);

    // Children Container
    const draftForThisNode = draftActive && draftNode.parentCode === code;
    if (hasChildren || draftForThisNode) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-node-children';
        
        const isNodeExpanded = isRoot || expandedNodes.has(code) || draftForThisNode;
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
            decomposition.forEach((item, idx) => {
                if (draftActive && draftNode.parentCode === code && draftNode.index === idx) {
                    childrenContainer.appendChild(createDraftNodeRow(depth + 1));
                }
                const childNode = createNode(item.code, false, depth + 1, item.factor, mobileMode, item.type || 0);
                if (childNode) {
                    childrenContainer.appendChild(childNode);
                }
            });
            if (draftActive && draftNode.parentCode === code && draftNode.index >= decomposition.length) {
                childrenContainer.appendChild(createDraftNodeRow(depth + 1));
            }
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

    const isRoot = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes.includes(concept.code) : Object.values(parsedData.root_nodes).includes(concept.code);
    const isChapter = concept.code.endsWith('#') || (concept.decomposition && concept.decomposition.length > 0) || (concept.children && concept.children.length > 0) || isRoot;
    
    const addPartidaContainer = document.getElementById('addPartidaContainer');
    if (addPartidaContainer) {
        if (isChapter) {
            addPartidaContainer.style.display = 'block';
            const addPartidaBtn = document.getElementById('addPartidaBtn');
            if (addPartidaBtn) {
                addPartidaBtn.dataset.parentCode = concept.code;
                addPartidaBtn.textContent = `➕ Añadir Partida a ${concept.code.replace(/#+\s*$/, '')}`;
            }
        } else {
            addPartidaContainer.style.display = 'none';
        }
    }

    document.getElementById('detCode').textContent = concept.code.replace(/#+\s*$/, '');
    updateEditableText(document.getElementById('detSummary'), concept.summary);
    document.getElementById('detPrice').textContent = parseFloat(concept.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

    // Description: Prefer ~T description, fallback to Summary
    updateEditableText(document.getElementById('detDescription'), (concept.description || concept.summary).replace(/\n/g, '<br>'), true);

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

            const tdCode = document.createElement('td');
            tdCode.textContent = item.code.replace(/#+\s*$/, '');
            
            const tdFactor = document.createElement('td');
            tdFactor.textContent = `${factor.toLocaleString('es-ES')} ${childNode ? childNode.unit : ''}`;
            
            const tdSummary = document.createElement('td');
            tdSummary.textContent = childNode ? childNode.summary : '???';
            if (childNode) {
                setupExplicitEdit(tdSummary, (newSummary) => {
                    if (newSummary && newSummary !== childNode.summary) {
                        childNode.summary = newSummary;
                        saveHistoryState();
                        
                        const treeNodeSummary = document.querySelector(`.tree-node-container[data-code="${childNode.code}"] > .tree-node-row > .col-summary`);
                        if (treeNodeSummary) {
                            const valEl = treeNodeSummary.querySelector('.editable-val') || treeNodeSummary;
                            valEl.textContent = newSummary;
                        }
                        
                        const detCodeEl = document.getElementById('detCode');
                        const detSummaryEl = document.getElementById('detSummary');
                        if (detCodeEl && detSummaryEl && detCodeEl.textContent === childNode.code.replace(/#+\s*$/, '')) {
                            const valEl = detSummaryEl.querySelector('.editable-val') || detSummaryEl;
                            valEl.textContent = newSummary;
                        }
                        return true;
                    }
                    return false;
                });
            }
            
            const tdPrice = document.createElement('td');
            tdPrice.textContent = `${childPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
            
            const tdTotal = document.createElement('td');
            tdTotal.innerHTML = `<strong>${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</strong>`;
            
            row.appendChild(tdCode);
            row.appendChild(tdFactor);
            row.appendChild(tdSummary);
            row.appendChild(tdPrice);
            row.appendChild(tdTotal);
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
        totalEl.innerHTML = `<span class="lbl">PEM</span><span class="val">${pem.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>`;
        
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
            totalPecEl.innerHTML = `<span class="lbl">PEC</span><span class="val">${pec.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>`;
            totalPecEl.style.display = 'flex';
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

    // Exportar las nuevas partidas agregadas al archivo BC3
    if (parsedData && parsedData.concepts) {
        Object.values(parsedData.concepts).forEach(concept => {
            if (concept.isNewPartida) {
                const formattedPrice = (parseFloat(concept.price) || 0).toFixed(2);
                // Formato FIEBDC-3: ~C|código|unidad|resumen|precio|tipo|
                const cLine = `~C|${concept.code}|${concept.unit || 'ud'}|${concept.summary || ''}|${formattedPrice}|0|`;
                modifiedLines.push(cLine);
            }
        });
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
        themeToggleBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        themeToggleBtn.textContent = '🌙';
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
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

            // Simular subida idéntica al formulario
            const formData = new FormData();
            formData.append('bc3file', file);

            const processBtn = document.querySelector('.process-btn');
            const originalText = processBtn ? processBtn.textContent : 'Procesar';
            if (processBtn) {
                processBtn.textContent = 'Procesando...';
                processBtn.disabled = true;
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
                if (processBtn) {
                    processBtn.textContent = originalText;
                    processBtn.disabled = false;
                }
            }
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
    if (!parsedData) return;

    const dist = calculateResourceDistribution();
    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#e2e8f0' : '#1e293b';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    // ─── Recopilar datos de capítulos (children del root) ───
    const roots = Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    const chapters = [];
    roots.forEach(rootCode => {
        const root = parsedData.concepts[rootCode];
        if (!root) return;
        const children = getConceptDecomposition(root);
        children.forEach(ch => {
            const concept = parsedData.concepts[ch.code];
            if (!concept) return;
            // Calcular distribución MO/MAQ/MAT por capítulo
            let mo = 0, maq = 0, mat = 0, sub = 0;
            function accumulate(code, qty) {
                const c = parsedData.concepts[code];
                if (!c) return;
                if (c.code.endsWith('#') || c.is_root) {
                    getConceptDecomposition(c).forEach(ci => accumulate(ci.code, qty * (parseFloat(ci.factor) || 1)));
                } else {
                    (c.decomposition || []).forEach(item => {
                        const child = parsedData.concepts[item.code];
                        const childPrice = child ? (parseFloat(child.price) || 0) : 0;
                        const cost = (parseFloat(item.factor) || 0) * childPrice * qty;
                        if (item.type === 1) mo += cost;
                        else if (item.type === 2) maq += cost;
                        else if (item.type === 3) mat += cost;
                        else sub += cost;
                    });
                    if (!c.decomposition || c.decomposition.length === 0) sub += (parseFloat(c.price) || 0) * qty;
                }
            }
            accumulate(ch.code, parseFloat(ch.factor) || 1);

            // Recopilar partidas hoja del capítulo para precio medio/máximo
            const leaves = [];
            function collectLeaves(code) {
                const c = parsedData.concepts[code];
                if (!c) return;
                const kids = getConceptDecomposition(c);
                if (kids.length === 0 || (!c.code.endsWith('#') && !c.is_root)) {
                    const p = parseFloat(c.price) || 0;
                    if (p > 0) leaves.push(p);
                } else {
                    kids.forEach(k => collectLeaves(k.code));
                }
            }
            collectLeaves(ch.code);

            const totalCost = (parseFloat(concept.price) || 0) * (parseFloat(ch.factor) || 1);
            const avgPrice = leaves.length > 0 ? leaves.reduce((a, b) => a + b, 0) / leaves.length : 0;
            const maxPrice = leaves.length > 0 ? Math.max(...leaves) : 0;

            chapters.push({
                summary: (concept.summary || concept.code).substring(0, 20),
                cost: totalCost,
                mo, maq, mat, sub,
                avgPrice, maxPrice,
                numLeaves: leaves.length
            });
        });
    });

    chapters.sort((a, b) => b.cost - a.cost);
    const top = chapters.slice(0, 8);
    const topLabels = top.map(c => c.summary);

    // ─── Total partidas hoja del presupuesto ───
    let totalLeaves = 0, allPrices = [];
    Object.values(parsedData.concepts).forEach(c => {
        const kids = getConceptDecomposition(c);
        if (kids.length === 0 && !c.code.endsWith('#') && !c.is_root) {
            const p = parseFloat(c.price) || 0;
            if (p > 0) { totalLeaves++; allPrices.push(p); }
        }
    });
    const globalAvg = allPrices.length > 0 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0;
    const globalMax = allPrices.length > 0 ? Math.max(...allPrices) : 0;
    const totalBudget = Object.values(parsedData.concepts)
        .filter(c => c.is_root || c.code.endsWith('#'))
        .reduce((s, c) => s + (parseFloat(c.price) || 0), 0);
    const totalPEM = chapters.reduce((s, c) => s + c.cost, 0);
    const moTotal = dist.MO, maqTotal = dist.MAQ, matTotal = dist.MAT, subTotal = dist.SUB;
    const costTotal = moTotal + maqTotal + matTotal + subTotal || 1;
    const pctMO = (moTotal / costTotal * 100).toFixed(1);
    const pctMat = (matTotal / costTotal * 100).toFixed(1);
    const pctMaq = (maqTotal / costTotal * 100).toFixed(1);

    // ─── KPI Strip ───
    const strip = document.getElementById('dbKpiStrip');
    if (strip) {
        const kpis = [
            { icon: '💶', label: 'PEM Total', val: totalPEM.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €' },
            { icon: '📂', label: 'Capítulos', val: chapters.length },
            { icon: '📋', label: 'Partidas', val: totalLeaves },
            { icon: '📐', label: 'Precio Medio', val: globalAvg.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €' },
            { icon: '🔝', label: 'Precio Máx.', val: globalMax.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €' },
            { icon: '👷', label: '% Mano Obra', val: pctMO + '%' },
            { icon: '🏗️', label: '% Materiales', val: pctMat + '%' },
            { icon: '⚙️', label: '% Maquinaria', val: pctMaq + '%' },
        ];
        strip.innerHTML = kpis.map(k =>
            `<div class="db-kpi-card"><span class="db-kpi-icon">${k.icon}</span><span class="db-kpi-label">${k.label}</span><span class="db-kpi-val">${k.val}</span></div>`
        ).join('');
    }

    // ─── Destruir instancias previas ───
    ['typeChartInstance','chaptersChartInstance','chapterBreakdownChart','priceAvgMaxChart','priceRangeChart','weightPieChart'].forEach(key => {
        if (window[key]) { try { window[key].destroy(); } catch(e){} window[key] = null; }
    });

    const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

    // 1. Doughnut - Distribución por tipo de coste
    const ctx1 = document.getElementById('resourceTypeChart');
    if (ctx1) {
        typeChartInstance = new Chart(ctx1.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Mano de Obra', 'Maquinaria', 'Materiales', 'Subcontratas/Otros'],
                datasets: [{ data: [dist.MO, dist.MAQ, dist.MAT, dist.SUB],
                    backgroundColor: ['#ef4444','#f59e0b','#3b82f6','#a855f7'], borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: labelColor, padding: 12 } },
                    tooltip: { callbacks: { label: ctx => {
                        const v = ctx.parsed; const t = ctx.dataset.data.reduce((a,b)=>a+b,0)||1;
                        return ` ${ctx.label}: ${v.toLocaleString('es-ES',{minimumFractionDigits:2})} € (${(v/t*100).toFixed(1)}%)`;
                    }}}}}
        });
    }

    // 2. Bar horizontal - Top capítulos por peso
    const ctx2 = document.getElementById('chaptersCostChart');
    if (ctx2) {
        chaptersChartInstance = new Chart(ctx2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topLabels,
                datasets: [{ label: 'Coste (€)', data: top.map(c => c.cost),
                    backgroundColor: top.map((_, i) => COLORS[i % COLORS.length]), borderRadius: 4 }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { color: labelColor }, grid: { color: gridColor } },
                    y: { ticks: { color: labelColor } } } }
        });
    }

    // 3. Stacked bar - MO/MAQ/MAT por capítulo
    const ctx3 = document.getElementById('chapterBreakdownChart');
    if (ctx3) {
        window.chapterBreakdownChart = new Chart(ctx3.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topLabels,
                datasets: [
                    { label: 'Mano Obra', data: top.map(c => c.mo), backgroundColor: '#ef4444', borderRadius: 2 },
                    { label: 'Maquinaria', data: top.map(c => c.maq), backgroundColor: '#f59e0b', borderRadius: 2 },
                    { label: 'Materiales', data: top.map(c => c.mat), backgroundColor: '#3b82f6', borderRadius: 2 },
                    { label: 'Otros/Sub.', data: top.map(c => c.sub), backgroundColor: '#a855f7', borderRadius: 2 },
                ]
            },
            options: { responsive: true, maintainAspectRatio: false,
                scales: { x: { stacked: true, ticks: { color: labelColor }, grid: { color: gridColor } },
                    y: { stacked: true, ticks: { color: labelColor }, grid: { color: gridColor } } },
                plugins: { legend: { labels: { color: labelColor } } } }
        });
    }

    // 4. Line/Bar combo - Precio medio y máximo por capítulo
    const ctx4 = document.getElementById('priceAvgMaxChart');
    if (ctx4) {
        window.priceAvgMaxChart = new Chart(ctx4.getContext('2d'), {
            type: 'bar',
            data: {
                labels: topLabels,
                datasets: [
                    { type: 'bar', label: 'Precio Máx. (€)', data: top.map(c => c.maxPrice),
                        backgroundColor: 'rgba(239,68,68,0.5)', borderColor: '#ef4444', borderWidth: 1, borderRadius: 4 },
                    { type: 'line', label: 'Precio Medio (€)', data: top.map(c => c.avgPrice),
                        borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)',
                        fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#10b981' },
                ]
            },
            options: { responsive: true, maintainAspectRatio: false,
                scales: { x: { ticks: { color: labelColor }, grid: { color: gridColor } },
                    y: { ticks: { color: labelColor }, grid: { color: gridColor } } },
                plugins: { legend: { labels: { color: labelColor } } } }
        });
    }

    // 5. Histogram - Distribución por rango de precio
    const ctx5 = document.getElementById('priceRangeChart');
    if (ctx5) {
        const ranges = [[0,10],[10,50],[50,200],[200,500],[500,1000],[1000,5000],[5000,Infinity]];
        const rangeLabels = ['<10€','10–50€','50–200€','200–500€','500–1k€','1k–5k€','>5k€'];
        const counts = ranges.map(([lo, hi]) => allPrices.filter(p => p >= lo && p < hi).length);
        window.priceRangeChart = new Chart(ctx5.getContext('2d'), {
            type: 'bar',
            data: {
                labels: rangeLabels,
                datasets: [{ label: 'Nº de Partidas', data: counts,
                    backgroundColor: COLORS, borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { ticks: { color: labelColor }, grid: { color: gridColor } },
                    y: { ticks: { color: labelColor, stepSize: 1 }, grid: { color: gridColor } } } }
        });
    }

    // 6. Pie - Peso económico por capítulo
    const ctx6 = document.getElementById('weightPieChart');
    if (ctx6) {
        window.weightPieChart = new Chart(ctx6.getContext('2d'), {
            type: 'pie',
            data: {
                labels: chapters.map(c => c.summary),
                datasets: [{ data: chapters.map(c => c.cost),
                    backgroundColor: chapters.map((_, i) => COLORS[i % COLORS.length]), borderWidth: 1 }]
            },
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: labelColor, boxWidth: 12, padding: 8 } },
                    tooltip: { callbacks: { label: ctx => {
                        const v = ctx.parsed; const t = chapters.reduce((a,c)=>a+c.cost,0)||1;
                        return ` ${ctx.label}: ${v.toLocaleString('es-ES',{minimumFractionDigits:2})} € (${(v/t*100).toFixed(1)}%)`;
                    }}}}}
        });
    }
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
    const costFilterVal = document.getElementById('costFilter').value;
    if (costFilterVal !== 'all') {
        const limit = parseFloat(costFilterVal);
        const price = parseFloat(concept.price) || 0;
        const quantity = parseFloat(concept.quantity) || 1.0;
        const cost = price * quantity;
        if (cost <= limit) return false;
    }

    // Filtro por Tipo de Recurso
    const resourceFilterVal = document.getElementById('resourceFilter').value;
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
        const costFilterVal = document.getElementById('costFilter').value;
        const resourceFilterVal = document.getElementById('resourceFilter').value;
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

// Info modal toggling
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeInfoBtn = document.getElementById('closeInfoBtn');

if (infoBtn && infoModal && closeInfoBtn) {
    infoBtn.addEventListener('click', () => {
        infoModal.style.display = 'flex';
    });

    closeInfoBtn.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.style.display = 'none';
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
const collapseAllBtn = document.getElementById('collapseAllBtn');
const costFilter = document.getElementById('costFilter');
const resourceFilter = document.getElementById('resourceFilter');

if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
        if (!parsedData) return;
        Object.keys(parsedData.concepts).forEach(code => {
            if (code.endsWith('#')) {
                expandedNodes.add(code);
            }
        });
        renderCurrentLevel();
    });
}

if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
        expandedNodes.clear();
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
let GANTT_COL_PX = 44; // ancho de cada columna en px (redimensionable por zoom slider)
let ganttViewMode = 'weeks'; // escala de tiempo: 'days', 'weeks', 'months'
let ganttLeftColWidth = 460;  // ancho columna tareas en px (redimensionable)
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
    // depth=2 son los capítulos reales; depth=1 es el nodo raíz único del proyecto BC3
    let chapterDepth = tasks.some(t => t.depth === 2) ? 2 : 1;
    const total = tasks.filter(t => t.depth === chapterDepth).reduce((s, t) => s + t.price, 0) || 1;
    let cursor = 1;

    tasks.forEach(task => {
        if (ganttState[task.id]) return; // ya guardado
        if (task.depth === chapterDepth) {
            const proportion = task.price / total;
            const dur = Math.max(1, Math.round(proportion * totalWeeks));
            ganttState[task.id] = { startWeek: cursor, durationWeeks: dur, collapsed: false };
            cursor += dur;
        }
    });

    // Subcapítulos y partidas: distribuidos dentro del padre
    tasks.forEach(task => {
        if (ganttState[task.id]) return;
        if (task.depth > chapterDepth && task.parentId && ganttState[task.parentId]) {
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

    // Inicializar el nodo raíz si existe (depth < chapterDepth)
    tasks.forEach(task => {
        if (ganttState[task.id]) return;
        if (task.depth < chapterDepth) {
            ganttState[task.id] = { startWeek: 1, durationWeeks: totalWeeks, collapsed: false };
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

    if (ganttViewMode === 'days') {
        // Modo DÍAS: Fila 1 = Semanas, Fila 2 = Días del mes
        let lastWeekNum = null;
        let weekSpan = 0;
        let weekCells = [];
        const totalDays = totalWeeks * 7;

        for (let d = 1; d <= totalDays; d++) {
            const date = new Date(ganttStartDate);
            date.setDate(date.getDate() + (d - 1));
            const wNum = Math.ceil(d / 7);

            const dCell = document.createElement('div');
            dCell.className = 'gantt-week-cell';
            dCell.style.width = GANTT_COL_PX + 'px';
            dCell.textContent = date.getDate();
            dCell.title = formatDate(date);
            weekRow.appendChild(dCell);

            if (wNum !== lastWeekNum) {
                if (lastWeekNum !== null) {
                    const mCell = document.createElement('div');
                    mCell.className = 'gantt-month-cell';
                    mCell.textContent = 'Semana ' + lastWeekNum;
                    mCell.style.width = (weekSpan * GANTT_COL_PX) + 'px';
                    weekCells.push(mCell);
                }
                lastWeekNum = wNum;
                weekSpan = 1;
            } else {
                weekSpan++;
            }
        }
        if (lastWeekNum) {
            const mCell = document.createElement('div');
            mCell.className = 'gantt-month-cell';
            mCell.textContent = 'Semana ' + lastWeekNum;
            mCell.style.width = (weekSpan * GANTT_COL_PX) + 'px';
            weekCells.push(mCell);
        }
        weekCells.forEach(c => monthRow.appendChild(c));

    } else if (ganttViewMode === 'months') {
        // Modo MESES: Fila 1 = Años, Fila 2 = Nombres de mes
        const totalMonths = Math.ceil(totalWeeks / 4);
        let lastYear = null;
        let yearSpan = 0;
        let yearCells = [];

        for (let m = 1; m <= totalMonths; m++) {
            const date = new Date(ganttStartDate);
            date.setMonth(date.getMonth() + (m - 1));
            const year = date.getFullYear();

            const mCell = document.createElement('div');
            mCell.className = 'gantt-week-cell';
            mCell.style.width = GANTT_COL_PX + 'px';
            mCell.textContent = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
            mCell.title = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            weekRow.appendChild(mCell);

            if (year !== lastYear) {
                if (lastYear !== null) {
                    const yCell = document.createElement('div');
                    yCell.className = 'gantt-month-cell';
                    yCell.textContent = lastYear;
                    yCell.style.width = (yearSpan * GANTT_COL_PX) + 'px';
                    yearCells.push(yCell);
                }
                lastYear = year;
                yearSpan = 1;
            } else {
                yearSpan++;
            }
        }
        if (lastYear) {
            const yCell = document.createElement('div');
            yCell.className = 'gantt-month-cell';
            yCell.textContent = lastYear;
            yCell.style.width = (yearSpan * GANTT_COL_PX) + 'px';
            yearCells.push(yCell);
        }
        yearCells.forEach(c => monthRow.appendChild(c));

    } else {
        // Modo SEMANAS (Predeterminado)
        let lastMonth = null;
        let monthSpan = 0;
        let monthCells = [];

        for (let w = 1; w <= totalWeeks; w++) {
            const date = weekToDate(w);
            const month = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

            const wCell = document.createElement('div');
            wCell.className = 'gantt-week-cell';
            wCell.style.width = GANTT_COL_PX + 'px';
            wCell.textContent = 'S' + w;
            wCell.title = formatDate(date);
            weekRow.appendChild(wCell);

            if (month !== lastMonth) {
                if (lastMonth !== null) {
                    const mCell = document.createElement('div');
                    mCell.className = 'gantt-month-cell';
                    mCell.textContent = lastMonth;
                    mCell.style.width = (monthSpan * GANTT_COL_PX) + 'px';
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
            mCell.style.width = (monthSpan * GANTT_COL_PX) + 'px';
            monthCells.push(mCell);
        }
        monthCells.forEach(c => monthRow.appendChild(c));
    }

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
    } else {
        recalculateParentTasks();
        recalculateParentProgress();
    }

    // Sincronizar el input de fecha con la fecha real cargada
    const ganttStartDateInput = document.getElementById('ganttStartDate');
    if (ganttStartDateInput) {
        const year = ganttStartDate.getFullYear();
        const month = String(ganttStartDate.getMonth() + 1).padStart(2, '0');
        const day = String(ganttStartDate.getDate()).padStart(2, '0');
        ganttStartDateInput.value = `${year}-${month}-${day}`;
    }

    // Sincronizar las semanas con el input
    const ganttWeeksInput = document.getElementById('ganttWeeks');
    if (ganttWeeksInput) {
        ganttWeeksInput.value = ganttTotalWeeks;
    }

    const modal = document.getElementById('planningModal');
    if (!modal) return;
    modal.style.display = 'flex';

    rebuildGanttDOM();
}

// Recalcular dinámicamente las fechas de los capítulos (padres) basándose en sus hijos
function recalculateParentTasks() {
    if (!ganttTasks || ganttTasks.length === 0) return;
    
    // depth=1: nodo raíz global; depth=2: capítulos; depth=3: sub-capítulos/partidas
    // Procesar de abajo hacia arriba: 3 → 2 → 1
    for (let d = 3; d >= 1; d--) {
        ganttTasks.forEach(task => {
            if (task.depth === d && task.hasKids) {
                const children = ganttTasks.filter(c => c.parentId === task.id);
                if (children.length > 0) {
                    let minStart = 9999;
                    let maxEnd = 0;
                    
                    children.forEach(c => {
                        const cSt = ganttState[c.id];
                        if (cSt) {
                            if (cSt.startWeek < minStart) minStart = cSt.startWeek;
                            const cEnd = cSt.startWeek + cSt.durationWeeks;
                            if (cEnd > maxEnd) maxEnd = cEnd;
                        }
                    });
                    
                    if (minStart !== 9999 && maxEnd > 0) {
                        if (!ganttState[task.id]) {
                            ganttState[task.id] = { collapsed: false };
                        }
                        ganttState[task.id].startWeek = minStart;
                        ganttState[task.id].durationWeeks = Math.max(1, maxEnd - minStart);
                    }
                }
            }
        });
    }
}

// Calcular el camino crítico entre los capítulos reales (depth === 2)
function getCriticalPath() {
    const criticalIds = new Set();
    if (!ganttTasks || ganttTasks.length === 0) return criticalIds;
    
    // Los capítulos reales están en depth=2 (depth=1 es el nodo raíz del proyecto)
    let chapters = ganttTasks.filter(t => t.depth === 2);
    if (chapters.length === 0) chapters = ganttTasks.filter(t => t.depth === 1); // fallback
    if (chapters.length === 0) return criticalIds;
    
    // Encontrar la semana de fin máxima de entre todos los capítulos
    let maxEnd = 0;
    chapters.forEach(t => {
        const st = ganttState[t.id];
        if (st) {
            const end = st.startWeek + st.durationWeeks;
            if (end > maxEnd) maxEnd = end;
        }
    });
    
    if (maxEnd === 0) return criticalIds;
    
    // Empezar con los capítulos que terminan en maxEnd
    const endChapters = chapters.filter(t => {
        const st = ganttState[t.id];
        return st && (st.startWeek + st.durationWeeks === maxEnd);
    });
    
    endChapters.forEach(t => criticalIds.add(t.id));
    
    // Trazar hacia atrás recursivamente
    let changed = true;
    while (changed) {
        changed = false;
        chapters.forEach(t => {
            if (criticalIds.has(t.id)) return;
            
            const st = ganttState[t.id];
            if (!st) return;
            
            const tEnd = st.startWeek + st.durationWeeks;
            
            // Si termina exactamente cuando empieza una tarea crítica (o con 1 semana de tolerancia)
            for (let cId of criticalIds) {
                const cSt = ganttState[cId];
                if (!cSt) continue;
                
                if (tEnd >= cSt.startWeek - 1 && tEnd <= cSt.startWeek && st.startWeek < cSt.startWeek) {
                    criticalIds.add(t.id);
                    changed = true;
                    break;
                }
            }
        });
    }
    
    return criticalIds;
}

// Recalcular dinámicamente el progreso de los capítulos basándose en la media ponderada por coste de sus hijos
function recalculateParentProgress() {
    if (!ganttTasks || ganttTasks.length === 0) return;
    
    // depth=3→2→1: procesar de abajo hacia arriba para cubrir toda la jerarquía BC3
    for (let d = 3; d >= 1; d--) {
        ganttTasks.forEach(task => {
            if (task.depth === d && task.hasKids) {
                const children = ganttTasks.filter(c => c.parentId === task.id);
                if (children.length > 0) {
                    let totalPrice = 0;
                    let executedPrice = 0;
                    children.forEach(c => {
                        const cSt = ganttState[c.id];
                        const price = c.price || 0;
                        const prog = cSt ? (cSt.progress || 0) : 0;
                        totalPrice += price;
                        executedPrice += price * (prog / 100);
                    });
                    if (!ganttState[task.id]) {
                        ganttState[task.id] = { collapsed: false };
                    }
                    ganttState[task.id].progress = totalPrice > 0 
                        ? Math.round((executedPrice / totalPrice) * 100) 
                        : 0;
                }
            }
        });
    }
}

// Aplicar progreso de forma recursiva a todos los descendientes
function applyProgressToDescendants(pId, prog) {
    ganttTasks.forEach(c => {
        if (c.parentId === pId) {
            if (!ganttState[c.id]) ganttState[c.id] = {};
            ganttState[c.id].progress = prog;
            if (c.hasKids) {
                applyProgressToDescendants(c.id, prog);
            }
        }
    });
}

function rebuildGanttDOM() {
    const container = document.getElementById('ganttContainer');
    if (!container) return;
    container.innerHTML = '';

    const totalWeeks = ganttTotalWeeks;
    
    // 1. Recalcular las fechas y avances automáticos de los capítulos
    recalculateParentTasks();
    recalculateParentProgress();
    
    // 2. Obtener la ruta crítica actual (solo capítulos)
    const criticalPathSet = getCriticalPath();

    // 3. Rellenar el panel resumen superior (KPIs)
    const summaryBar = document.getElementById('ganttSummaryBar');
    if (summaryBar) {
        // Los capítulos reales son depth=2 (depth=1 es el nodo raíz único del proyecto)
        let chapters = ganttTasks.filter(t => t.depth === 2);
        if (chapters.length === 0) chapters = ganttTasks.filter(t => t.depth === 1);
        const totalChapters = chapters.length;
        
        let totalPrice = 0;
        let executedPrice = 0;
        chapters.forEach(c => {
            const st = ganttState[c.id];
            const price = c.price || 0;
            const prog = st ? (st.progress || 0) : 0;
            totalPrice += price;
            executedPrice += price * (prog / 100);
        });
        
        const globalProg = totalPrice > 0 ? ((executedPrice / totalPrice) * 100).toFixed(1) : '0.0';
        const totalDays = totalWeeks * 7;
        
        summaryBar.innerHTML = `
            <div class="gantt-kpi-card">
                <span class="gantt-kpi-label">Capítulos</span>
                <span class="gantt-kpi-val">${totalChapters}</span>
            </div>
            <div class="gantt-kpi-card">
                <span class="gantt-kpi-label">Plazo Total</span>
                <span class="gantt-kpi-val">${totalWeeks} semanas <small style="font-size:0.7em; color:var(--text-secondary);">(${totalDays} días)</small></span>
            </div>
            <div class="gantt-kpi-card">
                <span class="gantt-kpi-label">Avance Global</span>
                <span class="gantt-kpi-val" style="color: #10b981;">${globalProg}%</span>
            </div>
        `;
    }

    // ---- Cabecera grid ----
    const tableWrap = document.createElement('div');
    tableWrap.className = 'gantt-table-wrap';

    // Columna izquierda: nombres de tarea (ancho redimensionable)
    const leftCol = document.createElement('div');
    leftCol.className = 'gantt-left-col';
    leftCol.style.width = ganttLeftColWidth + 'px';
    leftCol.style.minWidth = ganttLeftColWidth + 'px';

    // Cabecera estructurada de la columna izquierda (Tarea, Plazo Restante, % Ejecutado)
    const leftHeader = document.createElement('div');
    leftHeader.className = 'gantt-left-header';
    
    const hName = document.createElement('span');
    hName.className = 'gh-col-name';
    hName.textContent = 'Tarea / Capítulo';
    
    const hDays = document.createElement('span');
    hDays.className = 'gh-col-days';
    hDays.textContent = 'Restante';
    
    const hProgress = document.createElement('span');
    hProgress.className = 'gh-col-progress';
    hProgress.textContent = '% Ejec.';
    
    leftHeader.appendChild(hName);
    leftHeader.appendChild(hDays);
    leftHeader.appendChild(hProgress);
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

    // Dibujar la Línea de Hoy (vertical) basada en el HOY real del sistema
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Normalizar ganttStartDate a medianoche local para evitar desfases de zona horaria
    const ganttStartNorm = new Date(ganttStartDate);
    ganttStartNorm.setHours(0, 0, 0, 0);
    
    const diffMs = today.getTime() - ganttStartNorm.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const diffWeeks = diffDays / 7;
    
    if (diffWeeks >= 0 && diffWeeks <= totalWeeks + 0.5) {
        const todayLine = document.createElement('div');
        todayLine.className = 'gantt-today-line';
        todayLine.id = 'ganttTodayLine';
        
        let todayLeft = 0;
        if (ganttViewMode === 'days') {
            todayLeft = diffDays * GANTT_COL_PX;
        } else if (ganttViewMode === 'months') {
            todayLeft = (diffWeeks / 4) * GANTT_COL_PX;
        } else { // weeks (default)
            todayLeft = diffWeeks * GANTT_COL_PX;
        }
        todayLine.style.left = todayLeft + 'px';
        
        const todayLabel = document.createElement('div');
        todayLabel.className = 'gantt-today-line-label';
        const todayStr = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        todayLabel.textContent = `HOY · ${todayStr}`;
        todayLine.appendChild(todayLabel);
        
        bodyWrap.appendChild(todayLine);
    }

    let renderedRowIndex = -1;
    const renderedCriticalChapters = [];

    ganttTasks.forEach(task => {
        const st = ganttState[task.id];
        if (!st) return;

        // Verificar si el padre está colapsado
        if (task.parentId && ganttState[task.parentId] && ganttState[task.parentId].collapsed) {
            return;
        }

        renderedRowIndex++;

        // Registrar coordenadas de capítulos críticos visibles para trazar la línea de conexión
        if (task.depth === 1 && criticalPathSet.has(task.id)) {
            renderedCriticalChapters.push({
                id: task.id,
                startWeek: st.startWeek,
                durationWeeks: st.durationWeeks,
                y: (renderedRowIndex * 34) + 17 // Centro vertical de esta fila
            });
        }

        // Fila nombre estructurada
        const nameRow = document.createElement('div');
        nameRow.className = 'gantt-name-row gantt-depth-' + task.depth;
        nameRow.dataset.taskId = task.id;

        // 1. Celda Nombre (con sangría y toggle)
        const cellName = document.createElement('div');
        cellName.className = 'gantt-cell-name';

        if (task.hasKids) {
            const toggle = document.createElement('span');
            toggle.className = 'gantt-toggle';
            toggle.textContent = st.collapsed ? '▶' : '▼';
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                ganttState[task.id].collapsed = !ganttState[task.id].collapsed;
                ganttSave();
                rebuildGanttDOM();
            });
            cellName.appendChild(toggle);
        } else {
            const spacer = document.createElement('span');
            spacer.className = 'gantt-toggle-spacer';
            cellName.appendChild(spacer);
        }

        const nameSpan = document.createElement('span');
        nameSpan.className = 'gantt-task-name';
        nameSpan.title = task.summary + ' — ' + task.price.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
        nameSpan.textContent = task.summary;
        
        // Agregar fueguito si es crítico
        if (criticalPathSet.has(task.id)) {
            const fireIcon = document.createElement('span');
            fireIcon.className = 'critical-badge-icon';
            fireIcon.textContent = '🔥 ';
            fireIcon.title = 'Ruta crítica';
            nameSpan.prepend(fireIcon);
        }
        
        cellName.appendChild(nameSpan);
        nameRow.appendChild(cellName);

        // 2. Celda Días Restantes (desde Hoy hasta fin de tarea)
        const cellDays = document.createElement('div');
        cellDays.className = 'gantt-cell-days';
        
        const progressVal = st.progress || 0;
        if (progressVal === 100) {
            cellDays.textContent = 'Listo';
            cellDays.className = 'gantt-cell-days gantt-days-ready';
        } else {
            const endD = weekToDate(st.startWeek + st.durationWeeks);
            endD.setHours(0,0,0,0);
            
            const diffMs = endD - today;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                cellDays.textContent = `-${Math.abs(diffDays)} d`;
                cellDays.className = 'gantt-cell-days gantt-days-delayed';
                cellDays.title = `Retraso de ${Math.abs(diffDays)} días sobre el plazo previsto`;
            } else {
                cellDays.textContent = `${diffDays} d`;
                cellDays.className = 'gantt-cell-days gantt-days-normal';
                cellDays.title = `Faltan ${diffDays} días para finalizar el plazo`;
            }
        }
        nameRow.appendChild(cellDays);

        // 3. Celda % Ejecutado con botones + y -
        const cellProgress = document.createElement('div');
        cellProgress.className = 'gantt-cell-progress';
        
        const btnDec = document.createElement('button');
        btnDec.type = 'button';
        btnDec.className = 'gantt-prog-btn';
        btnDec.textContent = '-';
        btnDec.title = 'Restar 10% de avance';
        btnDec.addEventListener('click', (e) => {
            e.stopPropagation();
            const curr = st.progress || 0;
            const targetProg = Math.max(0, curr - 10);
            st.progress = targetProg;
            if (task.hasKids) {
                applyProgressToDescendants(task.id, targetProg);
            }
            recalculateParentProgress();
            ganttSave();
            rebuildGanttDOM();
        });
        
        const labelProg = document.createElement('span');
        labelProg.className = 'gantt-prog-val';
        labelProg.textContent = progressVal + '%';
        
        const btnInc = document.createElement('button');
        btnInc.type = 'button';
        btnInc.className = 'gantt-prog-btn';
        btnInc.textContent = '+';
        btnInc.title = 'Sumar 10% de avance';
        btnInc.addEventListener('click', (e) => {
            e.stopPropagation();
            const curr = st.progress || 0;
            const targetProg = Math.min(100, curr + 10);
            st.progress = targetProg;
            if (task.hasKids) {
                applyProgressToDescendants(task.id, targetProg);
            }
            recalculateParentProgress();
            ganttSave();
            rebuildGanttDOM();
        });
        
        cellProgress.appendChild(btnDec);
        cellProgress.appendChild(labelProg);
        cellProgress.appendChild(btnInc);
        nameRow.appendChild(cellProgress);

        leftCol.appendChild(nameRow);

        // Fila barra en timeline
        const barRow = document.createElement('div');
        barRow.className = 'gantt-bar-row';
        
        let colsCount = totalWeeks;
        if (ganttViewMode === 'days') colsCount = totalWeeks * 7;
        else if (ganttViewMode === 'months') colsCount = Math.ceil(totalWeeks / 4);
        
        barRow.style.width = (colsCount * GANTT_COL_PX) + 'px';
        barRow.dataset.taskId = task.id;

        // Grid de fondo según la escala
        for (let w = 1; w <= colsCount; w++) {
            const cell = document.createElement('div');
            cell.className = 'gantt-bg-cell' + (w % 4 === 0 ? ' gantt-bg-month-end' : '');
            cell.style.width = GANTT_COL_PX + 'px';
            barRow.appendChild(cell);
        }

        // Barra de la tarea
        const bar = document.createElement('div');
        bar.className = 'gantt-bar gantt-bar-depth-' + task.depth;
        if (criticalPathSet.has(task.id)) {
            bar.classList.add('gantt-bar-critical');
        }
        bar.dataset.taskId = task.id;
        positionBar(bar, st.startWeek, st.durationWeeks, totalWeeks);

        // Capa interna de progreso acumulado
        if (progressVal > 0) {
            const progBar = document.createElement('div');
            progBar.className = 'gantt-bar-progress';
            progBar.style.width = progressVal + '%';
            bar.appendChild(progBar);
        }

        const barLabel = document.createElement('span');
        barLabel.className = 'gantt-bar-label';
        barLabel.style.position = 'relative';
        barLabel.style.zIndex = '2';
        barLabel.textContent = task.summary.length > 18 ? task.summary.slice(0, 16) + '…' : task.summary;

        if (task.hasKids) {
            // Estilo barra de capítulo (Summary Bar) - deshabilitar drag y redimensionamiento
            bar.classList.add('gantt-bar-parent');
            bar.appendChild(barLabel);
        } else {
            // Partida o Subcapítulo editable: inyectar manejadores de arrastre
            const resizeL = document.createElement('div');
            resizeL.className = 'gantt-resize gantt-resize-l';
            resizeL.style.position = 'relative';
            resizeL.style.zIndex = '2';
            resizeL.addEventListener('mousedown', e => startGanttDrag(e, task.id, 'left'));

            const resizeR = document.createElement('div');
            resizeR.className = 'gantt-resize gantt-resize-r';
            resizeR.style.position = 'relative';
            resizeR.style.zIndex = '2';
            resizeR.addEventListener('mousedown', e => startGanttDrag(e, task.id, 'right'));

            bar.appendChild(resizeL);
            bar.appendChild(barLabel);
            bar.appendChild(resizeR);
            bar.addEventListener('mousedown', e => {
                if (ganttLinkMode) return; // link mode: no drag, let click handle it
                if (e.target === resizeL || e.target === resizeR) return;
                startGanttDrag(e, task.id, 'move');
            });
            // Click listener específico para modo enlace en barras hoja
            bar.addEventListener('click', e => {
                if (!ganttLinkMode) return;
                e.stopPropagation();
                handleLinkModeClick(task.id, bar);
            });
        }

        barRow.appendChild(bar);
        bodyWrap.appendChild(barRow);
    });

    // 4. Dibujar las líneas SVG de conexión entre capítulos críticos consecutivos
    if (renderedCriticalChapters.length > 1) {
        // Ordenar secuencialmente por semana de inicio
        renderedCriticalChapters.sort((a, b) => a.startWeek - b.startWeek);

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("class", "gantt-svg-overlay");
        
        let colsCount = totalWeeks;
        if (ganttViewMode === 'days') colsCount = totalWeeks * 7;
        else if (ganttViewMode === 'months') colsCount = Math.ceil(totalWeeks / 4);
        svg.style.width = (colsCount * GANTT_COL_PX) + 'px';

        for (let i = 0; i < renderedCriticalChapters.length - 1; i++) {
            const A = renderedCriticalChapters[i];
            const B = renderedCriticalChapters[i + 1];

            const coordsA = getGanttBarCoords(A);
            const xA = coordsA.left + coordsA.width;
            const yA = A.y;

            const coordsB = getGanttBarCoords(B);
            const xB = coordsB.left;
            const yB = B.y;

            const xMid = xA + (xB - xA) / 2;

            const path = document.createElementNS(svgNS, "path");
            // Trazado escalonado: horizontal, vertical, horizontal
            const dAttr = `M ${xA} ${yA} L ${xMid} ${yA} L ${xMid} ${yB} L ${xB} ${yB}`;
            path.setAttribute("d", dAttr);
            path.setAttribute("stroke", "#f97316"); // Naranja de ruta crítica
            path.setAttribute("stroke-width", "2");
            path.setAttribute("fill", "none");
            path.setAttribute("stroke-dasharray", "4,4"); // Estilo línea discontinua

            svg.appendChild(path);
        }
        bodyWrap.appendChild(svg);
    }

    rightCol.appendChild(bodyWrap);
    tableWrap.appendChild(leftCol);
    tableWrap.appendChild(rightCol);
    container.appendChild(tableWrap);

    // Sincronizar scroll vertical entre columnas
    leftCol.addEventListener('scroll', () => { rightCol.scrollTop = leftCol.scrollTop; });
}

// Calcular coordenadas izquierda y ancho de barra según el zoom y la escala activa
function getGanttBarCoords(st) {
    let left = 0;
    let width = 0;
    
    if (ganttViewMode === 'days') {
        left = (st.startWeek - 1) * 7 * GANTT_COL_PX;
        width = Math.max(GANTT_COL_PX * 0.5, (st.durationWeeks * 7) * GANTT_COL_PX - 2);
    } else if (ganttViewMode === 'months') {
        left = ((st.startWeek - 1) / 4) * GANTT_COL_PX;
        width = Math.max(GANTT_COL_PX * 0.5, (st.durationWeeks / 4) * GANTT_COL_PX - 2);
    } else {
        // semanas
        left = (st.startWeek - 1) * GANTT_COL_PX;
        width = Math.max(GANTT_COL_PX * 0.5, st.durationWeeks * GANTT_COL_PX - 2);
    }
    
    return { left, width };
}

function positionBar(barEl, startWeek, durationWeeks, totalWeeks) {
    const { left, width } = getGanttBarCoords({ startWeek, durationWeeks });
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
    // En modo enlace: no iniciar drag, dejar que el click se propague
    if (ganttLinkMode) return;

    e.preventDefault();
    e.stopPropagation();
    const st = ganttState[taskId];
    if (!st) return;

    const taskObj = ganttTasks.find(t => t.id === taskId);
    // Las barras de capítulo (hasKids) son automáticas — no se arrastran directamente.
    // Solo se pueden arrastrar partidas hoja (sin hijos).
    if (taskObj && taskObj.hasKids) return;

    ganttDrag = {
        taskId,
        parentId: taskObj ? taskObj.parentId : null,
        mode,
        startX: e.clientX,
        origStart: st.startWeek,
        origDur: st.durationWeeks
    };

    document.addEventListener('mousemove', doGanttDrag);
    document.addEventListener('mouseup', stopGanttDrag);
}

function doGanttDrag(e) {
    if (!ganttDrag) return;
    const { taskId, mode, startX, origStart, origDur } = ganttDrag;
    const dx = e.clientX - startX;

    let weeksDelta = 0;
    if (ganttViewMode === 'days') {
        weeksDelta = Math.round(dx / GANTT_COL_PX) / 7;
    } else if (ganttViewMode === 'months') {
        weeksDelta = Math.round(dx / GANTT_COL_PX) * 4;
    } else {
        weeksDelta = Math.round(dx / GANTT_COL_PX);
    }

    const st = ganttState[taskId];
    const total = ganttTotalWeeks;

    // Sin clamping por el padre — las tareas se mueven libremente dentro del proyecto.
    // Los capítulos (padres) se recalculan automáticamente al soltar para adaptarse.
    if (mode === 'move') {
        st.startWeek = Math.max(1, Math.min(total - origDur + 1, origStart + weeksDelta));
        st.durationWeeks = origDur;
    } else if (mode === 'right') {
        st.durationWeeks = Math.max(1, Math.min(total - st.startWeek + 1, origDur + weeksDelta));
    } else if (mode === 'left') {
        const newStart = Math.max(1, Math.min(origStart + origDur - 1, origStart + weeksDelta));
        st.startWeek = newStart;
        st.durationWeeks = Math.max(1, origStart + origDur - newStart);
    }

    // Actualizar la barra de la tarea en DOM en tiempo real
    const bar = document.querySelector(`.gantt-bar[data-task-id="${taskId}"]`);
    if (bar) positionBar(bar, st.startWeek, st.durationWeeks, total);

    // Recalcular y actualizar visualmente los padres en tiempo real durante el arrastre
    recalculateParentTasks();
    const taskObj = ganttTasks.find(t => t.id === taskId);
    if (taskObj && taskObj.parentId) {
        updateParentBarsInDOM(taskObj.parentId);
    }
}

// Actualiza recursivamente las barras padre en el DOM sin rerenderizar todo
function updateParentBarsInDOM(parentId) {
    if (!parentId) return;
    const pst = ganttState[parentId];
    if (!pst) return;
    const pBar = document.querySelector(`.gantt-bar[data-task-id="${parentId}"]`);
    if (pBar) positionBar(pBar, pst.startWeek, pst.durationWeeks, ganttTotalWeeks);

    // Subir un nivel más si existe abuelo
    const parentTask = ganttTasks.find(t => t.id === parentId);
    if (parentTask && parentTask.parentId) {
        recalculateParentTasks(); // asegurar que el abuelo está actualizado
        updateParentBarsInDOM(parentTask.parentId);
    }
}

function stopGanttDrag() {
    if (!ganttDrag) return;
    recalculateParentTasks();
    recalculateParentProgress();
    ganttSave();
    ganttDrag = null;
    document.removeEventListener('mousemove', doGanttDrag);
    document.removeEventListener('mouseup', stopGanttDrag);
    rebuildGanttDOM();
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

// Configurar botones de escala (Días, Semanas, Meses)
const modeDaysBtn = document.getElementById('ganttModeDaysBtn');
const modeWeeksBtn = document.getElementById('ganttModeWeeksBtn');
const modeMonthsBtn = document.getElementById('ganttModeMonthsBtn');

function setGanttMode(mode, activeBtn) {
    ganttViewMode = mode;
    document.querySelectorAll('.gantt-mode-btn').forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
    if (planningModal && planningModal.style.display !== 'none') rebuildGanttDOM();
}

if (modeDaysBtn) {
    modeDaysBtn.addEventListener('click', () => setGanttMode('days', modeDaysBtn));
}
if (modeWeeksBtn) {
    modeWeeksBtn.addEventListener('click', () => setGanttMode('weeks', modeWeeksBtn));
}
if (modeMonthsBtn) {
    modeMonthsBtn.addEventListener('click', () => setGanttMode('months', modeMonthsBtn));
}

// Configurar control de Zoom (Ancho de columnas)
const ganttZoom = document.getElementById('ganttZoom');
if (ganttZoom) {
    ganttZoom.addEventListener('input', () => {
        GANTT_COL_PX = parseInt(ganttZoom.value) || 44;
        if (planningModal && planningModal.style.display !== 'none') rebuildGanttDOM();
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

// Setup explicit editing for details description
const detDescriptionEl = document.getElementById('detDescription');
if (detDescriptionEl) {
    setupExplicitEdit(detDescriptionEl, (newDescription) => {
        if (!parsedData) return false;
        const detCodeEl = document.getElementById('detCode');
        if (detCodeEl && detCodeEl.textContent) {
            const rawCode = Object.keys(parsedData.concepts).find(c => c.replace(/#+\s*$/, '') === detCodeEl.textContent);
            if (rawCode) {
                const concept = parsedData.concepts[rawCode];
                if (newDescription !== concept.description) {
                    concept.description = newDescription;
                    saveHistoryState();
                    return true;
                }
            }
        }
        return false;
    }, {
        multiLine: true
    });
}

// Setup explicit editing for details title
const detSummaryEl = document.getElementById('detSummary');
if (detSummaryEl) {
    setupExplicitEdit(detSummaryEl, (newSummary) => {
        if (!parsedData) return false;
        const detCodeEl = document.getElementById('detCode');
        if (detCodeEl && detCodeEl.textContent) {
            const rawCode = Object.keys(parsedData.concepts).find(c => c.replace(/#+\s*$/, '') === detCodeEl.textContent);
            if (rawCode) {
                const concept = parsedData.concepts[rawCode];
                if (newSummary && newSummary !== concept.summary) {
                    concept.summary = newSummary;
                    saveHistoryState();
                    
                    // Sincronizar en el árbol visual si existe
                    const treeNodeSummary = document.querySelector(`.tree-node-container[data-code="${rawCode}"] > .tree-node-row > .col-summary`);
                    if (treeNodeSummary) {
                        const valEl = treeNodeSummary.querySelector('.editable-val') || treeNodeSummary;
                        valEl.textContent = newSummary;
                    }
                    return true;
                }
            }
        }
        return false;
    });
}

// ==========================================================================
// Lógica del Banco de Precios Unitarios
// ==========================================================================

let activePriceFilter = 'all';

// Clasificación de conceptos para el Banco de Precios
function getConceptCategory(concept) {
    if (concept.category === 'PARTIDA_NEW' || concept.isNewPartida) return 'partida_new';
    if (concept.type === 1) return 'mo';
    if (concept.type === 2) return 'maq';
    if (concept.type === 3) return 'mat';
    if (concept.type === 4) return 'sub';
    
    const lowerCode = concept.code.toLowerCase();
    if (lowerCode.startsWith('mo') || lowerCode.includes('mano')) return 'mo';
    if (lowerCode.startsWith('mq') || lowerCode.startsWith('maq')) return 'maq';
    if (lowerCode.startsWith('mt') || lowerCode.startsWith('mat')) return 'mat';
    
    return 'partida';
}

// Renderizar la tabla del Banco de Precios Unitarios
function renderPricesTable() {
    if (!parsedData) return;

    const tbody = document.getElementById('pricesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // 1. Precalcular mapa de usos ("Dónde se usa")
    const whereUsed = {};
    Object.values(parsedData.concepts).forEach(c => {
        if (Array.isArray(c.decomposition)) {
            c.decomposition.forEach(item => {
                if (!whereUsed[item.code]) {
                    whereUsed[item.code] = [];
                }
                if (!whereUsed[item.code].includes(c.code)) {
                    whereUsed[item.code].push(c.code);
                }
            });
        }
    });

    // 2. Filtrar conceptos que son precios unitarios o recursos elementales
    const searchVal = document.getElementById('pricesSearch') ? document.getElementById('pricesSearch').value.toLowerCase().trim() : '';

    const filtered = Object.values(parsedData.concepts).filter(concept => {
        // Excluir capítulos estructurales
        if (concept.code.endsWith('#')) return false;
        // Requerir unidad o precio para calificar como precio unitario
        if (!concept.unit && !concept.price) return false;

        // Filtro por categoría (Pestañas)
        const cat = getConceptCategory(concept);
        if (activePriceFilter !== 'all' && cat !== activePriceFilter) return false;

        // Filtro por búsqueda
        if (searchVal) {
            const matchesCode = concept.code.toLowerCase().includes(searchVal);
            const matchesSummary = (concept.summary || '').toLowerCase().includes(searchVal);
            const matchesDesc = (concept.description || '').toLowerCase().includes(searchVal);
            if (!matchesCode && !matchesSummary && !matchesDesc) return false;
        }

        return true;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 24px;">No se encontraron precios unitarios para el filtro aplicado.</td></tr>`;
        return;
    }

    filtered.forEach(concept => {
        const row = document.createElement('tr');
        row.className = 'price-row';
        row.dataset.code = concept.code;

        const cat = getConceptCategory(concept);
        let badgeClass = 'badge-partida';
        let catText = 'Partida';
        if (cat === 'mo') { badgeClass = 'badge-mo'; catText = 'Mano de Obra'; }
        else if (cat === 'mat') { badgeClass = 'badge-mat'; catText = 'Material'; }
        else if (cat === 'maq') { badgeClass = 'badge-maq'; catText = 'Maquinaria'; }
        else if (cat === 'sub') { badgeClass = 'badge-sub'; catText = 'Subcontrata'; }
        else if (cat === 'partida_new') { badgeClass = 'badge-partida-new'; catText = 'Nueva Partida'; }

        const uses = whereUsed[concept.code] || [];
        const usesCount = uses.length;

        // Crear celdas programáticamente
        const tdCode = document.createElement('td');
        tdCode.innerHTML = `<span class="code-badge">${concept.code.replace(/#+\s*$/, '')}</span>`;

        const tdType = document.createElement('td');
        tdType.innerHTML = `<span class="badge-type ${badgeClass}">${catText}</span>`;

        const tdUnit = document.createElement('td');
        tdUnit.className = 'edit-unit';
        tdUnit.textContent = concept.unit || '';
        setupExplicitEdit(tdUnit, (newVal) => {
            if (concept.unit !== newVal) {
                concept.unit = newVal;
                saveHistoryState();
                
                // Sincronizar en el árbol visual si existe
                const treeNodeUnit = document.querySelector(`.tree-node-container[data-code="${concept.code}"] > .tree-node-row > .col-unit`);
                if (treeNodeUnit) {
                    const valEl = treeNodeUnit.querySelector('.editable-val') || treeNodeUnit;
                    valEl.textContent = newVal;
                }
                return true;
            }
            return false;
        });

        const tdSummary = document.createElement('td');
        tdSummary.className = 'edit-summary';
        tdSummary.textContent = concept.summary || '';
        setupExplicitEdit(tdSummary, (newVal) => {
            if (concept.summary !== newVal) {
                concept.summary = newVal;
                saveHistoryState();

                // Sincronizar árbol y detalles
                const treeNodeSummary = document.querySelector(`.tree-node-container[data-code="${concept.code}"] > .tree-node-row > .col-summary`);
                if (treeNodeSummary) {
                    const valEl = treeNodeSummary.querySelector('.editable-val') || treeNodeSummary;
                    valEl.textContent = newVal;
                }

                const detCodeEl = document.getElementById('detCode');
                const detSummaryEl = document.getElementById('detSummary');
                if (detCodeEl && detSummaryEl && detCodeEl.textContent === concept.code.replace(/#+\s*$/, '')) {
                    const valEl = detSummaryEl.querySelector('.editable-val') || detSummaryEl;
                    valEl.textContent = newVal;
                }
                return true;
            }
            return false;
        });

        const tdUsage = document.createElement('td');
        tdUsage.style.textAlign = 'center';
        const usageBtn = document.createElement('button');
        usageBtn.type = 'button';
        usageBtn.className = 'usage-badge';
        usageBtn.textContent = usesCount;
        usageBtn.title = 'Ver partidas que usan este recurso';
        usageBtn.addEventListener('click', () => {
            showUsageModal(concept.code, uses);
        });
        tdUsage.appendChild(usageBtn);

        const tdPrice = document.createElement('td');
        tdPrice.className = 'edit-price';
        tdPrice.style.textAlign = 'right';
        tdPrice.style.fontWeight = '600';
        tdPrice.textContent = parseFloat(concept.price || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        setupExplicitEdit(tdPrice, (newPriceText) => {
            const rawText = newPriceText.trim().replace(',', '.');
            const newVal = parseFloat(rawText);
            if (!isNaN(newVal) && newVal >= 0) {
                if (parseFloat(concept.price) !== newVal) {
                    concept.price = newVal;
                    concept.isManualPrice = true;
                    
                    recalculateAll();
                    updateTotalBudgetDisplay();
                    saveHistoryState();
                    
                    // Actualizar árbol si es visible
                    const treeNodePrice = document.querySelector(`.tree-node-container[data-code="${concept.code}"] > .tree-node-row > .col-price`);
                    if (treeNodePrice) {
                        const valEl = treeNodePrice.querySelector('.editable-val') || treeNodePrice;
                        valEl.textContent = newVal.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
                    }

                    // Sincronizar panel de detalles si coincide
                    const detCodeEl = document.getElementById('detCode');
                    const detPriceEl = document.getElementById('detPrice');
                    if (detCodeEl && detPriceEl && detCodeEl.textContent === concept.code.replace(/#+\s*$/, '')) {
                        detPriceEl.textContent = newVal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
                    }

                    // Mantener posición del scroll al re-renderizar tabla de precios
                    const scrollPos = document.querySelector('.prices-table-container').scrollTop;
                    renderPricesTable();
                    document.querySelector('.prices-table-container').scrollTop = scrollPos;
                    return true;
                }
            }
            tdPrice.textContent = parseFloat(concept.price || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return false;
        }, {
            isNumeric: true
        });

        const tdActions = document.createElement('td');
        const descBtn = document.createElement('button');
        descBtn.type = 'button';
        descBtn.className = 'desc-toggle-btn';
        descBtn.textContent = '📝';
        descBtn.title = 'Editar texto explicativo';
        descBtn.addEventListener('click', () => {
            toggleDescriptionRow(row, concept);
        });
        tdActions.appendChild(descBtn);

        row.appendChild(tdCode);
        row.appendChild(tdType);
        row.appendChild(tdUnit);
        row.appendChild(tdSummary);
        row.appendChild(tdUsage);
        row.appendChild(tdPrice);
        row.appendChild(tdActions);

        tbody.appendChild(row);
    });
}

// Desplegar fila de descripción extendida
function toggleDescriptionRow(parentRow, concept) {
    const nextRow = parentRow.nextElementSibling;
    if (nextRow && nextRow.classList.contains('description-row')) {
        nextRow.remove();
        return;
    }

    const descRow = document.createElement('tr');
    descRow.className = 'description-row';
    descRow.innerHTML = `
        <td colspan="7">
            <div class="prices-desc-editor">
                <div class="prices-desc-title">Descripción / Texto Explicativo (${concept.code})</div>
                <div class="prices-desc-content">
                    ${(concept.description || concept.summary || '').replace(/\n/g, '<br>')}
                </div>
            </div>
        </td>
    `;

    const editor = descRow.querySelector('.prices-desc-content');
    setupExplicitEdit(editor, (newDesc) => {
        if (newDesc !== concept.description) {
            concept.description = newDesc;
            saveHistoryState();

            // Sincronizar el panel de detalles si coincide
            const detCodeEl = document.getElementById('detCode');
            const detDescEl = document.getElementById('detDescription');
            if (detCodeEl && detDescEl && detCodeEl.textContent === concept.code.replace(/#+\s*$/, '')) {
                const valEl = detDescEl.querySelector('.editable-val') || detDescEl;
                valEl.innerHTML = newDesc.replace(/\n/g, '<br>');
            }
            return true;
        }
        return false;
    }, {
        multiLine: true
    });

    parentRow.after(descRow);
}

// Mostrar el Modal de "Dónde se usa" (Impact Analysis)
function showUsageModal(code, parentCodes) {
    const modal = document.getElementById('usageModal');
    const body = document.getElementById('usageModalBody');
    if (!modal || !body) return;

    body.innerHTML = '';
    
    if (parentCodes.length === 0) {
        body.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin: 24px 0;">Este recurso no se utiliza en ninguna partida compuesta del presupuesto.</p>`;
        modal.style.display = 'block';
        return;
    }

    const titleInfo = document.createElement('p');
    titleInfo.style.fontSize = '0.85rem';
    titleInfo.style.marginBottom = '12px';
    titleInfo.style.color = 'var(--text-secondary)';
    titleInfo.innerHTML = `El recurso <strong>${code}</strong> se utiliza en las siguientes <strong>${parentCodes.length}</strong> partidas. Haz clic en cualquiera para navegar a ella:`;
    body.appendChild(titleInfo);

    const list = document.createElement('ul');
    list.className = 'usage-list';

    parentCodes.forEach(pCode => {
        const parent = parsedData.concepts[pCode];
        if (!parent) return;

        const li = document.createElement('li');
        li.className = 'usage-item';
        
        // Calcular la aportación (si figura en la descomposición de la partida)
        let factor = 0;
        if (Array.isArray(parent.decomposition)) {
            const match = parent.decomposition.find(d => d.code === code);
            if (match) factor = parseFloat(match.factor) || 0;
        }

        li.innerHTML = `
            <div class="usage-item-details">
                <div class="usage-item-header">
                    <span class="code-badge" style="font-size: 0.72rem; padding: 2px 6px;">${pCode.replace(/#+\s*$/, '')}</span>
                    <span class="usage-item-title">${parent.summary}</span>
                </div>
                <span class="usage-item-subtitle">Cantidad en partida: ${factor.toLocaleString('es-ES')} ${parent.unit}</span>
            </div>
            <div class="usage-item-contribution">
                ${(factor * parseFloat(parsedData.concepts[code].price || 0)).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </div>
        `;

        li.addEventListener('click', () => {
            // Cerrar modal
            modal.style.display = 'none';
            // Cambiar a vista Presupuesto (Árbol)
            const presupuestoBtn = document.getElementById('presupuestoBtn');
            if (presupuestoBtn) presupuestoBtn.click();
            // Mostrar detalles de la partida
            showDetails(pCode);
            // Hacer scroll hasta el nodo del árbol correspondiente
            const nodeContainer = document.querySelector(`.tree-node-container[data-code="${pCode}"]`);
            if (nodeContainer) {
                nodeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Resaltar brevemente la partida
                const row = nodeContainer.querySelector('.tree-node-row');
                if (row) {
                    row.style.transition = 'background-color 0.3s';
                    const origBg = row.style.backgroundColor;
                    row.style.backgroundColor = 'var(--accent-glow, rgba(59, 130, 246, 0.15))';
                    setTimeout(() => {
                        row.style.backgroundColor = origBg;
                    }, 2000);
                }
            }
        });

        list.appendChild(li);
    });

    body.appendChild(list);
    modal.style.display = 'block';
}

// Configurar listeners de navegación y controles del Banco de Precios
const pricesBtn = document.getElementById('pricesBtn');
const pricesPanel = document.getElementById('pricesPanel');
const treePanel = document.getElementById('treePanel');
const detailsPanel = document.getElementById('detailsPanel');
const pricesSearch = document.getElementById('pricesSearch');

if (pricesBtn && pricesPanel) {
    pricesBtn.addEventListener('click', () => {
        // Ocultar Dashboard
        if (treePanel) treePanel.style.display = 'none';
        if (detailsPanel) detailsPanel.style.display = 'none';
        // Mostrar Precios
        pricesPanel.style.display = 'flex';

        // Estilo de botones activos
        document.querySelectorAll('.control-container button').forEach(b => b.classList.remove('active'));
        pricesBtn.classList.add('active');

        // Renderizar tabla
        renderPricesTable();
    });
}

const presupuestoBtn = document.getElementById('presupuestoBtn');
if (presupuestoBtn) {
    presupuestoBtn.addEventListener('click', () => {
        // Mostrar Dashboard (árbol y detalles) y ocultar Precios
        if (treePanel) treePanel.style.display = 'flex';
        if (detailsPanel) detailsPanel.style.display = 'flex';
        if (pricesPanel) pricesPanel.style.display = 'none';

        // Estilo de botones activos
        document.querySelectorAll('.control-container button').forEach(b => b.classList.remove('active'));
        presupuestoBtn.classList.add('active');
    });
}



// Búsqueda en tiempo real
if (pricesSearch) {
    pricesSearch.addEventListener('input', () => {
        renderPricesTable();
    });
}

// Filtros de categoría por pestañas
document.querySelectorAll('.prices-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.prices-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePriceFilter = btn.dataset.filter;
        renderPricesTable();
    });
});

// Cerrar modal de usos
const closeUsageBtn = document.getElementById('closeUsageBtn');
const usageModal = document.getElementById('usageModal');
if (closeUsageBtn && usageModal) {
    closeUsageBtn.addEventListener('click', () => {
        usageModal.style.display = 'none';
    });
    usageModal.addEventListener('click', (e) => {
        if (e.target === usageModal) usageModal.style.display = 'none';
    });
}

// =============================================================================
// FEATURE 3: Dependencias Gantt (Fin → Inicio)
// =============================================================================
let ganttDeps = []; // [{from: taskId, to: taskId}]
let ganttLinkMode = false;
let ganttLinkSource = null; // taskId de la tarea origen seleccionada

// ── Guardar/cargar deps junto al estado del Gantt ──
const _origGanttSave = ganttSave;
ganttSave = function() {
    try {
        localStorage.setItem(ganttStorageKey(), JSON.stringify({
            startDate: ganttStartDate.toISOString(),
            totalWeeks: ganttTotalWeeks,
            state: ganttState,
            deps: ganttDeps
        }));
    } catch(e) {}
};
const _origGanttLoad = ganttLoad;
ganttLoad = function() {
    try {
        const raw = localStorage.getItem(ganttStorageKey());
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (saved.startDate) ganttStartDate = new Date(saved.startDate);
        if (saved.totalWeeks) ganttTotalWeeks = saved.totalWeeks;
        if (saved.state) ganttState = saved.state;
        if (saved.deps) ganttDeps = saved.deps;
        return true;
    } catch(e) { return false; }
};

// ── Propagar dependencias en cadena (Fin→Inicio) ──
function applyDependencies() {
    if (!ganttDeps || ganttDeps.length === 0) return;
    // Hasta 10 pasadas para resolver cadenas largas
    for (let pass = 0; pass < 10; pass++) {
        let changed = false;
        ganttDeps.forEach(dep => {
            const fromSt = ganttState[dep.from];
            const toSt   = ganttState[dep.to];
            if (!fromSt || !toSt) return;
            const minStart = fromSt.startWeek + fromSt.durationWeeks;
            if (toSt.startWeek < minStart) {
                toSt.startWeek = minStart;
                changed = true;
            }
        });
        if (!changed) break;
    }
}

// ── Dibujar flechas de dependencia en SVG ──
function drawDependencyArrows(bodyWrap, colsCount) {
    const svgNS = 'http://www.w3.org/2000/svg';
    let depSvg = bodyWrap.querySelector('.gantt-dep-svg');
    if (depSvg) {
        depSvg.innerHTML = '';
    } else {
        depSvg = document.createElementNS(svgNS, 'svg');
        depSvg.setAttribute('class', 'gantt-dep-svg gantt-svg-overlay');
        depSvg.style.width  = (colsCount * GANTT_COL_PX) + 'px';
        depSvg.style.pointerEvents = 'all';
        bodyWrap.appendChild(depSvg);
    }
    depSvg.style.width = (colsCount * GANTT_COL_PX) + 'px';

    if (!ganttDeps || ganttDeps.length === 0) return;

    // Definir marcador de flecha
    const defs   = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', 'depArrow');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const poly = document.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', '0 0, 6 3, 0 6');
    poly.setAttribute('class', 'gantt-dep-arrowhead');
    marker.appendChild(poly);
    defs.appendChild(marker);
    depSvg.appendChild(defs);

    ganttDeps.forEach(dep => {
        const fromSt = ganttState[dep.from];
        const toSt   = ganttState[dep.to];
        if (!fromSt || !toSt) return;

        const fromIdx = getRenderedRowIndex(dep.from);
        const toIdx   = getRenderedRowIndex(dep.to);
        if (fromIdx < 0 || toIdx < 0) return;

        const ROW_H = 34;
        const fromCoords = getGanttBarCoords(fromSt);
        const toCoords   = getGanttBarCoords(toSt);

        const xA = fromCoords.left + fromCoords.width;
        const yA = fromIdx * ROW_H + ROW_H / 2;
        const xB = toCoords.left;
        const yB = toIdx   * ROW_H + ROW_H / 2;

        const xMid = xA + Math.max(10, (xB - xA) / 2);
        const d = `M ${xA} ${yA} C ${xMid} ${yA}, ${xMid} ${yB}, ${xB} ${yB}`;

        const group = document.createElementNS(svgNS, 'g');
        group.setAttribute('class', 'gantt-dep-group');

        // Línea invisible más gruesa para hit-area
        const hit = document.createElementNS(svgNS, 'path');
        hit.setAttribute('d', d);
        hit.setAttribute('class', 'gantt-dep-hit-area');

        // Línea visible
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'gantt-dep-arrow');
        path.setAttribute('marker-end', 'url(#depArrow)');

        // Botón circular de eliminar (×) en el punto medio
        const cx = (xA + xB) / 2;
        const cy = (yA + yB) / 2;

        const delGroup = document.createElementNS(svgNS, 'g');
        delGroup.setAttribute('class', 'gantt-dep-delete-btn');
        delGroup.style.cursor = 'pointer';

        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', '7');
        circle.setAttribute('fill', '#ef4444');
        circle.setAttribute('stroke', '#ffffff');
        circle.setAttribute('stroke-width', '1');

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', cx);
        text.setAttribute('y', cy);
        text.setAttribute('dy', '3');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#ffffff');
        text.setAttribute('font-size', '9');
        text.setAttribute('font-weight', 'bold');
        text.textContent = '×';

        const title = document.createElementNS(svgNS, 'title');
        title.textContent = 'Eliminar esta dependencia';
        delGroup.appendChild(title);

        delGroup.appendChild(circle);
        delGroup.appendChild(text);

        delGroup.addEventListener('click', e => {
            e.stopPropagation();
            if (confirm('¿Eliminar esta dependencia de enlace?')) {
                ganttDeps = ganttDeps.filter(d => !(d.from === dep.from && d.to === dep.to));
                ganttSave();
                rebuildGanttDOM();
            }
        });

        group.appendChild(hit);
        group.appendChild(path);
        group.appendChild(delGroup);

        depSvg.appendChild(group);
    });
}

// Helper: índice de fila renderizada de una tarea
function getRenderedRowIndex(taskId) {
    let idx = 0;
    for (const task of ganttTasks) {
        if (isTaskHidden(task)) continue;
        if (task.id === taskId) return idx;
        idx++;
    }
    return -1;
}

function isTaskHidden(task) {
    if (!task.parentId) return false;
    const pSt = ganttState[task.parentId];
    if (pSt && pSt.collapsed) return true;
    const parent = ganttTasks.find(t => t.id === task.parentId);
    return parent ? isTaskHidden(parent) : false;
}

// ── Mostrar/ocultar banner de enlace ──
function showGanttLinkBanner(htmlText) {
    let banner = document.getElementById('ganttLinkBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'ganttLinkBanner';
        banner.className = 'gantt-link-banner';
        const container = document.getElementById('ganttContainer');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(banner, container);
        }
    }
    if (banner) {
        banner.innerHTML = `<span>${htmlText}</span>`;
        banner.style.display = 'flex';
    }
}

function hideGanttLinkBanner() {
    const banner = document.getElementById('ganttLinkBanner');
    if (banner) banner.style.display = 'none';
}

// ── Botón Enlazar ──
const ganttLinkBtn = document.getElementById('ganttLinkBtn');
if (ganttLinkBtn) {
    ganttLinkBtn.addEventListener('click', () => {
        ganttLinkMode = !ganttLinkMode;
        ganttLinkSource = null;
        ganttLinkBtn.classList.toggle('active', ganttLinkMode);
        document.body.classList.toggle('gantt-link-mode', ganttLinkMode);

        document.querySelectorAll('.gantt-bar.dep-source').forEach(el => el.classList.remove('dep-source'));

        if (ganttLinkMode) {
            showGanttLinkBanner("🔗 <strong>Modo enlace activo</strong>: Seleccione la tarea predecesora (Fin) haciendo clic en su barra.");
        } else {
            hideGanttLinkBanner();
        }
    });
}

// ── Manejar clicks en modo enlace ──
function handleLinkModeClick(taskId, bar) {
    if (!ganttLinkMode) return;
    const taskObj = ganttTasks.find(t => t.id === taskId);
    if (!taskObj || taskObj.hasKids) return;

    if (!ganttLinkSource) {
        ganttLinkSource = taskId;
        bar.classList.add('dep-source');
        showGanttLinkBanner(`🔗 Seleccione ahora la tarea sucesora (Inicio) para enlazarla con <strong>${taskObj.summary}</strong>, o pulse Enlazar para cancelar.`);
    } else {
        if (ganttLinkSource === taskId) {
            ganttLinkSource = null;
            document.querySelectorAll('.gantt-bar.dep-source').forEach(el => el.classList.remove('dep-source'));
            showGanttLinkBanner("🔗 Seleccione la tarea predecesora (Fin) haciendo clic en su barra.");
            return;
        }
        const exists = ganttDeps.some(d => d.from === ganttLinkSource && d.to === taskId);
        if (!exists) {
            if (ganttDeps.some(d => d.from === taskId && d.to === ganttLinkSource)) {
                alert("Error: No se pueden crear enlaces cíclicos.");
                return;
            }
            ganttDeps.push({ from: ganttLinkSource, to: taskId });
            applyDependencies();
            recalculateParentTasks();
            recalculateParentProgress();
            ganttSave();
        }
        ganttLinkSource = null;
        document.querySelectorAll('.gantt-bar.dep-source').forEach(el => el.classList.remove('dep-source'));
        showGanttLinkBanner("Enlace creado con éxito. Seleccione otra tarea predecesora (Fin) o pulse Enlazar para terminar.");
        rebuildGanttDOM();
    }
}


// ── Integrar en rebuildGanttDOM: aplicar deps y dibujar flechas ──
// Sobreescribimos stopGanttDrag para incluir applyDependencies
const _origStopGanttDrag = stopGanttDrag;
stopGanttDrag = function() {
    if (!ganttDrag) return;
    recalculateParentTasks();
    applyDependencies();
    recalculateParentProgress();
    ganttSave();
    ganttDrag = null;
    document.removeEventListener('mousemove', doGanttDrag);
    document.removeEventListener('mouseup', stopGanttDrag);
    rebuildGanttDOM();
};

// Inyectar drawDependencyArrows al final de rebuildGanttDOM
// Lo hacemos interceptando la función existente
const _origRebuildGanttDOM = rebuildGanttDOM;
rebuildGanttDOM = function() {
    applyDependencies();
    _origRebuildGanttDOM();
    // Dibujar flechas tras el rebuild
    const bw = document.querySelector('#ganttContainer .gantt-body');
    if (bw) {
        let colsCount = ganttTotalWeeks;
        if (ganttViewMode === 'days') colsCount = ganttTotalWeeks * 7;
        else if (ganttViewMode === 'months') colsCount = Math.ceil(ganttTotalWeeks / 4);
        drawDependencyArrows(bw, colsCount);
    }
};

// =============================================================================
// FEATURE 4: Curva S de Avance Económico
// =============================================================================
function calculateSCurve() {
    if (!ganttTasks || ganttTasks.length === 0) return { labels: [], planned: [], executed: [] };

    const totalWeeks = ganttTotalWeeks;
    const planned  = new Array(totalWeeks).fill(0);
    const executed = new Array(totalWeeks).fill(0);

    // Solo tareas hoja (sin hijos) contribuyen directamente
    const leaves = ganttTasks.filter(t => !t.hasKids);

    leaves.forEach(task => {
        const st = ganttState[task.id];
        if (!st || !task.price) return;
        const cost = task.price;
        const prog = (st.progress || 0) / 100;
        const start = Math.max(0, st.startWeek - 1); // 0-indexed
        const dur   = Math.max(1, st.durationWeeks);
        const costPerWeek = cost / dur;

        for (let w = 0; w < dur; w++) {
            const idx = start + w;
            if (idx < totalWeeks) {
                planned[idx]  += costPerWeek;
                executed[idx] += costPerWeek * prog;
            }
        }
    });

    // Acumular
    const plannedAcc  = [];
    const executedAcc = [];
    let sumP = 0, sumE = 0;
    const labels = [];
    for (let w = 0; w < totalWeeks; w++) {
        sumP += planned[w];
        sumE += executed[w];
        plannedAcc.push(Math.round(sumP * 100) / 100);
        executedAcc.push(Math.round(sumE * 100) / 100);
        const d = new Date(ganttStartDate);
        d.setDate(d.getDate() + w * 7);
        labels.push(`S${w + 1}`);
    }

    return { labels, planned: plannedAcc, executed: executedAcc };
}

// Integrar la Curva S en renderCharts
const _origRenderCharts = renderCharts;
renderCharts = function() {
    _origRenderCharts();

    // Destruir instancia previa si existe
    if (window.sCurveChartInstance) {
        try { window.sCurveChartInstance.destroy(); } catch(e) {}
        window.sCurveChartInstance = null;
    }

    const ctx = document.getElementById('sCurveChart');
    if (!ctx) return;

    const { labels, planned, executed } = calculateSCurve();
    if (labels.length === 0) return;

    const isDark = document.body.classList.contains('dark-theme');
    const labelColor = isDark ? '#e2e8f0' : '#1e293b';
    const gridColor  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    // Mostrar solo cada N semanas en el eje X para no saturar
    const maxLabels = 26;
    const step = Math.max(1, Math.ceil(labels.length / maxLabels));
    const filteredLabels = labels.map((l, i) => i % step === 0 ? l : '');

    window.sCurveChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: filteredLabels,
            datasets: [
                {
                    label: 'Planificado (€)',
                    data: planned,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.08)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 0,
                    borderWidth: 2.5
                },
                {
                    label: 'Ejecutado (€)',
                    data: executed,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.08)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 0,
                    borderWidth: 2.5,
                    borderDash: [],
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { color: labelColor } },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = ctx.parsed.y;
                            return ` ${ctx.dataset.label}: ${v.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
                        },
                        afterBody: (items) => {
                            if (items.length < 2) return '';
                            const pl = items[0].parsed.y || 0;
                            const ex = items[1].parsed.y || 0;
                            const pct = pl > 0 ? ((ex / pl) * 100).toFixed(1) : '0.0';
                            const dev = ex - pl;
                            const devStr = (dev >= 0 ? '+' : '') + dev.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + ' €';
                            return [`Avance real: ${pct}%`, `Desviación: ${devStr}`];
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: labelColor, maxRotation: 0 }, grid: { color: gridColor } },
                y: {
                    ticks: {
                        color: labelColor,
                        callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k€' : v + '€'
                    },
                    grid: { color: gridColor }
                }
            }
        }
    });
};

// =============================================================================
// FEATURE 5: Buscador Global (Ctrl+F)
// =============================================================================
let gsMatches = [];
let gsActiveIdx = -1;

function openGlobalSearch() {
    const bar = document.getElementById('globalSearchBar');
    if (!bar) return;
    bar.style.display = 'flex';
    const input = document.getElementById('globalSearchInput');
    if (input) { input.value = ''; input.focus(); }
    gsMatches = []; gsActiveIdx = -1;
    updateGSCount();
}

function closeGlobalSearch() {
    const bar = document.getElementById('globalSearchBar');
    if (bar) bar.style.display = 'none';
    clearGSHighlights();
    gsMatches = []; gsActiveIdx = -1;
}

function clearGSHighlights() {
    document.querySelectorAll('.search-highlight, .search-highlight--active').forEach(el => {
        // Restore original text (strip <mark> tags)
        el.querySelectorAll('mark').forEach(m => {
            const t = document.createTextNode(m.textContent);
            m.replaceWith(t);
        });
        el.classList.remove('search-highlight', 'search-highlight--active');
    });
}

function performGlobalSearch(term) {
    clearGSHighlights();
    gsMatches = []; gsActiveIdx = -1;

    if (!term || term.length < 2) { updateGSCount(); return; }

    const lower = term.toLowerCase();
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    // Buscar en todas las filas de la tabla del árbol
    const rows = document.querySelectorAll('#treeContent tr, #treeContent .tree-row');
    rows.forEach(row => {
        // Buscar en celdas de texto (código y summary)
        const cells = row.querySelectorAll('td, .tree-cell');
        let matched = false;
        cells.forEach(cell => {
            if (cell.querySelector('button, input, select')) return; // Saltar celdas de control
            if (cell.textContent.toLowerCase().includes(lower)) {
                // Resaltar el texto coincidente dentro de nodos de texto
                highlightTextInEl(cell, re);
                matched = true;
            }
        });
        if (matched) {
            row.classList.add('search-highlight');
            gsMatches.push(row);
        }
    });

    updateGSCount();
    if (gsMatches.length > 0) navigateGS(1); // Ir al primero
}

function highlightTextInEl(el, re) {
    // Solo procesar nodos de texto directos e hijos no-element
    el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const span = document.createElement('span');
            span.innerHTML = node.textContent.replace(re, m => `<mark>${m}</mark>`);
            node.replaceWith(span);
        } else if (node.nodeType === Node.ELEMENT_NODE && !['BUTTON','INPUT','SELECT','MARK'].includes(node.tagName)) {
            highlightTextInEl(node, re);
        }
    });
}

function navigateGS(dir) {
    if (gsMatches.length === 0) return;

    // Quitar clase activa anterior
    if (gsActiveIdx >= 0 && gsMatches[gsActiveIdx]) {
        gsMatches[gsActiveIdx].classList.remove('search-highlight--active');
    }

    gsActiveIdx = (gsActiveIdx + dir + gsMatches.length) % gsMatches.length;

    const active = gsMatches[gsActiveIdx];
    if (active) {
        active.classList.add('search-highlight--active');
        active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateGSCount();
}

function updateGSCount() {
    const el = document.getElementById('globalSearchCount');
    if (!el) return;
    if (gsMatches.length === 0) {
        el.textContent = 'Sin resultados';
        el.style.color = 'var(--text-secondary)';
    } else {
        el.textContent = `${gsActiveIdx + 1} de ${gsMatches.length}`;
        el.style.color = 'var(--accent, #3b82f6)';
    }
    const prev = document.getElementById('globalSearchPrev');
    const next = document.getElementById('globalSearchNext');
    if (prev) prev.disabled = gsMatches.length === 0;
    if (next) next.disabled = gsMatches.length === 0;
}

// ── Atajos de teclado ──
document.addEventListener('keydown', e => {
    // Ctrl+F / Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const bar = document.getElementById('globalSearchBar');
        // Solo activar cuando el árbol de presupuesto es visible
        const treeContent = document.getElementById('treeContent');
        if (treeContent && treeContent.offsetParent !== null) {
            e.preventDefault();
            if (bar && bar.style.display === 'none') {
                openGlobalSearch();
            } else {
                document.getElementById('globalSearchInput')?.focus();
            }
        }
    }
    // Escape para cerrar buscador o modo enlace
    if (e.key === 'Escape') {
        const bar = document.getElementById('globalSearchBar');
        if (bar && bar.style.display !== 'none') {
            closeGlobalSearch();
        }
        if (ganttLinkMode) {
            ganttLinkMode = false;
            ganttLinkSource = null;
            if (ganttLinkBtn) ganttLinkBtn.classList.remove('active');
            document.body.classList.remove('gantt-link-mode');
            document.querySelectorAll('.gantt-bar.dep-source').forEach(el => el.classList.remove('dep-source'));
            hideGanttLinkBanner();
        }
    }
});

// ── Eventos de la barra ──
const gsInput = document.getElementById('globalSearchInput');
if (gsInput) {
    let gsTimer;
    gsInput.addEventListener('input', () => {
        clearTimeout(gsTimer);
        gsTimer = setTimeout(() => performGlobalSearch(gsInput.value.trim()), 250);
    });
    gsInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            navigateGS(e.shiftKey ? -1 : 1);
        }
    });
}

const gsPrev  = document.getElementById('globalSearchPrev');
const gsNext  = document.getElementById('globalSearchNext');
const gsClose = document.getElementById('globalSearchClose');
if (gsPrev)  gsPrev.addEventListener('click',  () => navigateGS(-1));
if (gsNext)  gsNext.addEventListener('click',  () => navigateGS(1));
if (gsClose) gsClose.addEventListener('click', () => closeGlobalSearch());

// =============================================================================
// Lógica para Añadir Nueva Partida
// =============================================================================
const addPartidaBtn = document.getElementById('addPartidaBtn');
const addPartidaModal = document.getElementById('addPartidaModal');
const closeAddPartidaBtn = document.getElementById('closeAddPartidaBtn');
const cancelAddPartidaBtn = document.getElementById('cancelAddPartidaBtn');
const addPartidaForm = document.getElementById('addPartidaForm');

if (addPartidaBtn && addPartidaModal) {
    addPartidaBtn.addEventListener('click', () => {
        const parentCode = addPartidaBtn.dataset.parentCode;
        if (!parentCode) return;
        const parentConcept = parsedData.concepts[parentCode];
        if (!parentConcept) return;

        // Mostrar nombre del capítulo destino
        const parentDisplay = document.getElementById('addPartidaParentDisplay');
        if (parentDisplay) {
            parentDisplay.value = `${parentCode.replace(/#+\s*$/, '')} - ${parentConcept.summary || ''}`;
        }

        // Abrir modal
        addPartidaModal.style.display = 'flex';
        
        // Resetear y enfocar el primer input
        if (addPartidaForm) addPartidaForm.reset();
        setTimeout(() => {
            document.getElementById('addPartidaSummary')?.focus();
        }, 100);
    });
}

function closeAddPartidaModal() {
    if (addPartidaModal) {
        addPartidaModal.style.display = 'none';
    }
}

if (closeAddPartidaBtn) closeAddPartidaBtn.addEventListener('click', closeAddPartidaModal);
if (cancelAddPartidaBtn) cancelAddPartidaBtn.addEventListener('click', closeAddPartidaModal);
if (addPartidaModal) {
    addPartidaModal.addEventListener('click', (e) => {
        if (e.target === addPartidaModal) closeAddPartidaModal();
    });
}

if (addPartidaForm) {
    addPartidaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const parentCode = addPartidaBtn.dataset.parentCode;
        const summary = document.getElementById('addPartidaSummary').value.trim();
        const qty = parseFloat(document.getElementById('addPartidaQty').value) || 0;
        const price = parseFloat(document.getElementById('addPartidaPrice').value) || 0;

        if (!parentCode || !summary) return;

        const parentConcept = parsedData.concepts[parentCode];
        if (!parentConcept) return;

        // Auto-generación de código (ej: 01.02.new1)
        const parentCodeClean = parentCode.replace(/#+\s*$/, '');
        let count = 1;
        let newCode = `${parentCodeClean}.new${count}`;
        while (parsedData.concepts[newCode]) {
            count++;
            newCode = `${parentCodeClean}.new${count}`;
        }

        // 1. Crear el objeto concepto
        parsedData.concepts[newCode] = {
            code: newCode,
            unit: 'ud',
            summary: summary,
            price: price,
            description: '',
            decomposition: [],
            measurements: [],
            category: 'PARTIDA_NEW',
            isNewPartida: true
        };

        // 2. Asociar como hijo en la descomposición del padre
        if (!Array.isArray(parentConcept.decomposition)) {
            parentConcept.decomposition = [];
        }
        parentConcept.decomposition.push({
            code: newCode,
            factor: qty,
            type: 4 // Generic subcontrato / simple item
        });

        // Si el padre tiene el array children auxiliar, sincronizar
        if (Array.isArray(parentConcept.children)) {
            parentConcept.children.push(newCode);
        }

        // Forzar recálculo
        parentConcept.isManualPrice = false;
        
        recalculateAll();
        saveHistoryState();
        closeAddPartidaModal();

        // Renderizar el árbol y seleccionar el nuevo elemento
        renderCurrentLevel();
        showDetails(newCode);
        updateTotalBudgetDisplay();
        
        // Enfocar el elemento recién creado en el árbol para dar feedback visual
        setTimeout(() => {
            const nodeContainer = document.querySelector(`.tree-node-container[data-code="${newCode}"]`);
            if (nodeContainer) {
                nodeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const row = nodeContainer.querySelector('.tree-node-row');
                if (row) {
                    row.classList.add('active');
                    row.style.transition = 'background-color 0.3s';
                    const origBg = row.style.backgroundColor;
                    row.style.backgroundColor = 'var(--accent-glow, rgba(59, 130, 246, 0.15))';
                    setTimeout(() => {
                        row.style.backgroundColor = origBg;
                    }, 2000);
                }
            }
        }, 300);
    });
}


// =============================================================================
// Helper Functions for Inline Draft Partida Creation in the Tree
// =============================================================================

function createDraftNodeRow(depth) {
    const row = document.createElement('div');
    row.className = 'tree-node-row draft-node-row';
    row.style.backgroundColor = 'var(--accent-glow, rgba(59, 130, 246, 0.08))';
    row.style.borderLeft = '4px solid var(--accent, #3b82f6)';
    row.style.display = 'grid';
    row.style.alignItems = 'center';
    row.style.minHeight = '38px';
    
    if (window.columnWidths && window.columnWidths.length >= 5) {
        const w = window.columnWidths;
        row.style.gridTemplateColumns = `${w[0]}px ${w[1]}px 1fr ${w[2]}px ${w[3]}px ${w[4]}px`;
    } else {
        row.style.gridTemplateColumns = '160px 50px 1fr 100px 100px 120px';
    }

    // 1. Column: Code (contains arrows and OK checkmark)
    const colCode = document.createElement('div');
    colCode.className = 'col-code';
    colCode.style.paddingLeft = (depth * 20 + 8) + 'px';
    colCode.style.display = 'flex';
    colCode.style.alignItems = 'center';
    colCode.style.gap = '4px';

    // Arrow and OK buttons wrapper
    const btnWrapper = document.createElement('div');
    btnWrapper.style.display = 'inline-flex';
    btnWrapper.style.alignItems = 'center';
    btnWrapper.style.gap = '2px';

    // Arrow Left button
    const btnLeft = document.createElement('button');
    btnLeft.type = 'button';
    btnLeft.innerHTML = '◀';
    btnLeft.className = 'draft-nav-btn';
    btnLeft.title = 'Subir de nivel (extraer)';
    btnLeft.style.cssText = 'background:none; border:none; cursor:pointer; font-size:11px; padding:2px; color:var(--text-secondary); font-weight:bold;';
    btnLeft.onclick = (e) => { e.stopPropagation(); moveDraftLeft(); };

    // Arrow Up button
    const btnUp = document.createElement('button');
    btnUp.type = 'button';
    btnUp.innerHTML = '▲';
    btnUp.className = 'draft-nav-btn';
    btnUp.title = 'Mover Arriba';
    btnUp.style.cssText = 'background:none; border:none; cursor:pointer; font-size:11px; padding:2px; color:var(--text-secondary); font-weight:bold;';
    btnUp.onclick = (e) => { e.stopPropagation(); moveDraftUp(); };

    // Arrow Down button
    const btnDown = document.createElement('button');
    btnDown.type = 'button';
    btnDown.innerHTML = '▼';
    btnDown.className = 'draft-nav-btn';
    btnDown.title = 'Mover Abajo';
    btnDown.style.cssText = 'background:none; border:none; cursor:pointer; font-size:11px; padding:2px; color:var(--text-secondary); font-weight:bold;';
    btnDown.onclick = (e) => { e.stopPropagation(); moveDraftDown(); };

    // Arrow Right button
    const btnRight = document.createElement('button');
    btnRight.type = 'button';
    btnRight.innerHTML = '▶';
    btnRight.className = 'draft-nav-btn';
    btnRight.title = 'Bajar de nivel (anidar)';
    btnRight.style.cssText = 'background:none; border:none; cursor:pointer; font-size:11px; padding:2px; color:var(--text-secondary); font-weight:bold;';
    btnRight.onclick = (e) => { e.stopPropagation(); moveDraftRight(); };

    // OK Button
    const btnConfirm = document.createElement('button');
    btnConfirm.type = 'button';
    btnConfirm.innerHTML = '✔️';
    btnConfirm.className = 'draft-confirm-btn';
    btnConfirm.title = 'Confirmar y Guardar Partida';
    btnConfirm.style.cssText = 'background:var(--success, #10b981); border:none; border-radius:4px; color:white; font-size:10px; cursor:pointer; padding:3px 6px; font-weight:bold; margin-left: 4px;';
    btnConfirm.onclick = (e) => { e.stopPropagation(); confirmDraftPartida(); };

    btnWrapper.appendChild(btnLeft);
    btnWrapper.appendChild(btnUp);
    btnWrapper.appendChild(btnDown);
    btnWrapper.appendChild(btnRight);
    btnWrapper.appendChild(btnConfirm);

    colCode.appendChild(btnWrapper);

    // 2. Column: Unit
    const colUnit = document.createElement('div');
    colUnit.className = 'col-unit';
    const inputUnit = document.createElement('input');
    inputUnit.type = 'text';
    inputUnit.value = draftNode.unit || 'ud';
    inputUnit.style.cssText = 'width:90%; padding:3px 4px; border:1px solid var(--border-color); border-radius:4px; font-size:12px; background:var(--bg-color); color:var(--text-primary); outline:none; text-align:center;';
    inputUnit.oninput = (e) => { draftNode.unit = e.target.value; };
    colUnit.appendChild(inputUnit);

    // 3. Column: Summary
    const colSummary = document.createElement('div');
    colSummary.className = 'col-summary';
    colSummary.style.display = 'flex';
    colSummary.style.alignItems = 'center';
    const inputSummary = document.createElement('input');
    inputSummary.type = 'text';
    inputSummary.id = 'draftInputSummary';
    inputSummary.placeholder = 'Resumen de la nueva partida (obligatorio)';
    inputSummary.value = draftNode.summary || '';
    inputSummary.style.cssText = 'width:98%; padding:3px 6px; border:1px solid var(--border-color); border-radius:4px; font-size:12px; background:var(--bg-color); color:var(--text-primary); outline:none;';
    inputSummary.oninput = (e) => { 
        draftNode.summary = e.target.value; 
        e.target.style.borderColor = ''; // clear error
    };
    colSummary.appendChild(inputSummary);

    // 4. Column: Quantity
    const colQty = document.createElement('div');
    colQty.className = 'col-quantity';
    const inputQty = document.createElement('input');
    inputQty.type = 'number';
    inputQty.id = 'draftInputQty';
    inputQty.placeholder = '0.00';
    inputQty.step = 'any';
    inputQty.value = draftNode.qty || '';
    inputQty.style.cssText = 'width:90%; padding:3px 4px; border:1px solid var(--border-color); border-radius:4px; font-size:12px; background:var(--bg-color); color:var(--text-primary); outline:none; text-align:right;';
    inputQty.oninput = (e) => {
        draftNode.qty = e.target.value;
        e.target.style.borderColor = '';
        updateDraftImporte();
    };
    colQty.appendChild(inputQty);

    // 5. Column: Price
    const colPrice = document.createElement('div');
    colPrice.className = 'col-price';
    const inputPrice = document.createElement('input');
    inputPrice.type = 'number';
    inputPrice.id = 'draftInputPrice';
    inputPrice.placeholder = '0.00';
    inputPrice.step = 'any';
    inputPrice.value = draftNode.price || '';
    inputPrice.style.cssText = 'width:90%; padding:3px 4px; border:1px solid var(--border-color); border-radius:4px; font-size:12px; background:var(--bg-color); color:var(--text-primary); outline:none; text-align:right;';
    inputPrice.oninput = (e) => {
        draftNode.price = e.target.value;
        e.target.style.borderColor = '';
        updateDraftImporte();
    };
    colPrice.appendChild(inputPrice);

    // 6. Column: Amount (calculated automatically)
    const colAmount = document.createElement('div');
    colAmount.className = 'col-amount';
    colAmount.id = 'draftDisplayAmount';
    colAmount.style.textAlign = 'right';
    colAmount.style.fontWeight = 'bold';
    colAmount.style.fontSize = '12px';
    colAmount.style.paddingRight = '8px';
    
    const qVal = parseFloat(draftNode.qty);
    const pVal = parseFloat(draftNode.price);
    if (!isNaN(qVal) && !isNaN(pVal)) {
        colAmount.textContent = (qVal * pVal).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    } else {
        colAmount.textContent = '0,00 €';
    }

    row.appendChild(colCode);
    row.appendChild(colUnit);
    row.appendChild(colSummary);
    row.appendChild(colQty);
    row.appendChild(colPrice);
    row.appendChild(colAmount);

    function updateDraftImporte() {
        const display = row.querySelector('#draftDisplayAmount');
        if (display) {
            const q = parseFloat(draftNode.qty);
            const p = parseFloat(draftNode.price);
            if (!isNaN(q) && !isNaN(p)) {
                display.textContent = (q * p).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
            } else {
                display.textContent = '0,00 €';
            }
        }
    }

    return row;
}

function confirmDraftPartida() {
    const summaryInput = document.getElementById('draftInputSummary');
    const qtyInput = document.getElementById('draftInputQty');
    const priceInput = document.getElementById('draftInputPrice');

    const summary = (draftNode.summary || '').trim();
    const qty = parseFloat(draftNode.qty);
    const price = parseFloat(draftNode.price);

    let hasError = false;

    if (!summary) {
        if (summaryInput) summaryInput.style.borderColor = '#ef4444';
        hasError = true;
    }
    if (isNaN(qty) || qty < 0) {
        if (qtyInput) qtyInput.style.borderColor = '#ef4444';
        hasError = true;
    }
    if (isNaN(price) || price < 0) {
        if (priceInput) priceInput.style.borderColor = '#ef4444';
        hasError = true;
    }

    if (hasError) {
        alert("Por favor, rellene todos los campos obligatorios resaltados en rojo con valores válidos.");
        return;
    }

    // Auto-generate code based on parent
    let parentCode = draftNode.parentCode;
    let newCode = '';

    if (parentCode === null) {
        // Root node
        let count = 1;
        newCode = `${String(count).padStart(2, '0')}#`;
        while (parsedData.concepts[newCode]) {
            count++;
            newCode = `${String(count).padStart(2, '0')}#`;
        }
        
        // Add to roots
        if (Array.isArray(parsedData.root_nodes)) {
            parsedData.root_nodes.splice(draftNode.index, 0, newCode);
        } else {
            parsedData.root_nodes = Object.values(parsedData.root_nodes);
            parsedData.root_nodes.splice(draftNode.index, 0, newCode);
        }
    } else {
        const parentConcept = parsedData.concepts[parentCode];
        if (!parentConcept) return;

        const parentCodeClean = parentCode.replace(/#+\s*$/, '');
        let count = 1;
        newCode = `${parentCodeClean}.${String(count).padStart(2, '0')}`;
        while (parsedData.concepts[newCode]) {
            count++;
            newCode = `${parentCodeClean}.${String(count).padStart(2, '0')}`;
        }

        // Add to parent decomposition
        if (!Array.isArray(parentConcept.decomposition)) {
            parentConcept.decomposition = [];
        }
        parentConcept.decomposition.splice(draftNode.index, 0, {
            code: newCode,
            factor: qty,
            type: 4 // Subcontract / Simple node
        });

        if (Array.isArray(parentConcept.children)) {
            parentConcept.children.push(newCode);
        }

        parentConcept.isManualPrice = false;
    }

    // Create new concept
    parsedData.concepts[newCode] = {
        code: newCode,
        unit: draftNode.unit || 'ud',
        summary: summary,
        price: price,
        description: '',
        decomposition: [],
        measurements: [],
        category: 'PARTIDA_NEW',
        isNewPartida: true
    };

    // Recalculate, save history, hide draft
    recalculateAll();
    saveHistoryState();
    
    draftActive = false;
    
    // Clear draft fields
    draftNode.summary = '';
    draftNode.qty = '';
    draftNode.price = '';
    draftNode.unit = 'ud';

    renderCurrentLevel();
    updateTotalBudgetDisplay();

    // Highlight and focus newly created node
    setTimeout(() => {
        const nodeContainer = document.querySelector(`.tree-node-container[data-code="${newCode}"]`);
        if (nodeContainer) {
            nodeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const row = nodeContainer.querySelector('.tree-node-row');
            if (row) {
                row.classList.add('active');
                row.style.transition = 'background-color 0.3s';
                const origBg = row.style.backgroundColor;
                row.style.backgroundColor = 'var(--accent-glow, rgba(59, 130, 246, 0.15))';
                setTimeout(() => {
                    row.style.backgroundColor = origBg;
                }, 2000);
            }
        }
    }, 300);
}

function getParentConceptCode(childCode) {
    for (const concept of Object.values(parsedData.concepts)) {
        if (Array.isArray(concept.decomposition)) {
            if (concept.decomposition.some(item => item.code === childCode)) {
                return concept.code;
            }
        }
        if (Array.isArray(concept.children)) {
            if (concept.children.includes(childCode)) {
                return concept.code;
            }
        }
    }
    return null;
}

function getSiblingCodes(parentCode) {
    if (parentCode === null) {
        return Array.isArray(parsedData.root_nodes) ? parsedData.root_nodes : Object.values(parsedData.root_nodes);
    }
    const parentConcept = parsedData.concepts[parentCode];
    if (!parentConcept) return [];
    return getConceptDecomposition(parentConcept).map(item => item.code);
}

function moveDraftUp() {
    if (draftNode.index > 0) {
        draftNode.index--;
        renderCurrentLevel();
    }
}

function moveDraftDown() {
    const siblings = getSiblingCodes(draftNode.parentCode);
    if (draftNode.index < siblings.length) {
        draftNode.index++;
        renderCurrentLevel();
    }
}

function moveDraftLeft() {
    if (draftNode.parentCode !== null) {
        const parentCode = draftNode.parentCode;
        const parentParentCode = getParentConceptCode(parentCode);
        const parentSiblings = getSiblingCodes(parentParentCode);
        const parentIndex = parentSiblings.indexOf(parentCode);
        
        draftNode.parentCode = parentParentCode;
        draftNode.depth = Math.max(0, draftNode.depth - 1);
        draftNode.index = parentIndex >= 0 ? parentIndex + 1 : 0;
        renderCurrentLevel();
    }
}

function moveDraftRight() {
    const siblings = getSiblingCodes(draftNode.parentCode);
    if (draftNode.index > 0) {
        const siblingAboveCode = siblings[draftNode.index - 1];
        const siblingAbove = parsedData.concepts[siblingAboveCode];
        if (siblingAbove) {
            draftNode.parentCode = siblingAboveCode;
            draftNode.depth = draftNode.depth + 1;
            const newSiblings = getSiblingCodes(siblingAboveCode);
            draftNode.index = newSiblings.length;
            renderCurrentLevel();
        }
    }
}



