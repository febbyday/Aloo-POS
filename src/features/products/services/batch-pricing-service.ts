/**
 * Batch-Enabled Pricing Settings Service
 * 
 * This service provides methods for interacting with pricing settings
 * using batch requests during initialization to improve performance.
 */

import { createBatchSettingsService } from '@/lib/settings/batch-settings-service';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { z } from 'zod';

// Define pricing settings schema
export const pricingSettingsSchema = z.object({
  // Price Calculation Settings
  defaultPriceCalculation: z.enum(["markup", "margin"]),
  defaultMarkupPercentage: z.number().min(0).max(1000),
  defaultMarginPercentage: z.number().min(0).max(100),
  minimumMarginPercentage: z.number().min(0).max(100),
  roundPricesToNearest: z.number().min(0),
  enforceMinimumMargin: z.boolean(),

  // Tax Settings
  defaultTaxRate: z.number().min(0).max(100),
  includeTaxInPrice: z.boolean(),
  enableAutomaticTaxCalculation: z.boolean(),
  taxCalculationMethod: z.enum(["inclusive", "exclusive"]),

  // Currency Settings
  defaultCurrency: z.string(),
  currencyPosition: z.enum(["before", "after"]),
  thousandsSeparator: z.string(),
  decimalSeparator: z.string(),
  decimalPlaces: z.number().min(0).max(10),

  // Discount Settings
  maximumDiscountPercentage: z.number().min(0).max(100),
  allowStackingDiscounts: z.boolean(),
  minimumOrderValueForDiscount: z.number().min(0),
  enableAutomaticDiscounts: z.boolean(),
});

// Define pricing settings type
export type PricingSettings = z.infer<typeof pricingSettingsSchema>;

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
 * Batch-enabled pricing settings service
 * Uses the unified settings architecture with batch requests
 */
export const BatchPricingSettingsService = createBatchSettingsService<PricingSettings>('pricing', {
  defaultSettings,
  schema: pricingSettingsSchema,
  apiEndpoint: 'settings/pricing',
  cacheable: true,
  defaultPriority: RequestPriority.MEDIUM
});

/**
 * Utility functions for price calculations
 */
export const pricingUtils = {
  /**
   * Calculate markup price
   * 
   * @param costPrice Cost price
   * @param markupPercentage Markup percentage
   * @returns Markup price
   */
  calculateMarkup: (costPrice: number, markupPercentage: number): number => {
    return costPrice * (1 + markupPercentage / 100);
  },
  
  /**
   * Calculate margin price
   * 
   * @param costPrice Cost price
   * @param marginPercentage Margin percentage
   * @returns Margin price
   */
  calculateMargin: (costPrice: number, marginPercentage: number): number => {
    return costPrice / (1 - marginPercentage / 100);
  },
  
  /**
   * Calculate discount amount
   * 
   * @param price Original price
   * @param discountPercentage Discount percentage
   * @returns Discount amount
   */
  calculateDiscountAmount: (price: number, discountPercentage: number): number => {
    return price * (discountPercentage / 100);
  },
  
  /**
   * Calculate discounted price
   * 
   * @param price Original price
   * @param discountPercentage Discount percentage
   * @returns Discounted price
   */
  calculateDiscountedPrice: (price: number, discountPercentage: number): number => {
    return price - pricingUtils.calculateDiscountAmount(price, discountPercentage);
  },
  
  /**
   * Calculate tax amount
   * 
   * @param price Price
   * @param taxRate Tax rate
   * @param isInclusive Whether the price is tax inclusive
   * @returns Tax amount
   */
  calculateTaxAmount: (price: number, taxRate: number, isInclusive: boolean): number => {
    if (isInclusive) {
      return price - (price / (1 + (taxRate / 100)));
    } else {
      return price * (taxRate / 100);
    }
  },
  
  /**
   * Calculate price with tax
   * 
   * @param price Price without tax
   * @param taxRate Tax rate
   * @returns Price with tax
   */
  calculatePriceWithTax: (price: number, taxRate: number): number => {
    return price * (1 + (taxRate / 100));
  },
  
  /**
   * Calculate price without tax
   * 
   * @param priceWithTax Price with tax
   * @param taxRate Tax rate
   * @returns Price without tax
   */
  calculatePriceWithoutTax: (priceWithTax: number, taxRate: number): number => {
    return priceWithTax / (1 + (taxRate / 100));
  },
  
  /**
   * Format price
   * 
   * @param price Price to format
   * @param settings Pricing settings
   * @returns Formatted price
   */
  formatPrice: (price: number, settings: PricingSettings): string => {
    // Format the number with the specified decimal places
    const formattedNumber = price.toFixed(settings.decimalPlaces);
    
    // Split the number into whole and decimal parts
    const [wholePart, decimalPart] = formattedNumber.split('.');
    
    // Format the whole part with thousands separator
    const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, settings.thousandsSeparator);
    
    // Combine the whole and decimal parts with the decimal separator
    const formattedPrice = decimalPart
      ? `${formattedWholePart}${settings.decimalSeparator}${decimalPart}`
      : formattedWholePart;
    
    // Add the currency symbol in the correct position
    return settings.currencyPosition === 'before'
      ? `${settings.defaultCurrency}${formattedPrice}`
      : `${formattedPrice}${settings.defaultCurrency}`;
  }
};

export default BatchPricingSettingsService;
