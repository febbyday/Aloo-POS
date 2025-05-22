import { z } from 'zod';

/**
 * Validation schema for appearance settings
 */
export const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  accentColor: z.string().default('#0284c7'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  borderRadius: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
  animation: z.object({
    enabled: z.boolean().default(true),
    reducedMotion: z.boolean().default(false),
  }),
  layout: z.object({
    sidebarCollapsed: z.boolean().default(false),
    contentWidth: z.enum(['full', 'contained']).default('contained'),
    menuPosition: z.enum(['top', 'side']).default('side'),
    compactMode: z.boolean().default(false),
  }),
  cards: z.object({
    shadow: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
    hover: z.boolean().default(true),
  }),
  tables: z.object({
    striped: z.boolean().default(true),
    compact: z.boolean().default(false),
    bordered: z.boolean().default(false),
  }),
});

/**
 * Type definition derived from the schema
 */
export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>;
