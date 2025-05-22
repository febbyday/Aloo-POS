import { z } from 'zod';

/**
 * Validation schema for gift card settings
 */
export const giftCardSettingsSchema = z.object({
  enableEmailDelivery: z.boolean().default(true),
  enablePrintFormat: z.boolean().default(true),
  enableDigitalWallet: z.boolean().default(false),
  defaultExpirationPeriod: z.number().min(0).default(90),
  defaultTemplate: z.string().default("4"),
  codePrefix: z.string().max(10, 'Prefix cannot exceed 10 characters').default("GIFT"),
  codeLength: z.number().min(8).max(24).default(16),
  allowManualCodes: z.boolean().default(true),
});

/**
 * Type definition derived from the schema
 */
export type GiftCardSettings = z.infer<typeof giftCardSettingsSchema>;
