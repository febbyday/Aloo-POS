import { ConnectionTestResult } from '../types/woocommerce.types';
import { createSettingsService } from '@/lib/settings';
import { wooCommerceSettingsSchema, WooCommerceSettings } from '../schemas/woocommerce-settings.schema';

// Default WooCommerce settings
const defaultSettings: WooCommerceSettings = {
  enabled: false,
  storeUrl: "",
  consumerKey: "",
  consumerSecret: "",
  sync: {
    products: {
      enabled: true,
      frequency: "hourly",
      importImages: true,
      importCategories: true,
      importAttributes: true,
    },
    inventory: {
      enabled: true,
      syncBidirectional: false,
      threshold: 5,
    },
    orders: {
      import: true,
      defaultStatus: "processing",
      autoComplete: false,
      notifications: true,
    },
    customers: {
      sync: true,
      importExisting: false,
    },
  },
  prices: {
    allowOverride: false,
    useWooCommercePricing: false,
  },
};

/**
 * WooCommerce settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<WooCommerceSettings>('woocommerce', {
  defaultSettings,
  schema: wooCommerceSettingsSchema,
  apiEndpoint: 'settings/woocommerce',
  cacheable: true,
});

/**
 * WooCommerce service for integration operations
 */
class WooCommerceService {
    private static instance: WooCommerceService;

    private constructor() {}

    public static getInstance(): WooCommerceService {
        if (!WooCommerceService.instance) {
            WooCommerceService.instance = new WooCommerceService();
        }
        return WooCommerceService.instance;
    }

    /**
     * Test connection to WooCommerce API
     */
    async testConnection(settings: WooCommerceSettings): Promise<ConnectionTestResult> {
        try {
            // Implement actual WooCommerce API connection test here
            const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/products`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${settings.consumerKey}:${settings.consumerSecret}`)
                }
            });

            if (!response.ok) {
                throw new Error('Failed to connect to WooCommerce');
            }

            return {
                success: true,
                message: 'Successfully connected to WooCommerce store',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to connect to WooCommerce store',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get current settings
     * @deprecated Use SettingsService.getSettings() instead
     */
    async loadSettings(): Promise<WooCommerceSettings> {
        return SettingsService.getSettings();
    }

    /**
     * Save settings
     * @deprecated Use SettingsService.saveSettings() instead
     */
    async saveSettings(settings: WooCommerceSettings): Promise<void> {
        return SettingsService.saveSettings(settings);
    }

    // Sync operations
    async syncProducts(): Promise<void> {
        // Get current settings
        const settings = await SettingsService.getSettings();

        // Only sync if enabled
        if (!settings.enabled || !settings.sync.products.enabled) {
            console.log('Product sync is disabled');
            return;
        }

        // Implement product sync logic
        console.log('Syncing products...');
    }

    async syncInventory(): Promise<void> {
        // Get current settings
        const settings = await SettingsService.getSettings();

        // Only sync if enabled
        if (!settings.enabled || !settings.sync.inventory.enabled) {
            console.log('Inventory sync is disabled');
            return;
        }

        // Implement inventory sync logic
        console.log('Syncing inventory...');
    }

    async syncOrders(): Promise<void> {
        // Get current settings
        const settings = await SettingsService.getSettings();

        // Only sync if enabled
        if (!settings.enabled || !settings.sync.orders.import) {
            console.log('Order sync is disabled');
            return;
        }

        // Implement order sync logic
        console.log('Syncing orders...');
    }

    async syncCustomers(): Promise<void> {
        // Get current settings
        const settings = await SettingsService.getSettings();

        // Only sync if enabled
        if (!settings.enabled || !settings.sync.customers.sync) {
            console.log('Customer sync is disabled');
            return;
        }

        // Implement customer sync logic
        console.log('Syncing customers...');
    }
}

export const wooCommerceService = WooCommerceService.getInstance();
export default wooCommerceService;
