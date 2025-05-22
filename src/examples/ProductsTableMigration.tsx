import React, { useState } from 'react';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { CrudTable } from '@/components/ui/table-variants';
import { Edit, Trash, Eye, Package } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { convertLegacyColumns, convertLegacyActions } from '@/utils/table-migration-utils';

// Sample data
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Smartphone X',
    price: 799.99,
    category: 'Electronics',
    stock: 45,
    status: 'active',
  },
  {
    id: '2',
    name: 'Laptop Pro',
    price: 1299.99,
    category: 'Electronics',
    stock: 12,
    status: 'active',
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    price: 149.99,
    category: 'Audio',
    stock: 78,
    status: 'active',
  },
  {
    id: '4',
    name: 'Smart Watch',
    price: 249.99,
    category: 'Wearables',
    stock: 32,
    status: 'active',
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    price: 89.99,
    category: 'Audio',
    stock: 54,
    status: 'active',
  },
];

// BEFORE: Original implementation using custom DataTable
function OriginalProductsTable() {
  const [products] = useState<Product[]>(sampleProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Legacy column definition
  const legacyColumns = [
    {
      header: 'Product Name',
      accessorKey: 'name',
      sortable: true,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      sortable: true,
      cell: ({ row }: any) => `$${row.original.price.toFixed(2)}`,
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  // Legacy actions
  const legacyActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (product: Product) => {
        toast({
          title: 'View Product',
          description: `Viewing ${product.name}`,
        });
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (product: Product) => {
        toast({
          title: 'Edit Product',
          description: `Editing ${product.name}`,
        });
      },
    },
    {
      label: 'Delete',
      icon: Trash,
      onClick: (product: Product) => {
        toast({
          title: 'Delete Product',
          description: `Deleting ${product.name}`,
          variant: 'destructive',
        });
      },
    },
  ];

  // Render using a hypothetical custom DataTable component
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products</h2>

      {/* This is a hypothetical custom DataTable component */}
      <div className="custom-data-table">
        <div className="custom-data-table-header">
          <input type="text" placeholder="Search products..." className="custom-search-input" />
          <button className="custom-add-button">Add Product</button>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={() => {
                    if (selectedProducts.length === products.length) {
                      setSelectedProducts([]);
                    } else {
                      setSelectedProducts(products.map(p => p.id));
                    }
                  }}
                />
              </th>
              {legacyColumns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => {
                      if (selectedProducts.includes(product.id)) {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      } else {
                        setSelectedProducts([...selectedProducts, product.id]);
                      }
                    }}
                  />
                </td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex gap-2">
                    {legacyActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => action.onClick(product)}
                        className="custom-action-button"
                      >
                        {action.icon && <action.icon className="h-4 w-4" />}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="custom-pagination">
          <span>Showing 1 to {products.length} of {products.length} entries</span>
          <div className="custom-pagination-controls">
            <button disabled>Previous</button>
            <button disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// AFTER: Migrated implementation using EnhancedDataTable
function MigratedProductsTable() {
  const [products] = useState<Product[]>(sampleProducts);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Action handlers
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

  const handleAdd = () => {
    toast({
      title: 'Add Product',
      description: 'Creating a new product',
    });
  };

  // Define columns using the standardized format
  const columns = [
    {
      id: 'name',
      header: 'Product Name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => `$${row.original.price.toFixed(2)}`,
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
      cell: ({ row }: any) => {
        const stock = row.original.stock;
        let color = '';

        if (stock <= 10) {
          color = 'text-red-500';
        } else if (stock <= 30) {
          color = 'text-yellow-500';
        } else {
          color = 'text-green-500';
        }

        return <span className={color}>{stock}</span>;
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products</h2>

      <EnhancedDataTable
        columns={columns}
        data={products}
        enableRowSelection={true}
        onRowSelectionChange={setSelectedProducts}
        enableSearch={true}
        searchPlaceholder="Search products..."
        enablePagination={true}
        enableSorting={true}
        onRowDoubleClick={handleView}
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

// AFTER VARIANT: Using the CrudTable variant
function CrudProductsTable() {
  const [products] = useState<Product[]>(sampleProducts);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Action handlers
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

  const handleAdd = () => {
    toast({
      title: 'Add Product',
      description: 'Creating a new product',
    });
  };

  const handleBulkDelete = (products: Product[]) => {
    toast({
      title: 'Bulk Delete',
      description: `Deleting ${products.length} products`,
      variant: 'destructive',
    });
  };

  // Define columns using the standardized format
  const columns = [
    {
      id: 'name',
      header: 'Product Name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({ row }: any) => {
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
      cell: ({ row }: any) => `$${row.original.price.toFixed(2)}`,
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
      cell: ({ row }: any) => {
        const stock = row.original.stock;
        let color = '';

        if (stock <= 10) {
          color = 'text-red-500';
        } else if (stock <= 30) {
          color = 'text-yellow-500';
        } else {
          color = 'text-green-500';
        }

        return <span className={color}>{stock}</span>;
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      enableSorting: true,
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <CrudTable
      title="Products"
      description="Manage your product inventory"
      columns={columns}
      data={products}
      enableRowSelection={true}
      onRowSelectionChange={setSelectedProducts}
      selectedItems={selectedProducts}
      onBulkDelete={handleBulkDelete}
      enableSearch={true}
      searchPlaceholder="Search products..."
      enablePagination={true}
      enableSorting={true}
      onRowDoubleClick={handleView}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );
}

// AFTER UTILITY: Using the migration utilities
function UtilityMigratedProductsTable() {
  const [products] = useState<Product[]>(sampleProducts);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Legacy column definition
  const legacyColumns = [
    {
      header: 'Product Name',
      accessorKey: 'name',
      sortable: true,
    },
    {
      header: 'Price',
      accessorKey: 'price',
      sortable: true,
      cell: ({ row }: any) => `$${row.original.price.toFixed(2)}`,
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: ({ row }: any) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  // Legacy actions
  const legacyActions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (product: Product) => {
        toast({
          title: 'View Product',
          description: `Viewing ${product.name}`,
        });
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (product: Product) => {
        toast({
          title: 'Edit Product',
          description: `Editing ${product.name}`,
        });
      },
    },
    {
      label: 'Delete',
      icon: Trash,
      onClick: (product: Product) => {
        toast({
          title: 'Delete Product',
          description: `Deleting ${product.name}`,
          variant: 'destructive',
        });
      },
    },
  ];

  // Convert legacy columns and actions using utility functions
  const columns = convertLegacyColumns<Product>(legacyColumns);
  const actions = convertLegacyActions<Product>(legacyActions);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products (Utility Migration)</h2>

      <EnhancedDataTable
        columns={columns}
        data={products}
        enableRowSelection={true}
        onRowSelectionChange={setSelectedProducts}
        enableSearch={true}
        searchPlaceholder="Search products..."
        enablePagination={true}
        enableSorting={true}
        actions={actions}
      />
    </div>
  );
}

// Example component to show all implementations
export function ProductsTableMigration() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Products Table Migration Example</h1>
      <p className="text-lg text-muted-foreground">
        This example demonstrates how to migrate a products table from a custom implementation to the standardized EnhancedDataTable.
      </p>

      <Tabs defaultValue="before">
        <TabsList>
          <TabsTrigger value="before">Before Migration</TabsTrigger>
          <TabsTrigger value="after">After Migration</TabsTrigger>
          <TabsTrigger value="variant">Using Table Variant</TabsTrigger>
          <TabsTrigger value="utility">Using Migration Utilities</TabsTrigger>
        </TabsList>

        <TabsContent value="before">
          <Card>
            <CardHeader>
              <CardTitle>Original Implementation</CardTitle>
              <CardDescription>
                Custom table implementation with manual handling of pagination, sorting, and selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OriginalProductsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="after">
          <Card>
            <CardHeader>
              <CardTitle>Migrated Implementation</CardTitle>
              <CardDescription>
                Using the standardized EnhancedDataTable component with the same functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MigratedProductsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variant">
          <Card>
            <CardHeader>
              <CardTitle>Using Table Variant</CardTitle>
              <CardDescription>
                Using the CrudTable variant for a more streamlined implementation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CrudProductsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utility">
          <Card>
            <CardHeader>
              <CardTitle>Using Migration Utilities</CardTitle>
              <CardDescription>
                Using the migration utilities to convert legacy columns and actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UtilityMigratedProductsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
