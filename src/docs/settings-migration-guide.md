# Settings Migration Guide

This guide explains how to migrate existing settings services to the new unified settings architecture.

## Overview

The new settings architecture provides a standardized way to manage settings across the application. It includes:

- A common interface for all settings services
- Centralized caching
- Validation using Zod schemas
- Support for both localStorage and API-based storage
- Consistent error handling

## Migration Steps

### 1. Create a Schema

First, create a Zod schema for your settings type:

```typescript
// src/features/your-module/schemas/your-settings.schema.ts
import { z } from 'zod';

export const yourSettingsSchema = z.object({
  // Define your settings properties with validation
  someSetting: z.boolean().default(true),
  anotherSetting: z.string().min(3).max(50).default('default value'),
  numericSetting: z.number().min(0).max(100).default(50),
  // ...
});

// Export the type derived from the schema
export type YourSettings = z.infer<typeof yourSettingsSchema>;
```

### 2. Update Your Settings Service

Replace your existing settings service with one that uses the unified architecture:

```typescript
// src/features/your-module/services/settingsService.ts
import { createSettingsService } from '@/lib/settings';
import { yourSettingsSchema } from '../schemas/your-settings.schema';
import type { YourSettings } from '../schemas/your-settings.schema';

// Define default settings
const defaultSettings: YourSettings = {
  someSetting: true,
  anotherSetting: 'default value',
  numericSetting: 50,
  // ...
};

// Create the settings service
export const SettingsService = createSettingsService<YourSettings>('your-module', {
  defaultSettings,
  schema: yourSettingsSchema,
  apiEndpoint: 'your-module/settings', // Optional: API endpoint for remote storage
  cacheable: true, // Optional: Enable caching (default: true)
});

// For backward compatibility, maintain the default export
export default SettingsService;
```

### 3. Update Usage in Components

Update your components to use the new service:

```typescript
import { SettingsService } from '@/features/your-module/services/settingsService';
import type { YourSettings } from '@/features/your-module/schemas/your-settings.schema';

// In your component
const [settings, setSettings] = useState<YourSettings | null>(null);

// Load settings
useEffect(() => {
  const loadSettings = async () => {
    try {
      const data = await SettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };
  
  loadSettings();
}, []);

// Save settings
const handleSave = async (updatedSettings: YourSettings) => {
  try {
    await SettingsService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};
```

### 4. Add to Settings Navigation (Optional)

If your settings should be accessible from the settings page, add a route and component:

1. Create a settings panel component:

```typescript
// src/features/settings/components/YourModuleSettings.tsx
import { useState, useEffect } from 'react';
import { SettingsService } from '@/features/your-module/services/settingsService';
import type { YourSettings } from '@/features/your-module/schemas/your-settings.schema';

export function YourModuleSettingsPanel() {
  const [settings, setSettings] = useState<YourSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load settings
  useEffect(() => {
    // Implementation...
  }, []);
  
  // Save settings
  const handleSave = async () => {
    // Implementation...
  };
  
  // Render your settings UI
  return (
    <div>
      {/* Your settings UI */}
    </div>
  );
}
```

2. Add a wrapper to SettingsPanelWrappers.tsx:

```typescript
// In src/features/settings/components/SettingsPanelWrappers.tsx
import { YourModuleSettingsPanel } from './YourModuleSettings';

// Add this function
export function YourModuleSettingsWrapper() {
  return (
    <YourModuleSettingsPanel />
  );
}
```

3. Add a route in App.tsx:

```typescript
// In the settings routes section of App.tsx
<Route path="your-module" element={<YourModuleSettingsWrapper />} />
```

4. Add a navigation link in SettingsSidebar.tsx:

```typescript
// In the appropriate section of SettingsSidebar.tsx
<NavLink to="/settings/your-module" icon={YourIcon} label="Your Module" />
```

## Example: Gift Card Settings Migration

The gift card settings have been migrated as an example:

1. Schema: `src/features/gift-cards/schemas/gift-card-settings.schema.ts`
2. Service: `src/features/gift-cards/services/settingsService.ts`
3. Settings Panel: `src/features/settings/components/GiftCardSettings.tsx`
4. Route: Added to App.tsx
5. Navigation: Added to SettingsSidebar.tsx

## Benefits of Migration

- **Consistency**: All settings follow the same pattern
- **Validation**: Zod schemas ensure data integrity
- **Caching**: Improved performance with automatic caching
- **Type Safety**: Full TypeScript support
- **Flexibility**: Works with both local and remote storage
- **Error Handling**: Consistent error handling across all settings

## Need Help?

If you need assistance migrating your settings, please contact the development team.
