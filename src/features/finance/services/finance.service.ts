import { createSettingsService } from '@/lib/settings';
import { financeSettingsSchema, FinanceSettings } from '../schemas/finance-settings.schema';

// Default finance settings
const defaultSettings: FinanceSettings = {
  currency: "USD",
  taxEnabled: true,
  defaultTaxRate: "standard",
  fiscalizationEnabled: false,
  fiscalizationSettings: {},
  paymentMethods: [
    {
      id: "cash",
      name: "Cash",
      icon: "Banknote",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "card",
      name: "Card",
      icon: "CreditCard",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "mobile",
      name: "Mobile Money",
      icon: "Smartphone",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "Building",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "installments",
      name: "Pay in Installments",
      icon: "Calendar",
      enabled: true,
      systemDefined: true,
    },
  ],
  receiptFooter: "Thank you for your business!",
  receiptHeader: "Official Receipt",
  showTaxOnReceipt: true,
  requireReconciliation: true,
  reconciliationFrequency: "daily",
};

/**
 * Finance settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<FinanceSettings>('finance', {
  defaultSettings,
  schema: financeSettingsSchema,
  apiEndpoint: 'settings/finance',
  cacheable: true,
});

/**
 * Helper functions for finance operations
 */
export const financeService = {
  /**
   * Get currency
   */
  getCurrency: async (): Promise<string> => {
    const settings = await SettingsService.getSettings();
    return settings.currency;
  },

  /**
   * Get payment methods
   */
  getPaymentMethods: async () => {
    const settings = await SettingsService.getSettings();
    return settings.paymentMethods.filter(method => method.enabled);
  },

  /**
   * Get receipt settings
   */
  getReceiptSettings: async () => {
    const settings = await SettingsService.getSettings();
    return {
      header: settings.receiptHeader,
      footer: settings.receiptFooter,
      showTax: settings.showTaxOnReceipt,
    };
  },

  /**
   * Check if tax is enabled
   */
  isTaxEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.taxEnabled;
  },

  /**
   * Get default tax rate
   */
  getDefaultTaxRate: async (): Promise<string | undefined> => {
    const settings = await SettingsService.getSettings();
    return settings.defaultTaxRate;
  },
};

export default SettingsService;
