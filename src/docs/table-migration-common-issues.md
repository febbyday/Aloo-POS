# Table Migration: Common Issues and Solutions

This document addresses common issues encountered during the table migration process and provides solutions to help developers troubleshoot and resolve them.

## Introduction

The table migration project involves replacing legacy table components with the new standardized `EnhancedDataTable` component. This component is built on top of TanStack Table v8 (formerly React Table) and provides a consistent, feature-rich table implementation across the application.

### Key Benefits of the Enhanced Table

- **Consistent UI**: All tables share the same look and feel
- **Rich Features**: Built-in sorting, filtering, pagination, and row selection
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized for large datasets
- **Accessibility**: Improved keyboard navigation and screen reader support
- **Customization**: Flexible styling and rendering options

### Migration Approach

When migrating from legacy tables to the enhanced table:

1. **Identify** the legacy table component and its usage
2. **Map** the props from the legacy format to the enhanced format
3. **Convert** column definitions to the new format
4. **Update** cell renderers to use the new context structure
5. **Test** the migrated table to ensure it works as expected

This document covers the most common issues you might encounter during this process and provides solutions for each.

## 1. Prop Mapping Issues

### Problem
The `EnhancedDataTable` component uses different prop names than the legacy table components, which can lead to errors when migrating.

### Solution
Use the following mapping to convert legacy props to the new format:

| Legacy Prop | Enhanced Prop | Notes |
|-------------|---------------|-------|
| `searchable` | `enableSearch` | Boolean to enable/disable search |
| `searchPlaceholder` | `searchPlaceholder` | Text to display in the search input |
| `pagination` | `enablePagination` | Boolean to enable/disable pagination |
| `pageSize` | `defaultPageSize` | Initial page size |
| `sortable` | `enableSorting` | Boolean to enable/disable sorting |
| `defaultSortColumn` | `defaultSortColumn` | Column ID to sort by initially |
| `defaultSortDirection` | `defaultSortDirection` | Initial sort direction ('asc' or 'desc') |
| `primaryKey` | Not needed | The component handles this internally |
| `onRowClick` | `onRowClick` | Same function signature |
| `onSort` | `onSortChange` | New signature: `(columnId: string, direction: 'asc' | 'desc' | false) => void` |
| `loading` | `isLoading` | Boolean to indicate loading state |
| `loadingStateMessage` | `loadingMessage` | Message to display when loading |
| `emptyStateMessage` | `emptyMessage` | Message to display when no data is available |
| `data` | `data` | Same data array |
| `columns` | `columns` | Different format, see below |
| `rowClassName` | `rowClassName` | String or function to apply custom class to rows |
| `hideHeader` | `hideHeader` | Boolean to hide the table header |
| `stickyHeader` | `stickyHeader` | Boolean to make the header sticky |
| `stickyActions` | `stickyActions` | Boolean to make action buttons sticky |

## 2. Column Definition Format

### Problem
The column definition format is different between legacy and enhanced tables.

### Solution
Convert column definitions using this pattern:

```typescript
// Legacy format
const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    renderCell: (row) => <div>{row.name}</div>
  },
  {
    key: 'email',
    label: 'Email',
    width: '200px'
  }
];

// Enhanced format
const columns: EnhancedDataTableColumn<MyDataType, any>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ row }) => <div>{row.original.name}</div>
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    enableHiding: true // Allows this column to be hidden via column visibility
  }
];
```

Note the key differences:
- `key` becomes `id` and `accessorKey`
- `label` becomes `header`
- `sortable` becomes `enableSorting`
- `renderCell` becomes `cell` with a different parameter structure
- Added `enableHiding` for column visibility control

## 3. Custom Cell Rendering

### Problem
The way to render custom cell content is different in the enhanced table.

### Solution
Use the `cell` property in the column definition:

```typescript
// Legacy approach
renderCell: (row) => <div>{row.name}</div>

// Enhanced approach
cell: ({ row }) => <div>{row.original.name}</div>
```

Note these important differences:
1. The cell property receives an object with a `row` property, not the row directly
2. The row data is accessed via `row.original` instead of directly on the row
3. You can access the cell value via `getValue()` in the cell context:

```typescript
cell: ({ row, getValue }) => {
  const value = getValue();
  return <div className={value < 0 ? "text-red-500" : "text-green-500"}>{value}</div>;
}
```

4. You can use the full context for advanced rendering:

```typescript
cell: (context) => {
  const { row, table, column } = context;
  // Access to the full table context
  return <CustomCellRenderer data={row.original} context={context} />;
}
```

## 4. Row Selection

### Problem
Row selection works differently in the enhanced table.

### Solution
Use the `enableRowSelection` and `onRowSelectionChange` props:

```typescript
// Legacy approach
<DataTable
  selectable={true}
  selectedItems={selectedItems}
  onSelectionChange={(items) => setSelectedItems(items)}
  // ...other props
/>

// Enhanced approach
<EnhancedDataTable
  enableRowSelection={true}
  onRowSelectionChange={(selectedRows) => {
    // selectedRows is an array of the selected row data objects
    setSelectedItems(selectedRows);
  }}
  // ...other props
/>
```

Key differences:
1. `selectable` becomes `enableRowSelection`
2. `onSelectionChange` becomes `onRowSelectionChange`
3. You don't need to pass the currently selected items back to the table - it manages selection state internally
4. The selection callback receives the complete row data objects, not just IDs

## 5. Pagination Issues

### Problem
Pagination state management is different in the enhanced table.

### Solution
The enhanced table handles pagination internally. You can customize it with:

```typescript
// Legacy approach
<DataTable
  pagination={true}
  pageSize={10}
  currentPage={currentPage}
  onPageChange={setCurrentPage}
  totalItems={totalItems}
  // ...other props
/>

// Enhanced approach
<EnhancedDataTable
  enablePagination={true}
  defaultPageSize={10}
  pageSizeOptions={[5, 10, 20, 50, 100]}
  // ...other props
/>
```

Key differences:
1. `pagination` becomes `enablePagination`
2. `pageSize` becomes `defaultPageSize`
3. You don't need to manage pagination state externally - the table handles it internally
4. You don't need to pass `totalItems` - the table calculates it from the data array
5. You can customize available page sizes with `pageSizeOptions`
6. The table automatically resets to the first page when data changes

## 6. Sorting Issues

### Problem
Sorting behavior is different in the enhanced table.

### Solution
The enhanced table handles sorting internally. You can customize it with:

```typescript
// Legacy approach
<DataTable
  sortable={true}
  defaultSortColumn="name"
  defaultSortDirection="asc"
  onSort={(column, direction) => {
    console.log(`Sorted by ${column} in ${direction} order`);
    // Often required to fetch sorted data from API
    fetchSortedData(column, direction);
  }}
  // ...other props
/>

// Enhanced approach
<EnhancedDataTable
  enableSorting={true}
  defaultSortColumn="name"
  defaultSortDirection="asc"
  onSortChange={(columnId, direction) => {
    console.log(`Sorted by ${columnId} in ${direction} order`);
    // direction can be 'asc', 'desc', or false (when sorting is cleared)
    if (direction) {
      fetchSortedData(columnId, direction);
    } else {
      fetchDefaultData();
    }
  }}
  // ...other props
/>
```

Key differences:
1. `sortable` becomes `enableSorting`
2. `onSort` becomes `onSortChange`
3. The `direction` parameter can now be `false` when sorting is cleared
4. Sorting is handled internally by default - you only need the callback for server-side sorting
5. Individual columns can have sorting disabled with `enableSorting: false` in their definition

## 7. Action Buttons

### Problem
The way to add action buttons is different in the enhanced table.

### Solution
Use the `actions` prop:

```typescript
// Legacy approach
<DataTable
  actions={[
    {
      label: 'Edit',
      icon: 'edit', // Icon name or component
      onClick: handleEdit,
    },
    {
      label: 'Delete',
      icon: 'trash',
      onClick: handleDelete,
      disabled: (row) => row.status === 'deleted'
    }
  ]}
  // ...other props
/>

// Enhanced approach
<EnhancedDataTable
  actions={[
    {
      label: 'Edit',
      icon: Edit, // Lucide icon component
      onClick: (row) => handleEdit(row),
      variant: 'ghost', // Button variant
      className: 'custom-edit-button' // Optional custom class
    },
    {
      label: 'Delete',
      icon: Trash2, // Lucide icon component
      onClick: (row) => handleDelete(row),
      variant: 'destructive',
      // Optional condition to show/hide this action for specific rows
      condition: (row) => row.status !== 'deleted'
    }
  ]}
  // ...other props
/>
```

Key differences:
1. The `icon` prop now expects a React component (typically a Lucide icon), not a string
2. `disabled` is replaced with `condition` which determines if the action is shown
3. Added `variant` prop to control button appearance
4. Added `className` prop for custom styling
5. The `onClick` handler receives the row data object directly

## 8. Search Functionality

### Problem
Search behavior is different in the enhanced table.

### Solution
The enhanced table handles search internally. You can customize it with:

```typescript
// Legacy approach
<DataTable
  searchable={true}
  searchPlaceholder="Search..."
  searchFields={['name', 'email']} // Fields to search in
  onSearch={(query) => {
    // Often used to fetch filtered data from API
    fetchFilteredData(query);
  }}
  // ...other props
/>

// Enhanced approach
<EnhancedDataTable
  enableSearch={true}
  searchPlaceholder="Search..."
  searchFields={['name', 'email']} // Optional fields to search in
  // ...other props
/>
```

Key differences:
1. `searchable` becomes `enableSearch`
2. The search is performed automatically on all fields by default
3. You can specify which fields to search with `searchFields`
4. The search input has built-in debouncing for better performance
5. The search is performed client-side by default

For server-side search, you can use the `useEffect` hook to watch for changes in the search query:

```typescript
const [searchQuery, setSearchQuery] = useState('');

// Watch for changes in the search query
useEffect(() => {
  // Fetch filtered data from API
  fetchFilteredData(searchQuery);
}, [searchQuery]);

return (
  <EnhancedDataTable
    enableSearch={true}
    searchPlaceholder="Search..."
    onGlobalFilterChange={setSearchQuery}
    // ...other props
  />
);
```

## 9. Performance Issues

### Problem
Large datasets can cause performance issues.

### Solution

For large datasets, consider these performance optimizations:

1. **Use memoization** for expensive computations:
```typescript
// Memoize data transformations
const processedData = useMemo(() => {
  return data.map(item => ({
    ...item,
    fullName: `${item.firstName} ${item.lastName}`,
    formattedDate: formatDate(item.createdAt)
  }));
}, [data]);

// Memoize column definitions
const columns = useMemo(() => [
  // column definitions
], []);

return <EnhancedDataTable data={processedData} columns={columns} />;
```

2. **Implement server-side operations** for very large datasets:
```typescript
const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
const [sorting, setSorting] = useState({ column: 'id', direction: 'asc' });
const [filter, setFilter] = useState('');

// Fetch data based on pagination, sorting, and filtering
useEffect(() => {
  fetchData({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sortBy: sorting.column,
    sortDirection: sorting.direction,
    filter
  });
}, [pagination, sorting, filter]);

return (
  <EnhancedDataTable
    // Pass server-side state handlers
    onPaginationChange={setPagination}
    onSortChange={(column, direction) => setSorting({ column, direction })}
    onGlobalFilterChange={setFilter}
    // ...other props
  />
);
```

3. **Optimize column definitions**:
- Disable sorting for columns that don't need it
- Use simple cell renderers where possible
- Avoid complex calculations in cell renderers

4. **Use debounced search** (already built into the enhanced table)

5. **Consider code splitting** for complex cell renderers:
```typescript
const ComplexCellRenderer = React.lazy(() => import('./ComplexCellRenderer'));

const columns = [
  {
    id: 'complex',
    header: 'Complex Data',
    cell: ({ row }) => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ComplexCellRenderer data={row.original} />
      </React.Suspense>
    )
  }
];
```

## 10. Styling Issues

### Problem
The enhanced table has different styling options.

### Solution
Use the following props for styling:

```typescript
// Legacy approach
<DataTable
  className="custom-table-container"
  rowClassName={(row) => row.status === 'inactive' ? 'inactive-row' : ''}
  // ...other props
/>

// Enhanced approach
<EnhancedDataTable
  // Container styling
  className="custom-table-container"

  // Row styling - can be a string or a function
  rowClassName={(row) => {
    // Apply different classes based on row data
    if (row.status === 'inactive') return 'bg-muted/20';
    if (row.status === 'error') return 'bg-destructive/10';
    if (row.isNew) return 'bg-primary/5 font-medium';
    return '';
  }}

  // Layout options
  stickyHeader={true}
  stickyActions={true}
  hideHeader={false}

  // ...other props
/>
```

Additional styling options:

1. **Custom cell styling** in column definitions:
```typescript
{
  id: 'status',
  header: 'Status',
  accessorKey: 'status',
  cell: ({ row }) => {
    const status = row.original.status;
    return (
      <div className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        status === 'active' ? 'bg-green-100 text-green-800' :
        status === 'inactive' ? 'bg-gray-100 text-gray-800' :
        'bg-red-100 text-red-800'
      )}>
        {status}
      </div>
    );
  }
}
```

2. **Custom header styling**:
```typescript
{
  id: 'important',
  header: () => (
    <div className="font-bold text-primary flex items-center">
      <Star className="mr-1 h-4 w-4" />
      Important Field
    </div>
  ),
  accessorKey: 'important'
}
```

## 11. Type Errors

### Problem
TypeScript errors when migrating to the enhanced table.

### Solution
Make sure to properly type your data and columns:

```typescript
// Define your data type
interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Import the column type
import { EnhancedDataTableColumn } from '@/components/ui/enhanced-data-table';

// Define properly typed columns
const columns: EnhancedDataTableColumn<User, any>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email'
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status: 'active' | 'inactive' = row.original.status;
      return <StatusBadge status={status} />;
    }
  }
];

// Use the generic type parameters
<EnhancedDataTable<User, any>
  columns={columns}
  data={users}
  onRowClick={(user) => {
    // TypeScript knows this is a User
    console.log(user.name);
  }}
  // ...other props
/>
```

Common type errors and solutions:

1. **Missing generic type parameters**:
```typescript
// Error: Type 'User[]' is not assignable to type 'never[]'
<EnhancedDataTable
  columns={columns}
  data={users}
/>

// Solution: Add generic type parameters
<EnhancedDataTable<User, any>
  columns={columns}
  data={users}
/>
```

2. **Incorrect column type**:
```typescript
// Error: Type '{ key: string; label: string; }[]' is not assignable to type 'EnhancedDataTableColumn<User, any>[]'
const columns = [
  { key: 'name', label: 'Name' }
];

// Solution: Use the correct column type
const columns: EnhancedDataTableColumn<User, any>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' }
];
```

3. **Accessing row data incorrectly in cell renderer**:
```typescript
// Error: Property 'name' does not exist on type 'Row<User>'
cell: (row) => <div>{row.name}</div>

// Solution: Access via row.original
cell: ({ row }) => <div>{row.original.name}</div>
```

## 12. Integration with Forms

### Problem
Integrating the enhanced table with form libraries can be challenging.

### Solution
Use the `onRowSelectionChange` prop to update form values:

```typescript
// Legacy approach with React Hook Form
<DataTable
  selectable={true}
  selectedItems={selectedItems}
  onSelectionChange={(items) => {
    setSelectedItems(items);
    form.setValue('selectedUserIds', items.map(item => item.id));
  }}
  // ...other props
/>

// Enhanced approach with React Hook Form
<EnhancedDataTable
  enableRowSelection={true}
  onRowSelectionChange={(selectedRows) => {
    // Update form values with selected rows
    form.setValue('selectedUsers', selectedRows);

    // If you need just the IDs
    form.setValue('selectedUserIds', selectedRows.map(user => user.id));

    // Trigger validation
    form.trigger('selectedUsers');
  }}
  // ...other props
/>
```

For more complex form integrations:

1. **Controlled selection with form state**:
```typescript
// Get the current form values
const selectedUserIds = form.watch('selectedUserIds') || [];

// Pre-select rows based on form values
useEffect(() => {
  if (selectedUserIds.length > 0) {
    const selectedRows = data.filter(row =>
      selectedUserIds.includes(row.id)
    );
    setSelectedItems(selectedRows);
  }
}, [selectedUserIds, data]);

return (
  <EnhancedDataTable
    enableRowSelection={true}
    onRowSelectionChange={(selectedRows) => {
      setSelectedItems(selectedRows);
      form.setValue(
        'selectedUserIds',
        selectedRows.map(row => row.id)
      );
    }}
    // ...other props
  />
);
```

2. **Custom validation**:
```typescript
// In your form schema
const formSchema = z.object({
  selectedUserIds: z.array(z.string())
    .min(1, "Please select at least one user")
    .max(5, "You can select up to 5 users"),
});

// In your component
<FormField
  control={form.control}
  name="selectedUserIds"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Select Users</FormLabel>
      <EnhancedDataTable
        enableRowSelection={true}
        onRowSelectionChange={(selectedRows) => {
          const ids = selectedRows.map(row => row.id);
          field.onChange(ids);
        }}
        // ...other props
      />
      <FormMessage />
    </FormItem>
  )}
/>
```

## Need More Help?

If you encounter issues not covered in this document, please refer to:

1. **Component Source Code**:
   - `EnhancedDataTable` component: `src/components/ui/enhanced-data-table.tsx`
   - Table variants: `src/components/ui/table-variants.tsx`
   - Table styles: `src/components/ui/shared-table-styles.ts`

2. **Migration Resources**:
   - Table migration plan: `src/docs/table-migration-plan.md`
   - Phase summaries: `src/docs/table-migration-phase*.md`
   - Migration utilities: `src/utils/table-migration-utils.ts`

3. **External Documentation**:
   - [TanStack Table v8 Documentation](https://tanstack.com/table/v8/docs)
   - [TanStack Table Examples](https://tanstack.com/table/v8/docs/examples/react/basic)

4. **Example Implementations**:
   - Products table: `src/features/products/components/EnhancedProductsTable.tsx`
   - Orders table: `src/features/orders/components/EnhancedOrdersTable.tsx`
   - Inventory table: `src/features/inventory/components/EnhancedInventoryTable.tsx`

5. **Debugging Tips**:
   - Check the console for TypeScript errors
   - Use React DevTools to inspect the table state
   - Add `console.log` statements to debug callbacks
   - Verify that your data structure matches what the table expects

If you're still having issues, please reach out to the development team for assistance.
