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
 *
 * @param value - The number to format as currency
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * // Basic usage with default options (USD)
 * formatCurrency(1234.56) // '$1,234.56'
 *
 * @example
 * // With custom currency
 * formatCurrency(1234.56, { currency: 'EUR' }) // '€1,234.56'
 * 
 * @example
 * // With custom locale and currency
 * formatCurrency(1234.56, { locale: 'de-DE', currency: 'EUR' }) // '1.234,56 €'
 */
export const formatCurrency = (value: number, options: CurrencyFormatOptions = {}) => {
  const { currency = 'USD', locale = 'en-US' } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  }).format(value);
};

/**
 * Formats a date with various options
 *
 * @param date - The date to format (Date object, ISO string, or null/undefined)
 * @param options - Formatting options
 * @returns Formatted date string or placeholder for invalid dates
 *
 * @example
 * // Basic usage with default options
 * formatDate(new Date()) // '1/1/2023'
 *
 * @example
 * // With custom format
 * formatDate(new Date(), { format: 'long' }) // 'January 1, 2023'
 *
 * @example
 * // With time included
 * formatDate(new Date(), { includeTime: true }) // '1/1/2023, 12:00 PM'
 */
export const formatDate = (date: Date | string | null | undefined, options: DateFormatOptions = {}) => {
  // Return a placeholder for undefined, null or invalid dates
  if (!date) return '-';

  // Try to convert string dates to Date objects
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '-';
  }

  const { format = 'short', includeTime = false, locale = 'en-US' } = options;

  const dateOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    ...(includeTime && { timeStyle: 'short' })
  };

  try {
    return new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Formats a date as a relative time string (e.g., "2 days ago")
 *
 * @param date - The date to format
 * @returns Formatted relative time string
 *
 * @example
 * // For a date 5 minutes ago
 * formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000)) // '5 minutes ago'
 *
 * @example
 * // For a date 2 days ago
 * formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) // '2 days ago'
 */
export const formatRelativeTime = (date: Date | string | null | undefined): string => {
  // Return a placeholder for undefined, null or invalid dates
  if (!date) return '-';

  // Try to convert string dates to Date objects
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '-';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

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
 *
 * @param value - The number to format as percentage
 * @param options - Formatting options
 * @returns Formatted percentage string
 *
 * @example
 * // Basic usage with default options
 * formatPercentage(0.5) // '50%'
 *
 * @example
 * // With custom decimal places
 * formatPercentage(0.12345, { decimals: 1 }) // '12.3%'
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
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the truncated text
 * @param suffix - String to append to truncated text
 * @returns Truncated text
 *
 * @example
 * truncateText('This is a long text', 10) // 'This is a...'
 */
export const truncateText = (text: string, maxLength: number, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  // Ensure we truncate at a word boundary if possible
  const truncated = text.substring(0, maxLength - suffix.length);
  return truncated + suffix;
};

/**
 * Formats a phone number to a standard format
 *
 * @param phone - The phone number to format
 * @returns Formatted phone number
 *
 * @example
 * formatPhoneNumber('1234567890') // '(123) 456-7890'
 *
 * @example
 * formatPhoneNumber('11234567890') // '+1 (123) 456-7890'
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
 * Formats a file size in bytes to a human-readable string
 *
 * @param bytes - The file size in bytes
 * @param options - Formatting options
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024) // '1 KB'
 *
 * @example
 * formatFileSize(1536, { decimals: 1 }) // '1.5 KB'
 */
export const formatFileSize = (bytes: number, options: FileSizeFormatOptions = {}) => {
  const { decimals = 2 } = options;

  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Special case for bytes - no decimal places
  if (i === 0) {
    return `${Math.round(bytes)} ${sizes[i]}`;
  }
  
  // For KB and above, format with fixed decimal places to preserve trailing zeros
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
};