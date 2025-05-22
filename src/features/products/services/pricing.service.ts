import { createSettingsService } from '@/lib/settings';
import { pricingSettingsSchema, PricingSettings } from '../schemas/pricing-settings.schema';

// Default pricing settings
const defaultSettings: PricingSettings = {
  defaultPriceCalculation: "markup",
  defaultMarkupPercentage: 50,
  defaultMarginPercentage: 33,
  minimumMarginPercentage: 10,
  roundPricesToNearest: 0.99,
  enforceMinimumMargin: true,
  defaultTaxRate: 20,
  includeTaxInPrice: true,
  enableAutomaticTaxCalculation: true,
  taxCalculationMethod: "inclusive",
  defaultCurrency: "USD",
  currencyPosition: "before",
  thousandsSeparator: ",",
  decimalSeparator: ".",
  decimalPlaces: 2,
  maximumDiscountPercentage: 50,
  allowStackingDiscounts: false,
  minimumOrderValueForDiscount: 0,
  enableAutomaticDiscounts: true,
};

/**
 * Pricing settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<PricingSettings>('pricing', {
  defaultSettings,
  schema: pricingSettingsSchema,
  apiEndpoint: 'settings/pricing',
  cacheable: true,
});

/**
 * Helper functions for pricing calculations
 */
export const pricingService = {
  /**
   * Calculate price with markup
   * @param costPrice Cost price
   * @param markupPercentage Markup percentage
   * @returns Price with markup
   */
  calculateMarkup: (costPrice: number, markupPercentage: number): number => {
    return costPrice * (1 + markupPercentage / 100);
  },

  /**
   * Calculate price with margin
   * @param costPrice Cost price
   * @param marginPercentage Margin percentage
   * @returns Price with margin
   */
  calculateMargin: (costPrice: number, marginPercentage: number): number => {
    return costPrice / (1 - marginPercentage / 100);
  },

  /**
   * Format price according to settings
   * @param price Price to format
   * @returns Formatted price
   */
  formatPrice: async (price: number): Promise<string> => {
    const settings = await SettingsService.getSettings();
    
    // Format the number with the specified decimal places
    const formattedNumber = price.toFixed(settings.decimalPlaces);
    
    // Split the number into integer and decimal parts
    const [integerPart, decimalPart] = formattedNumber.split('.');
    
    // Format the integer part with thousands separator
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandsSeparator);
    
    // Combine the parts with the decimal separator
    const formattedPrice = decimalPart 
      ? `${formattedIntegerPart}${settings.decimalSeparator}${decimalPart}` 
      : formattedIntegerPart;
    
    // Add the currency symbol in the correct position
    return settings.currencyPosition === 'before' 
      ? `${getCurrencySymbol(settings.defaultCurrency)}${formattedPrice}` 
      : `${formattedPrice}${getCurrencySymbol(settings.defaultCurrency)}`;
  },

  /**
   * Get default price calculation method
   * @returns Default price calculation method
   */
  getDefaultPriceCalculation: async (): Promise<"markup" | "margin"> => {
    const settings = await SettingsService.getSettings();
    return settings.defaultPriceCalculation;
  },

  /**
   * Get default markup percentage
   * @returns Default markup percentage
   */
  getDefaultMarkupPercentage: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.defaultMarkupPercentage;
  },

  /**
   * Get default margin percentage
   * @returns Default margin percentage
   */
  getDefaultMarginPercentage: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.defaultMarginPercentage;
  },

  /**
   * Get default tax rate
   * @returns Default tax rate
   */
  getDefaultTaxRate: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.defaultTaxRate;
  },

  /**
   * Check if tax is included in price
   * @returns True if tax is included in price
   */
  isTaxIncludedInPrice: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.includeTaxInPrice;
  },

  /**
   * Get default currency
   * @returns Default currency
   */
  getDefaultCurrency: async (): Promise<string> => {
    const settings = await SettingsService.getSettings();
    return settings.defaultCurrency;
  },
};

/**
 * Helper function to get currency symbol
 * @param currencyCode Currency code
 * @returns Currency symbol
 */
function getCurrencySymbol(currencyCode: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    RUB: '₽',
    KRW: '₩',
    BRL: 'R$',
    // Add more currencies as needed
  };
  
  return currencySymbols[currencyCode] || currencyCode;
}

export default SettingsService;
