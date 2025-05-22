# Toast System Migration Guide

This guide will help you migrate from the old toast notification system to the new standardized toast system.

## Why Migrate?

The new standardized toast system provides several benefits:

- Consistent styling and behavior across the application
- Better type safety and error handling
- Support for different toast types (success, error, warning, info, loading)
- Support for actions and custom content
- Promise-based toasts for async operations
- Better handling of objects in toast descriptions
- Avoids circular dependencies and recursive toast calls

## Migration Steps

### 1. Update Imports

Replace imports from the old toast system with imports from the new system:

```diff
- import { useToast } from "@/components/ui/use-toast";
- import { toast } from "@/components/ui/use-toast";
- import { useToast } from "@/components/ui/use-toast-compat";
- import { toast } from "@/components/ui/use-toast-compat";
- import { useToastManager } from "@/components/ui/toast-manager";
+ import { useToast } from "@/lib/toast";
+ import { toast } from "@/lib/toast";
+ import { ToastService } from "@/lib/toast";
```

### 2. Update Direct Toast Usage

Replace direct toast calls with the new standardized toast methods:

```diff
- toast({
-   title: "Success",
-   description: "Operation completed successfully",
-   variant: "default",
-   className: "bg-green-50 border-green-200",
-   icon: <Check className="h-4 w-4" />,
- });
+ toast.success("Success", "Operation completed successfully");

- toast({
-   title: "Error",
-   description: "An error occurred",
-   variant: "destructive",
- });
+ toast.error("Error", "An error occurred");
```

### 3. Update useToast Hook Usage

Replace useToast hook usage with the new standardized useToast hook:

```diff
- const { toast } = useToast();
- toast({
-   title: "Success",
-   description: "Operation completed successfully",
- });
+ const toast = useToast();
+ toast.success("Success", "Operation completed successfully");
```

### 4. Update useToastManager Hook Usage

Replace useToastManager hook usage with the new standardized useToast hook:

```diff
- const showToast = useToastManager();
- showToast.success("Success", "Operation completed successfully");
+ const toast = useToast();
+ toast.success("Success", "Operation completed successfully");
```

### 5. Update Promise Toast Usage

Replace promise toast usage with the new standardized promise toast:

```diff
- toast.promise(
-   fetch('/api/data'),
-   {
-     loading: 'Loading...',
-     success: 'Data loaded successfully',
-     error: 'Failed to load data',
-   }
- );
+ toast.promise(
+   fetch('/api/data'),
+   {
+     loading: 'Loading...',
+     success: 'Data loaded successfully',
+     error: 'Failed to load data',
+   }
+ );
```

### 6. Update Custom Content Toast Usage

Replace custom content toast usage with the new standardized toast:

```diff
- toast({
-   title: "Product Added",
-   description: (
-     <div>
-       <p><strong>{product.name}</strong> - ${product.price}</p>
-       <p className="text-xs">Added to cart</p>
-     </div>
-   ),
- });
+ toast.success({
+   title: "Product Added",
+   description: (
+     <div>
+       <p><strong>{product.name}</strong> - ${product.price}</p>
+       <p className="text-xs">Added to cart</p>
+     </div>
+   ),
+ });
```

### 7. Update Action Toast Usage

Replace action toast usage with the new standardized action toast:

```diff
- toast({
-   title: "Item Deleted",
-   description: "The item has been removed from your cart",
-   action: {
-     label: "Undo",
-     onClick: handleUndo,
-   },
- });
+ toast.action(
+   "Item Deleted",
+   "The item has been removed from your cart",
+   handleUndo,
+   "Undo"
+ );
```

## Compatibility Layer

During the migration process, we've provided a compatibility layer to ensure that existing code continues to work. This layer will automatically map old toast calls to the new standardized toast system.

However, we recommend migrating to the new system as soon as possible, as the compatibility layer will be removed in a future release.

## Examples

Here are some examples of how to use the new standardized toast system:

### Basic Usage

```tsx
import { toast } from '@/lib/toast';

// Simple toast
toast('Message sent successfully');

// With title and description
toast({
  title: 'Message Sent',
  description: 'Your message has been sent successfully'
});
```

### Toast Types

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  const showToasts = () => {
    // Success toast
    toast.success('Operation completed successfully');

    // Error toast
    toast.error('An error occurred');

    // Warning toast
    toast.warning('Please check your input');

    // Info toast
    toast.info('New updates available');

    // Loading toast
    toast.loading('Processing your request...');
  };

  return (
    <button onClick={showToasts}>Show Toasts</button>
  );
}
```

### With Actions

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  const handleUndo = () => {
    // Undo logic here
    console.log('Undo action');
  };

  const showActionToast = () => {
    toast.action(
      'Item Deleted',
      'The item has been removed from your cart',
      handleUndo,
      'Undo'
    );
  };

  return (
    <button onClick={showActionToast}>Delete Item</button>
  );
}
```

### Promise Toast

```tsx
import { useToast } from '@/lib/toast';

function MyComponent() {
  const toast = useToast();

  const fetchData = async () => {
    try {
      await toast.promise(
        fetch('/api/data'),
        {
          loading: 'Fetching data...',
          success: 'Data loaded successfully',
          error: 'Failed to load data'
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={fetchData}>Fetch Data</button>
  );
}
```

## Using ToastService Directly

For components that don't need to use the hook-based approach, you can use the `ToastService` directly:

```tsx
import { ToastService } from '@/lib/toast';

function MyComponent() {
  const handleClick = () => {
    // Success toast
    ToastService.success('Success', 'Operation completed successfully');

    // Error toast
    ToastService.error('Error', 'An error occurred');

    // Warning toast
    ToastService.warning('Warning', 'Please check your input');

    // Info toast
    ToastService.info('Info', 'New updates available');
  };

  return (
    <button onClick={handleClick}>Show Toasts</button>
  );
}
```

This approach is recommended for most components as it avoids potential circular dependencies and is more straightforward.

## Preventing Recursive Toast Calls

If you see an error like `Preventing recursive toast call` or `Invalid hook call`, it means there's a circular dependency in the toast system or an improper use of React hooks. These issues are usually caused by importing from the compatibility layer instead of using the direct `ToastService`.

To fix these issues:

1. Use `ToastService` directly instead of the hook-based approach
2. Make sure you're importing from `@/lib/toast` and not from `@/components/ui/use-toast` or `@/components/ui/use-toast-compat`
3. If you see an "Invalid hook call" error, it means you're trying to use a React hook outside of a component function

### Common Error Messages and Solutions

#### "Preventing recursive toast call"

This error occurs when there's a circular dependency in the toast system. To fix it:

```diff
- import { useToast } from '@/components/ui/use-toast';
- const { toast } = useToast();
- toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
+ import { ToastService } from '@/lib/toast';
+ ToastService.error("Error", "Something went wrong");
```

#### "Invalid hook call"

This error occurs when you try to use a React hook outside of a component function:

```diff
- import { useToast } from '@/components/ui/use-toast';
- export const toast = useToast(); // Error: Invalid hook call
+ import { ToastService } from '@/lib/toast';
+ export const toast = ToastService; // This works because ToastService is not a hook
```

## Need Help?

If you need help migrating to the new standardized toast system, please refer to the [Toast System Documentation](./toast-system.md) or ask for assistance from the development team.

You can also run the toast migration helper script to identify components that need to be updated:

```bash
node scripts/toast-migration-helper.js
```
