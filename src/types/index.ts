/**
 * Types Module Index
 * 
 * This file exports all types, interfaces, and type utilities from the types directory.
 * Import from this file to get access to all type-related functionality.
 */

// Export base types
export * from './base';

// Export utility functions
export * from './utils';

// Export validation helpers
export * from './validation';

// Export common types
export * from './common';

// Export date utilities
export * from './date';

// Export inventory types
export * from './inventory';

// Export legacy aliases for backward compatibility
import * as Base from './base';
import * as Utils from './utils';
import * as Validation from './validation';
import * as Common from './common';
import * as Date from './date';
import * as Inventory from './inventory';

// Legacy namespace exports for backward compatibility
export const Types = {
  ...Base,
  ...Utils,
  ...Validation,
  ...Common,
  ...Date,
  ...Inventory
}; 