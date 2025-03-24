import React, { createContext, useContext, useState } from "react"

interface PricingSettings {
  // Price Calculation Settings
  defaultPriceCalculation: "markup" | "margin"
  defaultMarkupPercentage: number
  defaultMarginPercentage: number
  minimumMarginPercentage: number
  roundPricesToNearest: number
  enforceMinimumMargin: boolean

  // Tax Settings
  defaultTaxRate: number
  includeTaxInPrice: boolean
  enableAutomaticTaxCalculation: boolean
  taxCalculationMethod: "inclusive" | "exclusive"

  // Currency Settings
  defaultCurrency: string
  currencyPosition: "before" | "after"
  thousandsSeparator: string
  decimalSeparator: string
  decimalPlaces: number

  // Discount Settings
  maximumDiscountPercentage: number
  allowStackingDiscounts: boolean
  minimumOrderValueForDiscount: number
  enableAutomaticDiscounts: boolean
}

interface PricingSettingsContextType extends PricingSettings {
  updateSettings: (settings: Partial<PricingSettings>) => void
  resetSettings: () => void
}

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
}

const PricingSettingsContext = createContext<PricingSettingsContextType | undefined>(
  undefined
)

export function PricingSettingsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<PricingSettings>(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("pricing-settings")
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings
  })

  const updateSettings = (newSettings: Partial<PricingSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem("pricing-settings", JSON.stringify(updated))
      return updated
    })
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.setItem("pricing-settings", JSON.stringify(defaultSettings))
  }

  return (
    <PricingSettingsContext.Provider
      value={{
        ...settings,
        updateSettings,
        resetSettings,
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
