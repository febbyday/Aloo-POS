import { GiftCardSettings } from "../../types/gift-cards";

// Default settings
const defaultSettings: GiftCardSettings = {
  enableEmailDelivery: true,
  enablePrintFormat: true,
  enableDigitalWallet: false,
  defaultExpirationPeriod: 90, // 90 days
  defaultTemplate: "4", // ID of the default template
  codePrefix: "GIFT",
  codeLength: 16,
  allowManualCodes: true,
};

// Settings service
export const SettingsService = {
  // Get current settings
  getSettings: async (): Promise<GiftCardSettings> => {
    // In a real app, this would fetch from an API or local storage
    const storedSettings = localStorage.getItem('giftCardSettings');
    if (storedSettings) {
      try {
        return JSON.parse(storedSettings);
      } catch (error) {
        console.error('Error parsing stored settings', error);
        return { ...defaultSettings };
      }
    }
    return { ...defaultSettings };
  },

  // Save settings
  saveSettings: async (settings: GiftCardSettings): Promise<void> => {
    // In a real app, this would save to an API
    try {
      localStorage.setItem('giftCardSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings', error);
      throw new Error('Failed to save settings');
    }
    return Promise.resolve();
  },

  // Reset settings to defaults
  resetSettings: async (): Promise<GiftCardSettings> => {
    localStorage.removeItem('giftCardSettings');
    return { ...defaultSettings };
  }
};

export default SettingsService; 