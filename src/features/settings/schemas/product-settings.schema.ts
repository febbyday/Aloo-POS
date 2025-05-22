import { z } from 'zod';

/**
 * Validation schema for product settings
 */
export const productSettingsSchema = z.object({
  inventory: z.object({
    trackInventory: z.boolean().default(true),
    allowNegativeStock: z.boolean().default(false),
    lowStockThreshold: z.number().min(0).default(5),
    autoOrderThreshold: z.number().min(0).default(3),
    enableBarcodes: z.boolean().default(true),
    barcodeFormat: z.enum(['CODE128', 'EAN13', 'UPC', 'QR']).default('CODE128'),
    barcodePrefix: z.string().max(5).default(''),
  }),
  pricing: z.object({
    enableTax: z.boolean().default(true),
    defaultTaxRate: z.number().min(0).max(100).default(10),
    enableDiscount: z.boolean().default(true),
    maxDiscountPercent: z.number().min(0).max(100).default(50),
    enableCostTracking: z.boolean().default(true),
    defaultMarkupPercent: z.number().min(0).default(50),
    roundPricesToNearestCent: z.boolean().default(true),
  }),
  display: z.object({
    defaultView: z.enum(['grid', 'list']).default('grid'),
    itemsPerPage: z.number().min(10).max(100).default(24),
    showOutOfStock: z.boolean().default(true),
    showImages: z.boolean().default(true),
    defaultSortOrder: z.enum(['name', 'price', 'newest', 'bestselling']).default('name'),
  }),
  variations: z.object({
    enabled: z.boolean().default(true),
    maxVariationsPerProduct: z.number().min(1).max(100).default(50),
    defaultAttributes: z.array(z.string()).default(['Size', 'Color']),
  }),
});

/**
 * Type definition derived from the schema
 */
export type ProductSettings = z.infer<typeof productSettingsSchema>;
