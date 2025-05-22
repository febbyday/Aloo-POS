import { z } from 'zod';

/**
 * Validation schema for payment method
 */
export const paymentMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  allowPartialPayment: z.boolean().default(true),
  allowRefund: z.boolean().default(true),
  processingFee: z.number().min(0).default(0),
  processingFeeType: z.enum(['fixed', 'percentage']).default('percentage'),
  icon: z.string().optional(),
});

/**
 * Validation schema for payment settings
 */
export const paymentSettingsSchema = z.object({
  methods: z.array(paymentMethodSchema).default([]),
  allowMultiplePaymentMethods: z.boolean().default(true),
  requirePaymentForOrders: z.boolean().default(true),
  defaultPaymentMethod: z.string().optional(),
  showPaymentMethodIcons: z.boolean().default(true),
  roundingMethod: z.enum(['none', 'up', 'down', 'nearest']).default('nearest'),
  roundingPrecision: z.number().min(0).max(4).default(2),
  currency: z.object({
    code: z.string().default('USD'),
    symbol: z.string().default('$'),
    position: z.enum(['before', 'after']).default('before'),
    decimalSeparator: z.string().default('.'),
    thousandsSeparator: z.string().default(','),
    decimalPlaces: z.number().min(0).max(4).default(2),
  }),
});

/**
 * Type definition derived from the schema
 */
export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
