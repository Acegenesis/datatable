import { DataTable } from "../core/DataTable";
import { handleSortClick } from "../features/sorting";
import { handleSelectAllClick, updateSelectAllCheckboxState } from "../features/selection";
import { ColumnDefinition, SortCriterion } from "../core/types";

// --- Header Rendering Logic ---

/**
 * Renders the table header (THEAD).
 * @param instance The DataTable instance.
 * @param table The TABLE element.
 */
export function renderHeader(instance: DataTable, table: HTMLTableElement): void {
    const thead = table.createTHead();
    thead.className = 'bg-gray-50'; 
    // Sticky header styles
    thead.style.position = 'sticky';
    thead.style.top = '0';
    thead.style.zIndex = '10'; 
    
    const headerRow = thead.insertRow();
    headerRow.setAttribute('role', 'row');

    // "Select All" Checkbox Column (if needed)
    if (instance.selectionEnabled && instance.selectionMode === 'multiple') { 
        const thCheckbox = document.createElement('th');
        thCheckbox.scope = 'col';
        thCheckbox.setAttribute('role', 'columnheader');
        thCheckbox.className = 'px-4 py-3 text-center w-12'; 
        thCheckbox.style.boxSizing = 'border-box';

        instance.selectAllCheckbox = document.createElement('input');
        instance.selectAllCheckbox.type = 'checkbox';
        instance.selectAllCheckbox.className = 'form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500';
        updateSelectAllCheckboxState(instance); // Set initial state
        instance.selectAllCheckbox.setAttribute('aria-label', 'Sélectionner toutes les lignes visibles');

        instance.selectAllCheckbox.addEventListener('change', (event) => {
            handleSelectAllClick(instance, (event.target as HTMLInputElement).checked);
        });

        thCheckbox.appendChild(instance.selectAllCheckbox);
        headerRow.appendChild(thCheckbox);
    }

    // Data Columns
    instance.options.columns.forEach((columnDef: ColumnDefinition, index: number) => { 
        const th = document.createElement('th');
        th.scope = 'col';
        th.setAttribute('role', 'columnheader');
        th.className = 'px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis'; 
        th.style.boxSizing = 'border-box'; 
        
        if (columnDef.width) {
            th.style.width = columnDef.width;
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = columnDef.title || ''; 
        th.appendChild(titleSpan);

        // Sorting UI and Logic
        const isSortable = instance.options.sorting?.enabled && columnDef.sortable !== false;
        if (isSortable) { 
            th.classList.add('cursor-pointer', 'hover:bg-gray-100', 'transition-colors', 'duration-150'); 
            th.tabIndex = 0; // Make it focusable
            th.setAttribute('aria-roledescription', 'sortable column header');
            
            th.addEventListener('click', (event) => handleSortClick(instance, index, event.shiftKey, event.ctrlKey));
            th.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    // Simuler shiftKey=false et ctrlKey=false pour le clavier
                    handleSortClick(instance, index, false, false);
                }
            });
            
            let indicatorSymbol = ' ↕'; 
            let ariaSortValue: "ascending" | "descending" | "none" = "none";
            let sortDescription = 'non trié';
            let sortOrderIndicator = ''; // Pour afficher 1, 2, ...

            // Trouver le critère de tri pour cette colonne
            const criterionIndex = instance.sortCriteria.findIndex(c => c.columnIndex === index);
            if (criterionIndex !== -1) {
                const criterion = instance.sortCriteria[criterionIndex];
                indicatorSymbol = criterion.direction === 'asc' ? ' ▲' : ' ▼';
                ariaSortValue = criterion.direction === 'asc' ? 'ascending' : 'descending';
                th.classList.add('bg-gray-100'); 
                sortDescription = criterion.direction === 'asc' ? 'trié par ordre croissant' : 'trié par ordre décroissant';
                // Afficher le numéro d'ordre si plus d'un critère
                if (instance.sortCriteria.length > 1) {
                    sortOrderIndicator = ` (${criterionIndex + 1})`;
                }
             }
             
             const indicatorSpan = document.createElement('span');
             indicatorSpan.className = 'ml-1'; 
             indicatorSpan.setAttribute('aria-hidden', 'true'); 
             indicatorSpan.textContent = indicatorSymbol + sortOrderIndicator;
             th.appendChild(indicatorSpan);
             th.setAttribute('aria-sort', ariaSortValue);
             
             // Accessible description (sr-only)
             const accessibleDescription = document.createElement('span');
             accessibleDescription.className = 'sr-only';
             accessibleDescription.textContent = `, ${sortDescription}${sortOrderIndicator ? `, priorité ${criterionIndex + 1}` : ''}, cliquez pour trier, Maj+clic pour ajouter/modifier, Ctrl+clic pour supprimer`;
             th.appendChild(accessibleDescription);
        } 
        headerRow.appendChild(th);
    });
    
    // Actions Column Header (if needed)
    if (instance.options.rowActions && instance.options.rowActions.length > 0) {
        const thActions = document.createElement('th');
        thActions.scope = 'col';
        thActions.setAttribute('role', 'columnheader');
        // Consider adding a fixed width for actions column via options or CSS
        thActions.className = 'px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis';
        thActions.textContent = 'Actions'; 
        thActions.style.boxSizing = 'border-box';
        // Add sr-only text if header text is visually hidden but needed for screen readers
        // const srSpan = document.createElement('span'); srSpan.className = 'sr-only'; srSpan.textContent = 'Actions par ligne'; thActions.appendChild(srSpan);
        headerRow.appendChild(thActions);
    }
} 