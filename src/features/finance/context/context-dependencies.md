# Finance Module Context Dependencies

This document outlines the dependencies between context providers in the Finance module. Understanding these dependencies is crucial for maintaining and refactoring the context structure.

## Current Context Hierarchy

```
FinanceProvider
└── TaxProvider
    └── RevenueProvider
        └── ExpenseProvider
```

## Context Dependencies

### FinanceProvider

- **Provides**: Global finance settings, currencies, and configuration
- **Dependencies**: None (root provider)
- **Used by**: TaxProvider, RevenueProvider, ExpenseProvider
- **Purpose**: Manages global finance settings that affect all other finance-related functionality

### TaxProvider

- **Provides**: Tax rates, calculations, and tax-related utilities
- **Dependencies**: FinanceProvider (for currency and tax settings)
- **Used by**: RevenueProvider, ExpenseProvider
- **Purpose**: Manages tax configuration and provides tax calculation functions

### RevenueProvider

- **Provides**: Revenue data, sales transactions, and revenue analytics
- **Dependencies**: FinanceProvider, TaxProvider (for tax calculations)
- **Used by**: ExpenseProvider (for comparing with expenses)
- **Purpose**: Manages all revenue-related data and operations

### ExpenseProvider

- **Provides**: Expense data, categories, and expense analytics
- **Dependencies**: FinanceProvider, TaxProvider, RevenueProvider
- **Used by**: None (leaf provider)
- **Purpose**: Manages all expense-related data and operations

## Data Flow

1. **Settings Flow**: FinanceProvider → All child providers
   - Currency settings, fiscal year, and other global configurations flow down to all providers

2. **Tax Calculation Flow**: TaxProvider → RevenueProvider → ExpenseProvider
   - Tax rates and calculation methods are used by revenue calculations
   - Tax configurations affect how expenses are categorized and calculated

3. **Revenue/Expense Comparison**: RevenueProvider ↔ ExpenseProvider
   - Profit calculations require data from both providers
   - Financial reporting needs aggregated data from both sources

## Refactoring Considerations

### Current Issues

1. **Excessive Nesting**: The deep nesting creates tight coupling between providers
2. **Circular Dependencies**: Some operations require data from multiple contexts
3. **Provider Overhead**: Each provider adds React context overhead

### Refactoring Approaches

1. **Context Registry Pattern**:
   - Create a central registry of contexts
   - Allow contexts to register and retrieve other contexts
   - Reduce explicit nesting while maintaining dependencies

2. **Service-Based Architecture**:
   - Extract pure business logic into service classes
   - Make services available to all contexts
   - Reduce context responsibilities to state management only

3. **Composition over Inheritance**:
   - Create smaller, focused contexts
   - Compose them in components that need multiple contexts
   - Use custom hooks to combine data from multiple contexts

## Implementation Plan

1. Extract shared utilities to separate service modules
2. Implement a context registry
3. Refactor contexts to use the registry
4. Update components to use composed hooks instead of nested contexts

## Testing Implications

When refactoring context dependencies:

1. Ensure all existing functionality continues to work
2. Test edge cases where contexts interact
3. Verify that components receive all needed data
4. Check for performance implications from context changes 