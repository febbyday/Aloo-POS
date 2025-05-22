import { z } from 'zod';

/**
 * Validation schema for email settings
 */
export const emailSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  sender: z.object({
    name: z.string().default('POS System'),
    email: z.string().email("Please enter a valid email").default('noreply@posapp.com'),
  }),
  smtp: z.object({
    host: z.string().min(1, "SMTP host is required").default('smtp.example.com'),
    port: z.number().int().min(1).max(65535).default(587),
    secure: z.boolean().default(false),
    auth: z.object({
      user: z.string().default(''),
      pass: z.string().default(''),
    }),
  }),
  templates: z.object({
    orderConfirmation: z.boolean().default(true),
    receiptEmail: z.boolean().default(true),
    welcomeEmail: z.boolean().default(true),
    passwordReset: z.boolean().default(true),
    stockAlert: z.boolean().default(true),
    customTemplate: z.string().default(''),
  }),
  notifications: z.object({
    sendOrderConfirmation: z.boolean().default(true),
    sendReceiptEmail: z.boolean().default(true),
    sendStockAlerts: z.boolean().default(true),
    sendDailySummary: z.boolean().default(false),
    sendWeeklySummary: z.boolean().default(true),
  }),
});

/**
 * Type definition derived from the schema
 */
export type EmailSettings = z.infer<typeof emailSettingsSchema>;
