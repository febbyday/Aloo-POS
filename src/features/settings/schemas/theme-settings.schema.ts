import { z } from 'zod';

/**
 * Validation schema for theme settings
 */
export const themeSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color").default('#0284c7'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).default('medium'),
  animation: z.object({
    enabled: z.boolean().default(true),
    reducedMotion: z.boolean().default(false),
  }).optional().default({
    enabled: true,
    reducedMotion: false,
  }),
  layout: z.object({
    sidebarCollapsed: z.boolean().default(false),
    contentWidth: z.enum(['contained', 'full']).default('contained'),
    menuPosition: z.enum(['side', 'top']).default('side'),
    compactMode: z.boolean().default(false),
  }).optional().default({
    sidebarCollapsed: false,
    contentWidth: 'contained',
    menuPosition: 'side',
    compactMode: false,
  }),
  cards: z.object({
    shadow: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
    hover: z.boolean().default(true),
  }).optional().default({
    shadow: 'medium',
    hover: true,
  }),
  tables: z.object({
    striped: z.boolean().default(true),
    compact: z.boolean().default(false),
    bordered: z.boolean().default(false),
  }).optional().default({
    striped: true,
    compact: false,
    bordered: false,
  }),
});

/**
 * Type definition derived from the schema
 */
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
