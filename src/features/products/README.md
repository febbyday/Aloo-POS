# Products Module

This module provides functionality for managing products in the POS system.

## Architecture

The Products module has been refactored to use a more efficient and maintainable architecture:

1. **State Management**: Zustand store with normalized state structure for O(1) lookups
2. **Form Handling**: React Hook Form with Zod validation
3. **Component Structure**: Atomic design principles

## Integration with Legacy Code

To ensure a smooth transition from the old architecture to the new one, we've implemented an integration layer:

### ProductFormAdapter

The `ProductFormAdapter` component bridges the gap between the old and new form systems. It:

- Converts between legacy Product and new UnifiedProduct formats
- Handles form submission and validation
- Provides a consistent UI experience

### Usage in Legacy Pages

To use the new form system in legacy pages (ProductAddPage.tsx and ProductEditPage.tsx):

```tsx
import { ProductFormAdapter } from '../components';

// In your component:
<ProductFormAdapter
  product={yourProductData}
  onSubmit={yourSubmitHandler}
  onCancel={yourCancelHandler}
  onSuccess={yourSuccessHandler}
/>
```

### Example Implementation

Check out the example implementation in `src/features/products/examples/ProductFormAdapterExample.tsx` for a complete working example of how to integrate the new form system with legacy pages.

### Initialization

The integration is automatically initialized when the Products module is loaded. This ensures that the product store is properly set up before it's used in legacy pages.

## Migration Plan

1. **Current Phase**: Integration layer to bridge old and new architectures
2. **Next Phase**: Gradually migrate components to use the new store and hooks
3. **Final Phase**: Remove legacy code and integration layer

## New Components

- **ProductForm**: Modern form component with tabs and validation
- **ProductPage**: Main product listing page with filtering and sorting
- **ProductFormPage**: Page for creating and editing products

## Hooks

- **useProductOperations**: Common product actions
- **useProductFilters**: Search and filtering
- **useProductForm**: Form handling with validation

## Store

- **useProductStore**: Zustand store with normalized state
- **selectors.ts**: Efficient state extraction 

## Event System

The Products module uses the application's event bus system for cross-module communication. This allows other modules to react to product-related events without direct dependencies.

### Event Types

The following event types are defined in `productService.ts`:

```typescript
export enum ProductEventTypes {
  PRODUCT_CREATED = 'product:created',
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_DELETED = 'product:deleted',
  PRODUCT_STOCK_CHANGED = 'product:stock_changed',
  PRODUCT_PRICE_CHANGED = 'product:price_changed',
  PRODUCT_STATUS_CHANGED = 'product:status_changed',
  PRODUCT_IMPORTED = 'product:imported',
  PRODUCT_EXPORTED = 'product:exported',
  VARIANT_CREATED = 'product:variant_created',
  VARIANT_UPDATED = 'product:variant_updated',
  VARIANT_DELETED = 'product:variant_deleted',
  BULK_UPDATE_COMPLETED = 'product:bulk_update_completed'
}
```

### Usage Example

```typescript
// Subscribing to events
import { eventBus } from '@/lib/eventBus';
import { ProductEventTypes } from '../services/productService';

// Subscribe to product created events
const subscription = eventBus.subscribe(ProductEventTypes.PRODUCT_CREATED, (product) => {
  console.log('New product created:', product);
  // Update UI or perform other actions
});

// Unsubscribe when component unmounts
useEffect(() => {
  return () => subscription.unsubscribe();
}, []);

// Emitting events (typically done by the service)
eventBus.emit(ProductEventTypes.PRODUCT_CREATED, newProduct);
``` 