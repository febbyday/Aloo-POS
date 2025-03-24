// Base settings interface for common properties
export interface BaseSettings {
  enabled: boolean;
  updatedAt: string;
}

// Pricing related settings
export interface PricingSettings extends BaseSettings {
  defaultPriceCalculation: "markup" | "margin";
  defaultMarkupPercentage: number;
  defaultMarginPercentage: number;
  minimumMarginPercentage: number;
  // ... other pricing specific settings
}

// Market related settings
export interface MarketSettings extends BaseSettings {
  marketCodePrefix: string;
  enableLocationTracking: boolean;
  // ... other market specific settings
}

// Product related settings
export interface ProductSettings extends BaseSettings {
  defaultUnit: string;
  defaultCategory: string;
  // ... other product specific settings
}