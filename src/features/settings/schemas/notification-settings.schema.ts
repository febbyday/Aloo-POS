import { z } from 'zod';

/**
 * Validation schema for notification settings
 */
export const notificationSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean().default(true),
    salesReports: z.boolean().default(true),
    inventoryAlerts: z.boolean().default(true),
    systemAlerts: z.boolean().default(true),
  }),
  internal: z.object({
    enabled: z.boolean().default(true),
    showBadge: z.boolean().default(true),
    sound: z.boolean().default(true),
    desktop: z.boolean().default(true),
    autoRead: z.boolean().default(false),
    keepDays: z.number().min(1).max(365).default(30),
  }),
  inventoryAlerts: z.object({
    enabled: z.boolean().default(true),
    threshold: z.number().min(0).default(5),
  }),
  salesMilestones: z.object({
    enabled: z.boolean().default(true),
    dailyGoal: z.number().min(0).default(1000),
    weeklyGoal: z.number().min(0).default(5000),
    monthlyGoal: z.number().min(0).default(20000),
  }),
  securityAlerts: z.object({
    loginAttempts: z.boolean().default(true),
    systemChanges: z.boolean().default(true),
    backupStatus: z.boolean().default(true),
  }),
});

/**
 * Type definition derived from the schema
 */
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
