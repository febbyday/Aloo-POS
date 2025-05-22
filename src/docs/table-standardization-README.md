# Table Standardization Project

This project aims to standardize all tables across the application using the TanStack Table-based `EnhancedDataTable` component. This README provides an overview of the project, its goals, and how to contribute.

## Goals

1. **Consistency**: Ensure all tables across the application have a consistent look, feel, and behavior
2. **Maintainability**: Reduce code duplication and make it easier to maintain and update tables
3. **Feature Parity**: Provide all the features needed for various use cases (sorting, pagination, filtering, etc.)
4. **Performance**: Optimize table performance for large datasets
5. **Developer Experience**: Make it easy for developers to implement and customize tables

## Components

### EnhancedDataTable

The core component that provides a standardized table implementation based on TanStack Table (React Table). It includes:

- Row selection
- Sorting
- Pagination
- Searching
- Column visibility
- Custom actions
- Loading & empty states
- Customizable styling

[Documentation](./table-standardization.md)

### Table Variants

Specialized table components for common use cases:

- **CrudTable**: For tables that need create, read, update, and delete functionality
- **ReadOnlyTable**: For tables that only display data
- **SelectableTable**: For tables that need row selection for bulk actions

## Migration Plan

The migration will be implemented in phases:

1. **Infrastructure and Documentation** (Week 1)
2. **Core Features Migration** (Weeks 2-3)
3. **Secondary Features Migration** (Weeks 4-5)
4. **Cleanup and Optimization** (Week 6)

See the [Migration Plan](./table-migration-plan.md) for details.

## Getting Started

### Using the EnhancedDataTable

```tsx
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

function MyTable() {
  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      enableSorting: true,
    },
    // More columns...
  ];
  
  return (
    <EnhancedDataTable
      columns={columns}
      data={data}
      enableSearch={true}
      enablePagination={true}
      enableSorting={true}
      // More props...
    />
  );
}
```

### Using a Table Variant

```tsx
import { CrudTable } from '@/components/ui/table-variants';

function MyCrudTable() {
  return (
    <CrudTable
      title="Items"
      description="Manage your items"
      columns={columns}
      data={data}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAdd={handleAdd}
      // More props...
    />
  );
}
```

## Migration Utilities

To assist with migration, we've created utilities in `src/utils/table-migration-utils.ts`:

- `convertLegacyColumns`: Convert legacy column definitions to the standardized format
- `convertLegacyActions`: Convert legacy action definitions to the standardized format
- `convertRowClassName`: Convert legacy row class name functions to the standardized format
- `analyzeComponentForTableMigration`: Analyze a component to determine if it contains a table that needs migration

## Examples

Check out the example implementations:

- `src/examples/StandardizedTableExample.tsx`: Shows a complete implementation of the EnhancedDataTable
- `src/examples/TableMigrationExample.tsx`: Demonstrates before and after migration
- `src/examples/TableVariantsExample.tsx`: Shows how to use the specialized table variants
- `src/examples/ProductsTableMigration.tsx`: Shows how to migrate a products table

## Scripts

- `src/scripts/analyze-tables.js`: Analyzes the codebase to identify tables that need migration

## Documentation

- [Table Standardization Guide](./table-standardization.md): Comprehensive documentation on the EnhancedDataTable
- [Table Migration Plan](./table-migration-plan.md): Plan for migrating all tables
- [Products Table Migration Guide](./products-table-migration-guide.md): Step-by-step guide for migrating the Products table

## Contributing

When implementing or migrating a table:

1. Follow the [Table Standardization Guide](./table-standardization.md)
2. Use the migration utilities when appropriate
3. Add tests for your implementation
4. Update documentation if needed

## Support

If you have questions or need help with table migration, contact the UI team or post in the #table-migration Slack channel.
