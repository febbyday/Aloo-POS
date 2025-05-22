/**
 * Markets Services
 *
 * This module exports all services for the markets feature.
 */

// Export the factory-based service
export { default as marketsService } from './factory-marketsService';

// Export the legacy service with deprecation warning
import { marketsService as legacyMarketsService } from './marketsService';
/**
 * @deprecated Use the factory-based marketsService instead
 */
export const marketsServiceLegacy = legacyMarketsService;
