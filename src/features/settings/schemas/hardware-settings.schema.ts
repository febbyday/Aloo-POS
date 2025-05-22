import { z } from 'zod';

/**
 * Validation schema for hardware settings
 */
export const hardwareSettingsSchema = z.object({
  printers: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Printer name is required"),
      type: z.enum(['receipt', 'label', 'document']),
      connection: z.enum(['usb', 'network', 'bluetooth']),
      isDefault: z.boolean().default(false),
    })
  ).default([]),
  cashDrawer: z.object({
    enabled: z.boolean().default(true),
    openTrigger: z.enum(['after_sale', 'manual', 'both']).default('after_sale'),
    printer: z.string().default(''),
  }),
  scanner: z.object({
    enabled: z.boolean().default(true),
    type: z.enum(['usb', 'bluetooth', 'camera']).default('usb'),
    prefix: z.string().default(''),
    suffix: z.string().default(''),
  }),
  display: z.object({
    customerDisplay: z.boolean().default(false),
    brightness: z.number().min(1).max(100).default(80),
    orientation: z.enum(['landscape', 'portrait']).default('landscape'),
    timeout: z.number().min(0).default(300),
  }),
});

/**
 * Type definition derived from the schema
 */
export type HardwareSettings = z.infer<typeof hardwareSettingsSchema>;
