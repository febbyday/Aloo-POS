import { createSettingsService } from '@/lib/settings';
import { notificationSettingsSchema, NotificationSettings } from '../schemas/notification-settings.schema';

// Default notification settings
const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    salesReports: true,
    inventoryAlerts: true,
    systemAlerts: true,
  },
  internal: {
    enabled: true,
    showBadge: true,
    sound: true,
    desktop: true,
    autoRead: false,
    keepDays: 30,
  },
  inventoryAlerts: {
    enabled: true,
    threshold: 5,
  },
  salesMilestones: {
    enabled: true,
    dailyGoal: 1000,
    weeklyGoal: 5000,
    monthlyGoal: 20000,
  },
  securityAlerts: {
    loginAttempts: true,
    systemChanges: true,
    backupStatus: true,
  },
};

/**
 * Notification settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<NotificationSettings>('notification', {
  defaultSettings,
  schema: notificationSettingsSchema,
  apiEndpoint: 'settings/notification',
  cacheable: true,
});

/**
 * Helper functions for notification operations
 */
export const notificationService = {
  /**
   * Check if email notifications are enabled
   */
  areEmailNotificationsEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.email.enabled;
  },

  /**
   * Check if internal notifications are enabled
   */
  areInternalNotificationsEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.internal.enabled;
  },

  /**
   * Check if a specific email notification type is enabled
   */
  isEmailNotificationEnabled: async (type: keyof NotificationSettings['email']): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    
    if (type === 'enabled') {
      return settings.email.enabled;
    }
    
    return settings.email.enabled && settings.email[type];
  },

  /**
   * Get inventory alert threshold
   */
  getInventoryAlertThreshold: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.inventoryAlerts.threshold;
  },

  /**
   * Check if inventory alerts are enabled
   */
  areInventoryAlertsEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.inventoryAlerts.enabled;
  },

  /**
   * Get sales milestone settings
   */
  getSalesMilestones: async (): Promise<NotificationSettings['salesMilestones']> => {
    const settings = await SettingsService.getSettings();
    return settings.salesMilestones;
  },

  /**
   * Check if a specific security alert is enabled
   */
  isSecurityAlertEnabled: async (type: keyof NotificationSettings['securityAlerts']): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.securityAlerts[type];
  },
};

export default SettingsService;
