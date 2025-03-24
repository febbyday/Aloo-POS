/**
 * usePaymentSettings Hook
 * 
 * This hook provides state management and operations for payment settings.
 */

import { useState, useCallback } from 'react';
import { PaymentSettings, PaymentMethod } from '../types/settings.types';
import { paymentService } from '../services/paymentService';

export interface UsePaymentSettingsOptions {
  initialSettings: PaymentSettings;
  onSave?: (settings: PaymentSettings) => Promise<void>;
}

export function usePaymentSettings({ 
  initialSettings, 
  onSave 
}: UsePaymentSettingsOptions) {
  const [settings, setSettings] = useState<PaymentSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Toggle payment method enabled status
  const togglePaymentMethod = useCallback((methodId: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodId]: {
          ...prev.methods[methodId],
          enabled
        }
      }
    }));
  }, []);

  // Update a specific setting for a payment method
  const updateMethodSetting = useCallback((methodId: string, setting: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodId]: {
          ...prev.methods[methodId],
          settings: {
            ...prev.methods[methodId].settings,
            [setting]: value
          }
        }
      }
    }));
  }, []);

  // Add a new payment method
  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, 'id' | 'settings'>) => {
    const updatedSettings = paymentService.addPaymentMethod(settings, {
      ...method,
      settings: {}
    });
    setSettings(updatedSettings);
    return updatedSettings.methods[Object.keys(updatedSettings.methods).pop() || ''];
  }, [settings]);

  // Update an existing payment method
  const updatePaymentMethod = useCallback((methodId: string, updates: Partial<Omit<PaymentMethod, 'id'>>) => {
    if (!settings.methods[methodId]) return null;
    
    const updatedMethod = {
      ...settings.methods[methodId],
      ...updates
    };
    
    setSettings(prev => ({
      ...prev,
      methods: {
        ...prev.methods,
        [methodId]: updatedMethod
      }
    }));
    
    return updatedMethod;
  }, [settings]);

  // Delete a payment method
  const deletePaymentMethod = useCallback((methodId: string) => {
    // Cannot delete system-defined methods
    if (settings.methods[methodId]?.systemDefined) {
      return false;
    }

    setSettings(prev => {
      const updatedMethods = { ...prev.methods };
      delete updatedMethods[methodId];
      
      return {
        ...prev,
        methods: updatedMethods
      };
    });
    
    return true;
  }, [settings]);

  // Add a new installment plan
  const addInstallmentPlan = useCallback((plan: {
    period: {
      frequency: number;
      unit: 'day' | 'week' | 'month' | 'year';
    };
    priceRange: {
      min: number;
      max: number;
    };
    numberOfInstallments: number;
  }) => {
    const updatedSettings = paymentService.addInstallmentPlan(settings, plan);
    setSettings(updatedSettings);
    return updatedSettings.installment.plans[updatedSettings.installment.plans.length - 1];
  }, [settings]);

  // Remove an installment plan
  const removeInstallmentPlan = useCallback((planId: string) => {
    setSettings(prev => ({
      ...prev,
      installment: {
        ...prev.installment,
        plans: prev.installment.plans.filter(plan => plan.id !== planId)
      }
    }));
  }, []);

  // Update installment settings
  const updateInstallmentSettings = useCallback((updates: Partial<Omit<PaymentSettings['installment'], 'plans'>>) => {
    setSettings(prev => ({
      ...prev,
      installment: {
        ...prev.installment,
        ...updates
      }
    }));
  }, []);

  // Save all payment settings
  const saveSettings = useCallback(async () => {
    if (!onSave) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onSave(settings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save payment settings'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [settings, onSave]);

  // Reset settings to initial state
  const resetSettings = useCallback(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  return {
    settings,
    isLoading,
    error,
    togglePaymentMethod,
    updateMethodSetting,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    addInstallmentPlan,
    removeInstallmentPlan,
    updateInstallmentSettings,
    saveSettings,
    resetSettings
  };
}
