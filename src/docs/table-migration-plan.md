# Table Migration Plan

This document outlines the plan for migrating all tables in the application to use the standardized `EnhancedDataTable` component.

## Migration Timeline

The migration will be implemented in phases to minimize disruption and ensure a smooth transition:

### Phase 1: Infrastructure and Documentation (Week 1)

- ✅ Create the standardized `EnhancedDataTable` component
- ✅ Document the component's API and usage patterns
- ✅ Create example implementations for common use cases
- ✅ Add unit tests for the `EnhancedDataTable` component
- ✅ Create a table migration utility to assist with common migration patterns

### Phase 2: Core Features Migration (Weeks 2-3)

- ✅ Migrate high-visibility tables in core features:
  - ✅ Products table
  - ✅ Customers table
  - ✅ Orders table
  - ✅ Sales table
  - ✅ Inventory table

### Phase 3: Secondary Features Migration (Weeks 4-5)

- ✅ Migrate tables in secondary features:
  - ✅ Shops table
  - ✅ Markets table
  - ✅ Suppliers table
  - ✅ Staff table
  - ✅ Settings tables

### Phase 4: Cleanup and Optimization (Week 6)

- ✅ Remove deprecated table components
- ✅ Optimize performance of the standardized table
- ✅ Address any issues discovered during migration
- ✅ Update documentation based on feedback

## Migration Process

For each table component, follow these steps:

1. **Analysis** ✅
   - Identify the current table implementation ✅
   - Document the features and props used ✅
   - Note any custom behavior or styling ✅

2. **Implementation** ✅
   - Create a new component using `EnhancedDataTable` ✅
   - Map existing props to the standardized props ✅
   - Implement any custom behavior using the new API ✅

3. **Testing** ✅
   - Test the new implementation with various data sets ✅
   - Verify that all features work as expected ✅
   - Compare with the original implementation ✅

4. **Deployment**
   - Replace the old implementation with the new one
   - Update any dependent components
   - Verify in the application

## Migration Checklist

For each table component, use this checklist:

- ✅ Identify the current table implementation
- ✅ Map columns to the new format
- ✅ Implement row selection if needed
- ✅ Implement sorting if needed
- ✅ Implement pagination if needed
- ✅ Implement search if needed
- ✅ Implement actions if needed
- ✅ Apply custom styling if needed
- ✅ Test with real data
- ✅ Replace the old implementation
- ✅ Update documentation

## Example Migration

### Before (ProductsTable.tsx)

```tsx
import { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Eye } from 'lucide-react';

export function ProductsTable({ products, onEdit, onDelete, onView }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination logic
  const startIndex = currentPage * itemsPerPage;
  const paginatedData = products.slice(startIndex, startIndex + itemsPerPage);

  // Selection logic
  const toggleRowSelection = (id) => {
    // ...
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={selectedItems.length === products.length}
                onCheckedChange={/* ... */}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedItems.includes(product.id)}
                  onCheckedChange={() => toggleRowSelection(product.id)}
                />
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onView(product)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(product)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <div className="flex justify-between mt-4">
        {/* ... */}
      </div>
    </div>
  );
}
```

### After (ProductsTable.tsx)

```tsx
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { Eye, Edit, Trash } from 'lucide-react';

// Define columns
const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    id: 'price',
    header: 'Price',
    accessorKey: 'price',
    enableSorting: true,
    cell: ({ getValue }) => `$${getValue()}`,
  },
  {
    id: 'category',
    header: 'Category',
    accessorKey: 'category',
    enableSorting: true,
  },
];

export function ProductsTable({ products, onEdit, onDelete, onView }) {
  return (
    <EnhancedDataTable
      columns={columns}
      data={products}
      enableRowSelection={true}
      enablePagination={true}
      enableSearch={true}
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

## Handling Special Cases

### Tables with Complex Cell Rendering

Use the `cell` property in column definitions:

```tsx
{
  id: 'status',
  header: 'Status',
  accessorKey: 'status',
  cell: ({ getValue }) => {
    const status = getValue();
    return (
      <Badge variant={getStatusVariant(status)}>
        {status}
      </Badge>
    );
  },
}
```

### Tables with External State Management

Pass controlled props and handlers:

```tsx
function ExternallyControlledTable() {
  const [selectedRows, setSelectedRows] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  return (
    <EnhancedDataTable
      columns={columns}
      data={data}
      enableRowSelection={true}
      onRowSelectionChange={setSelectedRows}
      // Other props...
    />
  );
}
```

### Tables with Custom Row Actions

Use the `actions` prop with conditions:

```tsx
const actions = [
  {
    label: 'Approve',
    icon: Check,
    onClick: handleApprove,
    condition: (item) => item.status === 'pending',
    variant: 'success',
  },
  {
    label: 'Reject',
    icon: X,
    onClick: handleReject,
    condition: (item) => item.status === 'pending',
    variant: 'destructive',
  },
];
```

## Support and Resources

- Refer to the [Table Standardization Guide](./table-standardization.md) for detailed documentation
- Contact the UI team for assistance with complex migrations
- Submit issues or questions in the #table-migration Slack channel
