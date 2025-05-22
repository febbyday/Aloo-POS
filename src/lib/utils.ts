import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  formatCurrency as formatCurrencyNew,
  formatDate as formatDateNew,
  formatNumber as formatNumberNew,
  formatPercentage as formatPercentageNew,
  truncateText,
  formatFileSize as formatFileSizeNew,
  formatPhoneNumber as formatPhoneNumberNew,
  formatRelativeTime as formatRelativeTimeNew
} from './utils/formatters';
import { cn as cnNew } from './utils/cn';
import { 
  deepClone as deepCloneNew,
  isEmpty as isEmptyNew,
  pick as pickNew,
  omit as omitNew
} from './utils/object-utils';
import {
  generateId as generateIdNew,
  isValidUuid,
  generateUuidV4
} from './utils/id-utils';

/**
 * @deprecated Use cn from '@/lib/utils/cn' instead
 */
export function cn(...inputs: ClassValue[]) {
  console.warn('Warning: cn from @/lib/utils is deprecated. Use cn from @/lib/utils/cn instead.');
  return cnNew(...inputs);
}

/**
 * @deprecated Use formatCurrency from '@/lib/utils/formatters' instead
 */
export function formatCurrency(...args: Parameters<typeof formatCurrencyNew>): ReturnType<typeof formatCurrencyNew> {
  console.warn('Warning: formatCurrency from @/lib/utils is deprecated. Use formatCurrency from @/lib/utils/formatters instead.');
  return formatCurrencyNew(...args);
}

/**
 * @deprecated Use formatDate from '@/lib/utils/formatters' instead
 */
export function formatDate(date: Date | string | null | undefined, format: string = "medium", locale: string = "en-US") {
  console.warn('Warning: formatDate from @/lib/utils is deprecated. Use formatDate from @/lib/utils/formatters instead.');

  // Map old format strings to new format options
  let formatOption: 'short' | 'medium' | 'long' | 'full' = 'medium';
  let includeTime = false;

  switch (format) {
    case "short":
      formatOption = 'short';
      break;
    case "long":
      formatOption = 'long';
      break;
    case "time":
      formatOption = 'short';
      includeTime = true;
      break;
    case "datetime":
      formatOption = 'medium';
      includeTime = true;
      break;
    case "relative":
      return formatRelativeTimeNew(date);
    case "iso":
      if (date) {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return dateObj.toISOString();
      }
      return '-';
  }

  return formatDateNew(date, { format: formatOption, includeTime, locale });
}

/**
 * @deprecated Use formatRelativeTime from '@/lib/utils/formatters' instead
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  console.warn('Warning: formatRelativeTime from @/lib/utils is deprecated. Use formatRelativeTime from @/lib/utils/formatters instead.');
  return formatRelativeTimeNew(date);
}

/**
 * @deprecated Use formatNumber from '@/lib/utils/formatters' instead
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions, locale: string = "en-US") {
  console.warn('Warning: formatNumber from @/lib/utils is deprecated. Use formatNumber from @/lib/utils/formatters instead.');

  // Convert old options format to new options format
  const decimals = options?.minimumFractionDigits;

  return formatNumberNew(value, { decimals, locale });
}

/**
 * @deprecated Use formatPercentage from '@/lib/utils/formatters' instead
 */
export function formatPercentage(value: number, decimals: number = 2, locale: string = "en-US") {
  console.warn('Warning: formatPercentage from @/lib/utils is deprecated. Use formatPercentage from @/lib/utils/formatters instead.');

  // The old implementation divided by 100, but the new one expects a decimal
  // So we need to handle this difference
  return formatPercentageNew(value / 100, { decimals, locale });
}

/**
 * @deprecated Use truncateText from '@/lib/utils/formatters' instead
 */
export function truncate(str: string, length: number, ending: string = "...") {
  console.warn('Warning: truncate from @/lib/utils is deprecated. Use truncateText from @/lib/utils/formatters instead.');
  return truncateText(str, length, ending);
}

/**
 * @deprecated Use formatFileSize from '@/lib/utils/formatters' instead
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  console.warn('Warning: formatFileSize from @/lib/utils is deprecated. Use formatFileSize from @/lib/utils/formatters instead.');
  return formatFileSizeNew(bytes, { decimals });
}

/**
 * @deprecated Use formatPhoneNumber from '@/lib/utils/formatters' instead
 */
export function formatPhoneNumber(phoneNumber: string, format: string = "(###) ###-####"): string {
  console.warn('Warning: formatPhoneNumber from @/lib/utils is deprecated. Use formatPhoneNumber from @/lib/utils/formatters instead.');
  return formatPhoneNumberNew(phoneNumber);
}

// String utilities
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA < valueB) {
      return direction === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}

// Object utilities
/**
 * @deprecated Use omit from '@/lib/utils/object-utils' instead
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  console.warn('Warning: omit from @/lib/utils is deprecated. Use omit from @/lib/utils/object-utils instead.');
  return omitNew(obj, keys);
}

/**
 * @deprecated Use pick from '@/lib/utils/object-utils' instead
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  console.warn('Warning: pick from @/lib/utils is deprecated. Use pick from @/lib/utils/object-utils instead.');
  return pickNew(obj, keys);
}

/**
 * @deprecated Use deepClone from '@/lib/utils/object-utils' instead
 */
export function deepClone<T>(obj: T): T {
  console.warn('Warning: deepClone from @/lib/utils is deprecated. Use deepClone from @/lib/utils/object-utils instead.');
  return deepCloneNew(obj);
}

/**
 * @deprecated Use isEmpty from '@/lib/utils/object-utils' instead
 */
export function isEmpty(obj: object): boolean {
  console.warn('Warning: isEmpty from @/lib/utils is deprecated. Use isEmpty from @/lib/utils/object-utils instead.');
  return isEmptyNew(obj);
}

// Debounce utility
/**
 * @deprecated Use debounce from '@/lib/utils/timing' instead
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility
/**
 * @deprecated Use throttle from '@/lib/utils/timing' instead
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Generate a unique ID
/**
 * @deprecated Use generateId from '@/lib/utils/id-utils' instead
 */
export function generateId(prefix: string = ""): string {
  console.warn('Warning: generateId from @/lib/utils is deprecated. Use generateId from @/lib/utils/id-utils instead.');
  return generateIdNew(prefix);
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

// Check if a value is a valid date
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
