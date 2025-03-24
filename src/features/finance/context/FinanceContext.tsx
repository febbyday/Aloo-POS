// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FinanceSettings, FinanceSettingsSchema } from "../types/finance.types";
import { toast } from "@/components/ui/use-toast";

// Default finance settings
const defaultFinanceSettings: FinanceSettings = {
  currency: "USD",
  taxEnabled: true,
  defaultTaxRate: "standard",
  fiscalizationEnabled: false,
  fiscalizationSettings: {},
  paymentMethods: [
    {
      id: "cash",
      name: "Cash",
      icon: "Banknote",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "card",
      name: "Card",
      icon: "CreditCard",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "mobile",
      name: "Mobile Money",
      icon: "Smartphone",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "Building",
      enabled: true,
      systemDefined: true,
    },
    {
      id: "installments",
      name: "Pay in Installments",
      icon: "Calendar",
      enabled: true,
      systemDefined: true,
    },
  ],
  receiptFooter: "Thank you for your business!",
  receiptHeader: "Official Receipt",
  showTaxOnReceipt: true,
  requireReconciliation: true,
  reconciliationFrequency: "daily",
};

interface FinanceContextType {
  settings: FinanceSettings;
  updateSettings: (newSettings: Partial<FinanceSettings>) => void;
  resetSettings: () => void;
  loading: boolean;
  error: string | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FinanceSettings>(defaultFinanceSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading settings from API/localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call or localStorage read
        // For now, we'll use a timeout to simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if settings exist in localStorage
        const savedSettings = localStorage.getItem("financeSettings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Validate settings with Zod
          const validatedSettings = FinanceSettingsSchema.parse(parsedSettings);
          setSettings(validatedSettings);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to load finance settings:", err);
        setError("Failed to load finance settings");
        // Fall back to default settings
        setSettings(defaultFinanceSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = (newSettings: Partial<FinanceSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      // Validate with Zod
      const validatedSettings = FinanceSettingsSchema.parse(updatedSettings);
      
      setSettings(validatedSettings);
      // Save to localStorage
      localStorage.setItem("financeSettings", JSON.stringify(validatedSettings));
      
      toast({
        title: "Settings updated",
        description: "Finance settings have been updated successfully.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to update settings:", err);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset settings to default
  const resetSettings = () => {
    setSettings(defaultFinanceSettings);
    localStorage.setItem("financeSettings", JSON.stringify(defaultFinanceSettings));
    toast({
      title: "Settings reset",
      description: "Finance settings have been reset to defaults.",
      variant: "default",
    });
  };

  return (
    <FinanceContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        loading,
        error,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};
