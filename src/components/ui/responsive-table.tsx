import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Card } from './card';
import { tableStyles } from './shared-table-styles';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
}

/**
 * A responsive table component that displays as a regular table on desktop
 * and switches to a card-based layout on mobile devices
 */
export function ResponsiveTable<T>({
  data,
  columns,
  keyField,
  onRowClick,
  className,
  emptyMessage = 'No data available',
}: ResponsiveTableProps<T>) {
  if (!data.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Regular table for larger screens */}
      <div className="hidden md:block">
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead className={tableStyles.header}>
              <tr className={tableStyles.headerRow}>
                {columns.map((column) => (
                  <th key={String(column.accessorKey)} className={tableStyles.headerCell}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={String(item[keyField])}
                  className={cn(
                    tableStyles.row,
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td key={String(column.accessorKey)} className={tableStyles.cell}>
                      {column.cell
                        ? column.cell(item)
                        : String(item[column.accessorKey] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card-based layout for mobile */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((item) => (
          <Card
            key={String(item[keyField])}
            className={cn(
              'overflow-hidden',
              onRowClick && 'cursor-pointer hover:border-primary/50'
            )}
            onClick={() => onRowClick?.(item)}
          >
            <div className="divide-y">
              {columns.map((column) => (
                <div key={String(column.accessorKey)} className="flex py-3 px-4">
                  <div className="font-medium text-sm text-muted-foreground w-1/3">
                    {column.header}
                  </div>
                  <div className="flex-1 text-sm">
                    {column.cell
                      ? column.cell(item)
                      : String(item[column.accessorKey] || '')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ResponsiveTable;
