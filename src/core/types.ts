// Type pour l'identifiant unique d'une ligne
export type RowId = string | number;

// Type générique pour représenter une ligne de données (tableau où le premier élément est l'ID)
// NOTE: Une structure objet { id: T, ... } serait plus explicite mais demanderait plus de refactoring.
export type RowData<T extends RowId> = [T, ...any[]];

// Types pour définir une colonne
export interface ColumnDefinition {
    title: string;
    data?: string;
    name?: string;
    type?: 'string' | 'number' | 'date' | 'mail' | 'tel' | 'money';
    render?: (cellData: any, rowData: any[], rowIndex: number) => string | HTMLElement | DocumentFragment;
    sortable?: boolean;
    searchable?: boolean;
    locale?: string;
    currency?: string;
    width?: string;
    filterType?: 'text' | 'number' | 'date' | 'multi-select';
    resizable?: boolean;
    filterOptions?: (string | { value: any; label: string })[];
    filterPlaceholder?: string;
    filterOperators?: TextFilterOperator[] | NumberFilterOperator[] | DateFilterOperator[] | MultiSelectFilterOperator[];
    textAlign?: 'left' | 'center' | 'right' | 'justify';
}

// Interface pour les actions
export interface RowAction {
    label: string;        
    actionId: string;     
    className?: string;   
}

// Options pour l'export CSV (potentiellement déjà défini)
export interface CsvExportOptions {
    enabled?: boolean; // Peut-être redondant si on utilise l'objet
    delimiter?: string;
    filename?: string;
    encoding?: string;
    bom?: boolean;
}

// Options pour l'export Excel (vide pour l'instant, peut être étendu plus tard)
export interface ExcelExportOptions {
    enabled?: boolean;
    filename?: string;
    sheetName?: string;
    // ... autres options exceljs potentielles
}

// Options pour l'export PDF (vide pour l'instant, peut être étendu plus tard)
export interface PdfExportOptions {
    enabled?: boolean;
    filename?: string;
    orientation?: 'portrait' | 'landscape';
    format?: string; // ex: 'a4'
    // ... autres options jspdf/autotable potentielles
}

// Options principales
export interface DataTableOptions {
    columns: ColumnDefinition[];
    data?: any[][];
    uniqueRowIdColumn?: number | string;
    pagination?: PaginationOptions; 
    sorting?: { enabled: boolean; };
    searching?: { enabled: boolean; debounceTime?: number; };
    rowActions?: RowAction[]; 
    actionsColumn?: { header?: string; width?: string; }; 
    processingMode?: 'client' | 'server';
    serverSideTotalRows?: number;
    serverSide?: { fetchData?: (params: ServerSideParams) => Promise<{ data: any[][]; totalRecords: number }>; };
    selection?: { enabled: boolean; mode?: 'single' | 'multiple'; initialSelectedIds?: any[]; };
    loadingMessage?: string;
    // *** Modifier la structure de exporting ***
    exporting?: {
        csv?: CsvExportOptions | boolean;     // Garde la flexibilité existante
        excel?: ExcelExportOptions | boolean; // Permet d'activer/désactiver ou passer des options
        pdf?: PdfExportOptions | boolean;     // Permet d'activer/désactiver ou passer des options
    };
    columnFiltering?: { enabled: boolean; showClearButton?: boolean; };
    stateManagement?: { persist?: boolean; prefix?: string; };
    resizableColumns?: boolean;
}

// Opérateurs pour les filtres texte
export type TextFilterOperator = 
    'contains' | 
    'notContains' |
    'equals' | 
    'startsWith' | 
    'endsWith' | 
    'isEmpty' |
    'isNotEmpty';

// Nouveaux opérateurs pour les filtres nombre
export type NumberFilterOperator = 
    'equals' | 
    'notEquals' | 
    'greaterThan' | 
    'lessThan' | 
    'greaterThanOrEqual' | 
    'lessThanOrEqual' | 
    'between' | // Nécessitera une valeur spéciale { from: number, to: number }
    'isEmpty' | 
    'isNotEmpty';

// Nouveaux opérateurs pour les filtres date (similaires aux nombres)
export type DateFilterOperator = 
    'equals' | 
    'notEquals' | 
    'after' | // >
    'before' | // <
    'afterOrEqual' | // >=
    'beforeOrEqual' | // <=
    'between' | // Nécessitera une valeur spéciale { from: Date | string, to: Date | string }
    'isEmpty' | 
    'isNotEmpty';

// Nouvel opérateur pour les filtres multi-sélection
export type MultiSelectFilterOperator = 'in';

// État d'un filtre de colonne individuel
export type ColumnFilterState = {
    // La valeur peut être une chaîne, un nombre, un objet pour les plages, OU un tableau pour multi-select
    value: string | number | { from: number | string | Date, to: number | string | Date } | (string | number)[] | null;
    // L'opérateur peut être l'un des types définis
    operator?: TextFilterOperator | NumberFilterOperator | DateFilterOperator | MultiSelectFilterOperator;
} | null;

export type SortDirection = 'asc' | 'desc' | 'none';
export type PaginationStyle = 'simple' | 'numbered' | 'numbered-jump';

// Interface pour les paramètres envoyés au serveur
export interface ServerSideParams {
    draw: number;
    start: number;
    length: number;
    search: { value: string; regex: boolean };
    order: { column: number; dir: SortDirection }[];
    columns: {
        data: string | undefined;
        name: string | undefined;
        searchable: boolean;
        orderable: boolean;
        search: { value: string; regex: boolean };
    }[];
}

// Interface pour la réponse attendue du serveur - Revenir à non générique
export interface ServerSideResponse {
    draw?: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: any[][]; // Revenir à any[][]
    error?: string;
}

export interface PaginationOptions {
    enabled?: boolean;
    rowsPerPage?: number;
    rowsPerPageOptions?: number[];
    style?: PaginationStyle;
    previousButtonContent?: string;
    nextButtonContent?: string;
    jumpButtonText?: string;
} 