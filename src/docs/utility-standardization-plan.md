# Utility Standardization Plan

This document outlines the plan for standardizing utility functions across the application to reduce duplication and improve maintainability.

## Current Issues

1. **Duplicate Utility Functions**: Multiple implementations of the same functionality exist across the codebase
2. **Inconsistent Naming**: Similar functions have different names in different places
3. **Inline Utility Functions**: Many components define their own utility functions instead of using shared ones
4. **Scattered Implementations**: Related utilities are spread across different files

## Standardization Goals

1. **Single Source of Truth**: Each utility function should have one canonical implementation
2. **Consistent API**: Functions with similar purposes should have consistent parameters and return types
3. **Comprehensive Documentation**: All utility functions should be well-documented with JSDoc comments
4. **Proper Organization**: Utilities should be organized by domain/purpose
5. **Type Safety**: All utilities should be properly typed with TypeScript

## Directory Structure

```
src/
└── lib/
    └── utils/
        ├── index.ts                # Re-exports all utilities
        ├── formatting/
        │   ├── index.ts            # Re-exports all formatting utilities
        │   ├── currency.ts         # Currency formatting utilities
        │   ├── date.ts             # Date formatting utilities
        │   ├── number.ts           # Number formatting utilities
        │   ├── string.ts           # String formatting utilities
        │   └── file.ts             # File-related formatting utilities
        ├── timing/
        │   ├── index.ts            # Re-exports all timing utilities
        │   ├── debounce.ts         # Debounce utilities
        │   └── throttle.ts         # Throttle utilities
        ├── dom/
        │   ├── index.ts            # Re-exports all DOM utilities
        │   ├── events.ts           # Event handling utilities
        │   └── elements.ts         # Element manipulation utilities
        ├── array/
        │   ├── index.ts            # Re-exports all array utilities
        │   ├── sorting.ts          # Array sorting utilities
        │   ├── filtering.ts        # Array filtering utilities
        │   └── grouping.ts         # Array grouping utilities
        ├── object/
        │   ├── index.ts            # Re-exports all object utilities
        │   ├── clone.ts            # Object cloning utilities
        │   └── comparison.ts       # Object comparison utilities
        ├── validation/
        │   ├── index.ts            # Re-exports all validation utilities
        │   ├── common.ts           # Common validation utilities
        │   ├── string.ts           # String validation utilities
        │   └── number.ts           # Number validation utilities
        └── id/
            ├── index.ts            # Re-exports all ID utilities
            └── generators.ts       # ID generation utilities
```

## Implementation Plan

### Phase 1: Consolidate Formatting Utilities

1. Create the directory structure for formatting utilities
2. Move all formatting functions from `src/lib/utils.ts` to their respective files
3. Update the exports in `src/lib/utils/formatting/index.ts`
4. Update imports in all files using these functions

### Phase 2: Consolidate Timing Utilities

1. Create the directory structure for timing utilities
2. Move debounce and throttle functions to their respective files
3. Update the exports in `src/lib/utils/timing/index.ts`
4. Update imports in all files using these functions

### Phase 3: Consolidate Array and Object Utilities

1. Create the directory structure for array and object utilities
2. Move array and object utility functions to their respective files
3. Update the exports in the index files
4. Update imports in all files using these functions

### Phase 4: Consolidate Validation and ID Utilities

1. Create the directory structure for validation and ID utilities
2. Move validation and ID generation functions to their respective files
3. Update the exports in the index files
4. Update imports in all files using these functions

### Phase 5: Replace Inline Utility Functions

1. Identify components with inline utility functions
2. Replace these with imports from the standardized utilities
3. Remove the inline implementations

### Phase 6: Deprecate Legacy Utilities

1. Mark legacy utility files and functions as deprecated
2. Add deprecation warnings to encourage migration
3. Create a migration guide for developers

## Migration Guide

### Updating Imports

```typescript
// BEFORE
import { formatCurrency, formatDate } from '@/lib/utils';

// AFTER
import { formatCurrency } from '@/lib/utils/formatting/currency';
import { formatDate } from '@/lib/utils/formatting/date';

// OR (using the index re-exports)
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
```

### Replacing Inline Functions

```typescript
// BEFORE
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// AFTER
import { formatCurrency } from '@/lib/utils/formatting/currency';
```

## Utility Function Standards

### Naming Conventions

- Use camelCase for function names
- Use descriptive names that indicate what the function does
- Prefix boolean functions with verbs like `is`, `has`, `should`, etc.
- Use consistent naming patterns for related functions

### Documentation

- Use JSDoc comments for all utility functions
- Include a description of what the function does
- Document all parameters and return values
- Include examples for complex functions

### Type Safety

- Use TypeScript types for all parameters and return values
- Use generics where appropriate to maintain type information
- Avoid using `any` type unless absolutely necessary
- Use union types for parameters that can accept multiple types

## Testing

- Create unit tests for all utility functions
- Test edge cases and error conditions
- Ensure 100% code coverage for utility functions
- Use test-driven development for new utilities

## Tooling

- Create a script to detect duplicate utility functions
- Add ESLint rules to enforce utility function standards
- Create a utility migration helper to assist with migration

## Timeline

- Phase 1: Week 1
- Phase 2: Week 1
- Phase 3: Week 2
- Phase 4: Week 2
- Phase 5: Weeks 3-4
- Phase 6: Week 5

## Responsible Team

- UI Team: Responsible for frontend utility standardization
- Backend Team: Responsible for backend utility standardization
- DevOps: Responsible for tooling and automation
