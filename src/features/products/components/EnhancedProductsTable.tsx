import React from 'react';
import { EnhancedDataTable, EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';
import { 
  Package, 
  Layers, 
  Hash, 
  DollarSign, 
  Boxes, 
  AlertCircle, 
  BarChart,
  Eye,
  Edit,
  ArrowLeftRight,
  History,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/inventory';

interface EnhancedProductsTableProps {
  data: Product[];
  isLoading?: boolean;
  onSelectionChange?: (selectedProducts: Product[]) => void;
  onProductClick?: (product: Product) => void;
  onProductDoubleClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onTransfer?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  visibleColumns?: string[];
}

export function EnhancedProductsTable({
  data,
  isLoading = false,
  onSelectionChange,
  onProductClick,
  onProductDoubleClick,
  onEdit,
  onTransfer,
  onViewHistory,
  onDelete,
  visibleColumns = ['name', 'productType', 'sku', 'price', 'stock', 'status', 'category', 'supplier'],
}: EnhancedProductsTableProps) {
  
  // Define columns for the table
  const columns: EnhancedDataTableColumn<Product, any>[] = [
    {
      id: 'name',
      header: 'Product Name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" />
          {row.original.name}
        </div>
      ),
    },
    {
      id: 'productType',
      header: 'Type',
      accessorKey: 'productType',
      enableSorting: true,
      cell: ({ row }) => (
        <Badge variant={row.original.productType === 'simple' ? 'outline' : 'secondary'}>
          {row.original.productType === 'simple' ? 'Simple' : 'Variable'}
        </Badge>
      ),
    },
    {
      id: 'sku',
      header: 'SKU',
      accessorKey: 'sku',
      enableSorting: true,
    },
    {
      id: 'price',
      header: 'Price',
      accessorKey: 'retailPrice',
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium">
          ${row.original.retailPrice.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      accessorKey: 'locations',
      enableSorting: true,
      cell: ({ row }) => {
        const totalStock = row.original.locations.reduce((total, loc) => total + loc.stock, 0);
        const isLowStock = row.original.locations.some(loc => 
          loc.stock < (loc.minStock ?? row.original.minStock)
        );
        return (
          <div className="flex items-center gap-2">
            <span className={isLowStock ? "text-red-500" : "text-green-500"}>
              {totalStock}
            </span>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">Low Stock</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'locations',
      enableSorting: true,
      cell: ({ row }) => {
        const product = row.original;
        const stockStatus = product.locations.every(loc => loc.stock >= (loc.minStock ?? product.minStock))
          ? 'In Stock'
          : product.locations.every(loc => loc.stock === 0)
            ? 'Out of Stock'
            : 'Low Stock';
        
        const badgeVariant = stockStatus === 'In Stock' 
          ? 'success' 
          : stockStatus === 'Out of Stock' 
            ? 'destructive' 
            : 'default';
        
        return (
          <Badge variant={badgeVariant} className="capitalize">
            {stockStatus}
          </Badge>
        );
      },
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      enableSorting: true,
    },
    {
      id: 'supplier',
      header: 'Supplier',
      accessorKey: 'supplier.name',
      enableSorting: true,
      cell: ({ row }) => row.original.supplier?.name || 'Not specified',
    },
  ];

  // Filter columns based on visibleColumns prop
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.id));

  // Define actions for the table
  const actions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (product: Product) => onProductDoubleClick?.(product),
      variant: 'ghost',
    },
  ];

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
  const getRowClassName = (product: Product) => {
    const isLowStock = product.locations.some(loc => 
      loc.stock < (loc.minStock ?? product.minStock)
    );
    const isOutOfStock = product.locations.every(loc => loc.stock === 0);
    
    if (isOutOfStock) return "bg-red-50/10";
    if (isLowStock) return "bg-yellow-50/10";
    return "";
  };

  return (
    <EnhancedDataTable
      columns={filteredColumns}
      data={data}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={onSelectionChange}
      onRowClick={onProductClick}
      onRowDoubleClick={onProductDoubleClick}
      enableSearch={true}
      searchPlaceholder="Search products..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No products found"
      loadingMessage="Loading products..."
      rowClassName={getRowClassName}
      actions={actions}
    />
  );
}
