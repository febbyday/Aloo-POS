// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { z } from 'zod';

// Schedule frequency schema
export const ScheduleFrequencySchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly'
]);

// Schedule configuration schema
export const ScheduleConfigSchema = z.object({
  frequency: ScheduleFrequencySchema,
  dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday, 6 = Saturday
  dayOfMonth: z.number().min(1).max(31).optional(),
  monthOfYear: z.number().min(1).max(12).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
  timezone: z.string()
});

// Report format schema
export const ReportFormatSchema = z.enum([
  'pdf',
  'excel',
  'csv'
]);

// Report type schema
export const ReportTypeSchema = z.enum([
  'sales',
  'inventory',
  'financial',
  'staff',
  'custom'
]);

// Report parameters schema
export const ReportParametersSchema = z.object({
  type: ReportTypeSchema,
  format: ReportFormatSchema,
  includeCharts: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
  includeDetails: z.boolean().default(true),
  filters: z.record(z.any()).optional(),
  customQuery: z.string().optional()
});

// Delivery method schema
export const DeliveryMethodSchema = z.enum([
  'email',
  'slack',
  'webhook',
  'ftp'
]);

// Delivery configuration schema
export const DeliveryConfigSchema = z.object({
  method: DeliveryMethodSchema,
  recipients: z.array(z.string()).when('method', {
    is: 'email',
    then: z.array(z.string().email('Invalid email address')),
    otherwise: z.array(z.string())
  }),
  webhookUrl: z.string().url().optional(),
  ftpConfig: z.object({
    host: z.string(),
    port: z.number(),
    username: z.string(),
    password: z.string(),
    directory: z.string()
  }).optional()
});

// Scheduled report schema
export const ScheduledReportSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  schedule: ScheduleConfigSchema,
  parameters: ReportParametersSchema,
  delivery: DeliveryConfigSchema,
  isActive: z.boolean().default(true),
  lastRun: z.date().nullable(),
  nextRun: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string()
});

// Export types
export type ScheduleFrequency = z.infer<typeof ScheduleFrequencySchema>;
export type ScheduleConfig = z.infer<typeof ScheduleConfigSchema>;
export type ReportFormat = z.infer<typeof ReportFormatSchema>;
export type ReportType = z.infer<typeof ReportTypeSchema>;
export type ReportParameters = z.infer<typeof ReportParametersSchema>;
export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema>;
export type DeliveryConfig = z.infer<typeof DeliveryConfigSchema>;
export type ScheduledReport = z.infer<typeof ScheduledReportSchema>;

// Helper type for report execution status
export type ReportExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

// Helper type for report execution result
export type ReportExecutionResult = {
  id: string;
  reportId: string;
  status: ReportExecutionStatus;
  startTime: Date;
  endTime?: Date;
  error?: string;
  outputUrl?: string;
  deliveryStatus?: {
    method: DeliveryMethod;
    status: 'success' | 'failed';
    error?: string;
  };
}; 