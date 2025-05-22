import React, { createContext, useContext, useState, useEffect } from "react"
import { PricingSettings, pricingSettingsSchema } from "../schemas/pricing-settings.schema"
import { SettingsService } from "../services/pricing.service"
import { useToast } from "@/lib/toast"

/**
 * Helper function to get empty settings with default values
 * @returns Empty settings with default values
 */
function getEmptySettings(): PricingSettings {
  return pricingSettingsSchema.parse({});
}

interface PricingSettingsContextType extends PricingSettings {
  updateSettings: (settings: Partial<PricingSettings>) => void
  resetSettings: () => void
  isLoading: boolean
}

const PricingSettingsContext = createContext<PricingSettingsContextType | undefined>(
  undefined
)

export function PricingSettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const toast = useToast();
  const [settings, setSettings] = useState<PricingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await SettingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error("Error loading pricing settings:", error);
        toast.error(
          "Error",
          "Failed to load pricing settings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const updateSettings = async (newSettings: Partial<PricingSettings>) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };

      // Save settings using the settings service
      await SettingsService.saveSettings(updatedSettings);

      // Update local state
      setSettings(updatedSettings);

      toast.success(
        "Settings updated",
        "Pricing settings have been updated successfully."
      );
    } catch (error) {
      console.error("Error updating pricing settings:", error);
      toast.error(
        "Error",
        "Failed to update pricing settings"
      );
    }
  };

  const resetSettings = async () => {
    try {
      // Reset settings using the settings service
      const defaultSettings = await SettingsService.resetSettings();

      // Update local state
      setSettings(defaultSettings);

      toast.success(
        "Settings reset",
        "Pricing settings have been reset to defaults."
      );
    } catch (error) {
      console.error("Error resetting pricing settings:", error);
      toast.error(
        "Error",
        "Failed to reset pricing settings"
      );
    }
  };

  // If settings are still loading or not available, provide a loading state
  if (isLoading || !settings) {
    return (
      <PricingSettingsContext.Provider
        value={{
          ...getEmptySettings(),
          updateSettings,
          resetSettings,
          isLoading,
        }}
      >
        {children}
      </PricingSettingsContext.Provider>
    );
  }

  return (
    <PricingSettingsContext.Provider
      value={{
        ...settings,
        updateSettings,
        resetSettings,
        isLoading,
      }}
    >
      {children}
    </PricingSettingsContext.Provider>
  )
}

export function usePricingSettings() {
  const context = useContext(PricingSettingsContext)
  if (!context) {
    throw new Error(
      "usePricingSettings must be used within a PricingSettingsProvider"
    )
  }
  return context
}

// Utility functions for price calculations
export const calculateMarkup = (costPrice: number, markupPercentage: number) => {
  return costPrice * (1 + markupPercentage / 100)
}

export const calculateMargin = (costPrice: number, marginPercentage: number) => {
  return costPrice / (1 - marginPercentage / 100)
}

export const roundPrice = (
  price: number,
  roundTo: number,
  method: "up" | "down" | "nearest" = "nearest"
) => {
  if (roundTo === 0) return price

  const multiplier = 1 / roundTo
  const value = price * multiplier

  switch (method) {
    case "up":
      return Math.ceil(value) / multiplier
    case "down":
      return Math.floor(value) / multiplier
    default:
      return Math.round(value) / multiplier
  }
}

export const calculateTax = (
  price: number,
  taxRate: number,
  method: "inclusive" | "exclusive"
) => {
  if (method === "inclusive") {
    const taxMultiplier = 1 + taxRate / 100
    return {
      priceExcludingTax: price / taxMultiplier,
      taxAmount: price - price / taxMultiplier,
      priceIncludingTax: price,
    }
  }

  const taxAmount = price * (taxRate / 100)
  return {
    priceExcludingTax: price,
    taxAmount,
    priceIncludingTax: price + taxAmount,
  }
}

export const formatPrice = (
  amount: number,
  currency: string,
  {
    position = "before",
    thousandsSeparator = ",",
    decimalSeparator = ".",
    decimalPlaces = 2,
  }: Partial<{
    position: "before" | "after"
    thousandsSeparator: string
    decimalSeparator: string
    decimalPlaces: number
  }> = {}
) => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    useGrouping: true,
  })

  const formattedNumber = formatter
    .format(amount)
    .replace(/,/g, thousandsSeparator)
    .replace(/\./g, decimalSeparator)

  return position === "before"
    ? `${currency}${formattedNumber}`
    : `${formattedNumber}${currency}`
}
