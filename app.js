document.getElementById('bc3file').addEventListener('change', function (e) {
    if (this.files && this.files.length > 0) {
        document.getElementById('fileName').textContent = this.files[0].name;
    }
});

document.getElementById('uploadForm').addEventListener('submit', async function (e) {
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

let parsedData = null;

// Column resize state
let resizeState = {
    isResizing: false,
    colIdx: null,
    startX: 0,
    startWidth: 0
};

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

    // Render Project Info
    const info = document.getElementById('projectInfo');
    const title = document.getElementById('projectTitle');
    const owner = document.getElementById('projectOwner');

    // Try to find a good title. Usually from ~V properties or root node.
    title.textContent = data.properties.description || (data.properties.owner + ' Project');

    // Display metadata
    const metaText = [
        data.properties.owner ? `Propietario: ${data.properties.owner}` : '',
        data.properties.format ? `Formato: ${data.properties.format}` : '',
        data.properties.charset ? `(${data.properties.charset})` : ''
    ].filter(Boolean).join(' | ');

    owner.textContent = metaText;

    // Show debug stats
    const conceptCount = Object.keys(data.concepts).length;
    const rootCount = data.root_nodes.length;
    document.getElementById('stats').textContent = `Cargado: ${conceptCount} partidas | Raíces: ${rootCount}`;

    info.style.display = 'block';

    // Render Tree
    const treeContainer = document.getElementById('treeContent');
    treeContainer.innerHTML = '';

    // Hide empty state
    const emptyState = document.querySelector('#treePanel .empty-state');
    if (emptyState) emptyState.style.display = 'none';

    try {
        // Create Header (simple, relies on CSS grid-template-columns)
        const header = document.createElement('div');
        header.className = 'tree-header';
        header.innerHTML = `
            <div></div>
            <div>Código</div>
            <div>Ud</div>
            <div>Resumen</div>
            <div>Cantidad</div>
            <div>Precio</div>
            <div>Importe</div>
        `;
        treeContainer.appendChild(header);

        const rootList = document.createElement('div');

        // Ensure root_nodes is an array
        const roots = Array.isArray(data.root_nodes) ? data.root_nodes : Object.values(data.root_nodes);

        roots.forEach(code => {
            // Root nodes imply qty 1 unless we had a project root with factors (bc3 usually starts with concepts)
            const rootNode = createNode(code, true, 0, 1);
            rootList.appendChild(rootNode);
        });

        treeContainer.appendChild(rootList);
    } catch (e) {
        console.error(e);
        document.getElementById('stats').textContent += ' | ERROR RENDER: ' + e.message;
    }
}

/**
 * createNode
 * @param {string} code 
 * @param {boolean} isRoot 
 * @param {number} depth 
 * @param {number} qty - Quantity of this node in the parent context (factor)
 */
function createNode(code, isRoot = false, depth = 0, qty = 1) {
    const concept = parsedData.concepts[code];
    if (!concept) {
        console.warn('Missing concept:', code);
        return document.createTextNode('');
    }

    const container = document.createElement('div');
    container.className = 'tree-node-container';

    const row = document.createElement('div');

    // Determine styling class
    let hasChildren = false;
    let decomposition = [];

    // Helper to get decomposition with factors
    if (Array.isArray(concept.decomposition) && concept.decomposition.length > 0) {
        decomposition = concept.decomposition;
        hasChildren = true;
    } else if (Array.isArray(concept.children) && concept.children.length > 0) {
        // Fallback if decomposition is missing but children exist (should verify parser)
        // Convert strict references to decomposition-like objects with factor 1
        decomposition = concept.children.map(c => ({ code: c, factor: 1 }));
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

    // 1. Column: Hierarchy Icon
    const colHier = document.createElement('div');
    colHier.className = 'col-hierarchy';

    const toggle = document.createElement('span');
    toggle.className = 'toggle-icon';
    toggle.textContent = '▶';
    toggle.style.opacity = hasChildren ? '1' : '0.1';

    if (isRoot && hasChildren) {
        toggle.classList.add('expanded');
    }

    colHier.appendChild(toggle);

    // 2. Column: Code (Indented)
    const colCode = document.createElement('div');
    colCode.className = 'col-code';
    colCode.textContent = concept.code;
    colCode.style.paddingLeft = (depth * 20 + 8) + 'px';

    // 3. Column: Unit
    const colUnit = document.createElement('div');
    colUnit.className = 'col-unit';
    colUnit.textContent = concept.unit;

    // 4. Column: Summary
    const colSummary = document.createElement('div');
    colSummary.className = 'col-summary';
    colSummary.textContent = concept.summary || '(Sin título)';

    // Values
    const priceVal = parseFloat(concept.price);
    const qtyVal = parseFloat(qty);
    const amountVal = (isNaN(priceVal) || isNaN(qtyVal)) ? 0 : (priceVal * qtyVal);

    // 5. Column: Quantity
    const colQty = document.createElement('div');
    colQty.className = 'col-quantity';
    colQty.textContent = isNaN(qtyVal) ? '' : qtyVal.toLocaleString('es-ES', { minimumFractionDigits: 3 });

    // 6. Column: Price
    const colPrice = document.createElement('div');
    colPrice.className = 'col-price';
    colPrice.textContent = isNaN(priceVal) ? '' : priceVal.toLocaleString('es-ES', { minimumFractionDigits: 2 });

    // 7. Column: Amount (Importe)
    const colAmount = document.createElement('div');
    colAmount.className = 'col-amount';
    colAmount.textContent = amountVal === 0 ? '' : amountVal.toLocaleString('es-ES', { minimumFractionDigits: 2 });


    // Append columns
    row.appendChild(colHier);
    row.appendChild(colCode);
    row.appendChild(colUnit);
    row.appendChild(colSummary);
    row.appendChild(colQty);
    row.appendChild(colPrice);
    row.appendChild(colAmount);

    // Click handlers
    row.onclick = (e) => {
        document.querySelectorAll('.tree-node-row').forEach(el => el.classList.remove('active'));
        row.classList.add('active');
        showDetails(code);
    };

    // Toggle handler
    if (hasChildren) {
        toggle.onclick = (e) => {
            e.stopPropagation();
            const childrenContainer = container.querySelector('.tree-node-children');
            if (childrenContainer) {
                if (childrenContainer.classList.contains('visible')) {
                    childrenContainer.classList.remove('visible');
                    toggle.classList.remove('expanded');
                } else {
                    childrenContainer.classList.add('visible');
                    toggle.classList.add('expanded');
                }
            }
        };
        // Also toggle on double click of row? Optional.
    }

    container.appendChild(row);

    // Children Container
    if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-node-children';
        if (isRoot) {
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
        decomposition.forEach(item => {
            childrenContainer.appendChild(createNode(item.code, false, depth + 1, item.factor));
        });

        container.appendChild(childrenContainer);
    }

    return container;
}

/**
 * createMeasurementTable
 * Renders a full HTML table for measurements with calculations.
 */
function createMeasurementTable(measurements) {
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

    measurements.forEach(m => {
        const tr = document.createElement('tr');

        // Calculate Partial
        // Logic: Empty values imply 1 for multiplication usually, UNLESS all dims are empty?
        // User said "Cuando un valor sea nulo se asumirá un valor 1".

        const u = m.units === '' ? 1 : parseFloat(m.units.replace(',', '.'));
        const l = m.l === '' ? 1 : parseFloat(m.l.replace(',', '.'));
        const w = m.w === '' ? 1 : parseFloat(m.w.replace(',', '.'));
        const h = m.h === '' ? 1 : parseFloat(m.h.replace(',', '.'));

        // Default to 1 if parsing failed (NaN), or strictly 1? 
        // Let's assume valid numbers or 1.
        const vU = isNaN(u) ? 1 : u;
        const vL = isNaN(l) ? 1 : l;
        const vW = isNaN(w) ? 1 : w;
        const vH = isNaN(h) ? 1 : h;

        const partial = vU * vL * vW * vH;
        total += partial;

        tr.innerHTML = `
            <td>${m.label || ''}</td>
            <td class="numeric">${m.units || ''}</td>
            <td class="numeric">${m.l || ''}</td>
            <td class="numeric">${m.w || ''}</td>
            <td class="numeric">${m.h || ''}</td>
            <td class="numeric"><b>${partial.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</b></td>
        `;
        tbody.appendChild(tr);
    });

    // Total Row
    const trTotal = document.createElement('tr');
    trTotal.className = 'total-row';
    trTotal.innerHTML = `
        <td colspan="5" style="text-align: right;">TOTAL:</td>
        <td class="numeric">${total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</td>
    `;
    tbody.appendChild(trTotal);

    table.appendChild(tbody);
    container.appendChild(table);

    return container;
}

function showDetails(code) {
    const concept = parsedData.concepts[code];
    const panel = document.getElementById('detailsContent');
    const emptyState = document.querySelector('#detailsPanel .empty-state');

    emptyState.style.display = 'none';
    panel.style.display = 'block';

    document.getElementById('detCode').textContent = concept.code;
    document.getElementById('detSummary').textContent = concept.summary;
    document.getElementById('detPrice').textContent = parseFloat(concept.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

    // Description: Prefer ~T description, fallback to Summary
    document.getElementById('detDescription').innerHTML = (concept.description || concept.summary).replace(/\n/g, '<br>');

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
                <td>${item.code}</td>
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
