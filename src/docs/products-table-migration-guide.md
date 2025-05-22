# Products Table Migration Guide

This guide provides step-by-step instructions for migrating the Products table from its current implementation to the standardized `EnhancedDataTable` component.

## Current Implementation

The current Products table is implemented in `src/features/products/components/ProductsTable.tsx` using a custom table implementation with manual handling of pagination, sorting, and selection.

## Migration Steps

### Step 1: Analyze the Current Implementation

First, identify the key features and props used in the current implementation:

- Column definitions
- Data source
- Pagination
- Sorting
- Row selection
- Actions (view, edit, delete)
- Search/filtering
- Custom styling

### Step 2: Create a New Component Using EnhancedDataTable

Create a new component that uses the `EnhancedDataTable` component:

```tsx
import React, { useState } from 'react';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { Edit, Trash, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  // Add other fields as needed
}

interface ProductsTableProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSelectionChange?: (selectedProducts: Product[]) => void;
}

export function ProductsTable({
  products,
  onView,
  onEdit,
  onDelete,
  onSelectionChange,
}: ProductsTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Define columns
  const columns = [
    {
      id: 'name',
      header: 'Product Name',
      accessorKey: 'name',
      enableSorting: true,
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

  // Handle selection change
  const handleSelectionChange = (selectedRows: Product[]) => {
    setSelectedProducts(selectedRows);
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  };

  return (
    <EnhancedDataTable
      columns={columns}
      data={products}
      enableRowSelection={!!onSelectionChange}
      onRowSelectionChange={handleSelectionChange}
      enableSearch={true}
      searchPlaceholder="Search products..."
      enablePagination={true}
      enableSorting={true}
      onRowDoubleClick={onView}
      actions={[
        {
          label: 'View',
          icon: Eye,
          onClick: onView,
          variant: 'ghost',
        },
        {
          label: 'Edit',
          icon: Edit,
          onClick: onEdit,
          variant: 'ghost',
        },
        {
          label: 'Delete',
          icon: Trash,
          onClick: onDelete,
          variant: 'ghost',
        },
      ]}
    />
  );
}
```

### Step 3: Update Imports in Parent Components

Update any parent components that use the ProductsTable to pass the correct props:

```tsx
import { ProductsTable } from '@/features/products/components/ProductsTable';

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  // Fetch products...
  
  const handleView = (product: Product) => {
    // Handle view action
  };
  
  const handleEdit = (product: Product) => {
    // Handle edit action
  };
  
  const handleDelete = (product: Product) => {
    // Handle delete action
  };
  
  return (
    <div>
      <h1>Products</h1>
      <ProductsTable
        products={products}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelectionChange={setSelectedProducts}
      />
    </div>
  );
}
```

### Step 4: Test the New Implementation

Test the new implementation with various scenarios:

- Load products and verify they display correctly
- Test pagination by adding more products
- Test sorting by clicking on column headers
- Test search by entering search terms
- Test row selection by clicking on checkboxes
- Test actions by clicking on action buttons

### Step 5: Handle Edge Cases

Address any edge cases or custom behavior:

- Empty state (no products)
- Loading state (while fetching products)
- Error state (if fetching products fails)
- Custom row styling (e.g., highlighting low stock products)
- Conditional actions (e.g., only show delete for certain products)

### Step 6: Optimize for Performance

If the products list is large, consider optimizing:

- Use server-side pagination
- Implement server-side sorting
- Implement server-side filtering

Example with server-side operations:

```tsx
function ProductsTable({ /* props */ }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState({ column: '', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch products with pagination, sorting, and filtering
  const { data, isLoading } = useQuery(
    ['products', pagination, sorting, searchQuery],
    () => fetchProducts(pagination, sorting, searchQuery)
  );
  
  // Handle sort change
  const handleSortChange = (column: string, direction: 'asc' | 'desc' | false) => {
    setSorting({ column, direction: direction || 'asc' });
  };
  
  return (
    <EnhancedDataTable
      columns={columns}
      data={data?.products || []}
      enablePagination={true}
      enableSorting={true}
      enableSearch={true}
      isLoading={isLoading}
      onSortChange={handleSortChange}
      // Other props...
    />
  );
}
```

### Step 7: Clean Up

Once the migration is complete and tested:

1. Remove any unused imports, variables, or functions
2. Update documentation to reflect the new implementation
3. Remove any commented-out code from the old implementation

## Alternative: Using the CrudTable Variant

For a more streamlined implementation, consider using the `CrudTable` variant:

```tsx
import { CrudTable } from '@/components/ui/table-variants';

function ProductsPage() {
  // State and handlers...
  
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
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **Table not updating when data changes**
   - Make sure you're providing a new array reference when data changes
   - Check that you're not mutating the existing array

2. **Row selection not working**
   - Ensure `enableRowSelection` is set to `true`
   - Check that you're handling the selected rows correctly in your `onRowSelectionChange` callback

3. **Custom cell rendering not working**
   - Make sure your cell renderer function is correctly accessing the row data
   - Check that you're returning valid JSX from the cell renderer

4. **Actions not appearing**
   - Verify that you've provided the correct `actions` prop
   - Check that any conditional actions have the correct condition function

5. **Sorting not working**
   - Ensure `enableSorting` is set to `true` for both the table and the specific columns
   - Check that your column definitions have unique `id` properties

## Migration Checklist

- [ ] Analyze current implementation
- [ ] Create new component using EnhancedDataTable
- [ ] Map column definitions
- [ ] Implement row selection
- [ ] Implement sorting
- [ ] Implement pagination
- [ ] Implement search
- [ ] Implement actions
- [ ] Update parent components
- [ ] Test with real data
- [ ] Handle edge cases
- [ ] Optimize for performance
- [ ] Clean up unused code
