/**
 * Formatters Utility
 * 
 * A collection of utility functions for formatting various data types
 * including currency, dates, numbers, percentages, and more.
 */

interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
}

interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
  locale?: string;
}

interface NumberFormatOptions {
  decimals?: number;
  locale?: string;
}

interface FileSizeFormatOptions {
  decimals?: number;
}

/**
 * Formats a number as currency
 */
export const formatCurrency = (value: number, options: CurrencyFormatOptions = {}) => {
  const { currency = 'USD', locale = 'en-US' } = options;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
};

/**
 * Formats a date with various options
 */
export const formatDate = (date: Date, options: DateFormatOptions = {}) => {
  const { format = 'short', includeTime = false, locale = 'en-US' } = options;
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    ...(includeTime && { timeStyle: 'short' })
  };
  
  return new Intl.DateTimeFormat(locale, dateOptions).format(date);
};

/**
 * Formats a number with specified decimal places
 */
export const formatNumber = (value: number, options: NumberFormatOptions = {}) => {
  const { decimals, locale = 'en-US' } = options;
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals !== undefined ? decimals : 2
  }).format(value);
};

/**
 * Formats a number as a percentage
 */
export const formatPercentage = (value: number, options: NumberFormatOptions = {}) => {
  const { decimals = 2, locale = 'en-US' } = options;
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Truncates text to a specified length
 */
export const truncateText = (text: string, maxLength: number, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Formats a phone number to a standard format
 */
export const formatPhoneNumber = (phone: string) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number
  if (cleaned.length < 10) return phone;
  
  // Handle country code
  let formatted = '';
  if (cleaned.length > 10) {
    formatted = '+' + cleaned.slice(0, cleaned.length - 10) + ' ';
  }
  
  // Format the main number
  const areaCode = cleaned.slice(-10, -7);
  const prefix = cleaned.slice(-7, -4);
  const line = cleaned.slice(-4);
  
  return `${formatted}(${areaCode}) ${prefix}-${line}`;
};

/**
 * Formats a file size in bytes to a human-readable format
 */
export const formatFileSize = (bytes: number, options: FileSizeFormatOptions = {}) => {
  const { decimals = 2 } = options;
  
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}; 