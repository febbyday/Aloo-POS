import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  Row,
  RowSelectionState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from '@/lib/utils/cn';
import { tableStyles } from "./shared-table-styles"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type EnhancedDataTableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  enableSorting?: boolean;
  enableHiding?: boolean;
}

export interface EnhancedDataTableProps<TData, TValue> {
  columns: EnhancedDataTableColumn<TData, TValue>[];
  data: TData[];

  // Selection
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;

  // Interaction
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;

  // Styling
  className?: string;
  rowClassName?: string | ((row: TData) => string);

  // Features
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];

  enablePagination?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;

  enableSorting?: boolean;
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onSortChange?: (columnId: string, direction: 'asc' | 'desc' | false) => void;

  enableColumnVisibility?: boolean;

  // Actions
  actions?: {
    label: string;
    icon?: React.ElementType;
    onClick: (row: TData) => void;
    condition?: (row: TData) => boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
  }[];

  // State
  isLoading?: boolean;
  loadingMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;

  // Layout
  stickyHeader?: boolean;
  stickyActions?: boolean;
  hideHeader?: boolean;
}

export function EnhancedDataTable<TData, TValue>({
  columns,
  data,

  // Selection
  enableRowSelection = false,
  onRowSelectionChange,

  // Interaction
  onRowClick,
  onRowDoubleClick,

  // Styling
  className,
  rowClassName,

  // Features
  enableSearch = false,
  searchPlaceholder = "Search...",
  searchFields = [],

  enablePagination = true,
  pageSizeOptions = [10, 20, 30, 50, 100],
  defaultPageSize = 10,

  enableSorting = true,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  onSortChange,

  enableColumnVisibility = false,

  // Actions
  actions = [],

  // State
  isLoading = false,
  loadingMessage = "Loading data...",
  emptyMessage = "No data available",

  // Layout
  stickyHeader = false,
  stickyActions = false,
  hideHeader = false,
}: EnhancedDataTableProps<TData, TValue>) {
  // State
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (defaultSortColumn) {
      return [{ id: defaultSortColumn, desc: defaultSortDirection === 'desc' }];
    }
    return [];
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // Reset page when data changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [data]);

  // Configure table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  // Notify parent of row selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, onRowSelectionChange, table]);

  // Notify parent of sort changes
  useEffect(() => {
    if (onSortChange && sorting.length > 0) {
      const { id, desc } = sorting[0];
      onSortChange(id, desc ? 'desc' : 'asc');
    } else if (onSortChange && sorting.length === 0) {
      onSortChange('', false);
    }
  }, [sorting, onSortChange]);

  // Handle row click
  const handleRowClick = useCallback((e: React.MouseEvent, row: Row<TData>) => {
    if (onRowClick) {
      onRowClick(row.original);
    }
  }, [onRowClick]);

  // Handle row double click
  const handleRowDoubleClick = useCallback((e: React.MouseEvent, row: Row<TData>) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(row.original);
    }
  }, [onRowDoubleClick]);

  // Get row class name
  const getRowClassName = useCallback((row: Row<TData>) => {
    if (!rowClassName) return '';
    if (typeof rowClassName === 'function') {
      return rowClassName(row.original);
    }
    return rowClassName;
  }, [rowClassName]);

  // Calculate column span for empty/loading states
  const colSpan = useMemo(() =>
    columns.length + (actions.length > 0 ? 1 : 0) + (enableRowSelection ? 1 : 0),
  [columns.length, actions.length, enableRowSelection]);

  // Render loading state
  const renderLoadingState = useMemo(() => (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="h-24 text-center"
      >
        {loadingMessage}
      </TableCell>
    </TableRow>
  ), [colSpan, loadingMessage]);

  // Render empty state
  const renderEmptyState = useMemo(() => (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="h-24 text-center"
      >
        {emptyMessage}
      </TableCell>
    </TableRow>
  ), [colSpan, emptyMessage]);

  // Render table rows
  const renderTableRows = useCallback(() =>
    table.getRowModel().rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        onClick={(e) => handleRowClick(e, row)}
        onDoubleClick={(e) => handleRowDoubleClick(e, row)}
        className={cn(
          tableStyles.row,
          row.getIsSelected() && tableStyles.selectedRow,
          getRowClassName(row)
        )}
      >
        {enableRowSelection && (
          <TableCell className="p-2">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select row"
            />
          </TableCell>
        )}

        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className={tableStyles.cell}>
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext()
            )}
          </TableCell>
        ))}

        {actions.length > 0 && (
          <TableCell className={cn(
            "text-right",
            stickyActions && "sticky right-0 bg-background"
          )}>
            <div className="flex justify-end gap-2">
              {actions
                .filter(action => !action.condition || action.condition(row.original))
                .map((action, index) => (
                  <Button
                    key={`action-${index}`}
                    variant={action.variant || "ghost"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row.original);
                    }}
                    className={action.className}
                  >
                    {action.icon && <action.icon className="mr-1 h-4 w-4" />}
                    {action.label}
                  </Button>
                ))}
            </div>
          </TableCell>
        )}
      </TableRow>
    )),
  [
    table,
    handleRowClick,
    handleRowDoubleClick,
    getRowClassName,
    enableRowSelection,
    actions,
    stickyActions
  ]);

  // Render table content
  const renderTableContent = useCallback(() => {
    if (isLoading) {
      return renderLoadingState;
    }

    if (table.getFilteredRowModel().rows.length === 0) {
      return renderEmptyState;
    }

    return renderTableRows();
  }, [isLoading, table, renderLoadingState, renderEmptyState, renderTableRows]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Controls */}
      {(enableSearch || enableColumnVisibility) && (
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          {enableSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pl-8"
                value={globalFilter}
                onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;

                  // Clear any existing timeout
                  if ((window as any).searchTimeout) {
                    clearTimeout((window as any).searchTimeout);
                  }

                  // Set a new timeout to update the filter after a delay
                  (window as any).searchTimeout = setTimeout(() => {
                    setGlobalFilter(value);
                  }, 300); // 300ms debounce
                }, [setGlobalFilter])}
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setGlobalFilter("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(column => column.getCanHide())
                  .map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          {!hideHeader && (
            <TableHeader className={cn(
              tableStyles.header,
              stickyHeader && "sticky top-0 z-10"
            )}>
              <TableRow className={tableStyles.headerRow}>
                {enableRowSelection && (
                  <TableHead className="w-[40px] p-2">
                    <Checkbox
                      checked={
                        table.getFilteredRowModel().rows.length > 0 &&
                        table.getIsAllRowsSelected()
                      }
                      onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}

                {table.getHeaderGroups().map((headerGroup) => (
                  <React.Fragment key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          tableStyles.headerCell,
                          header.column.getCanSort() && "cursor-pointer select-none"
                        )}
                        onClick={header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined}
                      >
                        <div className={tableStyles.headerCellContent}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className={tableStyles.sortIconContainer}>
                              {header.column.getIsSorted() ? (
                                header.column.getIsSorted() === "desc" ? (
                                  <ChevronDown className={tableStyles.sortIcon} />
                                ) : (
                                  <ChevronUp className={tableStyles.sortIcon} />
                                )
                              ) : (
                                <ChevronsUpDown className={tableStyles.inactiveSortIcon} />
                              )}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </React.Fragment>
                ))}

                {actions.length > 0 && (
                  <TableHead className={cn(
                    "text-right",
                    stickyActions && "sticky right-0 bg-background"
                  )}>
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

      {/* Pagination */}
      {enablePagination && (
        <div className={tableStyles.footer}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={tableStyles.paginationText}>Show</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) =>
                  setPagination(prev => ({ ...prev, pageSize: Number(value) }))
                }
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className={tableStyles.paginationText}>entries</span>
            </div>
            <div className={tableStyles.paginationText}>
              Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} entries
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className={tableStyles.paginationButton}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className={tableStyles.paginationButton}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {Array.from(
              { length: Math.min(5, table.getPageCount()) },
              (_, i) => {
                const pageIndex = i + Math.max(
                  0,
                  Math.min(
                    pagination.pageIndex - 2,
                    table.getPageCount() - 5
                  )
                );
                return (
                  <Button
                    key={pageIndex}
                    variant={pagination.pageIndex === pageIndex ? "default" : "outline"}
                    className={cn(
                      tableStyles.paginationButton,
                      "hidden md:inline-flex"
                    )}
                    onClick={() => table.setPageIndex(pageIndex)}
                  >
                    {pageIndex + 1}
                  </Button>
                );
              }
            )}

            <Button
              variant="outline"
              className={tableStyles.paginationButton}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className={tableStyles.paginationButton}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
