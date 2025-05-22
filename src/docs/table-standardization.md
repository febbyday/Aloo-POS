# Table Standardization Guide

This guide explains the standardized approach for implementing tables in the application using the `EnhancedDataTable` component.

## Overview

The `EnhancedDataTable` component is a standardized table implementation based on TanStack Table (React Table) that provides a consistent interface for displaying tabular data across the application. It combines the best features of our previous table implementations and adds new capabilities.

## Key Features

- **Row Selection**: Select individual rows or all rows
- **Sorting**: Sort by any column
- **Pagination**: Navigate through large datasets
- **Searching**: Filter data with global search
- **Column Visibility**: Show/hide columns
- **Custom Actions**: Add action buttons for each row
- **Customizable Styling**: Apply custom styles to the table and rows
- **Loading & Empty States**: Display appropriate messages when loading or when no data is available

## Basic Usage

```tsx
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table";
import { Edit, Trash } from "lucide-react";

// Define your columns
const columns = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    enableSorting: true,
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
  },
];

// Use the component
function UsersTable({ users }) {
  return (
    <EnhancedDataTable
      columns={columns}
      data={users}
      enableSearch={true}
      enablePagination={true}
      enableRowSelection={true}
      onRowClick={(user) => console.log("Clicked user:", user)}
      actions={[
        {
          label: "Edit",
          icon: Edit,
          onClick: (user) => handleEdit(user),
        },
        {
          label: "Delete",
          icon: Trash,
          onClick: (user) => handleDelete(user),
          variant: "destructive",
        },
      ]}
    />
  );
}
```

## Props Reference

### Data and Columns

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | Required | The data to display in the table |
| `columns` | `EnhancedDataTableColumn<TData, TValue>[]` | Required | Column definitions |

### Selection

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `onRowSelectionChange` | `(selectedRows: TData[]) => void` | - | Callback when row selection changes |

### Interaction

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onRowClick` | `(row: TData) => void` | - | Callback when a row is clicked |
| `onRowDoubleClick` | `(row: TData) => void` | - | Callback when a row is double-clicked |

### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS class for the table container |
| `rowClassName` | `string \| ((row: TData) => string)` | - | CSS class for rows (can be a function) |

### Features

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableSearch` | `boolean` | `false` | Enable global search |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder for search input |
| `searchFields` | `string[]` | `[]` | Fields to search (empty means all fields) |
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `pageSizeOptions` | `number[]` | `[10, 20, 30, 50, 100]` | Available page sizes |
| `defaultPageSize` | `number` | `10` | Default page size |
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `defaultSortColumn` | `string` | - | Default column to sort by |
| `defaultSortDirection` | `'asc' \| 'desc'` | `'asc'` | Default sort direction |
| `onSortChange` | `(columnId: string, direction: 'asc' \| 'desc' \| false) => void` | - | Callback when sort changes |
| `enableColumnVisibility` | `boolean` | `false` | Enable column visibility toggle |

### Actions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `Array<{ label: string, icon?: React.ElementType, onClick: (row: TData) => void, condition?: (row: TData) => boolean, variant?: string, className?: string }>` | `[]` | Row actions |

### State

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | `false` | Whether the table is loading |
| `loadingMessage` | `React.ReactNode` | `"Loading data..."` | Message to display when loading |
| `emptyMessage` | `React.ReactNode` | `"No data available"` | Message to display when no data |

### Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stickyHeader` | `boolean` | `false` | Make the header sticky |
| `stickyActions` | `boolean` | `false` | Make the actions column sticky |
| `hideHeader` | `boolean` | `false` | Hide the table header |

## Column Definition

Each column is defined with the following properties:

```tsx
{
  id: string;                   // Unique identifier for the column
  header: React.ReactNode;      // Header content
  accessorKey: string;          // Property in data object to display
  cell?: (info: any) => any;    // Custom cell renderer
  enableSorting?: boolean;      // Enable sorting for this column
  enableHiding?: boolean;       // Allow this column to be hidden
}
```

## Common Patterns

### CRUD Table

```tsx
function ProductsTable({ products, onEdit, onDelete, onView }) {
  return (
    <EnhancedDataTable
      columns={productColumns}
      data={products}
      enableSearch={true}
      searchPlaceholder="Search products..."
      enableRowSelection={true}
      onRowDoubleClick={onView}
      actions={[
        {
          label: "View",
          icon: Eye,
          onClick: onView,
        },
        {
          label: "Edit",
          icon: Edit,
          onClick: onEdit,
        },
        {
          label: "Delete",
          icon: Trash,
          onClick: onDelete,
          variant: "destructive",
        },
      ]}
    />
  );
}
```

### Read-Only Table

```tsx
function TransactionsTable({ transactions }) {
  return (
    <EnhancedDataTable
      columns={transactionColumns}
      data={transactions}
      enableSearch={true}
      enablePagination={true}
      enableSorting={true}
      defaultSortColumn="date"
      defaultSortDirection="desc"
    />
  );
}
```

### Table with Custom Row Styling

```tsx
function InventoryTable({ inventory }) {
  return (
    <EnhancedDataTable
      columns={inventoryColumns}
      data={inventory}
      rowClassName={(item) => {
        if (item.stock <= item.lowStockThreshold) return "bg-red-50";
        if (item.stock <= item.lowStockThreshold * 2) return "bg-yellow-50";
        return "";
      }}
    />
  );
}
```

## Migration Guide

### Migrating from Custom DataTable

If you're currently using the custom `DataTable` from `src/lib/table.tsx`:

1. Replace the import:
   ```tsx
   // Before
   import { DataTable } from "@/lib/table";
   
   // After
   import { EnhancedDataTable } from "@/components/ui/enhanced-data-table";
   ```

2. Update the props:
   ```tsx
   // Before
   <DataTable
     data={data}
     columns={columns}
     primaryKey="id"
     searchable={true}
     pagination={true}
     onRowClick={handleRowClick}
     actions={actions}
   />
   
   // After
   <EnhancedDataTable
     data={data}
     columns={columns}
     enableSearch={true}
     enablePagination={true}
     onRowClick={handleRowClick}
     actions={actions}
   />
   ```

3. Update column definitions:
   ```tsx
   // Before
   const columns = [
     {
       header: "Name",
       accessorKey: "name",
       sortable: true,
     },
   ];
   
   // After
   const columns = [
     {
       id: "name",
       header: "Name",
       accessorKey: "name",
       enableSorting: true,
     },
   ];
   ```

### Migrating from Feature-Specific Tables

If you have a feature-specific table implementation:

1. Identify the key features your table needs
2. Map your existing props to the standardized props
3. Replace your custom table implementation with `EnhancedDataTable`
4. Update any component-specific logic to work with the new table

## Best Practices

1. **Always provide an `id` for each column** - This ensures proper sorting and filtering
2. **Use the `cell` property for custom cell rendering** - This allows for complex cell content
3. **Leverage the built-in features** - Use the built-in search, pagination, and sorting instead of implementing your own
4. **Handle state externally when needed** - For complex use cases, you can control pagination, sorting, and selection state externally
5. **Use consistent action patterns** - Keep action buttons consistent across tables
6. **Provide meaningful empty and loading states** - Customize the messages to be context-specific

## Advanced Usage

### Server-Side Pagination and Sorting

```tsx
function ServerSideTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState({ column: "", direction: "asc" });
  
  const { data, isLoading } = useQuery(
    ["table-data", pagination, sorting],
    () => fetchData(pagination, sorting)
  );
  
  return (
    <EnhancedDataTable
      columns={columns}
      data={data?.items || []}
      enablePagination={true}
      defaultPageSize={pagination.pageSize}
      enableSorting={true}
      onSortChange={(column, direction) => 
        setSorting({ column, direction: direction || "asc" })
      }
      isLoading={isLoading}
    />
  );
}
```

### Custom Cell Rendering

```tsx
const columns = [
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => {
      const status = getValue();
      return (
        <Badge variant={getStatusVariant(status)}>
          {status}
        </Badge>
      );
    },
  },
];
```

### Conditional Actions

```tsx
const actions = [
  {
    label: "Approve",
    icon: Check,
    onClick: handleApprove,
    condition: (item) => item.status === "pending",
    variant: "success",
  },
  {
    label: "Reject",
    icon: X,
    onClick: handleReject,
    condition: (item) => item.status === "pending",
    variant: "destructive",
  },
];
```

## Troubleshooting

### Table not updating when data changes

Make sure you're providing a new array reference when data changes, not mutating the existing array.

### Sorting not working correctly

Ensure your column definitions have unique `id` properties and that `enableSorting` is set to `true` for both the table and the specific columns.

### Row selection not working

Check that `enableRowSelection` is set to `true` and that you're handling the selected rows correctly in your `onRowSelectionChange` callback.

### Custom styling not applying

Make sure you're using the correct class names and that they're properly defined in your CSS. Use the `className` prop for the table container and `rowClassName` for rows.
