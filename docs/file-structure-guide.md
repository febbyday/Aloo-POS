# POS System File Structure Guide

This document outlines the standardized file structure for the POS system, with a focus on consistent naming patterns and organization.

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

## File Types and Their Purposes

### Component Files (.tsx)

Components should be organized by their purpose and scope:

```tsx
// CustomerTable.tsx
import { Table } from "@/components/ui/table";

interface CustomerTableProps {
  // Props definition
}

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <Table>
      {/* Table implementation */}
    </Table>
  );
}
```

### Service Files (.ts)

Services handle data fetching, API calls, and business logic:

```ts
// customerService.ts
import { Customer } from "../types";

export const customerService = {
  fetchCustomers: async (): Promise<Customer[]> => {
    // API call implementation
    return [];
  },
  
  createCustomer: async (customer: Customer): Promise<Customer> => {
    // API call implementation
    return customer;
  },
  
  // Other service methods
};
```

### Hook Files (.tsx)

Hooks encapsulate reusable logic and state management:

```tsx
// useCustomers.tsx
import { useState, useEffect } from "react";
import { customerService } from "../services/customerService";
import { Customer } from "../types";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Hook implementation
  
  return { customers, loading, error };
}
```

### Context Files (.tsx)

Context providers manage shared state:

```tsx
// CustomerContext.tsx
import { createContext, useContext, ReactNode, useState } from "react";
import { Customer } from "../types";

interface CustomerContextValue {
  customers: Customer[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
}

const CustomerContext = createContext<CustomerContextValue | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  return (
    <CustomerContext.Provider value={{ customers, selectedCustomer, setSelectedCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomerContext must be used within a CustomerProvider");
  }
  return context;
}
```

### Type Files (.types.ts)

Type definitions should be organized in dedicated files:

```ts
// customer.types.ts
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  // Other properties
}

export interface CustomerFormValues {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export enum CustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked"
}
```

### Index Files (.ts)

Index files re-export components and hooks for easier imports:

```ts
// features/customers/index.ts
// Re-export components
export * from "./components/CustomerTable";
export * from "./components/CustomerForm";
export * from "./components/CustomerDetails";

// Re-export hooks
export * from "./hooks/useCustomers";
export * from "./hooks/useCustomerForm";

// Re-export types
export * from "./types";

// Re-export context
export * from "./context/CustomerContext";
```

## Feature-Specific Guidelines

### Payment Methods Feature

Based on the existing payment methods implementation:

```
features/settings/
├── components/
│   ├── PaymentSettings.tsx         # Main payment settings component
│   └── InstallmentPlansTable.tsx   # Table for installment plans
├── services/
│   └── paymentService.ts           # Payment-related API calls
├── hooks/
│   └── usePaymentMethods.tsx       # Hook for payment methods management
└── types/
    └── payment.types.ts            # Payment method type definitions
```

The `PaymentMethod` interface should be defined in `payment.types.ts`:

```ts
// payment.types.ts
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  systemDefined: boolean;
  settings: Record<string, string | boolean>;
}

export interface InstallmentPlan {
  id: string;
  period: {
    frequency: number;
    unit: 'day' | 'week' | 'month' | 'year';
  };
  priceRange: {
    min: number;
    max: number;
  };
  numberOfInstallments: number;
}

export interface PaymentSettings {
  methods: Record<string, PaymentMethod>;
  installment: {
    enabled: boolean;
    minimumAmount: number;
    minimumDownPaymentPercent: number;
    plans: InstallmentPlan[];
  };
}
```

## Migration Strategy

When migrating existing code to follow these conventions:

1. **Identify Files to Change**: Use the `rename-files.js` script to identify files that need renaming
2. **Rename Files**: Rename files to follow the conventions
3. **Update Imports**: Use the `update-imports.js` script to update import statements
4. **Verify Changes**: Run tests and verify the application works correctly
5. **Refactor Gradually**: Focus on one feature module at a time to minimize disruption

## Best Practices

1. **Be Consistent**: Follow the naming conventions consistently across all files
2. **Use Descriptive Names**: Choose clear, descriptive names for files and components
3. **Organize by Feature**: Keep related files together in feature modules
4. **Separate Concerns**: Keep UI components, business logic, and data fetching separate
5. **Document Types**: Add JSDoc comments to explain complex types
6. **Use Index Files**: Create index files to simplify imports
7. **Test After Renaming**: Always test the application after renaming files to ensure nothing breaks
