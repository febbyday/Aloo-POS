import { z } from 'zod';

/**
 * Validation schema for receipt settings
 */
export const receiptSettingsSchema = z.object({
  logo: z.object({
    enabled: z.boolean().default(true),
    url: z.string().default(''),
    maxHeight: z.number().min(20).max(200).default(80),
  }),
  customText: z.object({
    header: z.string().default(''),
    footer: z.string().default(''),
    disclaimer: z.string().default(''),
  }),
  format: z.object({
    paperSize: z.string().default('80mm'),
    fontSize: z.number().min(8).max(16).default(12),
    showBarcode: z.boolean().default(true),
  }),
  digital: z.object({
    enabled: z.boolean().default(true),
    emailCopy: z.boolean().default(true),
    smsNotification: z.boolean().default(false),
  }),
});

/**
 * Type definition derived from the schema
 */
export type ReceiptSettings = z.infer<typeof receiptSettingsSchema>;
