# Module Connection Guide - Settings

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/settings`) and backend (`backend/src/settings`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Settings Categories
1. Core Settings:
   - Appearance
   - Notifications
   - Backup
   - Security
   - System

2. Business Settings:
   - Company
   - Shops
   - Markets
   - Products
   - Customers
   - Suppliers
   - Expenses
   - Repairs

3. Integration Settings:
   - WooCommerce
   - Payment
   - Loyalty
   - Gift Cards

## Component Structure
```typescript
interface SettingsModule {
  schema: z.ZodSchema;
  defaultValues: Record<string, any>;
  component: React.FC;
  storageKey: string;
}

const settingsModules: Record<string, SettingsModule> = {
  products: {
    schema: productSettingsSchema,
    defaultValues: productDefaultValues,
    component: ProductsSettingsPanel,
    storageKey: "product-settings"
  },
  // ... other modules
}
```

## Step-by-Step Connection Process

### 1. Schema Definition
- [ ] Create/update schemas in `src/features/settings/schemas/`:
  - Base schema with common fields
  - Module-specific schemas
  - Validation rules
  - Type definitions

### 2. Default Values
- [ ] Define default values for each module:
  ```typescript
  const defaultValues = {
    appearance: {
      theme: 'light',
      density: 'comfortable',
      fontSize: 'medium'
    },
    notifications: {
      email: { enabled: true },
      inventory: { enabled: true }
    },
    // ... other modules
  };
  ```

### 3. Storage Implementation
- [ ] Implement settings store using Zustand:
  ```typescript
  const createSettingsStore = <T>({
    schema,
    defaultValues,
    storageKey
  }: CreateSettingsStoreProps<T>) => {
    return create(
      persist(
        (set) => ({
          settings: defaultValues,
          updateSettings: (newSettings: Partial<T>) =>
            set((state) => {
              const updated = { ...state.settings, ...newSettings };
              return { settings: schema.parse(updated) };
            }),
          resetSettings: () => set({ settings: defaultValues }),
        }),
        { name: storageKey }
      )
    );
  };
  ```

### 4. Component Implementation
- [ ] Create settings panels for each module:
  - WooCommerceSettings
  - ProductSettings
  - CustomerSettings
  - SupplierSettings
  - MarketSettings
  - ExpenseSettings
  - RepairSettings
  - LoyaltySettings

### 5. Form Implementation
- [ ] Implement forms using react-hook-form:
  ```typescript
  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues
  });
  ```

### 6. API Integration
- [ ] Create settings service:
  ```typescript
  class SettingsService {
    async getSettings(module: string): Promise<Settings>;
    async updateSettings(module: string, settings: Partial<Settings>): Promise<Settings>;
    async resetSettings(module: string): Promise<void>;
  }
  ```

### 7. Persistence Layer
- [ ] Implement storage strategies:
  - LocalStorage for client-side persistence
  - Database for server-side storage
  - Cache layer for frequently accessed settings

## Module-Specific Implementations

### WooCommerce Settings
```typescript
const wooCommerceSchema = z.object({
  enabled: z.boolean(),
  storeUrl: z.string().url(),
  consumerKey: z.string().min(1),
  consumerSecret: z.string().min(1),
  sync: z.object({
    products: z.boolean(),
    inventory: z.boolean(),
    orders: z.boolean(),
    customers: z.boolean(),
    frequency: z.enum(["realtime", "hourly", "daily", "manual"])
  })
});
```

### Product Settings
```typescript
const productSettingsSchema = z.object({
  defaultUnit: z.string(),
  enableVariants: z.boolean(),
  trackInventory: z.boolean(),
  lowStockThreshold: z.number(),
  defaultPriceCalculation: z.enum(["markup", "margin"]),
  defaultMarkupPercentage: z.number()
});
```

### Customer Settings
```typescript
const customerSettingsSchema = z.object({
  enableCustomerAccounts: z.boolean(),
  requireEmailVerification: z.boolean(),
  allowGuestCheckout: z.boolean(),
  enableLoyaltyProgram: z.boolean(),
  retentionPeriodDays: z.number()
});
```

## Event Handling
- [ ] Implement settings change events:
  - onSettingsUpdate
  - onSettingsReset
  - onValidationError
  - onSyncComplete

## Validation & Error Handling
- [ ] Implement validation:
  ```typescript
  try {
    const validatedSettings = settingsSchema.parse(newSettings);
    // Process valid settings
  } catch (err) {
    // Handle validation errors
    toast({
      title: "Error",
      description: "Invalid settings data",
      variant: "destructive"
    });
  }
  ```

## Security Considerations
1. Encryption for sensitive settings
2. Role-based access control
3. Audit logging for changes
4. Validation of external inputs
5. Rate limiting for API endpoints
6. Secure storage of credentials

## Performance Optimization
1. Implement caching strategy
2. Lazy loading of settings panels
3. Debounce settings updates
4. Batch settings changes
5. Optimize validation performance

## Testing Strategy
- [ ] Unit tests for schemas
- [ ] Integration tests for storage
- [ ] Component tests for panels
- [ ] E2E tests for settings flow
- [ ] Performance testing
- [ ] Security testing

## Documentation Requirements
1. API documentation
2. Schema documentation
3. Component usage examples
4. Configuration options
5. Migration guides
6. Troubleshooting guide

## Deployment Checklist
- [ ] Database migrations
- [ ] Environment variables
- [ ] Cache invalidation
- [ ] Backup current settings
- [ ] Version compatibility
- [ ] Rollback plan
- [ ] Monitoring setup

## Monitoring & Maintenance
1. Settings change logging
2. Performance metrics
3. Error tracking
4. Usage analytics
5. Backup verification
6. Regular security audits

