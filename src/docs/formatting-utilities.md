# Formatting Utilities

This document provides information about the standardized formatting utilities in the codebase.

## Overview

All formatting utilities have been consolidated in `src/lib/utils/formatters.ts`. These utilities provide consistent formatting for:

- Currency values
- Dates and times
- Numbers and percentages
- Text truncation
- File sizes
- Phone numbers

## Usage

```typescript
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/formatters";

// Format currency
const price = formatCurrency(19.99, { currency: 'USD' });

// Format date
const formattedDate = formatDate(new Date(), { format: 'long', includeTime: true });

// Format number
const formattedNumber = formatNumber(1234.56789, { decimals: 2 });
```

## Available Formatters

### Currency Formatting

```typescript
formatCurrency(value: number, options?: CurrencyFormatOptions): string

// Options
interface CurrencyFormatOptions {
  currency?: string;  // Default: 'USD'
  locale?: string;    // Default: 'en-US'
}
```

### Date Formatting

```typescript
formatDate(date: Date | string | null | undefined, options?: DateFormatOptions): string

// Options
interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full';  // Default: 'short'
  includeTime?: boolean;                          // Default: false
  locale?: string;                                // Default: 'en-US'
}
```

### Relative Time Formatting

```typescript
formatRelativeTime(date: Date | string | null | undefined): string
```

Returns a string like "2 days ago", "3 weeks ago", etc.

### Number Formatting

```typescript
formatNumber(value: number, options?: NumberFormatOptions): string

// Options
interface NumberFormatOptions {
  decimals?: number;  // Default: 2
  locale?: string;    // Default: 'en-US'
}
```

### Percentage Formatting

```typescript
formatPercentage(value: number, options?: NumberFormatOptions): string
```

### Text Truncation

```typescript
truncateText(text: string, maxLength: number, suffix = '...'): string
```

### Phone Number Formatting

```typescript
formatPhoneNumber(phone: string): string
```

### File Size Formatting

```typescript
formatFileSize(bytes: number, options?: FileSizeFormatOptions): string

// Options
interface FileSizeFormatOptions {
  decimals?: number;  // Default: 2
}
```

## Deprecated Functions

The formatting functions in `src/lib/utils.ts` are deprecated and will be removed in a future release. They currently show warning messages when used and redirect to the new implementations.

## Migration

When migrating from inline formatting functions to the standardized utilities:

1. Import the appropriate formatter from `@/lib/utils/formatters`
2. Replace the inline function with the imported one
3. Adjust parameters as needed to match the new API

Example:

```typescript
// Before
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// After
import { formatCurrency } from '@/lib/utils/formatters';
// ...
formatCurrency(value, { currency: 'USD' });
```
