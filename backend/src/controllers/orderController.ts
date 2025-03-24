import { Request, Response } from 'express';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { orderService } from '../services/orderService';
import { 
  transformOrderToDto, 
  transformToOrderListDto,
  transformToOrderSummary,
  transformToSalesSummaryDto
} from '../types/dto/orderDto';

/**
 * OrderController
 * Handles HTTP requests related to orders
 */
export class OrderController {
  /**
   * Get all orders with pagination and filtering
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        paymentStatus,
        storeId,
        startDate,
        endDate,
        minTotal,
        maxTotal,
        sortBy,
        sortOrder,
      } = req.query;

      // Parse query parameters
      const parsedPage = parseInt(page as string) || 1;
      const parsedLimit = parseInt(limit as string) || 20;
      const parsedMinTotal = minTotal ? parseFloat(minTotal as string) : undefined;
      const parsedMaxTotal = maxTotal ? parseFloat(maxTotal as string) : undefined;
      
      // Parse dates if provided
      const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
      const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

      // Get orders
      const result = await orderService.getAllOrders({
        page: parsedPage,
        limit: parsedLimit,
        search: search as string,
        status: status as OrderStatus,
        paymentStatus: paymentStatus as PaymentStatus,
        storeId: storeId as string,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        minTotal: parsedMinTotal,
        maxTotal: parsedMaxTotal,
        sortBy: sortBy as string,
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      });

      // Transform to DTO
      const orderListDto = transformToOrderListDto(result);

      res.status(200).json(orderListDto);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({
        message: 'Failed to retrieve orders',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get an order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      const orderDto = transformOrderToDto(order);
      res.status(200).json(orderDto);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        message: 'Failed to retrieve order',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get an order by order number
   */
  async getOrderByOrderNumber(req: Request, res: Response): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByOrderNumber(orderNumber);

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      const orderDto = transformOrderToDto(order);
      res.status(200).json(orderDto);
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({
        message: 'Failed to retrieve order',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const {
        storeId,
        status,
        paymentStatus,
        paymentMethod,
        notes,
        items,
      } = req.body;

      // Validate request
      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: 'Order must include at least one item' });
        return;
      }

      // Create order
      const order = await orderService.createOrder({
        storeId,
        status,
        paymentStatus,
        paymentMethod,
        notes,
        items,
      });

      // Transform to DTO and return
      const orderDto = transformOrderToDto(order);
      res.status(201).json(orderDto);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        message: 'Failed to create order',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Update an existing order
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        status,
        paymentStatus,
        paymentMethod,
        notes,
        storeId,
      } = req.body;

      // Update order
      const order = await orderService.updateOrder(id, {
        status,
        paymentStatus,
        paymentMethod,
        notes,
        storeId,
      });

      // Transform to DTO and return
      const orderDto = transformOrderToDto(order);
      res.status(200).json(orderDto);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({
        message: 'Failed to update order',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Delete an order
   */
  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await orderService.deleteOrder(id);
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({
        message: 'Failed to delete order',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get order summary (useful for receipt/invoice)
   */
  async getOrderSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      const summary = transformToOrderSummary(order);
      res.status(200).json(summary);
    } catch (error) {
      console.error('Error getting order summary:', error);
      res.status(500).json({
        message: 'Failed to retrieve order summary',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Get sales summary data
   */
  async getSalesSummary(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'day', startDate, endDate } = req.query;
      
      // Validate period
      if (!['day', 'week', 'month'].includes(period as string)) {
        res.status(400).json({ message: 'Invalid period. Must be day, week, or month' });
        return;
      }

      // Parse date range if provided
      let dateRange: { start: Date; end: Date } | undefined;
      
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }

      // Get sales summary
      const summary = await orderService.getSalesSummary(
        period as 'day' | 'week' | 'month',
        dateRange
      );

      // Transform to DTO
      const summaryDto = transformToSalesSummaryDto(summary);
      
      res.status(200).json(summaryDto);
    } catch (error) {
      console.error('Error getting sales summary:', error);
      res.status(500).json({
        message: 'Failed to retrieve sales summary',
        error: (error as Error).message,
      });
    }
  }
}

// Export singleton instance
export const orderController = new OrderController(); 