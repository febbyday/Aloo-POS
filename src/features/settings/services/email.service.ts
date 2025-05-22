import { createSettingsService } from '@/lib/settings';
import { emailSettingsSchema, EmailSettings } from '../schemas/email-settings.schema';

// Default email settings
const defaultSettings: EmailSettings = {
  enabled: true,
  sender: {
    name: 'POS System',
    email: 'noreply@posapp.com',
  },
  smtp: {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: '',
    },
  },
  templates: {
    orderConfirmation: true,
    receiptEmail: true,
    welcomeEmail: true,
    passwordReset: true,
    stockAlert: true,
    customTemplate: '',
  },
  notifications: {
    sendOrderConfirmation: true,
    sendReceiptEmail: true,
    sendStockAlerts: true,
    sendDailySummary: false,
    sendWeeklySummary: true,
  },
};

/**
 * Email settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<EmailSettings>('email', {
  defaultSettings,
  schema: emailSettingsSchema,
  apiEndpoint: 'settings/email',
  cacheable: true,
});

/**
 * Helper functions for email operations
 */
export const emailService = {
  /**
   * Check if email is enabled
   */
  isEmailEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.enabled;
  },

  /**
   * Get sender information
   */
  getSenderInfo: async (): Promise<EmailSettings['sender']> => {
    const settings = await SettingsService.getSettings();
    return settings.sender;
  },

  /**
   * Get SMTP configuration
   */
  getSmtpConfig: async (): Promise<EmailSettings['smtp']> => {
    const settings = await SettingsService.getSettings();
    return settings.smtp;
  },

  /**
   * Check if a specific notification type is enabled
   */
  isNotificationEnabled: async (type: keyof EmailSettings['notifications']): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.notifications[type];
  },

  /**
   * Check if a specific template is enabled
   */
  isTemplateEnabled: async (type: keyof EmailSettings['templates']): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    
    // Handle the custom template differently
    if (type === 'customTemplate') {
      return settings.templates.customTemplate !== '';
    }
    
    return settings.templates[type];
  },
};

export default SettingsService;
