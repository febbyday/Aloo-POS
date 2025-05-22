import { createSettingsService } from '@/lib/settings';
import { productSettingsSchema, ProductSettings } from '../schemas/product-settings.schema';

// Default product settings
const defaultSettings: ProductSettings = {
  inventory: {
    trackInventory: true,
    allowNegativeStock: false,
    lowStockThreshold: 5,
    autoOrderThreshold: 3,
    enableBarcodes: true,
    barcodeFormat: 'CODE128',
    barcodePrefix: '',
  },
  pricing: {
    enableTax: true,
    defaultTaxRate: 10,
    enableDiscount: true,
    maxDiscountPercent: 50,
    enableCostTracking: true,
    defaultMarkupPercent: 50,
    roundPricesToNearestCent: true,
  },
  display: {
    defaultView: 'grid',
    itemsPerPage: 24,
    showOutOfStock: true,
    showImages: true,
    defaultSortOrder: 'name',
  },
  variations: {
    enabled: true,
    maxVariationsPerProduct: 50,
    defaultAttributes: ['Size', 'Color'],
  },
};

/**
 * Product settings service
 * Uses the unified settings architecture
 */
export const SettingsService = createSettingsService<ProductSettings>('product', {
  defaultSettings,
  schema: productSettingsSchema,
  apiEndpoint: 'settings/product',
  cacheable: true,
});

/**
 * Helper functions for product operations
 */
export const productService = {
  /**
   * Check if inventory tracking is enabled
   */
  isInventoryTrackingEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.inventory.trackInventory;
  },

  /**
   * Check if negative stock is allowed
   */
  isNegativeStockAllowed: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.inventory.allowNegativeStock;
  },

  /**
   * Get low stock threshold
   */
  getLowStockThreshold: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.inventory.lowStockThreshold;
  },

  /**
   * Check if tax is enabled
   */
  isTaxEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.pricing.enableTax;
  },

  /**
   * Get default tax rate
   */
  getDefaultTaxRate: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.pricing.defaultTaxRate;
  },

  /**
   * Check if discounts are enabled
   */
  areDiscountsEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.pricing.enableDiscount;
  },

  /**
   * Get maximum discount percentage
   */
  getMaxDiscountPercent: async (): Promise<number> => {
    const settings = await SettingsService.getSettings();
    return settings.pricing.maxDiscountPercent;
  },

  /**
   * Check if variations are enabled
   */
  areVariationsEnabled: async (): Promise<boolean> => {
    const settings = await SettingsService.getSettings();
    return settings.variations.enabled;
  },

  /**
   * Get default product attributes
   */
  getDefaultAttributes: async (): Promise<string[]> => {
    const settings = await SettingsService.getSettings();
    return settings.variations.defaultAttributes;
  },
};

export default SettingsService;
