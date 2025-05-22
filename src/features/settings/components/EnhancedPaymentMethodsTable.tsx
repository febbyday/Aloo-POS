import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Wallet, 
  Gift, 
  FileText,
  Building,
  CheckCircle2,
  X,
  Settings,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PaymentMethod } from '../types/settings.types';

interface EnhancedPaymentMethodsTableProps {
  methods: PaymentMethod[];
  isLoading?: boolean;
  onEdit?: (method: PaymentMethod) => void;
  onDelete?: (method: PaymentMethod) => void;
  onToggleStatus?: (method: PaymentMethod) => void;
  onSettings?: (method: PaymentMethod) => void;
}

export function EnhancedPaymentMethodsTable({
  methods,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onSettings,
}: EnhancedPaymentMethodsTableProps) {
  
  // Map of icon names to Lucide icon components
  const iconMap: Record<string, React.ElementType> = {
    'credit-card': CreditCard,
    'cash': Banknote,
    'mobile': Smartphone,
    'wallet': Wallet,
    'gift-card': Gift,
    'check': FileText,
    'bank': Building
  };
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<PaymentMethod, any>[] = [
    {
      id: 'name',
      header: 'Method',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => {
        const Icon = iconMap[row.original.icon] || CreditCard;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.name}</span>
            {row.original.systemDefined && (
              <Badge variant="outline" className="ml-2">System</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'enabled',
      enableSorting: true,
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            {row.original.enabled ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{row.original.enabled ? "Enabled" : "Disabled"}</span>
          </div>
        );
      },
    },
    {
      id: 'toggle',
      header: 'Toggle',
      accessorKey: 'enabled',
      enableSorting: false,
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.enabled}
            onCheckedChange={() => onToggleStatus?.(row.original)}
            disabled={!onToggleStatus}
          />
        );
      },
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
      onClick: (method: PaymentMethod) => {
        if (!method.systemDefined) {
          onDelete(method);
        }
      },
      variant: 'destructive',
      condition: (method: PaymentMethod) => !method.systemDefined,
    });
  }

  // Custom row class name function
  const getRowClassName = (method: PaymentMethod) => {
    if (!method.enabled) return "bg-muted/20";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={methods}
      enableRowSelection={false}
      enableSearch={true}
      searchPlaceholder="Search payment methods..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No payment methods found"
      loadingMessage="Loading payment methods..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
