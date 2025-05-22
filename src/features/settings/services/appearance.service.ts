import { createSettingsService } from '@/lib/settings';
import { appearanceSettingsSchema, AppearanceSettings } from '../schemas/appearance-settings.schema';

// Default appearance settings
const defaultSettings: AppearanceSettings = {
  theme: 'system',
  accentColor: '#0284c7',
  fontSize: 'medium',
  borderRadius: 'medium',
  animation: {
    enabled: true,
    reducedMotion: false,
  },
  layout: {
    sidebarCollapsed: false,
    contentWidth: 'contained',
    menuPosition: 'side',
    compactMode: false,
  },
  cards: {
    shadow: 'medium',
    hover: true,
  },
  tables: {
    striped: true,
    compact: false,
    bordered: false,
  },
};

/**
 * Appearance settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<AppearanceSettings>('appearance', {
  defaultSettings,
  schema: appearanceSettingsSchema,
  apiEndpoint: 'settings/appearance',
  cacheable: true,
});

export default SettingsService;
