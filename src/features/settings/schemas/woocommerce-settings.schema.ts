import { z } from 'zod';

/**
 * Validation schema for WooCommerce settings
 */
export const wooCommerceSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  storeUrl: z.string().url("Please enter a valid URL").default(""),
  consumerKey: z.string().min(1, "Consumer Key is required").default(""),
  consumerSecret: z.string().min(1, "Consumer Secret is required").default(""),
  sync: z.object({
    products: z.object({
      enabled: z.boolean().default(true),
      frequency: z.enum(["realtime", "hourly", "daily", "manual"]).default("hourly"),
      importImages: z.boolean().default(true),
      importCategories: z.boolean().default(true),
      importAttributes: z.boolean().default(true),
    }),
    inventory: z.object({
      enabled: z.boolean().default(true),
      syncBidirectional: z.boolean().default(false),
      threshold: z.number().min(0).default(5),
    }),
    orders: z.object({
      import: z.boolean().default(true),
      defaultStatus: z.string().default("processing"),
      autoComplete: z.boolean().default(false),
      notifications: z.boolean().default(true),
    }),
    customers: z.object({
      sync: z.boolean().default(true),
      importExisting: z.boolean().default(false),
    }),
  }),
  prices: z.object({
    allowOverride: z.boolean().default(false),
    useWooCommercePricing: z.boolean().default(false),
  }),
});

/**
 * Type definition derived from the schema
 */
export type WooCommerceSettings = z.infer<typeof wooCommerceSettingsSchema>;
