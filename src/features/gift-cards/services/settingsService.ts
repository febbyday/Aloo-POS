import { createSettingsService } from '@/lib/settings';
import { giftCardSettingsSchema } from '../schemas/gift-card-settings.schema';
import type { GiftCardSettings } from '../schemas/gift-card-settings.schema';

// Default settings
const defaultSettings: GiftCardSettings = {
  enableEmailDelivery: true,
  enablePrintFormat: true,
  enableDigitalWallet: false,
  defaultExpirationPeriod: 90, // 90 days
  defaultTemplate: "4", // ID of the default template
  codePrefix: "GIFT",
  codeLength: 16,
  allowManualCodes: true,
};

/**
 * Gift card settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<GiftCardSettings>('gift-cards', {
  defaultSettings,
  schema: giftCardSettingsSchema,
  apiEndpoint: 'gift-cards/settings',
  cacheable: true,
});

// For backward compatibility, maintain the default export
export default SettingsService;