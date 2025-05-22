import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  Receipt, 
  Calendar, 
  User, 
  DollarSign, 
  CreditCard, 
  CircleDot,
  Store,
  Eye,
  FileDown,
  Printer,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/formatters';
import { Transaction, TransactionFilter } from '../pages/TransactionBrowserPage';

interface EnhancedTransactionsTableProps {
  data: Transaction[];
  isLoading?: boolean;
  filters?: TransactionFilter;
  onSelectionChange?: (selectedTransactions: Transaction[]) => void;
  onTransactionClick?: (transaction: Transaction) => void;
  onViewDetails?: (transaction: Transaction) => void;
  onExportPdf?: (transaction: Transaction) => void;
  onPrint?: (transaction: Transaction) => void;
}

export function EnhancedTransactionsTable({
  data,
  isLoading = false,
  filters = {
    search: '',
    status: null,
    paymentMethod: null,
    location: null,
    startDate: null,
    endDate: null,
    minAmount: undefined,
    maxAmount: undefined
  },
  onSelectionChange,
  onTransactionClick,
  onViewDetails,
  onExportPdf,
  onPrint,
}: EnhancedTransactionsTableProps) {
  
  // Filter transactions based on filters
  const filteredTransactions = React.useMemo(() => {
    return data.filter(transaction => {
      // Search filter
      if (filters.search && !transaction.reference.toLowerCase().includes(filters.search.toLowerCase()) &&
          !(transaction.customer && transaction.customer.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }
      
      // Status filter
      if (filters.status && transaction.status !== filters.status) {
        return false;
      }
      
      // Payment method filter
      if (filters.paymentMethod && transaction.paymentMethod !== filters.paymentMethod) {
        return false;
      }
      
      // Location filter
      if (filters.location && transaction.location !== filters.location) {
        return false;
      }
      
      // Date range filter
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        if (transaction.date < startDate) {
          return false;
        }
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (transaction.date > endDate) {
          return false;
        }
      }
      
      // Amount range filter
      if (filters.minAmount !== undefined && transaction.total < filters.minAmount) {
        return false;
      }
      
      if (filters.maxAmount !== undefined && transaction.total > filters.maxAmount) {
        return false;
      }
      
      return true;
    });
  }, [data, filters]);
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<Transaction, any>[] = [
    {
      id: 'reference',
      header: 'Reference',
      accessorKey: 'reference',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.reference}</span>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.original.date)}</span>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'customer',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.customer || 'Walk-in Customer'}</span>
        </div>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">${row.original.total.toFixed(2)}</span>
        </div>
      ),
    },
    {
      id: 'paymentMethod',
      header: 'Payment Method',
      accessorKey: 'paymentMethod',
      enableSorting: true,
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        const variant = 
          method === 'cash' ? 'success' :
          method === 'card' ? 'default' :
          method === 'mobile' ? 'warning' :
          'default';
        
        return (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <Badge variant={variant} className="capitalize">
              {method}
            </Badge>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = 
          status === 'completed' ? 'success' :
          status === 'refunded' ? 'destructive' :
          status === 'partially_refunded' ? 'warning' :
          'default';
        
        return (
          <div className="flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-muted-foreground" />
            <Badge variant={variant} className="capitalize">
              {status.replace('_', ' ')}
            </Badge>
          </div>
        );
      },
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.location}</span>
        </div>
      ),
    },
  ];

  // Define actions for the table
  const actions = [];

  // Add conditional actions if handlers are provided
  if (onViewDetails) {
    actions.push({
      label: 'View Details',
      icon: Eye,
      onClick: onViewDetails,
      variant: 'ghost',
    });
  }

  if (onExportPdf) {
    actions.push({
      label: 'Export PDF',
      icon: FileDown,
      onClick: onExportPdf,
      variant: 'ghost',
    });
  }

  if (onPrint) {
    actions.push({
      label: 'Print',
      icon: Printer,
      onClick: onPrint,
      variant: 'ghost',
    });
  }

  // Custom row class name function
  const getRowClassName = (transaction: Transaction) => {
    if (transaction.status === 'refunded') return "bg-destructive/10";
    if (transaction.status === 'partially_refunded') return "bg-warning/10";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={filteredTransactions}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange}
      onRowClick={onTransactionClick}
      onRowDoubleClick={onViewDetails}
      enableSearch={false} // We're using external search
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No transactions found"
      loadingMessage="Loading transactions..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
