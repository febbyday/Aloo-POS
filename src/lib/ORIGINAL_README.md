# Shared Abstractions for POS System

This directory contains shared abstractions, utilities, and reusable components to improve code organization, reduce redundancy, and enhance maintainability across the POS system.

## Contents

### 1. CRUD Templates (`crud-templates.tsx`)

Reusable components for creating consistent CRUD (Create, Read, Update, Delete) interfaces:

- `CrudTemplate`: A flexible table component with built-in support for:
  - Searching
  - Pagination
  - Sorting
  - Custom actions
  - Empty states
  - Loading states
  
- `DetailView`: A component for displaying detailed information about an entity with:
  - Sections for organizing information
  - Icon support
  - Custom actions

### 2. Form Utilities (`form-utils.tsx`)

Tools for creating consistent, validated forms:

- `GenericForm`: A configurable form component with:
  - Field type support (text, number, select, checkbox, etc.)
  - Validation via Zod schemas
  - Responsive grid layouts
  - Error handling
  - Loading states

- `FormDialog`: A modal dialog with an embedded form for:
  - Creating new entities
  - Editing existing entities
  - Confirmation flows

- `useFormDialog`: A hook for managing form dialog state with:
  - Open/close handling
  - Form submission
  - Error handling
  - Initial values management

### 3. State Management (`state-management.tsx`)

Utilities for consistent state management:

- `createEntityContext`, `createEntityProvider`, `createEntityHook`: Factory functions for creating context-based state management for any entity type
- `useEntityFilters`: A hook for managing filtering, sorting, and pagination
- `useEntityForm`: A hook for managing form state with validation

## Usage Examples

### CRUD Template

```tsx
<CrudTemplate
  title="Products"
  description="Manage your product catalog"
  items={products}
  columns={[
    { header: "Name", accessorKey: "name" },
    { header: "Price", accessorKey: "price" },
    { header: "Stock", accessorKey: "stock" }
  ]}
  primaryKey="id"
  onAdd={handleAddProduct}
  onEdit={handleEditProduct}
  onDelete={handleDeleteProduct}
/>
```

### Form Utilities

```tsx
<FormDialog
  open={open}
  onOpenChange={setOpen}
  title="Add Product"
  fields={[
    { name: "name", label: "Product Name", type: "text", required: true },
    { name: "price", label: "Price", type: "number", min: 0, required: true },
    { name: "description", label: "Description", type: "textarea" }
  ]}
  defaultValues={{ name: "", price: 0, description: "" }}
  schema={productSchema}
  onSubmit={handleSubmit}
/>
```

### State Management

```tsx
// Create context, provider, and hook
const ProductContext = createEntityContext<Product>();
const ProductProvider = createEntityProvider(ProductContext, "Product", fetchProducts, "products");
const useProducts = createEntityHook(ProductContext, "Product");

// Use in components
function ProductList() {
  const { state, create, update, remove } = useProducts();
  const { paginatedItems, setSearch, setPage } = useEntityFilters(state.items);
  
  // Component logic...
}
```

## Best Practices

1. **Use shared abstractions** instead of creating new components for similar functionality
2. **Extend existing abstractions** when you need additional functionality
3. **Keep abstractions generic** to ensure they can be used across different modules
4. **Document customizations** when extending or modifying shared components
5. **Contribute improvements** back to the shared libraries when appropriate 