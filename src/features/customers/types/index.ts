/**
 * Customers Types
 * 
 * This module exports type definitions for the customers feature.
 */

// Export all types here

/**
 * Customer Types Barrel Export
 */

import { toUiModel, toApiModel } from './customer.mappers';

export * from './customer.types';
export { toUiModel, toApiModel };

// Export the mappers as an object for convenience
export const customerMappers = {
  toUiModel,
  toApiModel,
};
