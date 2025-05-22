/**
 * Number Formatting Utilities
 * 
 * This module provides utilities for formatting numbers.
 */

/**
 * Options for number formatting
 */
export interface NumberFormatOptions {
  /** The minimum number of decimal places to display */
  decimals?: number;
  /** The maximum number of decimal places to display */
  maxDecimals?: number;
  /** The locale to use for formatting */
  locale?: string;
}

/**
 * Formats a number with specified decimal places
 * 
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 * 
 * @example
 * // Basic usage with default options
 * formatNumber(1234.56) // '1,234.56'
 * 
 * @example
 * // With custom decimal places
 * formatNumber(1234.56789, { decimals: 3 }) // '1,234.568'
 * 
 * @example
 * // With custom locale
 * formatNumber(1234.56, { locale: 'de-DE' }) // '1.234,56'
 */
export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  const { 
    decimals, 
    maxDecimals = decimals !== undefined ? decimals : 2,
    locale = 'en-US' 
  } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: maxDecimals
    }).format(value);
  } catch (error) {
    console.error('Error formatting number:', error);
    // Fallback to basic formatting if Intl.NumberFormat fails
    return decimals !== undefined ? value.toFixed(decimals) : value.toString();
  }
}

/**
 * Formats a number as a percentage
 * 
 * @param value - The number to format (0-1 or 0-100)
 * @param options - Formatting options
 * @returns Formatted percentage string
 * 
 * @example
 * // With value between 0-1
 * formatPercentage(0.1234) // '12.34%'
 * 
 * @example
 * // With value between 0-100
 * formatPercentage(12.34, { isDecimal: false }) // '12.34%'
 * 
 * @example
 * // With custom decimal places
 * formatPercentage(0.1234, { decimals: 1 }) // '12.3%'
 */
export function formatPercentage(
  value: number, 
  options: NumberFormatOptions & { isDecimal?: boolean } = {}
): string {
  const { 
    decimals = 2, 
    locale = 'en-US',
    isDecimal = true 
  } = options;
  
  // Convert to percentage value if it's a decimal
  const percentValue = isDecimal && value <= 1 ? value : value / 100;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(percentValue);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    // Fallback to basic formatting if Intl.NumberFormat fails
    return `${(percentValue * 100).toFixed(decimals)}%`;
  }
}

/**
 * Formats a file size in bytes to a human-readable format
 * 
 * @param bytes - The file size in bytes
 * @param decimals - The number of decimal places to display
 * @returns Formatted file size string
 * 
 * @example
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(1073741824, 1) // '1.0 GB'
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
