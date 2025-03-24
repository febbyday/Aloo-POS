import { z } from "zod";

// Base schema for common validations
const baseSettingsSchema = z.object({
  enabled: z.boolean(),
  updatedAt: z.string().datetime(),
});

// Specific schemas extending the base
export const pricingSettingsSchema = baseSettingsSchema.extend({
  defaultPriceCalculation: z.enum(["markup", "margin"]),
  defaultMarkupPercentage: z.number().min(0).max(1000),
  defaultMarginPercentage: z.number().min(0).max(100),
  // ... other pricing validations
});

export const marketSettingsSchema = baseSettingsSchema.extend({
  marketCodePrefix: z.string().max(10),
  enableLocationTracking: z.boolean(),
  // ... other market validations
});