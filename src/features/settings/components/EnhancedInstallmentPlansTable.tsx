import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  Clock, 
  DollarSign, 
  Calendar,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { PaymentSettings } from '../types/settings.types';

interface EnhancedInstallmentPlansTableProps {
  plans: PaymentSettings['installment']['plans'];
  isLoading?: boolean;
  onEdit?: (plan: PaymentSettings['installment']['plans'][0]) => void;
  onDelete?: (plan: PaymentSettings['installment']['plans'][0]) => void;
  onSettings?: (plan: PaymentSettings['installment']['plans'][0]) => void;
}

export function EnhancedInstallmentPlansTable({
  plans,
  isLoading = false,
  onEdit,
  onDelete,
  onSettings,
}: EnhancedInstallmentPlansTableProps) {
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<PaymentSettings['installment']['plans'][0], any>[] = [
    {
      id: 'period',
      header: 'Period',
      accessorFn: (row) => `${row.period.frequency} ${row.period.unit}${row.period.frequency > 1 ? 's' : ''}`,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {row.original.period.frequency} {row.original.period.unit}
            {row.original.period.frequency > 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      id: 'priceRange',
      header: 'Price Range',
      accessorFn: (row) => row.priceRange.min,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>${row.original.priceRange.min.toFixed(2)} - ${row.original.priceRange.max.toFixed(2)}</span>
        </div>
      ),
    },
    {
      id: 'installments',
      header: 'Installments',
      accessorKey: 'numberOfInstallments',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.numberOfInstallments}</span>
        </div>
      ),
    },
  ];

  // Define actions for the table
  const actions = [];

  // Add conditional actions if handlers are provided
  if (onSettings) {
    actions.push({
      label: 'Settings',
      icon: Settings,
      onClick: onSettings,
      variant: 'ghost',
    });
  }

  if (onEdit) {
    actions.push({
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      variant: 'ghost',
    });
  }

  if (onDelete) {
    actions.push({
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive',
    });
  }

  return (
    <EnhancedDataTable
      columns={columns}
      data={plans}
      enableRowSelection={false}
      enableSearch={true}
      searchPlaceholder="Search installment plans..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No installment plans found"
      loadingMessage="Loading installment plans..."
      actions={actions}
    />
  );
}
