import { BaseService } from './base-service';
import { productService } from './product-service';
import { customerService } from './customer-service';
import { supplierService } from './supplier-service';
import { orderService } from './order-service';

// Export all services
export {
  BaseService,
  productService,
  customerService,
  supplierService,
  orderService,
};

// Export default object with all services
export default {
  products: productService,
  customers: customerService,
  suppliers: supplierService,
  orders: orderService,
};
