import { createSettingsService } from '@/lib/settings';
import { securitySettingsSchema, SecuritySettings } from '../schemas/security-settings.schema';

// Default security settings
const defaultSettings: SecuritySettings = {
  password: {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true,
    expiryDays: 90,
  },
  twoFactor: {
    enabled: false,
    method: 'email',
  },
  session: {
    timeout: 30,
    maxAttempts: 5,
    lockoutDuration: 15,
  },
  ipRestriction: {
    enabled: false,
    allowedIps: [],
  },
};

/**
 * Security settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<SecuritySettings>('security', {
  defaultSettings,
  schema: securitySettingsSchema,
  apiEndpoint: 'settings/security',
  cacheable: true,
});

export default SettingsService;
