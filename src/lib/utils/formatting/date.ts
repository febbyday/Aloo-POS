/**
 * Date Formatting Utilities
 * 
 * This module provides utilities for formatting and manipulating dates.
 */

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  /** The format style to use ('short', 'medium', 'long', 'full') */
  format?: 'short' | 'medium' | 'long' | 'full';
  /** Whether to include time in the formatted date */
  includeTime?: boolean;
  /** The locale to use for formatting */
  locale?: string;
  /** The time style to use when includeTime is true */
  timeStyle?: 'short' | 'medium' | 'long' | 'full';
}

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
export function formatDate(date: Date | string | null | undefined, options: DateFormatOptions = {}): string {
  // Return a placeholder for undefined, null or invalid dates
  if (!date) return '-';
  
  // Try to convert string dates to Date objects
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '-';
  }
  
  const { format = 'short', includeTime = false, locale = 'en-US', timeStyle = 'short' } = options;
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    ...(includeTime && { timeStyle })
  };
  
  try {
    return new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

/**
 * Formats a date as a relative time (e.g., "5 minutes ago", "2 days ago")
 * 
 * @param date - The date to format
 * @returns Relative time string
 * 
 * @example
 * // For a date 5 minutes ago
 * formatRelativeTime(fiveMinutesAgo) // '5 minutes ago'
 * 
 * @example
 * // For a date 2 days ago
 * formatRelativeTime(twoDaysAgo) // '2 days ago'
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
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
}

/**
 * Formats a date for input fields (YYYY-MM-DDTHH:MM format)
 * 
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DDTHH:MM format
 * 
 * @example
 * formatDateForInput(new Date()) // '2023-01-01T12:00'
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().slice(0, 16);
}

/**
 * Parses a date from an input field
 * 
 * @param value - The date string from an input field
 * @returns Parsed Date object
 * 
 * @example
 * parseDateFromInput('2023-01-01T12:00') // Date object
 */
export function parseDateFromInput(value: string): Date {
  return new Date(value);
}

/**
 * Checks if a value is a valid date
 * 
 * @param date - The value to check
 * @returns True if the value is a valid date
 * 
 * @example
 * isValidDate(new Date()) // true
 * isValidDate('not a date') // false
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
