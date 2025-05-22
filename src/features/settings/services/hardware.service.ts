import { createSettingsService } from '@/lib/settings';
import { hardwareSettingsSchema, HardwareSettings } from '../schemas/hardware-settings.schema';

// Default hardware settings
const defaultSettings: HardwareSettings = {
  printers: [
    {
      id: 'printer_receipt',
      name: 'Receipt Printer',
      type: 'receipt',
      connection: 'usb',
      isDefault: true,
    },
    {
      id: 'printer_label',
      name: 'Label Printer',
      type: 'label',
      connection: 'usb',
      isDefault: false,
    },
  ],
  cashDrawer: {
    enabled: true,
    openTrigger: 'after_sale',
    printer: 'printer_receipt',
  },
  scanner: {
    enabled: true,
    type: 'usb',
    prefix: '',
    suffix: '',
  },
  display: {
    customerDisplay: false,
    brightness: 80,
    orientation: 'landscape',
    timeout: 300,
  },
};

/**
 * Hardware settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<HardwareSettings>('hardware', {
  defaultSettings,
  schema: hardwareSettingsSchema,
  apiEndpoint: 'settings/hardware',
  cacheable: true,
});

/**
 * Helper functions for hardware operations
 */
export const hardwareService = {
  /**
   * Get default printer by type
   */
  getDefaultPrinter: async (type: 'receipt' | 'label' | 'document'): Promise<HardwareSettings['printers'][0] | undefined> => {
    const settings = await SettingsService.getSettings();
    
    // First try to find a default printer of the specified type
    let printer = settings.printers.find(p => p.type === type && p.isDefault);
    
    // If no default printer of that type, just get the first one of that type
    if (!printer) {
      printer = settings.printers.find(p => p.type === type);
    }
    
    return printer;
  },

  /**
   * Get printer by ID
   */
  getPrinterById: async (id: string): Promise<HardwareSettings['printers'][0] | undefined> => {
    const settings = await SettingsService.getSettings();
    return settings.printers.find(p => p.id === id);
  },

  /**
   * Check if cash drawer is enabled
   */
  isCashDrawerEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.cashDrawer.enabled;
  },

  /**
   * Get cash drawer settings
   */
  getCashDrawerSettings: async (): Promise<HardwareSettings['cashDrawer']> => {
    const settings = await SettingsService.getSettings();
    return settings.cashDrawer;
  },

  /**
   * Check if scanner is enabled
   */
  isScannerEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.scanner.enabled;
  },

  /**
   * Get scanner settings
   */
  getScannerSettings: async (): Promise<HardwareSettings['scanner']> => {
    const settings = await SettingsService.getSettings();
    return settings.scanner;
  },
};

export default SettingsService;
