/**
 * @deprecated This service is deprecated. Use the factory-based suppliers service instead.
 * Import from factory-suppliers-service.ts:
 * import suppliersService from './factory-suppliers-service';
 */

import factorySuppliersService from './factory-suppliers-service';
import { Supplier, SUPPLIER_STATUS, SupplierType, Performance, BankingDetails, Commission, TopProduct, OrderHistory, ConnectionConfig, ConnectionStatus, ConnectionType, ValidationResult } from '../types';

// Re-export the factory-based suppliers service
export const suppliersService = factorySuppliersService;

// Export for backward compatibility
export default suppliersService;
