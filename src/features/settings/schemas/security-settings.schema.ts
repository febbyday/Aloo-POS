import { z } from 'zod';

/**
 * Validation schema for security settings
 */
export const securitySettingsSchema = z.object({
  password: z.object({
    minLength: z.number().min(6).max(100).default(8),
    requireSpecialChar: z.boolean().default(true),
    requireNumber: z.boolean().default(true),
    requireUppercase: z.boolean().default(true),
    expiryDays: z.number().min(0).default(90),
  }),
  twoFactor: z.object({
    enabled: z.boolean().default(false),
    method: z.enum(['email', 'authenticator', 'sms']).default('email'),
  }),
  session: z.object({
    timeout: z.number().min(1).default(30),
    maxAttempts: z.number().min(1).default(5),
    lockoutDuration: z.number().min(1).default(15),
  }),
  ipRestriction: z.object({
    enabled: z.boolean().default(false),
    allowedIps: z.array(z.string()).default([]),
  }),
});

/**
 * Type definition derived from the schema
 */
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
