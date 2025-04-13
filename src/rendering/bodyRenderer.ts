import { DataTable } from "../core/DataTable";
import { getCurrentPageData } from "../features/pagination";
import { handleRowCheckboxClick } from "../features/selection";
import { appendRenderedContent, renderCellByType } from "./cellRenderer";
import { renderActionButtons } from "./uiComponents";

// --- Body Rendering Logic ---

/**
 * Renders the table body (TBODY).
 * @param instance The DataTable instance.
 * @param table The TABLE element.
 * @param data The data to display in the body (already filtered/sorted if client-side).
 */
export function renderStandardBody(instance: DataTable, table: HTMLTableElement, data: any[][]): void {
    // --- LOGS SUPPRIMÉS ---
    // console.log("[renderStandardBody] Received data (count):", data.length);
    // if(data.length > 0) console.log("[renderStandardBody] First row of received data:", data[0]);
    // ----------------------
    let tbody = table.querySelector('tbody');
    if (tbody) {
        tbody.remove(); // Remove old tbody if exists
    }
    tbody = table.createTBody();
    tbody.className = 'bg-white divide-y divide-gray-200';
    tbody.id = instance.element.id + '-tbody';

    // Appliquer la pagination côté client si nécessaire
    const dataToRender = getCurrentPageData(instance, data);
    // --- LOGS SUPPRIMÉS ---
    // console.log("[renderStandardBody] Data after pagination (count):", dataToRender.length);
    // if(dataToRender.length > 0) console.log("[renderStandardBody] First row after pagination:", dataToRender[0]);
    // ----------------------

    // Handle empty state
    if (dataToRender.length === 0) {
        // --- LOG SUPPRIMÉ ---
        // console.log("[renderStandardBody] Rendering empty state.");
        // ------------------
        renderEmptyState(instance, tbody);
        return;
    }

    // Render rows
    // --- LOG SUPPRIMÉ ---
    // console.log(`[renderStandardBody] Rendering ${dataToRender.length} rows.`);
    // --------------------
    dataToRender.forEach(rowData => {
        renderRow(instance, tbody!, rowData);
    });
}

/**
 * Renders a single table row (TR) with its cells (TD).
 * @param instance The DataTable instance.
 * @param tbody The TBODY element.
 * @param rowData The data for the row.
 */
function renderRow(instance: DataTable, tbody: HTMLTableSectionElement, rowData: any[]): void {
    const state = instance.stateManager; // Référence au stateManager
    const row = tbody.insertRow();
    const rowId = rowData[0]; // Assume ID is in the first column
    // Utiliser stateManager pour vérifier la sélection
    const isSelected = state.getSelectedRowIds().has(rowId);

    // Apply base class + selected class if applicable
    row.className = `hover:bg-gray-50 transition-colors duration-150 ${isSelected ? 'dt-row-selected bg-indigo-50' : ''}`;
    row.dataset.rowId = rowId;
    row.setAttribute('role', 'row');
    row.setAttribute('aria-selected', isSelected ? 'true' : 'false');

    // Render selection checkbox cell (if enabled)
    // Utiliser stateManager pour vérifier si la sélection est activée
    if (state.getSelectionEnabled()) {
        renderSelectionCell(instance, row, rowId, isSelected);
    }

    // Render data cells
    rowData.forEach((cellData, cellIndex) => {
        renderDataCell(instance, row, cellData, cellIndex, rowData);
    });

    // Render action buttons cell (if enabled)
    renderActionButtons(instance, row, rowData);
}

/**
 * Renders the cell for the selection checkbox.
 * @param instance The DataTable instance.
 * @param row The TR element.
 * @param rowId The ID of the row.
 * @param isSelected Whether the row is currently selected.
 */
function renderSelectionCell(instance: DataTable, row: HTMLTableRowElement, rowId: any, isSelected: boolean): void {
    const tdCheckbox = row.insertCell();
    tdCheckbox.className = 'px-4 py-4 text-center align-middle';
    tdCheckbox.setAttribute('role', 'gridcell');

    const rowCheckbox = document.createElement('input');
    rowCheckbox.type = 'checkbox';
    rowCheckbox.className = 'form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500';
    rowCheckbox.checked = isSelected;
    rowCheckbox.setAttribute('aria-label', `Sélectionner ligne ${rowId}`);
    rowCheckbox.dataset.rowId = rowId; // Link checkbox to row ID

    rowCheckbox.addEventListener('change', (event) => {
        const isChecked = (event.target as HTMLInputElement).checked;
        handleRowCheckboxClick(instance, rowId, isChecked);
    });
     tdCheckbox.appendChild(rowCheckbox);
}

/**
 * Renders a single data cell (TD).
 * @param instance The DataTable instance.
 * @param row The TR element.
 * @param cellData The data for the cell.
 * @param cellIndex The index of the cell.
 * @param rowData The data for the entire row (needed for custom renderers).
 */
function renderDataCell(instance: DataTable, row: HTMLTableRowElement, cellData: any, cellIndex: number, rowData: any[]): void {
    const cell = row.insertCell();
    cell.className = 'px-6 py-4 text-sm text-gray-800 align-middle whitespace-nowrap overflow-hidden text-ellipsis';
    cell.setAttribute('role', 'gridcell');
    const columnDef = instance.options.columns[cellIndex]; 

    if (columnDef && typeof columnDef.render === 'function') { 
        try { 
            appendRenderedContent(cell, columnDef.render(cellData, rowData)); 
        }
        catch (error) { 
            console.error('Erreur dans la fonction render personnalisée:', error, { cellData, rowData, columnDef }); 
            appendRenderedContent(cell, '[Erreur Rendu]', true); 
        }
    } else if (columnDef && columnDef.type) {
        renderCellByType(cell, cellData, columnDef);
    } else {
        appendRenderedContent(cell, cellData); 
    }
}

/**
 * Renders the empty state message in the table body.
 * @param instance The DataTable instance.
 * @param tbody The TBODY element.
 */
function renderEmptyState(instance: DataTable, tbody: HTMLTableSectionElement): void {
    const state = instance.stateManager; // Référence au stateManager
    const row = tbody.insertRow();
    const cell = row.insertCell();
    const totalColumnCount =
        instance.options.columns.length +
        (instance.options.rowActions && instance.options.rowActions.length > 0 ? 1 : 0) +
        // Utiliser stateManager pour vérifier si la sélection est activée
        (state.getSelectionEnabled() ? 1 : 0);
    cell.colSpan = totalColumnCount;
    cell.className = 'px-6 py-12 text-center text-sm text-gray-500';
    // Utiliser stateManager pour vérifier le terme de filtre
    cell.textContent = state.getFilterTerm()
        ? 'Aucun résultat trouvé pour votre recherche.'
        : 'Aucune donnée à afficher.';
} 