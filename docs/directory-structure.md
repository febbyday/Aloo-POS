# POS System Directory Structure

This document outlines the standardized directory structure for the POS system, ensuring consistency across all feature modules.

## Standard Feature Module Structure

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

## Directory Purposes

### components/

Contains all UI components specific to the feature. Components should be organized by their purpose or sub-feature.

**Example structure:**
```
components/
├── common/
│   ├── FeatureCard.tsx
│   └── FeatureHeader.tsx
├── forms/
│   ├── FeatureForm.tsx
│   └── FeatureFieldGroup.tsx
├── tables/
│   ├── FeatureTable.tsx
│   └── FeatureTableRow.tsx
├── modals/
│   ├── CreateFeatureModal.tsx
│   └── EditFeatureModal.tsx
└── index.ts           # Re-exports all components
```

### hooks/

Contains custom React hooks that encapsulate feature-specific logic and state management.

**Example structure:**
```
hooks/
├── useFeature.tsx
├── useFeatureForm.tsx
├── useFeatureFilters.tsx
└── index.ts           # Re-exports all hooks
```

### services/

Contains service modules that handle API calls, data fetching, and business logic.

**Example structure:**
```
services/
├── featureService.ts
├── featureAnalyticsService.ts
└── index.ts           # Re-exports all services
```

### context/

Contains React context providers for feature-wide state management.

**Example structure:**
```
context/
├── FeatureContext.tsx
├── FeatureSettingsContext.tsx
└── index.ts           # Re-exports all contexts
```

### utils/

Contains utility functions specific to the feature.

**Example structure:**
```
utils/
├── featureFormatters.ts
├── featureCalculations.ts
└── index.ts           # Re-exports all utilities
```

### types/

Contains TypeScript type definitions for the feature.

**Example structure:**
```
types/
├── feature.types.ts
├── featureForm.types.ts
└── index.ts           # Re-exports all types
```

### pages/

Contains page components that are used in routing.

**Example structure:**
```
pages/
├── FeaturePage.tsx
├── FeatureDetailsPage.tsx
├── FeatureSettingsPage.tsx
└── index.ts           # Re-exports all pages
```

## Feature-Specific Examples

### Customers Feature

```
features/customers/
├── components/
│   ├── CustomerTable.tsx
│   ├── CustomerForm.tsx
│   ├── CustomerDetails.tsx
│   └── index.ts
├── hooks/
│   ├── useCustomers.tsx
│   ├── useCustomerForm.tsx
│   └── index.ts
├── services/
│   ├── customerService.ts
│   └── index.ts
├── context/
│   ├── CustomerContext.tsx
│   └── index.ts
├── utils/
│   ├── customerFormatters.ts
│   └── index.ts
├── types/
│   ├── customer.types.ts
│   └── index.ts
├── pages/
│   ├── CustomersPage.tsx
│   ├── CustomerDetailsPage.tsx
│   └── index.ts
└── index.ts
```

### Products Feature

```
features/products/
├── components/
│   ├── common/
│   │   ├── ProductCard.tsx
│   │   └── ProductImage.tsx
│   ├── forms/
│   │   ├── ProductForm.tsx
│   │   └── ProductVariantForm.tsx
│   ├── tables/
│   │   ├── ProductsTable.tsx
│   │   └── ProductInventoryTable.tsx
│   └── index.ts
├── hooks/
│   ├── useProducts.tsx
│   ├── useProductInventory.tsx
│   └── index.ts
├── services/
│   ├── productService.ts
│   ├── productInventoryService.ts
│   └── index.ts
├── context/
│   ├── ProductContext.tsx
│   └── index.ts
├── utils/
│   ├── productFormatters.ts
│   ├── productCalculations.ts
│   └── index.ts
├── types/
│   ├── product.types.ts
│   ├── inventory.types.ts
│   └── index.ts
├── pages/
│   ├── ProductsPage.tsx
│   ├── ProductDetailsPage.tsx
│   ├── ProductInventoryPage.tsx
│   └── index.ts
└── index.ts
```

### Settings Feature (with Payment Methods)

```
features/settings/
├── components/
│   ├── common/
│   │   ├── SettingsCard.tsx
│   │   └── SettingsHeader.tsx
│   ├── payment/
│   │   ├── PaymentMethodCard.tsx
│   │   ├── PaymentMethodForm.tsx
│   │   ├── InstallmentPlansTable.tsx
│   │   └── PaymentSettings.tsx
│   └── index.ts
├── hooks/
│   ├── useSettings.tsx
│   ├── usePaymentMethods.tsx
│   └── index.ts
├── services/
│   ├── settingsService.ts
│   ├── paymentService.ts
│   └── index.ts
├── context/
│   ├── SettingsContext.tsx
│   └── index.ts
├── utils/
│   ├── settingsFormatters.ts
│   └── index.ts
├── types/
│   ├── settings.types.ts
│   ├── payment.types.ts
│   └── index.ts
├── pages/
│   ├── SettingsPage.tsx
│   ├── PaymentSettingsPage.tsx
│   └── index.ts
└── index.ts
```

## Migration Strategy

To migrate your existing codebase to this standardized structure:

1. **Create Standard Directories**: Use the `standardize-directories.js` script to create the standard directory structure for all feature modules.

2. **Migrate Files**: Use the `migrate-files.js` script to move existing files to their proper directories based on their type and purpose.

3. **Update Imports**: Use the `update-imports.js` script to update import statements after files have been moved.

4. **Verify Changes**: Run tests and verify the application works correctly after migration.

5. **Refactor Gradually**: Focus on one feature module at a time to minimize disruption.

## Best Practices

1. **Keep Related Files Together**: Organize files by feature, not by file type.

2. **Use Index Files**: Create index files in each directory to re-export its contents, making imports cleaner.

3. **Follow Naming Conventions**: Use consistent naming conventions for files and directories.

4. **Separate Concerns**: Keep UI components, business logic, and data fetching separate.

5. **Minimize Cross-Feature Dependencies**: Features should be as self-contained as possible.

6. **Document Directory Structure**: Keep this documentation updated as the structure evolves.
