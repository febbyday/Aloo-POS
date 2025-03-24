# POS System Naming Conventions

This document outlines the standardized naming conventions for the POS system codebase to ensure consistency across all modules and components.

## File Naming Conventions

### File Extensions

- **`.tsx`**: Use for files containing React components or JSX syntax
- **`.ts`**: Use for files containing only TypeScript code (no JSX)
- **`.types.ts`**: Use for files containing only type definitions
- **`.test.tsx`** or **`.test.ts`**: Use for test files
- **`.stories.tsx`**: Use for Storybook story files

### Directory Names

- Use **kebab-case** for all directory names:
  - `customer-details/`
  - `payment-methods/`
  - `inventory-management/`

## Component Naming

### Component Files

- Use **PascalCase** for all component files:
  - `CustomerTable.tsx`
  - `ProductCard.tsx`
  - `PaymentMethodSelector.tsx`

### Component Names

- Use **PascalCase** for component names, matching the filename:
  - `export function CustomerTable() {...}`
  - `export const ProductCard = () => {...}`

### Component Naming Patterns

- **Feature Prefix**: Prefix shared components with their feature name:
  - `CustomerDetailCard` vs generic `DetailCard`
  - `ProductListItem` vs generic `ListItem`

- **Component Type Suffixes**: Use consistent suffixes to indicate component type:
  - `Modal` for modal dialogs: `CustomerModal`, `ProductModal`
  - `Form` for form components: `CustomerForm`, `ProductForm`
  - `List` for list components: `ProductList`, `CustomerList`
  - `Item` for individual items in a list: `ProductItem`, `CustomerItem`
  - `Card` for card components: `CustomerCard`, `ProductCard`
  - `Table` for table components: `CustomersTable`, `ProductsTable`
  - `Page` for page components: `CustomersPage`, `ProductsPage`
  - `View` for view components: `CustomerDetailView`, `ProductDetailView`
  - `Provider` for context providers: `CustomerProvider`, `ProductProvider`

## Service Naming

### Service Files

- Use **camelCase** with a `Service` suffix for service files:
  - `customerService.ts`
  - `productService.ts`
  - `paymentService.ts`
  - `authService.ts`

### Service Functions and Methods

- Use **camelCase** with descriptive verbs for service methods:
  - `fetchCustomers()`
  - `createProduct()`
  - `updateOrder()`
  - `deleteSupplier()`
  - `processPayment()`

## Hook Naming

### Hook Files

- Use **camelCase** with a `use` prefix for hook files:
  - `useCustomers.tsx`
  - `useProducts.tsx`
  - `usePaymentMethods.tsx`

### Hook Functions

- Use **camelCase** with a `use` prefix for hook functions:
  - `export function useCustomers() {...}`
  - `export const useProducts = () => {...}`

- **Hook Naming Patterns**: Name hooks based on their functionality:
  - `useCustomerSearch` - for searching customers
  - `useProductFilters` - for filtering products
  - `usePaymentProcessing` - for processing payments

## Context Naming

### Context Files

- Use **PascalCase** with a `Context` suffix for context files:
  - `CustomerContext.tsx`
  - `ProductContext.tsx`
  - `AuthContext.tsx`

### Context Provider Components

- Use **PascalCase** with a `Provider` suffix for context provider components:
  - `CustomerProvider`
  - `ProductProvider`
  - `AuthProvider`

## Type Naming

### Type Files

- Use **camelCase** with a `.types.ts` extension for type files:
  - `customer.types.ts`
  - `product.types.ts`
  - `payment.types.ts`

### Type and Interface Names

- Use **PascalCase** for type and interface names:
  - `Customer`, `Product`, `Order`
  - `CustomerFormValues`, `ProductDetails`

- **Type Naming Patterns**:
  - Props interfaces: `ComponentNameProps` (e.g., `CustomerTableProps`)
  - State interfaces: `ComponentNameState` (e.g., `ProductFilterState`)
  - Context value interfaces: `ContextNameValue` (e.g., `CustomerContextValue`)

## Utility Naming

### Utility Files

- Use **camelCase** for utility files:
  - `formatCurrency.ts`
  - `dateUtils.ts`
  - `validationHelpers.ts`

### Utility Functions

- Use **camelCase** for utility functions:
  - `formatCurrency()`
  - `calculateTax()`
  - `validateEmail()`

## Index Files

- Use `index.ts` or `index.tsx` for barrel exports:
  - Export components, hooks, and utilities from a module
  - Use named exports rather than default exports

## Examples

### Component Example
```tsx
// CustomerTable.tsx
export function CustomerTable({ customers, onSelect }: CustomerTableProps) {
  // Component implementation
}
```

### Service Example
```ts
// customerService.ts
export const customerService = {
  fetchCustomers: async () => {
    // Implementation
  },
  createCustomer: async (customer: Customer) => {
    // Implementation
  }
};
```

### Hook Example
```tsx
// useCustomers.tsx
export function useCustomers(options?: UseCustomersOptions) {
  // Hook implementation
}
```

### Type Example
```ts
// customer.types.ts
export interface Customer {
  id: string;
  name: string;
  email: string;
  // Other properties
}

export interface CustomerTableProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
}
```

## Migration Strategy

When updating existing files to follow these conventions:

1. Create a new file with the correct naming convention
2. Copy and adapt the content from the old file
3. Update imports in files that reference the old file
4. Remove the old file once all references are updated

This approach allows for gradual migration without breaking existing functionality.
