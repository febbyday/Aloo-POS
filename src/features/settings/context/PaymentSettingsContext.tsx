/**
 * PaymentSettingsContext
 * 
 * Context provider for managing payment settings across the application.
 */

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { PaymentSettings } from '../types/settings.types';
import { paymentService, defaultPaymentSettings } from '../services/paymentService';
import { usePaymentSettings } from '../hooks/usePaymentSettings';

// Define the context shape
interface PaymentSettingsContextType {
  settings: PaymentSettings;
  isLoading: boolean;
  error: Error | null;
  togglePaymentMethod: (methodId: string, enabled: boolean) => void;
  updateMethodSetting: (methodId: string, setting: string, value: string | boolean) => void;
  addPaymentMethod: (method: any) => any;
  updatePaymentMethod: (methodId: string, updates: any) => any;
  deletePaymentMethod: (methodId: string) => boolean;
  addInstallmentPlan: (plan: any) => any;
  removeInstallmentPlan: (planId: string) => void;
  updateInstallmentSettings: (updates: any) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
}

// Create the context with a default value
const PaymentSettingsContext = createContext<PaymentSettingsContextType | undefined>(undefined);

// Provider props interface
interface PaymentSettingsProviderProps {
  children: ReactNode;
}

// Provider component
export const PaymentSettingsProvider: React.FC<PaymentSettingsProviderProps> = ({ children }) => {
  const [initialSettings, setInitialSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<Error | null>(null);

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await paymentService.fetchPaymentSettings();
        setInitialSettings(settings);
      } catch (error) {
        setInitError(error instanceof Error ? error : new Error('Failed to fetch payment settings'));
        console.error('Failed to fetch payment settings:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchSettings();
  }, []);

  // Use the hook for payment settings management
  const paymentSettingsHook = usePaymentSettings({
    initialSettings,
    onSave: async (settings) => {
      return await paymentService.savePaymentSettings(settings);
    }
  });

  // If still initializing, show loading or return null
  if (isInitializing) {
    return null; // Or a loading component
  }

  // Provide the context value
  return (
    <PaymentSettingsContext.Provider 
      value={{
        ...paymentSettingsHook,
        error: paymentSettingsHook.error || initError
      }}
    >
      {children}
    </PaymentSettingsContext.Provider>
  );
};

// Custom hook to use the payment settings context
export const usePaymentSettingsContext = (): PaymentSettingsContextType => {
  const context = useContext(PaymentSettingsContext);
  
  if (context === undefined) {
    throw new Error('usePaymentSettingsContext must be used within a PaymentSettingsProvider');
  }
  
  return context;
};
