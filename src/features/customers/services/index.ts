/**
 * Customers Services
 *
 * This module exports all services for the customers feature.
 */

// Import legacy services
import { dataAseusigService } from './dataAseusigService';

// Import factory-based services
import { factoryDataAseusigService } from './factory-data-aseusig-service';
import { factoryCustomerService } from './factory-customer-service';

// Export factory-based services as the primary services
export {
  factoryDataAseusigService as dataAseusigService,
  factoryCustomerService as customerService
};

// Export legacy services with deprecation warnings
/**
 * @deprecated Use the factory-based dataAseusigService from './factory-data-aseusig-service' instead
 */
export const legacyDataAseusigService = dataAseusigService;
