import { create } from "zustand"
import { persist } from "zustand/middleware"

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

interface PricingSettingsState extends PricingSettings {
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

export const usePricingSettings = create<PricingSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "pricing-settings",
    }
  )
)

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
