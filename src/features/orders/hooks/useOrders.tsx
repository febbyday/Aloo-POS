import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/lib/api/services/order-service';
import { Order, OrderStatus, PaymentStatus } from '@/lib/api/mock-data/orders';
import { useToast } from '@/lib/toast';
import { eventBus, POS_EVENTS } from '@/lib/events/event-bus';

interface UseOrdersOptions {
  initialPageSize?: number;
  initialPage?: number;
  autoLoad?: boolean;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const {
    initialPageSize = 10,
    initialPage = 1,
    autoLoad = true
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0,
  });

  const { toast } = useToast();

  const fetchOrders = useCallback(async (page = pagination.page, pageSize = pagination.pageSize, search?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderService.getAll({
        page,
        pageSize,
        search,
      });

      setOrders(response.data);
      setPagination({
        page: response.pagination.page,
        pageSize: response.pagination.pageSize,
        totalItems: response.pagination.totalItems,
        totalPages: response.pagination.totalPages,
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading orders",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load orders: ${(err as Error).message}`,
        source: 'useOrders.fetchOrders',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, toast]);

  const fetchOrderById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderService.getById(id);
      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading order",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load order ${id}: ${(err as Error).message}`,
        source: 'useOrders.fetchOrderById',
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createOrder = useCallback(async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      // Generate order number
      const orderNumber = orderService.generateOrderNumber();

      // Create the order with additional fields
      const newOrder: Omit<Order, 'id'> = {
        ...order,
        orderNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await orderService.create(newOrder);
      setOrders(prev => [...prev, response.data]);

      toast({
        title: "Order created",
        description: `Order ${response.data.orderNumber} has been created successfully.`,
      });

      // Emit order created event
      eventBus.emit(POS_EVENTS.ORDER_CREATED, response.data.id);

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error creating order",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to create order: ${(err as Error).message}`,
        source: 'useOrders.createOrder',
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateOrder = useCallback(async (id: string, order: Partial<Order>) => {
    setLoading(true);
    setError(null);

    try {
      const oldOrder = await orderService.getById(id);

      // Add updated timestamp
      const updatedOrder: Partial<Order> = {
        ...order,
        updatedAt: new Date().toISOString(),
      };

      const response = await orderService.update(id, updatedOrder);
      setOrders(prev => prev.map(o => o.id === id ? response.data : o));

      toast({
        title: "Order updated",
        description: `Order ${response.data.orderNumber} has been updated successfully.`,
      });

      // Emit order updated event
      eventBus.emit(POS_EVENTS.ORDER_UPDATED, {
        orderId: id,
        changes: {
          ...Object.keys(order).reduce((acc, key) => {
            acc[key] = {
              from: oldOrder.data?.[key as keyof Order],
              to: order[key as keyof Order]
            };
            return acc;
          }, {} as Record<string, { from: any; to: any }>)
        }
      });

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error updating order",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to update order ${id}: ${(err as Error).message}`,
        source: 'useOrders.updateOrder',
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await orderService.delete(id);
      setOrders(prev => prev.filter(o => o.id !== id));

      toast({
        title: "Order deleted",
        description: "The order has been deleted successfully.",
      });

      // Emit order deleted event
      eventBus.emit(POS_EVENTS.ORDER_DELETED, id);

      return true;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error deleting order",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to delete order ${id}: ${(err as Error).message}`,
        source: 'useOrders.deleteOrder',
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    setLoading(true);
    setError(null);

    try {
      const oldOrder = await orderService.getById(id);
      const updatedOrder = await orderService.updateStatus(id, status);

      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));

      toast({
        title: "Order status updated",
        description: `Status for order ${updatedOrder.orderNumber} has been updated to ${status}.`,
      });

      // Emit order status changed event
      eventBus.emit(POS_EVENTS.ORDER_STATUS_CHANGED, {
        orderId: id,
        newStatus: status,
        oldStatus: oldOrder.data?.status,
      });

      return updatedOrder;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error updating order status",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to update status for order ${id}: ${(err as Error).message}`,
        source: 'useOrders.updateOrderStatus',
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updatePaymentStatus = useCallback(async (id: string, paymentStatus: PaymentStatus) => {
    setLoading(true);
    setError(null);

    try {
      const oldOrder = await orderService.getById(id);
      const updatedOrder = await orderService.updatePaymentStatus(id, paymentStatus);

      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));

      toast({
        title: "Payment status updated",
        description: `Payment status for order ${updatedOrder.orderNumber} has been updated to ${paymentStatus}.`,
      });

      // Emit order payment status changed event
      eventBus.emit(POS_EVENTS.ORDER_PAYMENT_STATUS_CHANGED, {
        orderId: id,
        newStatus: paymentStatus,
        oldStatus: oldOrder.data?.paymentStatus,
      });

      return updatedOrder;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error updating payment status",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to update payment status for order ${id}: ${(err as Error).message}`,
        source: 'useOrders.updatePaymentStatus',
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getOrdersByCustomer = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);

    try {
      const customerOrders = await orderService.getByCustomer(customerId);
      return customerOrders;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading customer orders",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load orders for customer ${customerId}: ${(err as Error).message}`,
        source: 'useOrders.getOrdersByCustomer',
      });

      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getOrdersByStatus = useCallback(async (status: OrderStatus) => {
    setLoading(true);
    setError(null);

    try {
      const statusOrders = await orderService.getByStatus(status);
      return statusOrders;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading orders by status",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load orders with status ${status}: ${(err as Error).message}`,
        source: 'useOrders.getOrdersByStatus',
      });

      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getRecentOrders = useCallback(async (days: number = 30, limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const recentOrders = await orderService.getRecentOrders(days, limit);
      return recentOrders;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading recent orders",
        description: (err as Error).message,
        variant: "destructive",
      });

      // Emit system error event
      eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
        message: `Failed to load recent orders: ${(err as Error).message}`,
        source: 'useOrders.getRecentOrders',
      });

      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load orders on initial render if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchOrders(initialPage, initialPageSize);
    }
  }, [autoLoad, fetchOrders, initialPage, initialPageSize]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getOrdersByCustomer,
    getOrdersByStatus,
    getRecentOrders,
  };
}

export default useOrders;
