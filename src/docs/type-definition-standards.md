# Type Definition Standards

This document outlines the standards for type definitions across the POS application codebase. Following these standards ensures consistency, improves code maintainability, and enhances type safety throughout the application.

## File Organization

### File Naming Convention

- Use the `.types.ts` suffix for all type definition files.
- Use camelCase for the base filename.
- Be specific about the domain or feature the types relate to.

**Examples:**
```
✅ Good: customer.types.ts, orderItem.types.ts, paymentMethod.types.ts
❌ Bad: types.ts, definitions.ts, customerTypes.ts
```

### Type Directory Structure

Types should be organized according to their scope and usage:

1. **Feature-Specific Types:**
   - Located within the feature module in a `types` directory:
   - `src/features/[feature-name]/types/[domain].types.ts`

2. **Shared Types:**
   - Located in the global types directory:
   - `src/types/[domain].types.ts`

3. **Component-Specific Types:**
   - For types used only by a specific component or closely related components:
   - Co-locate with the component in the same directory:
   - `src/components/MyComponent/myComponent.types.ts`

## Type Definition Styles

### Use Zod for Schema Validation

Use Zod for all schema definitions and derive TypeScript types from these schemas:

```typescript
import { z } from "zod";

// Define the schema
export const CustomerSchema = z.object({
  id: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  createdAt: z.date(),
});

// Derive TypeScript type from schema
export type Customer = z.infer<typeof CustomerSchema>;
```

### Non-Zod Type Definitions

For types that don't require validation (e.g., prop types, utility types):

```typescript
// Component props
export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

// Utility types
export type SortDirection = 'asc' | 'desc';

export type DateRange = {
  startDate: Date;
  endDate: Date;
};
```

## Type Structure Rules

### Exports and Documentation

- Always export types that will be used outside the file
- Use JSDoc comments for all type definitions
- Describe complex properties or constraints

```typescript
/**
 * Represents a product in the inventory system
 * @property sku - Stock Keeping Unit (unique identifier)
 * @property stockLevel - Current inventory quantity
 * @property reorderPoint - Quantity at which to reorder product
 */
export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockLevel: number;
  reorderPoint: number;
  category: string;
};
```

### Type Naming Conventions

- Use PascalCase for interfaces, types, and enums
- Use descriptive, noun-based names for entity types
- Use verb-based names for function types

```typescript
// Entity type (noun-based)
export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

// Function type (verb-based)
export type ProcessPayment = (amount: number, method: PaymentMethod) => Promise<PaymentResult>;
```

### Prefer Interfaces for Object Types

- Use `interface` for object types that represent entities or models
- Use `type` for unions, intersections, and primitive types
- Extend interfaces rather than using intersection types when possible

```typescript
// Interface for an entity
export interface User {
  id: string;
  name: string;
  email: string;
}

// Extended interface
export interface AdminUser extends User {
  permissions: string[];
}

// Type for union
export type UserRole = 'admin' | 'manager' | 'staff' | 'customer';
```

## Type Reuse and Composition

### Reuse Types with Composition

- Compose complex types from simpler ones using composition
- Use utility types like `Pick`, `Omit`, `Partial`, etc.

```typescript
// Base type
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sku: string;
  stockLevel: number;
}

// Derived types
export type ProductCreationInput = Omit<Product, 'id'>;
export type ProductUpdateInput = Partial<Omit<Product, 'id'>>;
export type ProductListItem = Pick<Product, 'id' | 'name' | 'price' | 'category'>;
```

### Common Type Patterns

Use these common patterns for consistent type definitions:

```typescript
// Entity pattern
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// List request pattern
export interface ListRequestParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Response pattern
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Paginated response pattern
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Avoiding Common Pitfalls

### Never Use `any`

- **Never** use `any` in type definitions
- Use `unknown` when the type is truly unknown
- Use generics for flexible type definitions

```typescript
// BAD: Using any
export type ConfigMap = Record<string, any>;

// GOOD: Using unknown with type guards
export type ConfigMap = Record<string, unknown>;

// Helper function with type guard
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### Avoid Type Duplication

- Don't duplicate type definitions across modules
- Extract shared types to common files
- Use import/export to share types across the codebase

### Nullable Fields

- Be explicit about nullable fields
- Use union with `null` rather than optional chaining for values that can be explicitly null
- Reserve optional properties (`?:`) for values that may not be present

```typescript
// For fields that may be null
export interface UserProfile {
  id: string;
  name: string;
  bio: string | null; // Explicitly nullable
  lastLoginDate?: Date; // May not be present
}
```

## Implementation Strategy

### Type Audit Process

When auditing existing code for type standardization:

1. Identify all type declarations in the codebase
2. Consolidate duplicate or similar types
3. Move types to their appropriate location
4. Update imports to reference the new locations
5. Add proper documentation

### Migration Path

For existing non-conforming type definitions:

1. Start by standardizing shared/common types
2. Refactor feature-specific types within each sprint
3. Update component prop types as components are modified
4. Add/improve JSDoc comments incrementally

## Tooling and Enforcement

### TypeScript Configuration

Our tsconfig.json enforces strict type checking:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### ESLint Rules

ESLint enforces type definition standards:

```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"]
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"]
      }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error"
  }
}
```

## Best Practices Examples

### Feature Module Types

```typescript
// src/features/orders/types/order.types.ts
import { z } from "zod";
import { CustomerSchema } from "@/types/customer.types";
import { ProductSchema } from "@/features/products/types/product.types";

export const OrderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled"
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  productId: z.string(),
  product: ProductSchema,
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
  totalPrice: z.number().positive(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),
  customer: CustomerSchema,
  items: z.array(OrderItemSchema),
  status: OrderStatusSchema,
  total: z.number().positive(),
  tax: z.number().min(0),
  discount: z.number().min(0),
  shippingCost: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  notes: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema>;

export const OrderFilterSchema = z.object({
  status: OrderStatusSchema.optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});

export type OrderFilter = z.infer<typeof OrderFilterSchema>;
```

### Component Prop Types

```typescript
// src/components/OrderTable/orderTable.types.ts
import { Order, OrderStatus } from "@/features/orders/types/order.types";

export interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  onRowClick: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  showDetailPanel?: boolean;
  enableBulkActions?: boolean;
}

export interface OrderTableState {
  selectedOrders: string[];
  expandedOrderId: string | null;
  sortColumn: keyof Order;
  sortDirection: 'asc' | 'desc';
}
``` 