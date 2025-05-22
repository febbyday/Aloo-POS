import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FinanceSettings } from "../schemas/finance-settings.schema";
import { toast } from "@/components/ui/use-toast";
import { SettingsService } from "../services/finance.service";

interface FinanceContextType {
  settings: FinanceSettings;
  updateSettings: (newSettings: Partial<FinanceSettings>) => void;
  resetSettings: () => void;
  loading: boolean;
  error: string | null;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FinanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings using the settings service
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await SettingsService.getSettings();
        setSettings(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load finance settings:", err);
        setError("Failed to load finance settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = async (newSettings: Partial<FinanceSettings>) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      // Save settings using the settings service
      await SettingsService.saveSettings(updatedSettings);

      // Update local state
      setSettings(updatedSettings);

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
  const resetSettings = async () => {
    try {
      // Reset settings using the settings service
      const defaultSettings = await SettingsService.resetSettings();

      // Update local state
      setSettings(defaultSettings);

      toast({
        title: "Settings reset",
        description: "Finance settings have been reset to defaults.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to reset settings:", err);
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If settings are still loading, provide default empty settings
  const contextValue: FinanceContextType = {
    settings: settings || {} as FinanceSettings,
    updateSettings,
    resetSettings,
    loading,
    error,
  };

  return (
    <FinanceContext.Provider value={contextValue}>
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
