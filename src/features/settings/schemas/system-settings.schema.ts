import { z } from 'zod';

/**
 * Validation schema for system settings
 */
export const systemSettingsSchema = z.object({
  archiving: z.object({
    enabled: z.boolean().default(true),
    olderThan: z.number().min(1).default(90),
    archiveFormat: z.enum(['zip', 'tar']).default('zip'),
  }),
  cache: z.object({
    enabled: z.boolean().default(true),
    maxSize: z.number().min(1).default(100),
    clearInterval: z.number().min(1).default(24),
  }),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    alertThreshold: z.number().min(1).max(100).default(90),
    collectMetrics: z.boolean().default(true),
  }),
  background: z.object({
    maxJobs: z.number().min(1).default(5),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
});

/**
 * Type definition derived from the schema
 */
export type SystemSettings = z.infer<typeof systemSettingsSchema>;
