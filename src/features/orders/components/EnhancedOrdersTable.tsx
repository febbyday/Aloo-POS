import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  ShoppingCart, 
  User, 
  Calendar, 
  Package, 
  DollarSign, 
  CreditCard,
  Eye,
  Edit,
  Trash2,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

// Define Order type based on the schema
interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED';
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  notes?: string;
  paymentMethod?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  customerId?: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    productId: string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }[];
}

interface EnhancedOrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onSelectionChange?: (selectedOrders: Order[]) => void;
  onOrderClick?: (order: Order) => void;
  onOrderDoubleClick?: (order: Order) => void;
  onView?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
  onPrint?: (order: Order) => void;
}

export function EnhancedOrdersTable({
  orders,
  isLoading = false,
  onSelectionChange,
  onOrderClick,
  onOrderDoubleClick,
  onView,
  onEdit,
  onDelete,
  onPrint,
}: EnhancedOrdersTableProps) {
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<Order, any>[] = [
    {
      id: 'orderNumber',
      header: 'Order #',
      accessorKey: 'orderNumber',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.orderNumber}</span>
        </div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (row) => row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'Guest',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.customer ? `${row.original.customer.firstName} ${row.original.customer.lastName}` : 'Guest'}</span>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'createdAt',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.original.createdAt)}</span>
        </div>
      ),
    },
    {
      id: 'items',
      header: 'Items',
      accessorFn: (row) => row.items.length,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.items.length}</span>
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
          <span className="font-medium">{formatCurrency(row.original.total)}</span>
        </div>
      ),
    },
    {
      id: 'paymentStatus',
      header: 'Payment',
      accessorKey: 'paymentStatus',
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.paymentStatus;
        const variant = 
          status === 'PAID' ? 'success' :
          status === 'PARTIAL' ? 'warning' :
          status === 'REFUNDED' ? 'destructive' :
          status === 'FAILED' ? 'destructive' :
          'default';
        
        return (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <Badge variant={variant}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
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
          status === 'COMPLETED' ? 'success' :
          status === 'PROCESSING' ? 'default' :
          status === 'CANCELLED' ? 'destructive' :
          status === 'REFUNDED' ? 'warning' :
          'default';
        
        return (
          <Badge variant={variant}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Badge>
        );
      },
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

  if (onPrint) {
    actions.push({
      label: 'Print',
      icon: FileText,
      onClick: onPrint,
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
  const getRowClassName = (order: Order) => {
    if (order.status === 'CANCELLED') return "bg-destructive/10";
    if (order.status === 'REFUNDED') return "bg-warning/10";
    if (order.paymentStatus === 'FAILED') return "bg-destructive/5";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={orders}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange}
      onRowClick={onOrderClick}
      onRowDoubleClick={onOrderDoubleClick || onView}
      enableSearch={true}
      searchPlaceholder="Search orders..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No orders found"
      loadingMessage="Loading orders..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
