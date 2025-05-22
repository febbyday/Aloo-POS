import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  Package, 
  Tag, 
  Boxes, 
  AlertTriangle, 
  MapPin, 
  Clock,
  Edit,
  ArrowLeftRight,
  History,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/button';

// Define the InventoryItem type based on the schema
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  location: string;
  lastUpdated: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface InventoryFilter {
  search?: string;
  category?: string;
  status?: InventoryItem['status'];
  location?: string;
}

interface EnhancedInventoryTableProps {
  data: InventoryItem[];
  isLoading?: boolean;
  filters?: InventoryFilter;
  onSelectionChange?: (selectedItems: InventoryItem[]) => void;
  onItemClick?: (item: InventoryItem) => void;
  onItemDoubleClick?: (item: InventoryItem) => void;
  onEdit?: (item: InventoryItem) => void;
  onTransfer?: (item: InventoryItem) => void;
  onViewHistory?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onAdjustQuantity?: (item: InventoryItem, adjustment: number) => void;
}

export function EnhancedInventoryTable({
  data,
  isLoading = false,
  filters = {},
  onSelectionChange,
  onItemClick,
  onItemDoubleClick,
  onEdit,
  onTransfer,
  onViewHistory,
  onDelete,
  onAdjustQuantity,
}: EnhancedInventoryTableProps) {
  
  // Filter inventory items based on filters
  const filteredItems = React.useMemo(() => {
    return data.filter(item => {
      // Search filter
      if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !item.sku.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      
      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      
      // Location filter
      if (filters.location && item.location !== filters.location) {
        return false;
      }
      
      return true;
    });
  }, [data, filters]);
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<InventoryItem, any>[] = [
    {
      id: 'sku',
      header: 'SKU',
      accessorKey: 'sku',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="font-medium">{row.original.sku}</div>
      ),
    },
    {
      id: 'name',
      header: 'Product',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.category}</span>
        </div>
      ),
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessorKey: 'quantity',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-muted-foreground" />
          {onAdjustQuantity ? (
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdjustQuantity(row.original, -1);
                }}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-10 text-center">{row.original.quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdjustQuantity(row.original, 1);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <span>{row.original.quantity}</span>
          )}
        </div>
      ),
    },
    {
      id: 'lowStockThreshold',
      header: 'Low Stock Threshold',
      accessorKey: 'lowStockThreshold',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.lowStockThreshold}</span>
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.location}</span>
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
          status === 'in_stock' ? 'success' :
          status === 'low_stock' ? 'warning' :
          status === 'out_of_stock' ? 'destructive' :
          'default';
        
        return (
          <Badge variant={variant} className="capitalize">
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      id: 'lastUpdated',
      header: 'Last Updated',
      accessorKey: 'lastUpdated',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.original.lastUpdated)}</span>
        </div>
      ),
    },
  ];

  // Define actions for the table
  const actions = [];

  // Add conditional actions if handlers are provided
  if (onEdit) {
    actions.push({
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      variant: 'ghost',
    });
  }

  if (onTransfer) {
    actions.push({
      label: 'Transfer',
      icon: ArrowLeftRight,
      onClick: onTransfer,
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

  if (onDelete) {
    actions.push({
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive',
    });
  }

  // Custom row class name function
  const getRowClassName = (item: InventoryItem) => {
    if (item.status === 'out_of_stock') return "bg-destructive/10";
    if (item.status === 'low_stock') return "bg-warning/10";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={filteredItems}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange}
      onRowClick={onItemClick}
      onRowDoubleClick={onItemDoubleClick}
      enableSearch={false} // We're using external search
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No inventory items found"
      loadingMessage="Loading inventory items..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
