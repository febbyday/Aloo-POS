/**
 * Suppliers Services Barrel File
 * Exports all services related to supplier management
 */

// Import legacy services
import { suppliersService } from './suppliersService';
import { suppliersConnector as legacySuppliersConnector } from './suppliersConnector';

// Import factory-based services
import { default as factorySuppliersService } from './factory-suppliers-service';
import { default as factorySuppliersConnector } from './factory-suppliersConnector';

// Export factory-based services as the primary services
export {
  factorySuppliersService as suppliersService,
  factorySuppliersConnector as suppliersConnector
};

// Export legacy services with deprecation warnings
/**
 * @deprecated Use the factory-based suppliersService from './factory-suppliers-service' instead
 */
export const legacySuppliersService = suppliersService;

/**
 * @deprecated Use the factory-based suppliersConnector from './factory-suppliersConnector' instead
 */
export { legacySuppliersConnector };
