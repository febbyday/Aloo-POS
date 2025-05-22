import { z } from 'zod';

/**
 * Validation schema for company settings
 */
export const companySettingsSchema = z.object({
  name: z.string().min(1, "Company name is required").default('My Company'),
  legalName: z.string().default(''),
  taxId: z.string().default(''),
  logo: z.string().default(''),
  contact: z.object({
    email: z.string().email("Please enter a valid email").or(z.string().length(0)).default(''),
    phone: z.string().default(''),
    website: z.string().url("Please enter a valid URL").or(z.string().length(0)).default(''),
    socialMedia: z.string().default(''),
    supportEmail: z.string().email("Please enter a valid email").or(z.string().length(0)).default(''),
  }).default({}),
  address: z.object({
    street: z.string().default(''),
    city: z.string().default(''),
    state: z.string().default(''),
    postalCode: z.string().default(''),
    country: z.string().default(''),
  }).default({}),
  business: z.object({
    type: z.string().default('Retail'),
    registrationNumber: z.string().default(''),
    foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
    description: z.string().default(''),
    taxId: z.string().default(''),
    fiscalYear: z.object({
      startMonth: z.number().min(1).max(12).default(1),
      startDay: z.number().min(1).max(31).default(1),
    }).default({ startMonth: 1, startDay: 1 }),
  }).default({}),
  branding: z.object({
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color").default('#0284c7'),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color").default('#f59e0b'),
    fontFamily: z.string().default('Inter'),
  }).default({}),
});

/**
 * Type definition derived from the schema
 */
export type CompanySettings = z.infer<typeof companySettingsSchema>;
