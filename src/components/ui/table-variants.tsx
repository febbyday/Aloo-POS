import React from 'react';
import { EnhancedDataTable, EnhancedDataTableProps } from './enhanced-data-table';
import { Eye, Edit, Trash, Plus, Download, Upload, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

// Common type for all table variants
type CommonTableProps<TData, TValue> = Omit<
  EnhancedDataTableProps<TData, TValue>,
  'actions'
> & {
  title?: string;
  description?: string;
  footerContent?: React.ReactNode;
};

// CRUD Table
export interface CrudTableProps<TData, TValue> extends CommonTableProps<TData, TValue> {
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  selectedItems?: TData[];
  onBulkDelete?: (items: TData[]) => void;
  hideViewAction?: boolean;
  hideEditAction?: boolean;
  hideDeleteAction?: boolean;
  customActions?: EnhancedDataTableProps<TData, TValue>['actions'];
}

export function CrudTable<TData, TValue>({
  // CRUD-specific props
  onView,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  onExport,
  onImport,
  selectedItems = [],
  onBulkDelete,
  hideViewAction = false,
  hideEditAction = false,
  hideDeleteAction = false,
  customActions = [],
  
  // Card props
  title,
  description,
  footerContent,
  
  // Pass-through props
  ...tableProps
}: CrudTableProps<TData, TValue>) {
  // Build actions array
  const actions: EnhancedDataTableProps<TData, TValue>['actions'] = [
    ...(!hideViewAction && onView ? [{
      label: 'View',
      icon: Eye,
      onClick: onView,
      variant: 'ghost',
    }] : []),
    ...(!hideEditAction && onEdit ? [{
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      variant: 'ghost',
    }] : []),
    ...(!hideDeleteAction && onDelete ? [{
      label: 'Delete',
      icon: Trash,
      onClick: onDelete,
      variant: 'ghost',
    }] : []),
    ...customActions,
  ];

  return (
    <Card>
      {(title || description || onAdd || onRefresh || onExport || onImport || (selectedItems.length > 0 && onBulkDelete)) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {selectedItems.length > 0 && onBulkDelete && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onBulkDelete(selectedItems)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete ({selectedItems.length})
              </Button>
            )}
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {onImport && (
              <Button variant="outline" size="sm" onClick={onImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            )}
            {onAdd && (
              <Button size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <EnhancedDataTable
          {...tableProps}
          actions={actions}
          className="border-0"
        />
      </CardContent>
      {footerContent && (
        <CardFooter>{footerContent}</CardFooter>
      )}
    </Card>
  );
}

// Read-Only Table
export interface ReadOnlyTableProps<TData, TValue> extends CommonTableProps<TData, TValue> {
  onRefresh?: () => void;
  onExport?: () => void;
}

export function ReadOnlyTable<TData, TValue>({
  // ReadOnly-specific props
  onRefresh,
  onExport,
  
  // Card props
  title,
  description,
  footerContent,
  
  // Pass-through props
  ...tableProps
}: ReadOnlyTableProps<TData, TValue>) {
  return (
    <Card>
      {(title || description || onRefresh || onExport) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <EnhancedDataTable
          {...tableProps}
          enableRowSelection={false}
          className="border-0"
        />
      </CardContent>
      {footerContent && (
        <CardFooter>{footerContent}</CardFooter>
      )}
    </Card>
  );
}

// Selectable Table
export interface SelectableTableProps<TData, TValue> extends CommonTableProps<TData, TValue> {
  onSelectionChange: (selectedItems: TData[]) => void;
  selectedItems: TData[];
  onRefresh?: () => void;
  selectionActions?: React.ReactNode;
}

export function SelectableTable<TData, TValue>({
  // Selectable-specific props
  onSelectionChange,
  selectedItems,
  onRefresh,
  selectionActions,
  
  // Card props
  title,
  description,
  footerContent,
  
  // Pass-through props
  ...tableProps
}: SelectableTableProps<TData, TValue>) {
  return (
    <Card>
      {(title || description || onRefresh || (selectedItems.length > 0 && selectionActions)) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {selectedItems.length > 0 && selectionActions}
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <EnhancedDataTable
          {...tableProps}
          enableRowSelection={true}
          onRowSelectionChange={onSelectionChange}
          className="border-0"
        />
      </CardContent>
      {footerContent && (
        <CardFooter>{footerContent}</CardFooter>
      )}
    </Card>
  );
}
