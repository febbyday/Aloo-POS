import { Order, OrderItem, OrderStatus, PaymentStatus } from '@prisma/client';

/**
 * Data Transfer Object for Order Item entity
 */
export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for Order entity
 */
export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  storeId: string | null;
  storeName: string | null;
  items: OrderItemDto[];
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for a paginated list of orders
 */
export interface OrderListDto {
  orders: OrderDto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Data Transfer Object for order summaries (for lists)
 */
export interface OrderSummaryDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  itemCount: number;
  createdAt: Date;
}

/**
 * Data Transfer Object for sales summary
 */
export interface SalesSummaryDto {
  period: string;
  totalOrders: number;
  revenue: number;
  averageOrderValue: number;
}

/**
 * Transform an OrderItem entity to an OrderItemDto
 */
export function transformOrderItemToDto(
  orderItem: OrderItem & {
    product?: {
      id: string;
      name: string;
      sku: string;
    };
  }
): OrderItemDto {
  // Calculate the subtotal (price * quantity)
  const subtotal = Number(orderItem.price) * orderItem.quantity;
  
  // Calculate the total with tax and discount
  const total = subtotal + Number(orderItem.tax) - Number(orderItem.discount);

  return {
    id: orderItem.id,
    productId: orderItem.productId,
    productName: orderItem.product?.name || 'Unknown Product',
    productSku: orderItem.product?.sku || '',
    quantity: orderItem.quantity,
    price: Number(orderItem.price),
    discount: Number(orderItem.discount),
    tax: Number(orderItem.tax),
    subtotal,
    total,
    createdAt: orderItem.createdAt,
    updatedAt: orderItem.updatedAt,
  };
}

/**
 * Transform an Order entity to an OrderDto
 */
export function transformOrderToDto(
  order: Order & {
    store?: { id: string; name: string } | null;
    items?: (OrderItem & {
      product?: {
        id: string;
        name: string;
        sku: string;
      };
    })[];
    _count?: { items: number };
  }
): OrderDto {
  const items = order.items
    ? order.items.map(transformOrderItemToDto)
    : [];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    discount: Number(order.discount),
    total: Number(order.total),
    notes: order.notes,
    storeId: order.storeId,
    storeName: order.store?.name || null,
    items,
    itemCount: order._count?.items || items.length,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/**
 * Transform an Order entity to an OrderSummaryDto
 */
export function transformToOrderSummary(
  order: Order & {
    _count?: { items: number };
  }
): OrderSummaryDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    itemCount: order._count?.items || 0,
    createdAt: order.createdAt,
  };
}

/**
 * Transform a paginated list of orders to an OrderListDto
 */
export function transformToOrderListDto(
  data: {
    orders: (Order & {
      store?: { id: string; name: string } | null;
      items?: (OrderItem & {
        product?: {
          id: string;
          name: string;
          sku: string;
        };
      })[];
      _count?: { items: number };
    })[];
    total: number;
    page: number;
    limit: number;
  },
  useSummary: boolean = true
): OrderListDto {
  return {
    orders: data.orders.map(order => 
      useSummary 
        ? transformToOrderSummary(order) as unknown as OrderDto
        : transformOrderToDto(order)
    ),
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
}

/**
 * Transform sales summary data
 */
export function transformToSalesSummaryDto(
  data: Array<{
    period: string; 
    totalOrders: number; 
    revenue: number; 
    averageOrderValue: number;
  }>
): SalesSummaryDto[] {
  return data.map(item => ({
    period: item.period,
    totalOrders: Number(item.totalOrders),
    revenue: Number(item.revenue),
    averageOrderValue: Number(item.averageOrderValue),
  }));
} 