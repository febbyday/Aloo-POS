import { z } from 'zod';

/**
 * Validation schema for tax settings
 */
export const taxSettingsSchema = z.object({
  rates: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Tax name is required"),
      rate: z.number().min(0, "Rate must be a positive number"),
      isDefault: z.boolean().default(false),
    })
  ).default([]),
  rules: z.array(
    z.object({
      id: z.string(),
      region: z.string().min(1, "Region is required"),
      taxRateId: z.string().min(1, "Tax rate ID is required"),
    })
  ).default([]),
  currency: z.object({
    code: z.string().min(3).max(3).default('USD'),
    symbol: z.string().min(1).default('$'),
    position: z.enum(['before', 'after']).default('before'),
    decimalPlaces: z.number().min(0).max(4).default(2),
  }),
  multipleCurrencies: z.object({
    enabled: z.boolean().default(false),
    currencies: z.array(z.string()).default([]),
  }),
});

/**
 * Type definition derived from the schema
 */
export type TaxSettings = z.infer<typeof taxSettingsSchema>;
