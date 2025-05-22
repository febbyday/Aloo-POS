# Settings Implementation Technical Guide

This document provides a detailed technical implementation guide for the settings improvement tasks outlined in `settings-improvement-tasks.md`. It includes architecture decisions, code patterns, database schema designs, and implementation steps for each phase.

## Current State Analysis

Before implementing the improvements, it's important to understand the current state of settings in the application:

1. **Multiple Implementation Patterns**: 
   - Settings are implemented inconsistently across modules (e.g., duplicate gift card settings services)
   - Some settings use localStorage, others use API endpoints
   - No standardized pattern for settings storage or retrieval

2. **Storage Mechanisms**:
   - Frontend: Primarily using localStorage
   - Backend: Mix of in-memory storage and database (incomplete implementation)

3. **UI Organization**:
   - Settings are organized in a sidebar navigation with nested categories
   - Each settings panel is implemented as a separate component
   - Settings are passed through React context using outlet context

4. **API Endpoints**:
   - Some modules have dedicated settings endpoints (e.g., loyalty)
   - Endpoint registry contains settings endpoints but implementation is inconsistent
   - No standardized API pattern for settings CRUD operations

## Architecture Design

### 1. Unified Settings Service Architecture

#### 1.1 Core Settings Service Interface

```typescript
// src/lib/settings/types.ts
export interface SettingsService<T> {
  // Core CRUD operations
  getSettings(): Promise<T>;
  saveSettings(settings: T): Promise<void>;
  resetSettings(): Promise<T>;
  
  // Optional operations
  getSettingValue<K extends keyof T>(key: K): Promise<T[K]>;
  updateSettingValue<K extends keyof T>(key: K, value: T[K]): Promise<void>;
  
  // Metadata
  getMetadata(): SettingsMetadata;
}

export interface SettingsMetadata {
  module: string;
  storageType: 'local' | 'remote' | 'hybrid';
  cacheable: boolean;
  schema?: ZodSchema<any>;
  lastUpdated?: Date;
}
```

#### 1.2 Base Settings Service Implementation

```typescript
// src/lib/settings/base-settings-service.ts
export class BaseSettingsService<T> implements SettingsService<T> {
  protected readonly module: string;
  protected readonly defaultSettings: T;
  protected readonly schema?: ZodSchema<T>;
  protected readonly apiEndpoint?: string;
  protected settings: T | null = null;
  protected storageKey: string;
  
  constructor(options: {
    module: string;
    defaultSettings: T;
    schema?: ZodSchema<T>;
    apiEndpoint?: string;
  }) {
    this.module = options.module;
    this.defaultSettings = options.defaultSettings;
    this.schema = options.schema;
    this.apiEndpoint = options.apiEndpoint;
    this.storageKey = `settings_${this.module}`;
  }
  
  // Implementation of interface methods
  // ...
}
```

#### 1.3 Settings Factory

```typescript
// src/lib/settings/settings-factory.ts
export class SettingsFactory {
  private static instances: Map<string, SettingsService<any>> = new Map();
  
  static getService<T>(module: string, options: {
    defaultSettings: T;
    schema?: ZodSchema<T>;
    apiEndpoint?: string;
  }): SettingsService<T> {
    if (!this.instances.has(module)) {
      this.instances.set(module, new BaseSettingsService<T>(options));
    }
    return this.instances.get(module) as SettingsService<T>;
  }
}
```

### 2. Database Schema Design

#### 2.1 Core Settings Table

```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1,
  UNIQUE(module, key)
);

CREATE INDEX idx_settings_module ON settings(module);
CREATE INDEX idx_settings_module_key ON settings(module, key);
```

#### 2.2 Settings History Table

```sql
CREATE TABLE settings_history (
  id SERIAL PRIMARY KEY,
  settings_id INTEGER REFERENCES settings(id),
  module VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  changed_by INTEGER REFERENCES users(id),
  version INTEGER NOT NULL,
  change_type VARCHAR(10) NOT NULL -- 'UPDATE', 'CREATE', 'DELETE'
);

CREATE INDEX idx_settings_history_settings_id ON settings_history(settings_id);
CREATE INDEX idx_settings_history_module ON settings_history(module);
```

#### 2.3 Prisma Schema

```prisma
// backend/prisma/schema.prisma
model Settings {
  id        Int      @id @default(autoincrement())
  module    String
  key       String
  value     Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  version   Int      @default(1)
  
  history   SettingsHistory[]
  
  @@unique([module, key])
  @@map("settings")
}

model SettingsHistory {
  id         Int      @id @default(autoincrement())
  settingsId Int      @map("settings_id")
  module     String
  key        String
  value      Json
  changedAt  DateTime @default(now()) @map("changed_at")
  changedBy  Int?     @map("changed_by")
  version    Int
  changeType String   @map("change_type")
  
  settings   Settings @relation(fields: [settingsId], references: [id])
  user       User?    @relation(fields: [changedBy], references: [id])
  
  @@map("settings_history")
}
```

## Implementation Plan

### Phase 1: Consolidate Duplicate Settings Services

#### Task 1.1: Create a Unified Settings Service Architecture

1. **Create Base Files**:
   - Create the settings service interface and base implementation
   - Implement the settings factory
   - Add utility functions for settings operations

2. **Add Zod Schema Support**:
   - Create schema registry for settings validation
   - Implement validation in base service

3. **Add Caching Layer**:
   - Implement in-memory cache for settings
   - Add cache invalidation mechanism

4. **Create Migration Guide**:
   - Document the new architecture
   - Provide examples for migrating existing services

#### Task 1.2: Remove Gift Card Settings Duplication

1. **Compare Implementations**:
   - Both implementations in `src/features/gift-cards/services/settingsService.ts` and `src/features/sales/services/gift-cards/settingsService.ts` are identical
   - Both use localStorage with the same key 'giftCardSettings'
   - Both have the same default settings

2. **Migration Steps**:
   ```typescript
   // src/features/gift-cards/services/settingsService.ts
   import { SettingsFactory } from '@/lib/settings/settings-factory';
   import { GiftCardSettings } from "../types";
   import { giftCardSettingsSchema } from '../schemas/gift-card-settings.schema';

   // Default settings
   const defaultSettings: GiftCardSettings = {
     enableEmailDelivery: true,
     enablePrintFormat: true,
     enableDigitalWallet: false,
     defaultExpirationPeriod: 90,
     defaultTemplate: "4",
     codePrefix: "GIFT",
     codeLength: 16,
     allowManualCodes: true,
   };

   // Create settings service using factory
   export const SettingsService = SettingsFactory.getService<GiftCardSettings>('gift-cards', {
     defaultSettings,
     schema: giftCardSettingsSchema,
     apiEndpoint: 'gift-cards/settings'
   });

   export default SettingsService;
   ```

3. **Update References**:
   - Add deprecation notice to `src/features/sales/services/gift-cards/settingsService.ts`
   - Update imports in all files using the deprecated service

#### Task 1.3: Standardize Settings Storage Pattern

1. **Create Base Settings Service**:
   - Implement standard CRUD operations
   - Add caching layer
   - Add validation using Zod schemas

2. **Create API Client Integration**:
   - Add API endpoints for settings
   - Implement API client in settings service

3. **Create Migration Script**:
   - Scan codebase for settings implementations
   - Generate migration tasks for each implementation

### Phase 2: Implement Missing Critical Settings

#### Task 2.1: Add Security Settings

1. **Define Schema**:
   ```typescript
   // src/features/settings/schemas/security-settings.schema.ts
   import { z } from 'zod';

   export const securitySettingsSchema = z.object({
     password: z.object({
       minLength: z.number().min(6).max(100).default(8),
       requireSpecialChar: z.boolean().default(true),
       requireNumber: z.boolean().default(true),
       requireUppercase: z.boolean().default(true),
       expiryDays: z.number().min(0).default(90),
     }),
     twoFactor: z.object({
       enabled: z.boolean().default(false),
       method: z.enum(['email', 'authenticator', 'sms']).default('email'),
     }),
     session: z.object({
       timeout: z.number().min(1).default(30),
       maxAttempts: z.number().min(1).default(5),
       lockoutDuration: z.number().min(1).default(15),
     }),
     ipRestriction: z.object({
       enabled: z.boolean().default(false),
       allowedIps: z.array(z.string()).default([]),
     }),
   });

   export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
   ```

2. **Create Backend Model**:
   - Add security settings to Prisma schema
   - Create migration for database changes

3. **Implement API Endpoints**:
   - Add controller for security settings
   - Add routes for CRUD operations

4. **Create UI Components**:
   - Implement security settings panel
   - Add form validation
   - Connect to API

#### Task 2.2: Add Localization Settings

1. **Define Schema**:
   ```typescript
   // src/features/settings/schemas/localization-settings.schema.ts
   import { z } from 'zod';

   export const localizationSettingsSchema = z.object({
     language: z.string().default('en'),
     timezone: z.string().default('UTC'),
     dateFormat: z.string().default('MM/DD/YYYY'),
     timeFormat: z.string().default('h:mm A'),
     currency: z.object({
       code: z.string().default('USD'),
       symbol: z.string().default('$'),
       position: z.enum(['before', 'after']).default('before'),
       decimalSeparator: z.string().default('.'),
       thousandsSeparator: z.string().default(','),
       decimalPlaces: z.number().min(0).max(4).default(2),
     }),
     numberFormat: z.object({
       decimalSeparator: z.string().default('.'),
       thousandsSeparator: z.string().default(','),
       decimalPlaces: z.number().min(0).max(4).default(2),
     }),
   });

   export type LocalizationSettings = z.infer<typeof localizationSettingsSchema>;
   ```

2. **Create Backend Model**:
   - Add localization settings to Prisma schema
   - Create migration for database changes

3. **Implement API Endpoints**:
   - Add controller for localization settings
   - Add routes for CRUD operations

4. **Create UI Components**:
   - Implement localization settings panel
   - Add form validation
   - Connect to API

5. **Integrate with i18n Library**:
   - Add i18n configuration
   - Connect settings to i18n instance

### Phase 3: Standardize Backend Storage

#### Task 3.1: Create Settings Database Schema

1. **Define Base Schema**:
   - Create settings table structure
   - Add versioning/history support
   - Create migrations

2. **Implement Repository Pattern**:
   ```typescript
   // backend/src/repositories/settings.repository.ts
   export class SettingsRepository {
     async getSettings(module: string, key: string): Promise<any> {
       const settings = await prisma.settings.findUnique({
         where: { module_key: { module, key } },
       });
       return settings?.value;
     }
     
     async saveSettings(module: string, key: string, value: any, userId?: number): Promise<void> {
       const existing = await prisma.settings.findUnique({
         where: { module_key: { module, key } },
       });
       
       if (existing) {
         // Update existing settings
         await prisma.$transaction([
           // Create history record
           prisma.settingsHistory.create({
             data: {
               settingsId: existing.id,
               module,
               key,
               value: existing.value,
               changedBy: userId,
               version: existing.version,
               changeType: 'UPDATE',
             },
           }),
           // Update settings
           prisma.settings.update({
             where: { id: existing.id },
             data: {
               value,
               version: { increment: 1 },
             },
           }),
         ]);
       } else {
         // Create new settings
         const newSettings = await prisma.settings.create({
           data: {
             module,
             key,
             value,
           },
         });
         
         // Create history record
         await prisma.settingsHistory.create({
           data: {
             settingsId: newSettings.id,
             module,
             key,
             value,
             changedBy: userId,
             version: 1,
             changeType: 'CREATE',
           },
         });
       }
     }
     
     // Additional methods for history, etc.
   }
   ```

3. **Create Settings Service**:
   ```typescript
   // backend/src/services/settings.service.ts
   export class SettingsService {
     private repository: SettingsRepository;
     
     constructor() {
       this.repository = new SettingsRepository();
     }
     
     async getModuleSettings(module: string): Promise<Record<string, any>> {
       const settings = await prisma.settings.findMany({
         where: { module },
       });
       
       return settings.reduce((acc, setting) => {
         acc[setting.key] = setting.value;
         return acc;
       }, {});
     }
     
     // Additional methods
   }
   ```

#### Task 3.2: Migrate from localStorage to Database

1. **Identify localStorage Usage**:
   - Scan codebase for localStorage.getItem/setItem calls
   - Create migration plan for each module

2. **Create Migration Scripts**:
   ```typescript
   // scripts/migrate-settings.ts
   async function migrateSettings() {
     // For each module using localStorage
     const modules = ['gift-cards', 'appearance', 'notifications', /* ... */];
     
     for (const module of modules) {
       // Get settings from localStorage
       const key = `${module}_settings`;
       const value = localStorage.getItem(key);
       
       if (value) {
         try {
           const settings = JSON.parse(value);
           
           // Save to database
           await settingsRepository.saveSettings(module, 'settings', settings);
           
           console.log(`Migrated settings for ${module}`);
         } catch (error) {
           console.error(`Error migrating settings for ${module}:`, error);
         }
       }
     }
   }
   ```

3. **Update Services**:
   - Modify services to use database instead of localStorage
   - Add fallback for offline operation

#### Task 3.3: Implement Settings Caching

1. **Define Caching Strategy**:
   ```typescript
   // src/lib/settings/settings-cache.ts
   export class SettingsCache {
     private static instance: SettingsCache;
     private cache: Map<string, { value: any; timestamp: number }> = new Map();
     private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
     
     private constructor() {}
     
     static getInstance(): SettingsCache {
       if (!SettingsCache.instance) {
         SettingsCache.instance = new SettingsCache();
       }
       return SettingsCache.instance;
     }
     
     get<T>(key: string): T | null {
       const cached = this.cache.get(key);
       
       if (!cached) {
         return null;
       }
       
       const now = Date.now();
       if (now - cached.timestamp > this.DEFAULT_TTL) {
         this.cache.delete(key);
         return null;
       }
       
       return cached.value as T;
     }
     
     set<T>(key: string, value: T, ttl?: number): void {
       this.cache.set(key, {
         value,
         timestamp: Date.now(),
       });
     }
     
     invalidate(key: string): void {
       this.cache.delete(key);
     }
     
     invalidateByPrefix(prefix: string): void {
       for (const key of this.cache.keys()) {
         if (key.startsWith(prefix)) {
           this.cache.delete(key);
         }
       }
     }
   }
   ```

2. **Integrate with Settings Service**:
   - Add cache to base settings service
   - Implement cache invalidation on updates

3. **Add Cache Headers to API**:
   - Configure API responses with appropriate cache headers
   - Implement ETag support for efficient caching

### Phase 4: Improve Settings UI Organization

#### Task 4.1: Reorganize Settings Categories

1. **Review Current Structure**:
   - Analyze current navigation in `src/features/settings/components/SettingsSidebar.tsx`
   - Identify overlapping categories

2. **Create New Category Hierarchy**:
   ```typescript
   // src/features/settings/config/settings-navigation.ts
   export const settingsNavigation = [
     {
       id: 'business',
       label: 'Business Settings',
       icon: 'Building',
       items: [
         { id: 'company', label: 'Company', icon: 'Building', path: '/settings/company' },
         { id: 'shops', label: 'Shops', icon: 'Store', path: '/settings/shops' },
         { id: 'markets', label: 'Markets', icon: 'BarChart', path: '/settings/markets' },
       ],
     },
     {
       id: 'system',
       label: 'System Settings',
       icon: 'Settings',
       items: [
         { id: 'appearance', label: 'Appearance', icon: 'Palette', path: '/settings/appearance' },
         { id: 'theme', label: 'Theme', icon: 'Sun', path: '/settings/theme' },
         { id: 'security', label: 'Security', icon: 'Shield', path: '/settings/security' },
         { id: 'localization', label: 'Localization', icon: 'Globe', path: '/settings/localization' },
         { id: 'backup', label: 'Backup & Export', icon: 'Database', path: '/settings/backup' },
         { id: 'monitoring', label: 'Monitoring', icon: 'Activity', path: '/settings/monitoring' },
       ],
     },
     // Additional categories
   ];
   ```

3. **Update Navigation Component**:
   - Refactor SettingsSidebar to use the new configuration
   - Add support for nested categories

4. **Update Routes**:
   - Update routes to match new navigation structure
   - Add redirects for backward compatibility

#### Task 4.2: Implement Consistent UI Patterns

1. **Create Reusable Settings Components**:
   ```typescript
   // src/features/settings/components/SettingsPanel.tsx
   interface SettingsPanelProps {
     title: string;
     description?: string;
     children: ReactNode;
     actions?: ReactNode;
   }
   
   export function SettingsPanel({ title, description, children, actions }: SettingsPanelProps) {
     return (
       <Card className="w-full">
         <CardHeader>
           <CardTitle>{title}</CardTitle>
           {description && <CardDescription>{description}</CardDescription>}
         </CardHeader>
         <CardContent>{children}</CardContent>
         {actions && <CardFooter>{actions}</CardFooter>}
       </Card>
     );
   }
   ```

2. **Define Standard Layouts**:
   - Create templates for different setting types
   - Implement responsive design

3. **Add Help Text and Tooltips**:
   - Create consistent help text component
   - Add tooltips for complex settings

### Phase 5: Enhance Settings API

#### Task 5.1: Standardize API Endpoints

1. **Define API Naming Conventions**:
   - Use consistent URL structure: `/api/v1/settings/{module}`
   - Use standard HTTP methods for CRUD operations

2. **Create Endpoint Templates**:
   ```typescript
   // backend/src/routes/settings.routes.ts
   import express from 'express';
   import { SettingsController } from '../controllers/settings.controller';
   import { authenticateJWT } from '../middleware/auth';
   import { validateRequest } from '../middleware/validation';

   const router = express.Router();
   const controller = new SettingsController();

   // All routes require authentication
   router.use(authenticateJWT);

   // GET /api/v1/settings/:module - Get all settings for a module
   router.get('/:module', controller.getModuleSettings);

   // GET /api/v1/settings/:module/:key - Get specific setting
   router.get('/:module/:key', controller.getSetting);

   // PUT /api/v1/settings/:module/:key - Update specific setting
   router.put(
     '/:module/:key',
     validateRequest(/* schema */),
     controller.updateSetting
   );

   // GET /api/v1/settings/:module/history - Get settings history
   router.get('/:module/history', controller.getSettingsHistory);

   export default router;
   ```

3. **Update Existing Endpoints**:
   - Refactor existing endpoints to use the new pattern
   - Add documentation

#### Task 5.2: Implement Full CRUD Operations

1. **Identify Missing Operations**:
   - Review existing endpoints
   - Create list of missing operations

2. **Implement Missing Operations**:
   - Add controllers for missing operations
   - Add validation
   - Add error handling

### Phase 6: Add Settings Management Features

#### Task 6.1: Implement Settings Backup/Restore

1. **Define Export Format**:
   ```typescript
   // src/features/settings/types/backup.types.ts
   export interface SettingsBackup {
     version: string;
     timestamp: string;
     modules: {
       [module: string]: {
         [key: string]: any;
       };
     };
   }
   ```

2. **Create Export API**:
   - Add endpoint for exporting settings
   - Implement JSON export format
   - Add encryption for sensitive data

3. **Add UI for Export/Import**:
   - Create backup/restore panel
   - Add file upload/download functionality
   - Add validation for imported data

#### Task 6.2: Add Settings History

1. **Implement History Tracking**:
   - Use the settings_history table
   - Track all changes with user information

2. **Create History API**:
   - Add endpoints for retrieving history
   - Add filtering and pagination

3. **Add UI for Viewing History**:
   - Create history panel
   - Add timeline visualization
   - Implement revert functionality

## Implementation Timeline

The implementation will follow the timeline outlined in the settings-improvement-tasks.md document, with each sprint focusing on specific tasks:

### Sprint 1 (2 weeks)
- Task 1.1: Create a Unified Settings Service Architecture
- Task 1.2: Remove Gift Card Settings Duplication
- Task 3.1: Create Settings Database Schema

### Sprint 2 (2 weeks)
- Task 1.3: Standardize Settings Storage Pattern
- Task 3.2: Migrate from localStorage to Database
- Task 5.1: Standardize API Endpoints

### Sprint 3 (2 weeks)
- Task 2.1: Add Security Settings
- Task 4.1: Reorganize Settings Categories
- Task 5.2: Implement Full CRUD Operations

### Sprint 4 (2 weeks)
- Task 2.2: Add Localization Settings
- Task 3.3: Implement Settings Caching
- Task 6.1: Implement Settings Backup/Restore

### Sprint 5 (2 weeks)
- Task 2.3: Expand Integration Settings
- Task 4.2: Implement Consistent UI Patterns

### Sprint 6 (2 weeks)
- Task 4.3: Add Settings Search and Favorites
- Task 5.3: Add Settings Synchronization
- Task 6.2: Add Settings History

## Testing Strategy

### Unit Tests

- Test each settings service implementation
- Test validation logic
- Test caching mechanisms

### Integration Tests

- Test API endpoints
- Test database operations
- Test migration scripts

### UI Tests

- Test settings panels
- Test form validation
- Test responsive design

## Monitoring and Performance

- Add performance metrics for settings operations
- Monitor cache hit/miss rates
- Track settings usage patterns

## Documentation

- Create developer documentation for the settings architecture
- Add inline documentation for all components
- Create user documentation for settings features
