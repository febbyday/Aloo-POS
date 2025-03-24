/**
 * Formatters Utility Tests
 * 
 * This file contains tests for the formatter utility functions
 * created in Phase 2.
 */

import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  formatNumber, 
  formatPercentage,
  truncateText,
  formatPhoneNumber,
  formatFileSize
} from './formatters';

describe('Formatter Utilities', () => {
  describe('formatCurrency', () => {
    it('formats a number as currency with default options', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
    
    it('formats a number as currency with custom currency', () => {
      expect(formatCurrency(1234.56, { currency: 'EUR' })).toBe('€1,234.56');
    });
    
    it('formats a number as currency with custom locale', () => {
      expect(formatCurrency(1234.56, { locale: 'de-DE', currency: 'EUR' })).toBe('1.234,56 €');
    });
    
    it('handles zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });
    
    it('handles negative values correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });
  });
  
  describe('formatDate', () => {
    it('formats a date with default options', () => {
      const date = new Date('2023-01-15T12:30:45');
      expect(formatDate(date)).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // MM/DD/YYYY format
    });
    
    it('formats a date with custom format', () => {
      const date = new Date('2023-01-15T12:30:45');
      expect(formatDate(date, { format: 'long' })).toContain('January');
    });
    
    it('formats a date with time', () => {
      const date = new Date('2023-01-15T12:30:45');
      expect(formatDate(date, { includeTime: true })).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}/);
    });
    
    it('handles custom locale', () => {
      const date = new Date('2023-01-15T12:30:45');
      const formatted = formatDate(date, { locale: 'fr-FR', format: 'long' });
      expect(formatted).toContain('janvier');
    });
  });
  
  describe('formatNumber', () => {
    it('formats a number with default options', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });
    
    it('formats a number with custom decimal places', () => {
      expect(formatNumber(1234.56789, { decimals: 3 })).toBe('1,234.568');
    });
    
    it('formats a number with no decimal places', () => {
      expect(formatNumber(1234.56, { decimals: 0 })).toBe('1,235');
    });
    
    it('handles custom locale', () => {
      expect(formatNumber(1234.56, { locale: 'de-DE' })).toBe('1.234,56');
    });
  });
  
  describe('formatPercentage', () => {
    it('formats a number as percentage with default options', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
    });
    
    it('formats a number as percentage with custom decimal places', () => {
      expect(formatPercentage(0.1234, { decimals: 1 })).toBe('12.3%');
    });
    
    it('formats a number as percentage with no decimal places', () => {
      expect(formatPercentage(0.1234, { decimals: 0 })).toBe('12%');
    });
    
    it('handles values greater than 1', () => {
      expect(formatPercentage(1.5)).toBe('150.00%');
    });
    
    it('handles negative values', () => {
      expect(formatPercentage(-0.1234)).toBe('-12.34%');
    });
  });
  
  describe('truncateText', () => {
    it('truncates text that exceeds the max length', () => {
      expect(truncateText('This is a long text that should be truncated', 20)).toBe('This is a long text...');
    });
    
    it('does not truncate text that is shorter than max length', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
    });
    
    it('truncates text with custom suffix', () => {
      expect(truncateText('This is a long text that should be truncated', 20, ' [more]')).toBe('This is a long text [more]');
    });
    
    it('handles empty string', () => {
      expect(truncateText('', 20)).toBe('');
    });
  });
  
  describe('formatPhoneNumber', () => {
    it('formats a 10-digit US phone number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });
    
    it('formats a phone number with country code', () => {
      expect(formatPhoneNumber('+11234567890')).toBe('+1 (123) 456-7890');
    });
    
    it('handles phone numbers with existing formatting', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
    });
    
    it('returns the original string for invalid phone numbers', () => {
      expect(formatPhoneNumber('not-a-phone')).toBe('not-a-phone');
    });
  });
  
  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });
    
    it('formats kilobytes', () => {
      expect(formatFileSize(1500)).toBe('1.46 KB');
    });
    
    it('formats megabytes', () => {
      expect(formatFileSize(1500000)).toBe('1.43 MB');
    });
    
    it('formats gigabytes', () => {
      expect(formatFileSize(1500000000)).toBe('1.40 GB');
    });
    
    it('formats terabytes', () => {
      expect(formatFileSize(1500000000000)).toBe('1.36 TB');
    });
    
    it('handles zero', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
    
    it('handles custom decimal places', () => {
      expect(formatFileSize(1500, { decimals: 0 })).toBe('1 KB');
    });
  });
}); 