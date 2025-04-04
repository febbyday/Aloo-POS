import { BaseService } from './base-service';
import { productService } from './product-service';
import { customerService } from './customer-service';
import { supplierService } from './supplier-service';
import { orderService } from './order-service';
import { shopService } from './shop-service';

// Export all services
export {
  BaseService,
  productService,
  customerService,
  supplierService,
  orderService,
  shopService,
};

// Export default object with all services
export default {
  products: productService,
  customers: customerService,
  suppliers: supplierService,
  orders: orderService,
  shops: shopService,
};
