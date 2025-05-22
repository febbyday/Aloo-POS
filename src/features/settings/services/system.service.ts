import { createSettingsService } from '@/lib/settings';
import { systemSettingsSchema, SystemSettings } from '../schemas/system-settings.schema';

// Default system settings
const defaultSettings: SystemSettings = {
  archiving: {
    enabled: true,
    olderThan: 90,
    archiveFormat: 'zip',
  },
  cache: {
    enabled: true,
    maxSize: 100,
    clearInterval: 24,
  },
  monitoring: {
    enabled: true,
    alertThreshold: 90,
    collectMetrics: true,
  },
  background: {
    maxJobs: 5,
    priority: 'medium',
  },
};

/**
 * System settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<SystemSettings>('system', {
  defaultSettings,
  schema: systemSettingsSchema,
  apiEndpoint: 'settings/system',
  cacheable: true,
});

/**
 * Helper functions for system operations
 */
export const systemService = {
  /**
   * Check if archiving is enabled
   */
  isArchivingEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.archiving.enabled;
  },

  /**
   * Get archiving settings
   */
  getArchivingSettings: async (): Promise<SystemSettings['archiving']> => {
    const settings = await SettingsService.getSettings();
    return settings.archiving;
  },

  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.monitoring.enabled;
  },

  /**
   * Get monitoring alert threshold
   */
  getAlertThreshold: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.monitoring.alertThreshold;
  },

  /**
   * Get background job settings
   */
  getBackgroundJobSettings: async (): Promise<SystemSettings['background']> => {
    const settings = await SettingsService.getSettings();
    return settings.background;
  },
};

export default SettingsService;
