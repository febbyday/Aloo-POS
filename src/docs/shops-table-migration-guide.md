# Shops Table Migration Guide

This guide provides step-by-step instructions for migrating the Shops table from its current implementation to the standardized `EnhancedDataTable` component.

## Current Implementation

The current Shops table is implemented in `src/features/shops/components/ShopsTable.tsx` using a custom table implementation with manual handling of pagination, sorting, and selection.

## Migration Steps

### Step 1: Analyze the Current Implementation

The current `ShopsTable` component has the following features:

- Custom column definitions with icons
- Row selection with checkboxes
- Sorting by columns
- Pagination
- Custom cell rendering for different data types
- Double-click handling for row navigation
- Custom styling for selected rows
- Staff members display with avatars and tooltips

### Step 2: Create a New Component Using EnhancedDataTable

We've created a new component called `EnhancedShopsTable` in `src/features/shops/components/EnhancedShopsTable.tsx` that uses the standardized `EnhancedDataTable` component:

```tsx
import React, { useState } from 'react';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { Badge } from '@/components/ui/badge';
import { Shop, ShopStaffMember } from '../types/shops.types';
import {
  Building2,
  Settings,
  Users,
  BarChart3,
  // Other imports...
} from 'lucide-react';

interface EnhancedShopsTableProps {
  shops: Shop[];
  onRowSelectionChange?: (selectedShops: Shop[]) => void;
  onRowClick?: (shop: Shop) => void;
  onRowDoubleClick?: (shop: Shop) => void;
  isLoading?: boolean;
  onSettingsClick?: (shop: Shop) => void;
}

// Helper functions and components...

export function EnhancedShopsTable({
  shops,
  onRowSelectionChange,
  onRowClick,
  onRowDoubleClick,
  isLoading = false,
  onSettingsClick,
}: EnhancedShopsTableProps) {

  // Define columns for the table
  const columns = [
    // Column definitions...
  ];

  return (
    <EnhancedDataTable
      columns={columns}
      data={shops}
      enableRowSelection={!!onRowSelectionChange}
      onRowSelectionChange={onRowSelectionChange}
      onRowClick={onRowClick}
      onRowDoubleClick={onRowDoubleClick}
      enableSearch={true}
      searchPlaceholder="Search shops..."
      enablePagination={true}
      enableSorting={true}
      enableColumnVisibility={true}
      isLoading={isLoading}
      emptyMessage="No shops found"
      loadingMessage="Loading shops..."
      stickyHeader={true}
      actions={onSettingsClick ? [
        {
          label: 'Settings',
          icon: Settings,
          onClick: onSettingsClick,
          variant: 'ghost',
        },
      ] : []}
    />
  );
}
```

### Step 3: Update the Page Component

We've created a new page component called `EnhancedShopsPage` in `src/features/shops/pages/EnhancedShopsPage.tsx` that uses the new `EnhancedShopsTable` component:

```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRealShopContext } from '../context/RealShopContext';
import { Button } from '@/components/ui/button';
import { Shop } from '../types';
import { PlusIcon, StoreIcon, RefreshCw, Download } from 'lucide-react';
import { EnhancedShopsTable } from '../components/EnhancedShopsTable';
// Other imports...

export function EnhancedShopsPage() {
  const { shops, isLoading, error, fetchShops, deleteShop } = useRealShopContext();
  const [selectedShops, setSelectedShops] = useState<Shop[]>([]);
  // Other state and handlers...

  return (
    <div className="space-y-6">
      {/* Header and actions */}

      {/* Error and empty states */}

      {/* Shop table */}
      {(shops.length > 0 || initialLoad || isLoading) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Shops</CardTitle>
            <CardDescription>
              {shops.length} {shops.length === 1 ? 'shop' : 'shops'} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <EnhancedShopsTable
              shops={shops}
              onRowSelectionChange={setSelectedShops}
              onRowClick={handleShopClick}
              onRowDoubleClick={handleShopDoubleClick}
              onSettingsClick={handleSettingsClick}
              isLoading={initialLoad || isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
    </div>
  );
}
```

### Step 4: Key Changes and Improvements

#### Simplified Props

The new component has a simpler props interface:

```tsx
interface EnhancedShopsTableProps {
  shops: Shop[];
  onRowSelectionChange?: (selectedShops: Shop[]) => void;
  onRowClick?: (shop: Shop) => void;
  onRowDoubleClick?: (shop: Shop) => void;
  isLoading?: boolean;
  onSettingsClick?: (shop: Shop) => void;
}
```

Instead of passing individual handlers for selection, sorting, etc., we now use the standardized props from `EnhancedDataTable`.

#### Built-in Features

The new component leverages built-in features from `EnhancedDataTable`:

- **Pagination**: Built-in pagination with customizable page sizes
- **Sorting**: Built-in column sorting
- **Searching**: Global search functionality
- **Column Visibility**: Users can show/hide columns
- **Loading State**: Built-in loading state handling
- **Empty State**: Built-in empty state handling

#### Improved Column Definitions

Column definitions are now more standardized:

```tsx
const columns = [
  {
    id: 'name',
    header: 'Shop Name',
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ row }: any) => {
      // Custom cell rendering
    },
  },
  // Other columns...
];
```

#### Simplified Row Selection

Row selection is now handled by the `EnhancedDataTable` component:

```tsx
<EnhancedDataTable
  enableRowSelection={!!onRowSelectionChange}
  onRowSelectionChange={onRowSelectionChange}
  // Other props...
/>
```

#### Improved Actions Handling

Actions are now defined declaratively:

```tsx
actions={onSettingsClick ? [
  {
    label: 'Settings',
    icon: Settings,
    onClick: onSettingsClick,
    variant: 'ghost',
  },
] : []}
```

### Step 5: Update Routes

Update the routes to use the new page component:

```tsx
// In src/app/routes.tsx or similar
import { EnhancedShopsPage } from '@/features/shops/pages/EnhancedShopsPage';

// Replace the old route
{
  path: 'shops',
  element: <ShopsPage />,
},

// With the new route
{
  path: 'shops',
  element: <EnhancedShopsPage />,
},
```

### Step 6: Testing

Test the new implementation with various scenarios:

- Load shops and verify they display correctly
- Test pagination by adding more shops
- Test sorting by clicking on column headers
- Test search by entering search terms
- Test row selection by clicking on checkboxes
- Test double-click navigation to shop details
- Test the settings action button

### Step 7: Cleanup

Once the migration is complete and tested:

1. Remove the old `ShopsTable.tsx` component
2. Remove the old `ShopsPage.tsx` component
3. Rename `EnhancedShopsTable.tsx` to `ShopsTable.tsx`
4. Rename `EnhancedShopsPage.tsx` to `ShopsPage.tsx`
5. Update any imports in other files

## Benefits of Migration

The migration provides several benefits:

1. **Consistency**: The shops table now has the same look and feel as other tables in the application
2. **Maintainability**: The code is simpler and easier to maintain
3. **Features**: The table now has additional features like column visibility and global search
4. **Performance**: The table uses optimized rendering from TanStack Table
5. **Developer Experience**: Future changes to the table will be easier to implement

## Migration Checklist

- ✅ Analyze current implementation
- ✅ Create new component using EnhancedDataTable
- ✅ Map column definitions
- ✅ Implement row selection
- ✅ Implement sorting
- ✅ Implement pagination
- ✅ Implement search
- ✅ Implement actions
- ✅ Update page component
- [ ] Update routes
- ✅ Test with real data
- [ ] Clean up old components
