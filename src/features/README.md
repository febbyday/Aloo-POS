# POS System Code Organization Guidelines

This document outlines the standardized structure and naming conventions for the POS system codebase to ensure consistency, maintainability, and clarity across all modules.

## Directory Structure

Each feature module should follow this structure:

```
features/[feature-name]/
├── components/        # UI components specific to this feature
│   ├── common/        # Shared components within the feature
│   └── [sub-feature]/ # Components organized by sub-feature
├── hooks/             # Custom React hooks
├── services/          # API and data services
├── context/           # React context providers
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
│   └── index.ts       # Re-exports all types
├── pages/             # Page components
└── index.ts           # Re-exports public API of the feature
```

## Naming Conventions

### Files and Directories

- Use **kebab-case** for directory names: `customer-details/`
- Use **PascalCase** for component files: `CustomerTable.tsx`
- Use **camelCase** for utility, hook, and service files: `useCustomers.tsx`, `formatCurrency.ts`
- Use **PascalCase** for page components with the suffix `Page`: `CustomersPage.tsx`
- Use **camelCase** for type files with `.types.ts` extension: `customer.types.ts`

### Components

- Use **PascalCase** for component names: `CustomerTable`
- Use the feature name as a prefix for shared components: `CustomerDetailCard` vs generic `DetailCard`
- Use suffixes to indicate component type:
  - `Modal` for modal dialogs: `CustomerModal`
  - `Form` for form components: `CustomerForm`
  - `List` for list components: `ProductList`
  - `Item` for individual items in a list: `ProductItem`
  - `Card` for card components: `CustomerCard`

### Hooks

- Prefix custom hooks with `use`: `useCustomers`, `useProductInventory`
- Name hooks based on their functionality: `useCustomerSearch`, `useProductFilters`

### Services

- Use the suffix `Service` for service classes/objects: `customerService`, `inventoryService`
- Use descriptive verbs for service methods: `fetchCustomers`, `updateProduct`, `deleteOrder`

### Types and Interfaces

- Use **PascalCase** for type and interface names
- Use descriptive names without prefixes:
  - Types: `Customer`, `Product`, `OrderItem`
  - Props interfaces: `CustomerTableProps`, `ProductFormProps`
  - State interfaces: `CustomerState`, `ProductFilterState`

## Component Structure

### Component Organization

Components should follow this structure:

```tsx
// Imports
import { useState, useEffect } from 'react'
import { useFeatureHook } from '../hooks/useFeatureHook'

// Types
interface ComponentProps {
  // Props definition
}

// Component
export function Component({ prop1, prop2 }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  // Event handlers
  const handleEvent = () => {
    // Event handling
  }
  
  // Helper functions
  const formatData = (data) => {
    // Data formatting
  }
  
  // Render
  return (
    // JSX
  )
}
```

### Page Component Structure

Page components should follow this structure:

```tsx
// Imports
import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { FeatureComponent } from '../components/FeatureComponent'

// Page Component
export function FeaturePage() {
  // State and data fetching
  
  // Event handlers
  
  return (
    <div className="space-y-4">
      <PageHeader title="Feature Title" />
      
      {/* Main content */}
      <FeatureComponent />
    </div>
  )
}
```

## Event Handling

Use the event bus system for cross-module communication:

```tsx
// In a component or hook
import { eventBus } from '@/lib/events'

// Emit an event
eventBus.emit('customer:created', { id: '123', name: 'John Doe' })

// Subscribe to an event
useEffect(() => {
  const unsubscribe = eventBus.on('product:updated', (product) => {
    // Handle the event
  })
  
  return unsubscribe
}, [])
```

## Exports and Imports

- Use index files to re-export components and hooks:

```tsx
// features/customers/index.ts
export * from './components/CustomerTable'
export * from './hooks/useCustomers'
export * from './types'
```

- Import from the feature's public API when possible:

```tsx
// Good
import { CustomerTable } from '@/features/customers'

// Avoid when possible
import { CustomerTable } from '@/features/customers/components/CustomerTable'
```

## Best Practices

1. **Separation of Concerns**:
   - UI components should not contain business logic
   - Data fetching and state management should be in hooks
   - API calls should be in services

2. **Component Composition**:
   - Break down complex components into smaller, reusable ones
   - Use composition over inheritance

3. **State Management**:
   - Use local state for UI-specific state
   - Use context for feature-wide state
   - Use event bus for cross-feature communication

4. **Performance**:
   - Memoize expensive calculations with useMemo
   - Memoize callbacks with useCallback
   - Use virtualization for long lists

5. **Accessibility**:
   - Use semantic HTML elements
   - Include proper ARIA attributes
   - Ensure keyboard navigation works
