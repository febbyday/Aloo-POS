import { createSettingsService } from '@/lib/settings';
import { receiptSettingsSchema, ReceiptSettings } from '../schemas/receipt-settings.schema';

// Default receipt settings
const defaultSettings: ReceiptSettings = {
  logo: {
    enabled: true,
    url: '',
    maxHeight: 80,
  },
  customText: {
    header: '',
    footer: 'Thank you for your purchase!',
    disclaimer: 'All sales are final. Returns accepted within 30 days with receipt.',
  },
  format: {
    paperSize: '80mm',
    fontSize: 12,
    showBarcode: true,
  },
  digital: {
    enabled: true,
    emailCopy: true,
    smsNotification: false,
  },
};

/**
 * Receipt settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<ReceiptSettings>('receipt', {
  defaultSettings,
  schema: receiptSettingsSchema,
  apiEndpoint: 'settings/receipt',
  cacheable: true,
});

export default SettingsService;
