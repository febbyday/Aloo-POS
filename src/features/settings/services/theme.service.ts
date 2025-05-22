import { createSettingsService } from '@/lib/settings';
import { themeSettingsSchema, ThemeSettings } from '../schemas/theme-settings.schema';

// Default theme settings
const defaultSettings: ThemeSettings = {
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
 * Theme settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<ThemeSettings>('theme', {
  defaultSettings,
  schema: themeSettingsSchema,
  apiEndpoint: 'settings/theme',
  cacheable: true,
});

/**
 * Helper functions for theme operations
 */
export const themeService = {
  /**
   * Get current theme
   */
  getCurrentTheme: async (): Promise<ThemeSettings['theme']> => {
    const settings = await SettingsService.getSettings();
    return settings.theme;
  },

  /**
   * Get resolved theme (light or dark, not system)
   */
  getResolvedTheme: async (): Promise<'light' | 'dark'> => {
    const settings = await SettingsService.getSettings();
    
    if (settings.theme !== 'system') {
      return settings.theme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  /**
   * Get accent color
   */
  getAccentColor: async (): Promise<string> => {
    const settings = await SettingsService.getSettings();
    return settings.accentColor;
  },

  /**
   * Get font size
   */
  getFontSize: async (): Promise<ThemeSettings['fontSize']> => {
    const settings = await SettingsService.getSettings();
    return settings.fontSize;
  },

  /**
   * Get layout settings
   */
  getLayoutSettings: async (): Promise<ThemeSettings['layout']> => {
    const settings = await SettingsService.getSettings();
    return settings.layout;
  },

  /**
   * Check if animations are enabled
   */
  areAnimationsEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.animation.enabled && !settings.animation.reducedMotion;
  },

  /**
   * Get table display settings
   */
  getTableSettings: async (): Promise<ThemeSettings['tables']> => {
    const settings = await SettingsService.getSettings();
    return settings.tables;
  },
};

export default SettingsService;
