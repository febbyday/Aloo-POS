import { generateId } from '@/lib/utils';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  notes?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  employeeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'on_hold';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'failed';

// Generate mock orders
export const orders: Order[] = [
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10001',
    customerId: 'cust_1',
    customerName: 'John Smith',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_1',
        name: 'Laptop Pro 15"',
        sku: 'LAP-PRO-15',
        quantity: 1,
        unitPrice: 1299.99,
        taxRate: 8.5,
        taxAmount: 110.50,
        discountAmount: 0,
        total: 1410.49,
      },
      {
        id: generateId('item_'),
        productId: 'prod_3',
        name: 'Wireless Earbuds Pro',
        sku: 'AUDIO-EB-PRO',
        quantity: 1,
        unitPrice: 149.99,
        taxRate: 8.5,
        taxAmount: 12.75,
        discountAmount: 0,
        total: 162.74,
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    subtotal: 1449.98,
    taxAmount: 123.25,
    discountAmount: 0,
    shippingAmount: 0,
    total: 1573.23,
    notes: 'Customer requested gift wrapping',
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    employeeId: 'emp_1',
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 0, 15).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10002',
    customerId: 'cust_2',
    customerName: 'Emily Johnson',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_2',
        name: 'Smartphone X',
        sku: 'PHONE-X-128',
        quantity: 1,
        unitPrice: 899.99,
        taxRate: 8.5,
        taxAmount: 76.50,
        discountAmount: 0,
        total: 976.49,
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    subtotal: 899.99,
    taxAmount: 76.50,
    discountAmount: 0,
    shippingAmount: 0,
    total: 976.49,
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      postalCode: '67890',
      country: 'USA',
    },
    billingAddress: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      postalCode: '67890',
      country: 'USA',
    },
    employeeId: 'emp_2',
    createdAt: new Date(2024, 0, 20).toISOString(),
    updatedAt: new Date(2024, 0, 20).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10003',
    customerId: 'cust_3',
    customerName: 'Michael Brown',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_6',
        name: 'Gaming Console Pro',
        sku: 'GAME-CONS-PRO',
        quantity: 1,
        unitPrice: 499.99,
        taxRate: 8.5,
        taxAmount: 42.50,
        discountAmount: 0,
        total: 542.49,
      },
      {
        id: generateId('item_'),
        productId: 'prod_8',
        name: 'Bluetooth Speaker Portable',
        sku: 'AUDIO-BT-SPK',
        quantity: 2,
        unitPrice: 79.99,
        taxRate: 8.5,
        taxAmount: 13.60,
        discountAmount: 0,
        total: 173.58,
      }
    ],
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'paypal',
    subtotal: 659.97,
    taxAmount: 56.10,
    discountAmount: 0,
    shippingAmount: 15.00,
    total: 731.07,
    notes: 'Business purchase',
    shippingAddress: {
      street: '789 Pine St',
      city: 'Elsewhere',
      state: 'TX',
      postalCode: '54321',
      country: 'USA',
    },
    billingAddress: {
      street: '789 Pine St',
      city: 'Elsewhere',
      state: 'TX',
      postalCode: '54321',
      country: 'USA',
    },
    employeeId: 'emp_1',
    createdAt: new Date(2024, 1, 5).toISOString(),
    updatedAt: new Date(2024, 1, 10).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10004',
    customerId: 'cust_4',
    customerName: 'Sarah Davis',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_1',
        name: 'Laptop Pro 15"',
        sku: 'LAP-PRO-15',
        quantity: 1,
        unitPrice: 1299.99,
        taxRate: 8.5,
        taxAmount: 110.50,
        discountAmount: 0,
        total: 1410.49,
      }
    ],
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    subtotal: 1299.99,
    taxAmount: 110.50,
    discountAmount: 0,
    shippingAmount: 0,
    total: 1410.49,
    shippingAddress: {
      street: '101 Maple Dr',
      city: 'Nowhere',
      state: 'FL',
      postalCode: '98765',
      country: 'USA',
    },
    billingAddress: {
      street: '101 Maple Dr',
      city: 'Nowhere',
      state: 'FL',
      postalCode: '98765',
      country: 'USA',
    },
    employeeId: 'emp_3',
    createdAt: new Date(2024, 1, 15).toISOString(),
    updatedAt: new Date(2024, 1, 15).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10005',
    customerId: 'cust_5',
    customerName: 'David Wilson',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_6',
        name: 'Gaming Console Pro',
        sku: 'GAME-CONS-PRO',
        quantity: 1,
        unitPrice: 499.99,
        taxRate: 8.5,
        taxAmount: 42.50,
        discountAmount: 0,
        total: 542.49,
      },
      {
        id: generateId('item_'),
        productId: 'prod_7',
        name: 'Smart LED TV 55"',
        sku: 'TV-LED-55',
        quantity: 1,
        unitPrice: 599.99,
        taxRate: 8.5,
        taxAmount: 51.00,
        discountAmount: 50.00,
        total: 600.99,
      }
    ],
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'bank_transfer',
    subtotal: 1099.98,
    taxAmount: 93.50,
    discountAmount: 50.00,
    shippingAmount: 25.00,
    total: 1168.48,
    notes: 'Waiting for payment confirmation',
    shippingAddress: {
      street: '202 Cedar Ln',
      city: 'Someplace',
      state: 'WA',
      postalCode: '13579',
      country: 'USA',
    },
    billingAddress: {
      street: '202 Cedar Ln',
      city: 'Someplace',
      state: 'WA',
      postalCode: '13579',
      country: 'USA',
    },
    employeeId: 'emp_2',
    createdAt: new Date(2024, 1, 28).toISOString(),
    updatedAt: new Date(2024, 1, 28).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10006',
    customerId: 'cust_1',
    customerName: 'John Smith',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_5',
        name: 'Fitness Tracker Watch',
        sku: 'WEAR-FT-PRO',
        quantity: 1,
        unitPrice: 89.99,
        taxRate: 8.5,
        taxAmount: 7.65,
        discountAmount: 0,
        total: 97.64,
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    subtotal: 89.99,
    taxAmount: 7.65,
    discountAmount: 0,
    shippingAmount: 5.00,
    total: 102.64,
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    },
    employeeId: 'emp_1',
    createdAt: new Date(2024, 0, 25).toISOString(),
    updatedAt: new Date(2024, 0, 30).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10007',
    customerId: 'cust_6',
    customerName: 'Jennifer Martinez',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_4',
        name: 'Coffee Maker Deluxe',
        sku: 'HOME-CM-DLX',
        quantity: 1,
        unitPrice: 129.99,
        taxRate: 7.0,
        taxAmount: 9.10,
        discountAmount: 0,
        total: 139.09,
      },
      {
        id: generateId('item_'),
        productId: 'prod_10',
        name: 'Desk Chair Ergonomic',
        sku: 'FURN-CHAIR-ERG',
        quantity: 2,
        unitPrice: 199.99,
        taxRate: 7.0,
        taxAmount: 28.00,
        discountAmount: 40.00,
        total: 387.98,
      }
    ],
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    subtotal: 529.97,
    taxAmount: 37.10,
    discountAmount: 40.00,
    shippingAmount: 0,
    total: 527.07,
    notes: 'Business purchase for home office',
    shippingAddress: {
      street: '303 Birch Rd',
      city: 'Anywhere',
      state: 'IL',
      postalCode: '24680',
      country: 'USA',
    },
    billingAddress: {
      street: '303 Birch Rd',
      city: 'Anywhere',
      state: 'IL',
      postalCode: '24680',
      country: 'USA',
    },
    employeeId: 'emp_3',
    createdAt: new Date(2024, 2, 1).toISOString(),
    updatedAt: new Date(2024, 2, 1).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10008',
    customerId: 'cust_7',
    customerName: 'Robert Taylor',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_8',
        name: 'Bluetooth Speaker Portable',
        sku: 'AUDIO-BT-SPK',
        quantity: 1,
        unitPrice: 79.99,
        taxRate: 8.5,
        taxAmount: 6.80,
        discountAmount: 0,
        total: 86.79,
      }
    ],
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'credit_card',
    subtotal: 79.99,
    taxAmount: 6.80,
    discountAmount: 0,
    shippingAmount: 5.00,
    total: 91.79,
    notes: 'Customer cancelled order',
    shippingAddress: {
      street: '404 Elm St',
      city: 'Otherville',
      state: 'GA',
      postalCode: '36925',
      country: 'USA',
    },
    billingAddress: {
      street: '404 Elm St',
      city: 'Otherville',
      state: 'GA',
      postalCode: '36925',
      country: 'USA',
    },
    employeeId: 'emp_2',
    createdAt: new Date(2024, 1, 10).toISOString(),
    updatedAt: new Date(2024, 1, 12).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10009',
    customerId: 'cust_8',
    customerName: 'Lisa Anderson',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_3',
        name: 'Wireless Earbuds Pro',
        sku: 'AUDIO-EB-PRO',
        quantity: 1,
        unitPrice: 149.99,
        taxRate: 8.5,
        taxAmount: 12.75,
        discountAmount: 15.00,
        total: 147.74,
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'paypal',
    subtotal: 149.99,
    taxAmount: 12.75,
    discountAmount: 15.00,
    shippingAmount: 0,
    total: 147.74,
    notes: 'Student discount applied',
    shippingAddress: {
      street: '505 Walnut Ave',
      city: 'Sometown',
      state: 'MI',
      postalCode: '14703',
      country: 'USA',
    },
    billingAddress: {
      street: '505 Walnut Ave',
      city: 'Sometown',
      state: 'MI',
      postalCode: '14703',
      country: 'USA',
    },
    employeeId: 'emp_1',
    createdAt: new Date(2024, 0, 5).toISOString(),
    updatedAt: new Date(2024, 0, 10).toISOString(),
  },
  {
    id: generateId('ord_'),
    orderNumber: 'ORD-10010',
    customerId: 'cust_9',
    customerName: 'James Thomas',
    items: [
      {
        id: generateId('item_'),
        productId: 'prod_8',
        name: 'Bluetooth Speaker Portable',
        sku: 'AUDIO-BT-SPK',
        quantity: 1,
        unitPrice: 79.99,
        taxRate: 8.5,
        taxAmount: 6.80,
        discountAmount: 0,
        total: 86.79,
      },
      {
        id: generateId('item_'),
        productId: 'prod_3',
        name: 'Wireless Earbuds Pro',
        sku: 'AUDIO-EB-PRO',
        quantity: 1,
        unitPrice: 149.99,
        taxRate: 8.5,
        taxAmount: 12.75,
        discountAmount: 0,
        total: 162.74,
      }
    ],
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    subtotal: 229.98,
    taxAmount: 19.55,
    discountAmount: 0,
    shippingAmount: 0,
    total: 249.53,
    shippingAddress: {
      street: '606 Cherry St',
      city: 'Anyplace',
      state: 'OH',
      postalCode: '25814',
      country: 'USA',
    },
    billingAddress: {
      street: '606 Cherry St',
      city: 'Anyplace',
      state: 'OH',
      postalCode: '25814',
      country: 'USA',
    },
    employeeId: 'emp_3',
    createdAt: new Date(2024, 1, 8).toISOString(),
    updatedAt: new Date(2024, 1, 12).toISOString(),
  },
];

export default orders;
