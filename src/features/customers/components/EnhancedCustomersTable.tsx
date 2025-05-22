import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  BadgePercent, 
  CreditCard, 
  Tag,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Customer, CustomerFilters } from '../types/customer.types';

interface EnhancedCustomersTableProps {
  customers: Customer[];
  isLoading?: boolean;
  onSelectionChange?: (selectedCustomers: Customer[]) => void;
  onCustomerClick?: (customer: Customer) => void;
  onCustomerDoubleClick?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
  filters?: CustomerFilters;
}

export function EnhancedCustomersTable({
  customers,
  isLoading = false,
  onSelectionChange,
  onCustomerClick,
  onCustomerDoubleClick,
  onEdit,
  onDelete,
  onView,
  filters = {},
}: EnhancedCustomersTableProps) {
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<Customer, any>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>
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
          <span>{row.original.email || '-'}</span>
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
          <span>{row.original.phone || '-'}</span>
        </div>
      ),
    },
    {
      id: 'lastPurchaseDate',
      header: 'Last Purchase',
      accessorKey: 'lastPurchaseDate',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.lastPurchaseDate ? formatDate(row.original.lastPurchaseDate) : 'Never'}</span>
        </div>
      ),
    },
    {
      id: 'loyaltyPoints',
      header: 'Loyalty Points',
      accessorKey: 'loyaltyPoints',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BadgePercent className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.loyaltyPoints || 0}</span>
        </div>
      ),
    },
    {
      id: 'totalSpent',
      header: 'Total Spent',
      accessorKey: 'totalSpent',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>{formatCurrency(row.original.totalSpent || 0)}</span>
        </div>
      ),
    },
    {
      id: 'loyaltyTier',
      header: 'Tier',
      accessorFn: (row) => row.loyaltyTier?.name || '',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {row.original.loyaltyTier ? (
            <Badge variant="secondary" className="capitalize">
              {row.original.loyaltyTier.name}
            </Badge>
          ) : '-'}
        </div>
      ),
    },
  ];

  // Define actions for the table
  const actions = [];

  // Add conditional actions if handlers are provided
  if (onView) {
    actions.push({
      label: 'View',
      icon: Eye,
      onClick: onView,
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

  // Custom row class name function
  const getRowClassName = (customer: Customer) => {
    if (customer.status === 'inactive') return "bg-muted/20";
    if (customer.status === 'blocked') return "bg-destructive/10";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={customers}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange}
      onRowClick={onCustomerClick}
      onRowDoubleClick={onCustomerDoubleClick || onView}
      enableSearch={true}
      searchPlaceholder="Search customers..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No customers found"
      loadingMessage="Loading customers..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
