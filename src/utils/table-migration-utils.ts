import { EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';

/**
 * Utility functions to assist with migrating tables to the standardized EnhancedDataTable
 */

/**
 * Convert a legacy column definition to the standardized EnhancedDataTableColumn format
 * 
 * @param legacyColumn The legacy column definition
 * @returns A standardized column definition
 */
export function convertLegacyColumn<TData, TValue = unknown>(
  legacyColumn: any
): EnhancedDataTableColumn<TData, TValue> {
  return {
    id: legacyColumn.id || legacyColumn.accessorKey || String(Math.random()),
    header: legacyColumn.header || legacyColumn.label || '',
    accessorKey: legacyColumn.accessorKey || legacyColumn.key || legacyColumn.accessor,
    cell: legacyColumn.cell,
    enableSorting: legacyColumn.sortable || legacyColumn.enableSorting || false,
    enableHiding: legacyColumn.hideable || legacyColumn.enableHiding || true,
  };
}

/**
 * Convert an array of legacy column definitions to the standardized format
 * 
 * @param legacyColumns Array of legacy column definitions
 * @returns Array of standardized column definitions
 */
export function convertLegacyColumns<TData, TValue = unknown>(
  legacyColumns: any[]
): EnhancedDataTableColumn<TData, TValue>[] {
  return legacyColumns.map(col => convertLegacyColumn<TData, TValue>(col));
}

/**
 * Convert legacy action definitions to the standardized format
 * 
 * @param legacyActions Array of legacy action definitions
 * @returns Array of standardized action definitions
 */
export function convertLegacyActions<TData>(
  legacyActions: any[]
): Array<{
  label: string;
  icon?: React.ElementType;
  onClick: (row: TData) => void;
  condition?: (row: TData) => boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}> {
  return legacyActions.map(action => ({
    label: action.label || action.name || '',
    icon: action.icon,
    onClick: action.onClick || action.onAction || action.handler || (() => {}),
    condition: action.condition || action.shouldShow,
    variant: action.variant || action.type || 'ghost',
    className: action.className || action.class || '',
  }));
}

/**
 * Generate a standardized row class name function from various legacy formats
 * 
 * @param legacyRowClassName Legacy row class name (string, function, or object with conditions)
 * @returns Standardized row class name function
 */
export function convertRowClassName<TData>(
  legacyRowClassName: string | Function | Record<string, any>
): string | ((row: TData) => string) {
  if (typeof legacyRowClassName === 'string') {
    return legacyRowClassName;
  }
  
  if (typeof legacyRowClassName === 'function') {
    return legacyRowClassName as (row: TData) => string;
  }
  
  if (typeof legacyRowClassName === 'object') {
    return (row: TData) => {
      const conditions = Object.entries(legacyRowClassName);
      for (const [className, condition] of conditions) {
        if (typeof condition === 'function' && condition(row)) {
          return className;
        }
      }
      return '';
    };
  }
  
  return '';
}

/**
 * Analyze a component to determine if it contains a table that needs migration
 * 
 * @param componentCode The component code as a string
 * @returns Analysis result with migration recommendations
 */
export function analyzeComponentForTableMigration(
  componentCode: string
): {
  containsTable: boolean;
  tableType: 'custom' | 'dataTable' | 'tanstack' | 'unknown';
  recommendations: string[];
} {
  const result = {
    containsTable: false,
    tableType: 'unknown' as 'custom' | 'dataTable' | 'tanstack' | 'unknown',
    recommendations: [] as string[],
  };
  
  // Check if component contains a table
  if (componentCode.includes('<table') || 
      componentCode.includes('<Table') || 
      componentCode.includes('DataTable') ||
      componentCode.includes('useReactTable')) {
    result.containsTable = true;
    
    // Determine table type
    if (componentCode.includes('useReactTable')) {
      result.tableType = 'tanstack';
      result.recommendations.push('This component uses TanStack Table directly. Consider migrating to EnhancedDataTable for consistency.');
    } else if (componentCode.includes('DataTable')) {
      result.tableType = 'dataTable';
      result.recommendations.push('This component uses the custom DataTable. Migrate to EnhancedDataTable using the convertLegacyColumns and convertLegacyActions utilities.');
    } else {
      result.tableType = 'custom';
      result.recommendations.push('This component uses a custom table implementation. Consider a full rewrite using EnhancedDataTable.');
    }
    
    // Check for pagination
    if (componentCode.includes('pagination') || 
        componentCode.includes('currentPage') || 
        componentCode.includes('pageSize')) {
      result.recommendations.push('Use the built-in pagination in EnhancedDataTable instead of custom pagination logic.');
    }
    
    // Check for sorting
    if (componentCode.includes('sortBy') || 
        componentCode.includes('sortDirection') || 
        componentCode.includes('handleSort')) {
      result.recommendations.push('Use the built-in sorting in EnhancedDataTable instead of custom sorting logic.');
    }
    
    // Check for filtering/searching
    if (componentCode.includes('filter') || 
        componentCode.includes('search') || 
        componentCode.includes('query')) {
      result.recommendations.push('Use the built-in search functionality in EnhancedDataTable instead of custom filtering logic.');
    }
    
    // Check for row selection
    if (componentCode.includes('selectedRows') || 
        componentCode.includes('selectedItems') || 
        componentCode.includes('onSelect')) {
      result.recommendations.push('Use the built-in row selection in EnhancedDataTable with enableRowSelection and onRowSelectionChange props.');
    }
  }
  
  return result;
}
