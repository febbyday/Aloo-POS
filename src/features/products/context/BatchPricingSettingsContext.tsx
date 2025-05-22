/**
 * BatchPricingSettingsProvider
 * 
 * This provider manages pricing settings with optimized batch requests during initialization.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useProviderBatchInit } from '@/lib/hooks/useProviderBatchInit';
import { RequestPriority } from '@/lib/api/initialization-batch-manager';
import { logger } from '@/lib/logging/logger';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { useToast } from '@/lib/toast';

// Define pricing settings types
export interface PricingSettings {
  // Price Calculation Settings
  defaultPriceCalculation: "markup" | "margin";
  defaultMarkupPercentage: number;
  defaultMarginPercentage: number;
  minimumMarginPercentage: number;
  roundPricesToNearest: number;
  enforceMinimumMargin: boolean;

  // Tax Settings
  defaultTaxRate: number;
  includeTaxInPrice: boolean;
  enableAutomaticTaxCalculation: boolean;
  taxCalculationMethod: "inclusive" | "exclusive";

  // Currency Settings
  defaultCurrency: string;
  currencyPosition: "before" | "after";
  thousandsSeparator: string;
  decimalSeparator: string;
  decimalPlaces: number;

  // Discount Settings
  maximumDiscountPercentage: number;
  allowStackingDiscounts: boolean;
  minimumOrderValueForDiscount: number;
  enableAutomaticDiscounts: boolean;
}

// Default pricing settings
const defaultSettings: PricingSettings = {
  defaultPriceCalculation: "markup",
  defaultMarkupPercentage: 50,
  defaultMarginPercentage: 33,
  minimumMarginPercentage: 10,
  roundPricesToNearest: 0.99,
  enforceMinimumMargin: true,
  defaultTaxRate: 20,
  includeTaxInPrice: true,
  enableAutomaticTaxCalculation: true,
  taxCalculationMethod: "inclusive",
  defaultCurrency: "USD",
  currencyPosition: "before",
  thousandsSeparator: ",",
  decimalSeparator: ".",
  decimalPlaces: 2,
  maximumDiscountPercentage: 50,
  allowStackingDiscounts: false,
  minimumOrderValueForDiscount: 0,
  enableAutomaticDiscounts: true,
};

interface BatchPricingSettingsContextType {
  /**
   * Pricing settings
   */
  settings: PricingSettings;
  
  /**
   * Whether settings are loading
   */
  loading: boolean;
  
  /**
   * Error that occurred during loading
   */
  error: Error | null;
  
  /**
   * Update pricing settings
   */
  updateSettings: (settings: Partial<PricingSettings>) => Promise<void>;
  
  /**
   * Reset pricing settings to defaults
   */
  resetSettings: () => Promise<void>;
  
  /**
   * Calculate markup price
   */
  calculateMarkup: (costPrice: number, markupPercentage: number) => number;
  
  /**
   * Calculate margin price
   */
  calculateMargin: (costPrice: number, marginPercentage: number) => number;
}

// Create context
const BatchPricingSettingsContext = createContext<BatchPricingSettingsContextType | undefined>(undefined);

// Provider props
interface BatchPricingSettingsProviderProps {
  children: ReactNode;
}

/**
 * BatchPricingSettingsProvider Component
 * 
 * Provides pricing settings with optimized batch requests during initialization.
 */
export function BatchPricingSettingsProvider({ children }: BatchPricingSettingsProviderProps) {
  // State
  const [settings, setSettings] = useState<PricingSettings>(defaultSettings);
  
  // Get auth context
  const { isAuthenticated } = useAuth();
  
  // Get toast
  const toast = useToast();
  
  // Use provider batch initialization
  const {
    batchGet,
    batchPost,
    isInitializing,
    isInitialized,
    error,
    initialize
  } = useProviderBatchInit({
    providerName: 'pricingSettings',
    autoInit: true,
    defaultPriority: RequestPriority.MEDIUM,
    dependencies: [isAuthenticated],
    onInitComplete: () => {
      logger.info('Pricing settings provider initialized successfully');
    },
    onInitError: (error) => {
      logger.error('Error initializing pricing settings provider', { error });
    }
  });
  
  // Fetch pricing settings
  const fetchSettings = useCallback(async () => {
    performanceMonitor.markStart('pricingSettings:fetchSettings');
    try {
      // Use batch request to fetch pricing settings
      const settingsData = await batchGet<PricingSettings>('settings/pricing', undefined, RequestPriority.MEDIUM);
      
      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Use default settings as fallback
        setSettings(defaultSettings);
      }
    } catch (err) {
      logger.error('Error fetching pricing settings', { error: err });
      // Use default settings as fallback
      setSettings(defaultSettings);
      toast.error('Error', 'Failed to load pricing settings');
    } finally {
      performanceMonitor.markEnd('pricingSettings:fetchSettings');
    }
  }, [batchGet, toast]);
  
  // Update pricing settings
  const updateSettings = useCallback(async (newSettings: Partial<PricingSettings>) => {
    performanceMonitor.markStart('pricingSettings:updateSettings');
    try {
      // Merge new settings with current settings
      const updatedSettings = {
        ...settings,
        ...newSettings
      };
      
      // Use batch request to update pricing settings
      await batchPost('settings/UPDATE_MODULE', {
        module: 'pricing',
        settings: updatedSettings
      }, RequestPriority.LOW);
      
      // Update local state
      setSettings(updatedSettings);
      
      toast.success('Success', 'Pricing settings updated');
    } catch (err) {
      logger.error('Error updating pricing settings', { error: err });
      toast.error('Error', 'Failed to update pricing settings');
      throw err;
    } finally {
      performanceMonitor.markEnd('pricingSettings:updateSettings');
    }
  }, [batchPost, settings, toast]);
  
  // Reset pricing settings to defaults
  const resetSettings = useCallback(async () => {
    performanceMonitor.markStart('pricingSettings:resetSettings');
    try {
      // Use batch request to reset pricing settings
      await batchPost('settings/RESET_MODULE', {
        module: 'pricing'
      }, RequestPriority.LOW);
      
      // Update local state
      setSettings(defaultSettings);
      
      toast.success('Success', 'Pricing settings reset to defaults');
    } catch (err) {
      logger.error('Error resetting pricing settings', { error: err });
      toast.error('Error', 'Failed to reset pricing settings');
      throw err;
    } finally {
      performanceMonitor.markEnd('pricingSettings:resetSettings');
    }
  }, [batchPost, toast]);
  
  // Calculate markup price
  const calculateMarkup = useCallback((costPrice: number, markupPercentage: number): number => {
    return costPrice * (1 + markupPercentage / 100);
  }, []);
  
  // Calculate margin price
  const calculateMargin = useCallback((costPrice: number, marginPercentage: number): number => {
    return costPrice / (1 - marginPercentage / 100);
  }, []);
  
  // Initialize data when authenticated
  useEffect(() => {
    if (isAuthenticated && !isInitialized && !isInitializing) {
      logger.info('Initializing pricing settings provider');
      
      // Add requests to the batch
      fetchSettings();
      
      // Execute the batch
      initialize();
    }
  }, [isAuthenticated, isInitialized, isInitializing, fetchSettings, initialize]);
  
  // Context value
  const contextValue: BatchPricingSettingsContextType = {
    settings,
    loading: isInitializing,
    error,
    updateSettings,
    resetSettings,
    calculateMarkup,
    calculateMargin
  };
  
  return (
    <BatchPricingSettingsContext.Provider value={contextValue}>
      {children}
    </BatchPricingSettingsContext.Provider>
  );
}

/**
 * Hook to use the batch pricing settings context
 */
export function useBatchPricingSettings(): BatchPricingSettingsContextType {
  const context = useContext(BatchPricingSettingsContext);
  
  if (!context) {
    throw new Error('useBatchPricingSettings must be used within a BatchPricingSettingsProvider');
  }
  
  return context;
}

export default BatchPricingSettingsContext;
