import { createSettingsService } from '@/lib/settings';
import { taxSettingsSchema, TaxSettings } from '../schemas/tax-settings.schema';

// Default tax settings
const defaultSettings: TaxSettings = {
  rates: [
    {
      id: 'tax_standard',
      name: 'Standard Rate',
      rate: 10,
      isDefault: true,
    },
    {
      id: 'tax_reduced',
      name: 'Reduced Rate',
      rate: 5,
      isDefault: false,
    },
    {
      id: 'tax_zero',
      name: 'Zero Rate',
      rate: 0,
      isDefault: false,
    },
  ],
  rules: [],
  currency: {
    code: 'USD',
    symbol: '$',
    position: 'before',
    decimalPlaces: 2,
  },
  multipleCurrencies: {
    enabled: false,
    currencies: [],
  },
};

/**
 * Tax settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<TaxSettings>('tax', {
  defaultSettings,
  schema: taxSettingsSchema,
  apiEndpoint: 'settings/tax',
  cacheable: true,
});

/**
 * Helper functions for tax operations
 */
export const taxService = {
  /**
   * Get the default tax rate
   */
  getDefaultTaxRate: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    const defaultRate = settings.rates.find(rate => rate.isDefault);
    return defaultRate ? defaultRate.rate : 0;
  },

  /**
   * Get tax rate by ID
   */
  getTaxRateById: async (id: string): Promise<number> => {
    const settings = await SettingsService.getSettings();
    const rate = settings.rates.find(rate => rate.id === id);
    return rate ? rate.rate : 0;
  },

  /**
   * Get tax rate by region
   */
  getTaxRateByRegion: async (region: string): Promise<number> => {
    const settings = await SettingsService.getSettings();
    const rule = settings.rules.find(rule => rule.region === region);
    
    if (!rule) {
      return await taxService.getDefaultTaxRate();
    }
    
    const rate = settings.rates.find(rate => rate.id === rule.taxRateId);
    return rate ? rate.rate : 0;
  },

  /**
   * Calculate tax amount
   */
  calculateTax: async (amount: number, taxRateId?: string, region?: string): Promise<number> => {
    let taxRate: number;
    
    if (taxRateId) {
      taxRate = await taxService.getTaxRateById(taxRateId);
    } else if (region) {
      taxRate = await taxService.getTaxRateByRegion(region);
    } else {
      taxRate = await taxService.getDefaultTaxRate();
    }
    
    return (amount * taxRate) / 100;
  },
};

export default SettingsService;
