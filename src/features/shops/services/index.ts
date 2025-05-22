/**
 * Shops Services
 *
 * This module exports all services for the shops feature.
 */

// Export the factory-based service
export { default as shopService } from './factory-shopService';

// Export the legacy service with deprecation warning
import { shopService as legacyShopService } from './shopService';
/**
 * @deprecated Use the factory-based shopService instead
 */
export const shopServiceLegacy = legacyShopService;
