/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Factory-Based Orders Service
 * 
 * This service uses the centralized service factory and endpoint registry to provide
 * a consistent implementation of order-related operations with minimal duplication.
 */

import { Order, OrderItem, OrderPayment, OrderFulfillment } from '../types/order.types';
import { createServiceMethod, createStandardService } from '@/lib/api/service-endpoint-factory';
import { ORDER_ENDPOINTS } from '@/lib/api/endpoint-registry';
import { ApiErrorType } from '@/lib/api/error-handler';

/**
 * Orders service with standardized endpoint handling
 */
const ordersService = {
  // Basic CRUD operations from the standard service factory
  ...createStandardService<Order>('orders', {
    useEnhancedClient: true,
    withRetry: {
      maxRetries: 2,
      shouldRetry: (error: any) => {
        // Only retry network or server errors
        return ![
          ApiErrorType.VALIDATION, 
          ApiErrorType.CONFLICT,
          ApiErrorType.AUTHORIZATION
        ].includes(error.type);
      }
    },
    cacheResponse: false, // Orders should always be fresh
    // Map response to ensure dates are properly converted
    mapResponse: (data: any) => {
      if (Array.isArray(data)) {
        return data.map(order => ({
          ...order,
          createdAt: order.createdAt ? new Date(order.createdAt) : undefined,
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
          placedAt: order.placedAt ? new Date(order.placedAt) : undefined,
          fulfilledAt: order.fulfilledAt ? new Date(order.fulfilledAt) : undefined,
          cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined
        }));
      }
      
      if (!data) return null;
      
      return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        placedAt: data.placedAt ? new Date(data.placedAt) : undefined,
        fulfilledAt: data.fulfilledAt ? new Date(data.fulfilledAt) : undefined,
        cancelledAt: data.cancelledAt ? new Date(data.cancelledAt) : undefined
      };
    }
  }),
  
  // Custom methods for order-specific operations
  
  /**
   * Get order items
   */
  getOrderItems: createServiceMethod<OrderItem[]>(
    'orders', 'ITEMS', 'get'
  ),
  
  /**
   * Add item to order
   */
  addOrderItem: createServiceMethod<OrderItem, Partial<OrderItem>>(
    'orders', 'ADD_ITEM', 'post',
    { withRetry: false }
  ),
  
  /**
   * Remove item from order
   */
  removeOrderItem: createServiceMethod<void>(
    'orders', 'REMOVE_ITEM', 'delete',
    { withRetry: false }
  ),
  
  /**
   * Process order payment
   */
  processOrderPayment: createServiceMethod<OrderPayment, {
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
  }>('orders', 'PAYMENT', 'post', { withRetry: false }),
  
  /**
   * Process order fulfillment
   */
  processOrderFulfillment: createServiceMethod<OrderFulfillment, {
    status: string;
    notes?: string;
    trackingNumber?: string;
    fulfillmentMethod?: string;
  }>('orders', 'FULFILLMENT', 'post', { withRetry: false }),
  
  /**
   * Cancel order
   */
  cancelOrder: createServiceMethod<void, {
    reason: string;
    notes?: string;
  }>('orders', 'CANCEL', 'post', { withRetry: false }),
  
  /**
   * Refund order
   */
  refundOrder: createServiceMethod<void, {
    amount: number;
    reason: string;
    notes?: string;
  }>('orders', 'REFUND', 'post', { withRetry: false }),
  
  /**
   * Get order history
   */
  getOrderHistory: createServiceMethod<{
    timestamp: string;
    action: string;
    user: string;
    details: any;
  }[]>('orders', 'HISTORY', 'get'),
  
  /**
   * Additional convenience methods
   */
  
  /**
   * Get orders by customer
   */
  getOrdersByCustomer: async (customerId: string): Promise<Order[]> => {
    return ordersService.getAll({ customerId });
  },
  
  /**
   * Get orders by status
   */
  getOrdersByStatus: async (status: string): Promise<Order[]> => {
    return ordersService.getAll({ status });
  },
  
  /**
   * Get orders by date range
   */
  getOrdersByDateRange: async (startDate: Date, endDate: Date): Promise<Order[]> => {
    return ordersService.getAll({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  },
  
  /**
   * Create order with items in a single operation
   */
  createOrderWithItems: async (
    order: Partial<Order>,
    items: Array<Partial<OrderItem>>
  ): Promise<Order> => {
    // Create the order first
    const createdOrder = await ordersService.create(order);
    
    // Add items
    for (const item of items) {
      await ordersService.addOrderItem(
        undefined,
        {
          ...item,
          orderId: createdOrder.id
        },
        { id: createdOrder.id }
      );
    }
    
    // Get updated order with items
    const updatedOrder = await ordersService.getById(createdOrder.id);
    return updatedOrder as Order;
  },
  
  /**
   * Process a complete order
   */
  completeOrder: async (
    orderId: string,
    paymentDetails: {
      amount: number;
      method: string;
      reference?: string;
    }
  ): Promise<Order> => {
    // Process payment
    await ordersService.processOrderPayment(
      undefined,
      {
        ...paymentDetails,
        notes: 'Payment completed'
      },
      { id: orderId }
    );
    
    // Update order status
    const updatedOrder = await ordersService.update(orderId, {
      status: 'paid',
      updatedAt: new Date().toISOString()
    });
    
    return updatedOrder;
  }
};

export default ordersService;
