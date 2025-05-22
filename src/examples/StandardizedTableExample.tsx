import React, { useState } from 'react';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import {
  Edit,
  Trash,
  Eye,
  Check,
  X,
  ShoppingCart,
  Package,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';

// Sample data
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone X',
    price: 799.99,
    category: 'Electronics',
    stock: 45,
    status: 'active',
    createdAt: '2023-05-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Laptop Pro',
    price: 1299.99,
    category: 'Electronics',
    stock: 12,
    status: 'active',
    createdAt: '2023-04-20T14:15:00Z',
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    price: 149.99,
    category: 'Audio',
    stock: 78,
    status: 'active',
    createdAt: '2023-06-10T09:45:00Z',
  },
  {
    id: '4',
    name: 'Smart Watch',
    price: 249.99,
    category: 'Wearables',
    stock: 32,
    status: 'active',
    createdAt: '2023-05-28T16:20:00Z',
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    price: 89.99,
    category: 'Audio',
    stock: 54,
    status: 'active',
    createdAt: '2023-06-05T11:10:00Z',
  },
  {
    id: '6',
    name: 'Gaming Console',
    price: 499.99,
    category: 'Gaming',
    stock: 8,
    status: 'active',
    createdAt: '2023-04-15T13:25:00Z',
  },
  {
    id: '7',
    name: 'Tablet Mini',
    price: 349.99,
    category: 'Electronics',
    stock: 23,
    status: 'active',
    createdAt: '2023-05-10T15:40:00Z',
  },
  {
    id: '8',
    name: 'Digital Camera',
    price: 599.99,
    category: 'Photography',
    stock: 15,
    status: 'inactive',
    createdAt: '2023-03-20T10:15:00Z',
  },
  {
    id: '9',
    name: 'Fitness Tracker',
    price: 79.99,
    category: 'Wearables',
    stock: 67,
    status: 'active',
    createdAt: '2023-06-15T09:30:00Z',
  },
  {
    id: '10',
    name: 'Wireless Earbuds',
    price: 129.99,
    category: 'Audio',
    stock: 41,
    status: 'active',
    createdAt: '2023-05-25T14:50:00Z',
  },
  {
    id: '11',
    name: 'Smart Home Hub',
    price: 199.99,
    category: 'Smart Home',
    stock: 19,
    status: 'active',
    createdAt: '2023-06-02T12:20:00Z',
  },
  {
    id: '12',
    name: 'Portable Charger',
    price: 49.99,
    category: 'Accessories',
    stock: 92,
    status: 'active',
    createdAt: '2023-06-12T10:10:00Z',
  },
  {
    id: '13',
    name: 'VR Headset',
    price: 399.99,
    category: 'Gaming',
    stock: 7,
    status: 'active',
    createdAt: '2023-05-05T16:15:00Z',
  },
  {
    id: '14',
    name: 'Wireless Mouse',
    price: 39.99,
    category: 'Accessories',
    stock: 63,
    status: 'active',
    createdAt: '2023-06-08T11:45:00Z',
  },
  {
    id: '15',
    name: 'External Hard Drive',
    price: 129.99,
    category: 'Storage',
    stock: 28,
    status: 'active',
    createdAt: '2023-05-18T13:30:00Z',
  },
  {
    id: '16',
    name: 'Mechanical Keyboard',
    price: 149.99,
    category: 'Accessories',
    stock: 34,
    status: 'active',
    createdAt: '2023-05-30T15:20:00Z',
  },
  {
    id: '17',
    name: 'Curved Monitor',
    price: 349.99,
    category: 'Electronics',
    stock: 11,
    status: 'active',
    createdAt: '2023-04-25T14:40:00Z',
  },
  {
    id: '18',
    name: 'Wireless Printer',
    price: 199.99,
    category: 'Office',
    stock: 16,
    status: 'inactive',
    createdAt: '2023-03-15T11:25:00Z',
  },
  {
    id: '19',
    name: 'Smart Thermostat',
    price: 179.99,
    category: 'Smart Home',
    stock: 22,
    status: 'active',
    createdAt: '2023-05-22T10:50:00Z',
  },
  {
    id: '20',
    name: 'Drone',
    price: 799.99,
    category: 'Photography',
    stock: 5,
    status: 'discontinued',
    createdAt: '2023-02-10T09:15:00Z',
  },
];

// Define columns
const columns = [
  {
    id: 'name',
    header: 'Product Name',
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{product.name}</span>
        </div>
      );
    },
  },
  {
    id: 'price',
    header: 'Price',
    accessorKey: 'price',
    enableSorting: true,
    cell: ({ row }) => {
      const price = row.original.price;
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{price.toFixed(2)}</span>
        </div>
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
    id: 'stock',
    header: 'Stock',
    accessorKey: 'stock',
    enableSorting: true,
    cell: ({ row }) => {
      const stock = row.original.stock;
      let color = 'bg-green-100 text-green-800';

      if (stock <= 10) {
        color = 'bg-red-100 text-red-800';
      } else if (stock <= 30) {
        color = 'bg-yellow-100 text-yellow-800';
      }

      return (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${color}`}>
          {stock} in stock
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
      let variant: 'default' | 'secondary' | 'destructive' = 'default';

      if (status === 'inactive') {
        variant = 'secondary';
      } else if (status === 'discontinued') {
        variant = 'destructive';
      }

      return (
        <Badge variant={variant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
];

export function StandardizedTableExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Handlers
  const handleView = (product: Product) => {
    toast({
      title: 'View Product',
      description: `Viewing ${product.name}`,
    });
  };

  const handleEdit = (product: Product) => {
    toast({
      title: 'Edit Product',
      description: `Editing ${product.name}`,
    });
  };

  const handleDelete = (product: Product) => {
    toast({
      title: 'Delete Product',
      description: `Deleting ${product.name}`,
      variant: 'destructive',
    });
  };

  const handleActivate = (product: Product) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, status: 'active' } : p
      )
    );

    toast({
      title: 'Product Activated',
      description: `${product.name} has been activated`,
    });
  };

  const handleDeactivate = (product: Product) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, status: 'inactive' } : p
      )
    );

    toast({
      title: 'Product Deactivated',
      description: `${product.name} has been deactivated`,
      variant: 'secondary',
    });
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;

    setProducts(prev =>
      prev.filter(p => !selectedProducts.some(sp => sp.id === p.id))
    );

    toast({
      title: 'Products Deleted',
      description: `${selectedProducts.length} products have been deleted`,
      variant: 'destructive',
    });

    setSelectedProducts([]);
  };

  const handleRefresh = () => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setProducts(sampleProducts);
      setIsLoading(false);

      toast({
        title: 'Data Refreshed',
        description: 'Product data has been refreshed',
      });
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedProducts.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button>
            Add Product
          </Button>
        </div>
      </div>

      <EnhancedDataTable
        columns={columns}
        data={products}
        enableRowSelection={true}
        onRowSelectionChange={setSelectedProducts}
        enableSearch={true}
        searchPlaceholder="Search products..."
        enablePagination={true}
        enableSorting={true}
        enableColumnVisibility={true}
        onRowDoubleClick={handleView}
        isLoading={isLoading}
        rowClassName={(product) => {
          if (product.stock <= 10) return "bg-red-50/50";
          if (product.stock <= 30) return "bg-yellow-50/50";
          return "";
        }}
        actions={[
          {
            label: 'View',
            icon: Eye,
            onClick: handleView,
            variant: 'ghost',
          },
          {
            label: 'Edit',
            icon: Edit,
            onClick: handleEdit,
            variant: 'ghost',
          },
          {
            label: 'Activate',
            icon: Check,
            onClick: handleActivate,
            condition: (product) => product.status !== 'active',
            variant: 'ghost',
          },
          {
            label: 'Deactivate',
            icon: X,
            onClick: handleDeactivate,
            condition: (product) => product.status === 'active',
            variant: 'ghost',
          },
          {
            label: 'Delete',
            icon: Trash,
            onClick: handleDelete,
            variant: 'ghost',
          },
        ]}
      />
    </div>
  );
}
