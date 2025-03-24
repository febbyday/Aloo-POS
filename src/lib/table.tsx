import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Icon } from './icons';

// Types
export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  header: React.ReactNode;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  className?: string;
  cellClassName?: string;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  condition?: (item: T) => boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: TableAction<T>[];
  primaryKey: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: Array<keyof T>;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyStateMessage?: React.ReactNode;
  isLoading?: boolean;
  loadingStateMessage?: React.ReactNode;
  sortable?: boolean;
  defaultSortColumn?: keyof T;
  defaultSortDirection?: SortDirection;
  onSort?: (column: keyof T, direction: SortDirection) => void;
  hideHeader?: boolean;
  rowClassName?: string | ((item: T) => string);
  stickyHeader?: boolean;
  stickyActions?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  primaryKey,
  searchable = false,
  searchPlaceholder = "Search...",
  searchFields,
  pagination = false,
  pageSize = 10,
  onRowClick,
  className = "",
  emptyStateMessage = "No data available",
  isLoading = false,
  loadingStateMessage = "Loading data...",
  sortable = false,
  defaultSortColumn,
  defaultSortDirection = null,
  onSort,
  hideHeader = false,
  rowClassName,
  stickyHeader = false,
  stickyActions = false,
}: DataTableProps<T>) {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return data;

    return data.filter((item) => {
      // If searchFields are provided, only search those fields
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      // Otherwise, search all fields
      return Object.entries(item).some(([_, value]) => {
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchable, searchFields]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;
      
      // Handle null and undefined values
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;

      // Compare values based on sort direction
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue < bValue ? -1 : 1) 
        : (aValue < bValue ? 1 : -1);
    });
  }, [filteredData, sortColumn, sortDirection, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!pagination) return 1;
    return Math.ceil(sortedData.length / pageSize);
  }, [sortedData, pagination, pageSize]);

  // Handle sort
  const handleSort = (column: keyof T) => {
    if (!sortable) return;
    
    let newDirection: SortDirection = 'asc';
    
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }
    
    setSortColumn(newDirection === null ? null : column);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(column, newDirection);
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column: Column<T>) => {
    if (!sortable || !column.sortable) return null;
    
    if (sortColumn === column.accessorKey) {
      if (sortDirection === 'asc') {
        return <ArrowUp className="ml-1 h-4 w-4" />;
      } else if (sortDirection === 'desc') {
        return <ArrowDown className="ml-1 h-4 w-4" />;
      }
    }
    
    return <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />;
  };

  // Render cell content
  const renderCellContent = (item: T, column: Column<T>) => {
    const { accessorKey } = column;
    
    if (typeof accessorKey === 'function') {
      return accessorKey(item);
    }
    
    const value = item[accessorKey];
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    return String(value);
  };

  // Get row class name
  const getRowClassName = (item: T) => {
    if (!rowClassName) return '';
    if (typeof rowClassName === 'function') {
      return rowClassName(item);
    }
    return rowClassName;
  };

  // Render table content
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
            {loadingStateMessage}
          </TableCell>
        </TableRow>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
            {emptyStateMessage}
          </TableCell>
        </TableRow>
      );
    }

    return paginatedData.map((item) => (
      <TableRow 
        key={String(item[primaryKey])} 
        className={`${getRowClassName(item)} ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
        onClick={onRowClick ? () => onRowClick(item) : undefined}
      >
        {columns.map((column, index) => (
          <TableCell 
            key={`${String(item[primaryKey])}-${index}`}
            className={column.cellClassName}
          >
            {renderCellContent(item, column)}
          </TableCell>
        ))}
        
        {actions && actions.length > 0 && (
          <TableCell className={`text-right ${stickyActions ? 'sticky right-0 bg-background' : ''}`}>
            <div className="flex justify-end gap-2">
              {actions
                .filter(action => !action.condition || action.condition(item))
                .map((action, index) => (
                  <Button
                    key={`${String(item[primaryKey])}-action-${index}`}
                    variant={action.variant || "ghost"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(item);
                    }}
                    className={action.className}
                  >
                    {action.icon && (
                      <React.Fragment>
                        {typeof action.icon === 'string' ? (
                          <Icon name={action.icon} className="mr-1 h-4 w-4" />
                        ) : (
                          <action.icon className="mr-1 h-4 w-4" />
                        )}
                      </React.Fragment>
                    )}
                    {action.label}
                  </Button>
                ))}
            </div>
          </TableCell>
        )}
      </TableRow>
    ));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {searchable && (
        <div className="flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          {!hideHeader && (
            <TableHeader className={stickyHeader ? 'sticky top-0 bg-background z-10' : ''}>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead 
                    key={`header-${index}`}
                    className={column.className}
                    onClick={column.sortable && sortable ? () => handleSort(column.accessorKey as keyof T) : undefined}
                    style={column.sortable && sortable ? { cursor: 'pointer' } : undefined}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && sortable && renderSortIndicator(column)}
                    </div>
                  </TableHead>
                ))}
                
                {actions && actions.length > 0 && (
                  <TableHead className={`text-right ${stickyActions ? 'sticky right-0 bg-background' : ''}`}>
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
          )}
          
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
