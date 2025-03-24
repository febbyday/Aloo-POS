/**
 * Import Validation Utilities
 * 
 * This file contains utility functions for validating and processing
 * data imported from external sources like CSV, Excel, etc.
 */

/**
 * Validates and processes data imported from external sources
 * 
 * @param data The raw imported data as an array of objects
 * @param type The type of data being imported (e.g., 'Products', 'Customers')
 * @returns Object with validated data and any validation errors
 */
export async function validateAndProcessImport(
  data: any[],
  type: 'Products' | 'Customers' | 'Orders' | 'Inventory' | string
): Promise<{ validData: any[]; errors: string[] }> {
  const validData: any[] = [];
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Imported data is not in the expected format.');
    return { validData, errors };
  }

  if (data.length === 0) {
    errors.push('No data found in the imported file.');
    return { validData, errors };
  }

  // Validate based on data type
  switch (type) {
    case 'Products':
      return validateProducts(data);
    case 'Customers':
      return validateCustomers(data);
    case 'Orders':
      return validateOrders(data);
    case 'Inventory':
      return validateInventory(data);
    default:
      // Generic validation
      data.forEach((item, index) => {
        if (typeof item !== 'object' || item === null) {
          errors.push(`Row ${index + 1}: Invalid data format.`);
          return;
        }
        validData.push(item);
      });
      return { validData, errors };
  }
}

/**
 * Validates product data from import
 */
function validateProducts(data: any[]): { validData: any[]; errors: string[] } {
  const validData: any[] = [];
  const errors: string[] = [];

  data.forEach((product, index) => {
    const rowNum = index + 1;
    const rowErrors: string[] = [];

    // Required fields
    if (!product.name) {
      rowErrors.push('Product name is required');
    }

    if (product.price !== undefined && isNaN(Number(product.price))) {
      rowErrors.push('Price must be a valid number');
    }

    if (product.stock !== undefined && isNaN(Number(product.stock))) {
      rowErrors.push('Stock must be a valid number');
    }

    // Add the row errors with row number
    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
    } else {
      // Process and normalize the data
      validData.push({
        ...product,
        price: product.price !== undefined ? Number(product.price) : undefined,
        stock: product.stock !== undefined ? Number(product.stock) : undefined,
      });
    }
  });

  return { validData, errors };
}

/**
 * Validates customer data from import
 */
function validateCustomers(data: any[]): { validData: any[]; errors: string[] } {
  const validData: any[] = [];
  const errors: string[] = [];

  // Implement customer-specific validation
  data.forEach((customer, index) => {
    const rowNum = index + 1;
    const rowErrors: string[] = [];

    if (!customer.name) {
      rowErrors.push('Customer name is required');
    }

    // Basic email validation
    if (customer.email && !/\S+@\S+\.\S+/.test(customer.email)) {
      rowErrors.push('Email is not in a valid format');
    }

    // Phone number validation (basic)
    if (customer.phone && !/^[0-9+\-() ]+$/.test(customer.phone)) {
      rowErrors.push('Phone number contains invalid characters');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
    } else {
      validData.push(customer);
    }
  });

  return { validData, errors };
}

/**
 * Validates order data from import
 */
function validateOrders(data: any[]): { validData: any[]; errors: string[] } {
  const validData: any[] = [];
  const errors: string[] = [];

  // Implement order-specific validation
  data.forEach((order, index) => {
    const rowNum = index + 1;
    const rowErrors: string[] = [];

    if (!order.orderId && !order.orderNumber) {
      rowErrors.push('Order ID/number is required');
    }

    if (order.amount !== undefined && isNaN(Number(order.amount))) {
      rowErrors.push('Order amount must be a valid number');
    }

    if (order.date && isNaN(Date.parse(order.date))) {
      rowErrors.push('Order date is not in a valid format');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
    } else {
      validData.push({
        ...order,
        amount: order.amount !== undefined ? Number(order.amount) : undefined,
        date: order.date ? new Date(order.date) : undefined,
      });
    }
  });

  return { validData, errors };
}

/**
 * Validates inventory data from import
 */
function validateInventory(data: any[]): { validData: any[]; errors: string[] } {
  const validData: any[] = [];
  const errors: string[] = [];

  // Implement inventory-specific validation
  data.forEach((item, index) => {
    const rowNum = index + 1;
    const rowErrors: string[] = [];

    if (!item.sku && !item.productId) {
      rowErrors.push('Product identifier (SKU or ID) is required');
    }

    if (item.quantity !== undefined && isNaN(Number(item.quantity))) {
      rowErrors.push('Quantity must be a valid number');
    }

    if (item.reorderPoint !== undefined && isNaN(Number(item.reorderPoint))) {
      rowErrors.push('Reorder point must be a valid number');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
    } else {
      validData.push({
        ...item,
        quantity: item.quantity !== undefined ? Number(item.quantity) : undefined,
        reorderPoint: item.reorderPoint !== undefined ? Number(item.reorderPoint) : undefined,
      });
    }
  });

  return { validData, errors };
} 