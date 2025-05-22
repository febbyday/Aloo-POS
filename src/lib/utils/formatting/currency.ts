/**
 * Currency Formatting Utilities
 * 
 * This module provides utilities for formatting currency values.
 */

/**
 * Options for currency formatting
 */
export interface CurrencyFormatOptions {
  /** The currency code (e.g., 'USD', 'EUR', 'GBP') */
  currency?: string;
  /** The locale to use for formatting (e.g., 'en-US', 'fr-FR') */
  locale?: string;
  /** The minimum number of fraction digits to display */
  minimumFractionDigits?: number;
  /** The maximum number of fraction digits to display */
  maximumFractionDigits?: number;
}

/**
 * Formats a number as currency
 * 
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 * 
 * @example
 * // Basic usage with default options (USD)
 * formatCurrency(1234.56) // '$1,234.56'
 * 
 * @example
 * // With custom currency and locale
 * formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // '1.234,56 €'
 * 
 * @example
 * // With custom fraction digits
 * formatCurrency(1234.56789, { maximumFractionDigits: 3 }) // '$1,234.568'
 */
export function formatCurrency(value: number, options: CurrencyFormatOptions = {}): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback to basic formatting if Intl.NumberFormat fails
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Parses a currency string into a number
 * 
 * @param value - The currency string to parse
 * @param locale - The locale to use for parsing
 * @returns The parsed number value
 * 
 * @example
 * // Parse a USD currency string
 * parseCurrency('$1,234.56') // 1234.56
 * 
 * @example
 * // Parse a EUR currency string with German locale
 * parseCurrency('1.234,56 €', 'de-DE') // 1234.56
 */
export function parseCurrency(value: string, locale: string = 'en-US'): number {
  // Remove currency symbols and spaces
  const cleanValue = value.replace(/[^\d.,\-]/g, '');
  
  // Handle different decimal and thousand separators based on locale
  if (locale.startsWith('de') || locale.startsWith('fr') || locale.startsWith('es') || locale.startsWith('it')) {
    // European format: 1.234,56
    return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
  } else {
    // US/UK format: 1,234.56
    return parseFloat(cleanValue.replace(/,/g, ''));
  }
}
