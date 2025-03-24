# Component Pattern Standardization Guide

This document outlines the standard patterns for implementing common component behaviors across the application. Following these patterns will ensure consistency, improve code maintainability, and make the codebase more predictable for all developers.

## Data Loading Patterns

### Basic Data Fetching Pattern

Use the `useDataOperation` hook for all data fetching operations. This ensures consistent loading, error, and success states across the application.

```tsx
import { useDataOperation } from '@/hooks/useDataOperation';
import { LoadingState, DataState } from '@/components/ui/loading-state';

function MyComponent() {
  // Set up data fetching operation
  const { execute, loading, error, data } = useDataOperation({
    operation: async () => {
      // Fetch data from API
      const response = await apiService.getData();
      return response.data;
    },
    // Optional success handler
    onSuccess: (data) => {
      console.log('Data loaded successfully', data);
    },
    // Configure success toast (optional)
    showSuccessToast: false,
    successTitle: 'Success',
    successMessage: 'Data loaded successfully',
    // Configure error handling
    showErrorToast: true,
    errorTitle: 'Error loading data',
  });

  // Trigger data loading on component mount
  useEffect(() => {
    execute();
  }, [execute]);

  // Render loading/error/data state
  return (
    <DataState loading={loading} error={error}>
      {data && (
        <div>
          {/* Render your data here */}
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </DataState>
  );
}
```

### Advanced Data Fetching Pattern

For more complex scenarios with multiple data dependencies, still use `useDataOperation` but with additional organization:

```tsx
import { useDataOperation } from '@/hooks/useDataOperation';
import { LoadingState, DataState } from '@/components/ui/loading-state';

function MyComplexComponent() {
  // First data operation
  const usersOperation = useDataOperation({
    operation: apiService.getUsers,
    errorTitle: 'Error loading users',
  });

  // Second data operation
  const productsOperation = useDataOperation({
    operation: apiService.getProducts,
    errorTitle: 'Error loading products',
  });

  // Trigger data loading on component mount
  useEffect(() => {
    usersOperation.execute();
    productsOperation.execute();
  }, [usersOperation.execute, productsOperation.execute]);

  // Determine overall loading and error state
  const isLoading = usersOperation.loading || productsOperation.loading;
  const error = usersOperation.error || productsOperation.error;

  // Render loading/error/data state
  return (
    <DataState 
      loading={isLoading} 
      error={error}
      errorComponent={
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <h3 className="text-red-800 font-medium">Error Loading Data</h3>
          <p className="text-red-600">
            {usersOperation.error?.message || productsOperation.error?.message}
          </p>
        </div>
      }
    >
      {usersOperation.data && productsOperation.data && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2>Users</h2>
            {/* Render users data */}
          </div>
          <div>
            <h2>Products</h2>
            {/* Render products data */}
          </div>
        </div>
      )}
    </DataState>
  );
}
```

## Loading State Patterns

### Basic Loading States

Use the `LoadingState` component for all loading indicators. This ensures consistent appearance across the application.

```tsx
import { LoadingState } from '@/components/ui/loading-state';

// Basic loading state
<LoadingState />

// With custom text
<LoadingState text="Loading users..." />

// Different sizes
<LoadingState spinnerSize="sm" />
<LoadingState spinnerSize="md" />
<LoadingState spinnerSize="lg" />
```

### Specialized Loading States

Use the specialized loading components for specific scenarios:

```tsx
import { 
  FullscreenLoading, 
  InlineLoading, 
  LoadingOverlay,
  Skeleton 
} from '@/components/ui/loading-state';

// Fullscreen loading overlay (for initial page load)
<FullscreenLoading text="Loading application..." />

// Inline loading (for buttons)
<button disabled={isLoading}>
  {isLoading ? <InlineLoading /> : "Submit"}
</button>

// Loading overlay (for card or container)
<div className="relative">
  <div className="p-4">Content that is loading</div>
  {isLoading && <LoadingOverlay />}
</div>

// Skeleton loading
<div className="space-y-2">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-4 w-5/6" />
</div>
```

### Data State Component

For the common pattern of handling loading, error, and data states together, use the `DataState` component:

```tsx
import { DataState } from '@/components/ui/loading-state';

<DataState 
  loading={isLoading} 
  error={error}
  text="Loading user profile..."
>
  {data && (
    <div className="user-profile">
      {/* Data content here */}
    </div>
  )}
</DataState>
```

## Form Submission Patterns

When submitting forms, use the `useDataOperation` hook with a form submission handler:

```tsx
import { useDataOperation } from '@/hooks/useDataOperation';
import { LoadingState, InlineLoading } from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';

function MyForm() {
  const { execute, loading, error } = useDataOperation({
    operation: async (formData) => {
      return await apiService.submitForm(formData);
    },
    showSuccessToast: true,
    successTitle: 'Form Submitted',
    successMessage: 'Your form was submitted successfully',
    errorTitle: 'Form Submission Error',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    await execute(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      {error && (
        <div className="p-2 text-sm text-red-600">
          {error.message}
        </div>
      )}
      
      <Button type="submit" disabled={loading}>
        {loading ? <InlineLoading /> : "Submit"}
      </Button>
    </form>
  );
}
```

## Data Table Patterns

For data tables, combine `useDataOperation` with the `DataState` component:

```tsx
import { useDataOperation } from '@/hooks/useDataOperation';
import { DataState } from '@/components/ui/loading-state';
import { DataTable } from '@/components/ui/data-table';

function MyDataTable() {
  const { execute, loading, error, data } = useDataOperation({
    operation: apiService.getTableData,
    errorTitle: 'Error loading table data',
  });

  useEffect(() => {
    execute();
  }, [execute]);

  return (
    <DataState loading={loading} error={error}>
      {data && (
        <DataTable 
          columns={columns} 
          data={data} 
        />
      )}
    </DataState>
  );
}
```

## Migration Guidelines

### From Custom Loading States

If you're using custom loading states like:

```tsx
// BEFORE
const [loading, setLoading] = useState(false);

// In your JSX
{loading ? (
  <div className="loading-spinner">Loading...</div>
) : (
  <div>Your content</div>
)}
```

Change to:

```tsx
// AFTER
import { DataState } from '@/components/ui/loading-state';

// In your JSX
<DataState loading={loading} error={error}>
  <div>Your content</div>
</DataState>
```

### From Custom Data Fetching

If you're using custom data fetching like:

```tsx
// BEFORE
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await apiService.getData();
    setData(response.data);
    setError(null);
  } catch (err) {
    setError(err);
    console.error('Failed to fetch data:', err);
  } finally {
    setLoading(false);
  }
};
```

Change to:

```tsx
// AFTER
import { useDataOperation } from '@/hooks/useDataOperation';

const { execute: fetchData, loading, error, data } = useDataOperation({
  operation: async () => {
    const response = await apiService.getData();
    return response.data;
  },
  errorTitle: 'Error Fetching Data',
});
```

## Best Practices

1. **Always use the standard hooks and components** for loading, error handling, and data fetching
2. **Avoid creating custom loading indicators** or reinventing data fetching logic
3. **Separate data fetching from rendering** by using the hooks pattern
4. **Handle all error cases** explicitly, especially for user-facing operations
5. **Set meaningful titles and messages** for success and error toasts
6. **Consider accessibility** when implementing loading states (use aria attributes)
7. **Keep loading state components focused on loading** - don't mix other UI concerns
8. **Document any exceptions** to these patterns with explanatory comments 