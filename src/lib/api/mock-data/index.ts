import { products } from './products';
import { categories } from './categories';
import { customers } from './customers';
import { suppliers } from './suppliers';
import { orders } from './orders';
import { inventory } from './inventory';
import { employees } from './employees';
import { payments } from './payments';
import { taxes } from './taxes';
import { discounts } from './discounts';
import { settings } from './settings';

// Export all mock data
export const mockData = {
  products,
  categories,
  customers,
  suppliers,
  orders,
  inventory,
  employees,
  payments,
  taxes,
  discounts,
  settings,
};

// Export individual collections
export {
  products,
  categories,
  customers,
  suppliers,
  orders,
  inventory,
  employees,
  payments,
  taxes,
  discounts,
  settings,
};

export default mockData;
