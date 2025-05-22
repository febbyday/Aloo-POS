import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  Building, 
  Mail, 
  Phone, 
  Package, 
  AlertCircle, 
  Star,
  Hash,
  Eye,
  Edit,
  History,
  Trash2,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Supplier, SUPPLIER_STATUS } from '../types';

interface EnhancedSuppliersTableProps {
  data: Supplier[];
  isLoading?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedItems: string[]) => void;
  onSupplierClick?: (supplier: Supplier) => void;
  onViewSupplier?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onViewHistory?: (supplier: Supplier) => void;
  onDelete?: (supplier: Supplier) => void;
  onViewOrders?: (supplier: Supplier) => void;
  sortConfig?: { column: string; direction: 'asc' | 'desc' } | null;
  onSort?: (column: string) => void;
}

export function EnhancedSuppliersTable({
  data,
  isLoading = false,
  selectedItems = [],
  onSelectionChange,
  onSupplierClick,
  onViewSupplier,
  onEdit,
  onViewHistory,
  onDelete,
  onViewOrders,
  sortConfig,
  onSort,
}: EnhancedSuppliersTableProps) {
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<Supplier, any>[] = [
    {
      id: 'name',
      header: 'Supplier Name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      id: 'code',
      header: 'Code',
      accessorKey: 'id',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.id.toUpperCase()}
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      id: 'phone',
      header: 'Phone',
      accessorKey: 'phone',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.phone}</span>
        </div>
      ),
    },
    {
      id: 'products',
      header: 'Products',
      accessorKey: 'products',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.products}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = 
          status === SUPPLIER_STATUS.ACTIVE ? 'success' :
          status === SUPPLIER_STATUS.INACTIVE ? 'secondary' :
          status === SUPPLIER_STATUS.PENDING ? 'warning' :
          status === SUPPLIER_STATUS.BLOCKED ? 'destructive' :
          'default';
        
        return (
          <Badge variant={variant} className="capitalize">
            {status.toString().toLowerCase()}
          </Badge>
        );
      },
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.type.toString()}</span>
        </div>
      ),
    },
    {
      id: 'rating',
      header: 'Rating',
      accessorKey: 'rating',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400" />
          <span>{row.original.rating.toFixed(1)}</span>
        </div>
      ),
    },
  ];

  // Define actions for the table
  const actions = [];

  // Add conditional actions if handlers are provided
  if (onViewSupplier) {
    actions.push({
      label: 'View',
      icon: Eye,
      onClick: onViewSupplier,
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

  if (onViewHistory) {
    actions.push({
      label: 'History',
      icon: History,
      onClick: onViewHistory,
      variant: 'ghost',
    });
  }

  if (onViewOrders) {
    actions.push({
      label: 'Orders',
      icon: FileText,
      onClick: onViewOrders,
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

  // Custom row class name function
  const getRowClassName = (supplier: Supplier) => {
    if (supplier.status === SUPPLIER_STATUS.BLOCKED) return "bg-destructive/10";
    if (supplier.status === SUPPLIER_STATUS.INACTIVE) return "bg-muted/20";
    if (supplier.status === SUPPLIER_STATUS.PENDING) return "bg-warning/10";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={data}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange ? 
        (selectedRows) => onSelectionChange(selectedRows as string[]) : 
        undefined
      }
      onRowClick={onSupplierClick}
      onRowDoubleClick={onViewSupplier}
      enableSearch={true}
      searchPlaceholder="Search suppliers..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No suppliers found"
      loadingMessage="Loading suppliers..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
