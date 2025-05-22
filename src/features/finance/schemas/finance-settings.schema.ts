import { z } from 'zod';

/**
 * Payment method schema
 */
const PaymentMethodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Payment method name is required"),
  icon: z.string(),
  enabled: z.boolean().default(true),
  systemDefined: z.boolean().default(false),
});

/**
 * Validation schema for finance settings
 */
export const financeSettingsSchema = z.object({
  currency: z.string().default("USD"),
  taxEnabled: z.boolean().default(true),
  defaultTaxRate: z.string().optional(),
  fiscalizationEnabled: z.boolean().default(false),
  fiscalizationSettings: z.record(z.any()).optional(),
  paymentMethods: z.array(PaymentMethodSchema).default([
    {
      id: "cash",
      name: "Cash",
      icon: "Banknote",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "card",
      name: "Card",
      icon: "CreditCard",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "mobile",
      name: "Mobile Money",
      icon: "Smartphone",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "Building",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "installments",
      name: "Pay in Installments",
      icon: "Calendar",
      enabled: true,
      systemDefined: true,
    },
  ]),
  receiptFooter: z.string().optional(),
  receiptHeader: z.string().optional(),
  showTaxOnReceipt: z.boolean().default(true),
  requireReconciliation: z.boolean().default(true),
  reconciliationFrequency: z.enum(["daily", "weekly", "custom"]).default("daily"),
});

/**
 * Type definition derived from the schema
 */
export type FinanceSettings = z.infer<typeof financeSettingsSchema>;
