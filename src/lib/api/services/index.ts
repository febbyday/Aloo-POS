/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * API Services Index
 * 
 * This file exports all service instances from the centralized factory-based implementations.
 */

import { BaseService } from './base-service';
import productService from '../../../features/products/services/factory-product-service';
import customersService from '../../../features/customers/services/factory-customers-service';
import suppliersService from '../../../features/suppliers/services/factory-suppliers-service';
import ordersService from '../../../features/orders/services/factory-orders-service';
import { shopService } from './shop-service';

// Export all services
export {
  BaseService,
  productService,
  customersService as customerService,
  suppliersService as supplierService,
  ordersService as orderService,
  shopService,
};

// Export default object with all services
export default {
  products: productService,
  customers: customersService,
  suppliers: suppliersService,
  orders: ordersService,
  shops: shopService,
};
