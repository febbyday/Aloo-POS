import { z } from 'zod';

/**
 * Validation schema for pricing settings
 */
export const pricingSettingsSchema = z.object({
  // Price Calculation Settings
  defaultPriceCalculation: z.enum(["markup", "margin"]).default("markup"),
  defaultMarkupPercentage: z.number().min(0).max(1000).default(50),
  defaultMarginPercentage: z.number().min(0).max(100).default(33),
  minimumMarginPercentage: z.number().min(0).max(100).default(10),
  roundPricesToNearest: z.number().min(0).default(0.99),
  enforceMinimumMargin: z.boolean().default(true),

  // Tax Settings
  defaultTaxRate: z.number().min(0).max(100).default(20),
  includeTaxInPrice: z.boolean().default(true),
  enableAutomaticTaxCalculation: z.boolean().default(true),
  taxCalculationMethod: z.enum(["inclusive", "exclusive"]).default("inclusive"),

  // Currency Settings
  defaultCurrency: z.string().default("USD"),
  currencyPosition: z.enum(["before", "after"]).default("before"),
  thousandsSeparator: z.string().max(1).default(","),
  decimalSeparator: z.string().max(1).default("."),
  decimalPlaces: z.number().min(0).max(4).default(2),

  // Discount Settings
  maximumDiscountPercentage: z.number().min(0).max(100).default(50),
  allowStackingDiscounts: z.boolean().default(false),
  minimumOrderValueForDiscount: z.number().min(0).default(0),
  enableAutomaticDiscounts: z.boolean().default(true),
});

/**
 * Type definition derived from the schema
 */
export type PricingSettings = z.infer<typeof pricingSettingsSchema>;
