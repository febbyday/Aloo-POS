import { BaseService, QueryParams } from './base-service';
import { Order, OrderStatus, PaymentStatus } from '../mock-data/orders';
import { orders as mockOrders } from '../mock-data/orders';
import { generateId } from '@/lib/utils';

export class OrderService extends BaseService<Order> {
  constructor() {
    super({
      endpoint: '/orders',
      entityName: 'orders',
      usePersistence: true,
    });
  }

  // Override mock data methods
  protected getMockData(params?: QueryParams): Order[] {
    // Return a copy of the mock data to prevent modifications
    return JSON.parse(JSON.stringify(mockOrders));
  }

  // Get orders by customer
  public async getByCustomer(customerId: string, params?: QueryParams): Promise<Order[]> {
    try {
      const response = await this.getAll({
        ...params,
        filters: { ...params?.filters, customerId },
      });
      
      return response.data.filter(order => order.customerId === customerId);
    } catch (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error);
      throw error;
    }
  }

  // Get orders by status
  public async getByStatus(status: OrderStatus, params?: QueryParams): Promise<Order[]> {
    try {
      const response = await this.getAll({
        ...params,
        filters: { ...params?.filters, status },
      });
      
      return response.data.filter(order => order.status === status);
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error);
      throw error;
    }
  }

  // Get orders by payment status
  public async getByPaymentStatus(paymentStatus: PaymentStatus, params?: QueryParams): Promise<Order[]> {
    try {
      const response = await this.getAll({
        ...params,
        filters: { ...params?.filters, paymentStatus },
      });
      
      return response.data.filter(order => order.paymentStatus === paymentStatus);
    } catch (error) {
      console.error(`Error fetching orders with payment status ${paymentStatus}:`, error);
      throw error;
    }
  }

  // Get recent orders
  public async getRecentOrders(days: number = 30, limit: number = 10): Promise<Order[]> {
    try {
      const response = await this.getAll({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        pageSize: limit,
      });
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return response.data.filter(order => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= cutoffDate;
      });
    } catch (error) {
      console.error(`Error fetching orders from last ${days} days:`, error);
      throw error;
    }
  }

  // Update order status
  public async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const order = await this.getById(orderId);
      
      if (!order.data) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      const updatedOrder = {
        ...order.data,
        status,
        updatedAt: new Date().toISOString(),
      };
      
      return (await this.update(orderId, updatedOrder)).data;
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
      throw error;
    }
  }

  // Update payment status
  public async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      const order = await this.getById(orderId);
      
      if (!order.data) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      const updatedOrder = {
        ...order.data,
        paymentStatus,
        updatedAt: new Date().toISOString(),
      };
      
      return (await this.update(orderId, updatedOrder)).data;
    } catch (error) {
      console.error(`Error updating payment status for order ${orderId}:`, error);
      throw error;
    }
  }

  // Get total sales for a period
  public async getTotalSales(startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const orders = await this.getAll();
      
      let filteredOrders = orders.data;
      
      if (startDate || endDate) {
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          
          if (startDate && orderDate < startDate) {
            return false;
          }
          
          if (endDate && orderDate > endDate) {
            return false;
          }
          
          return true;
        });
      }
      
      // Only count paid or partially paid orders
      const paidOrders = filteredOrders.filter(order => 
        order.paymentStatus === 'paid' || order.paymentStatus === 'partially_paid'
      );
      
      return paidOrders.reduce((total, order) => total + order.total, 0);
    } catch (error) {
      console.error('Error calculating total sales:', error);
      throw error;
    }
  }

  // Get sales by product
  public async getSalesByProduct(startDate?: Date, endDate?: Date): Promise<Record<string, { quantity: number, total: number }>> {
    try {
      const orders = await this.getAll();
      
      let filteredOrders = orders.data;
      
      if (startDate || endDate) {
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          
          if (startDate && orderDate < startDate) {
            return false;
          }
          
          if (endDate && orderDate > endDate) {
            return false;
          }
          
          return true;
        });
      }
      
      // Only count paid or partially paid orders
      const paidOrders = filteredOrders.filter(order => 
        order.paymentStatus === 'paid' || order.paymentStatus === 'partially_paid'
      );
      
      const salesByProduct: Record<string, { quantity: number, total: number }> = {};
      
      paidOrders.forEach(order => {
        order.items.forEach(item => {
          if (!salesByProduct[item.productId]) {
            salesByProduct[item.productId] = { quantity: 0, total: 0 };
          }
          
          salesByProduct[item.productId].quantity += item.quantity;
          salesByProduct[item.productId].total += item.total;
        });
      });
      
      return salesByProduct;
    } catch (error) {
      console.error('Error calculating sales by product:', error);
      throw error;
    }
  }

  // Generate order number
  public generateOrderNumber(): string {
    const prefix = 'ORD-';
    const orders = this.getMockData();
    
    // Find the highest order number
    let maxNumber = 0;
    
    orders.forEach(order => {
      const orderNumber = order.orderNumber;
      if (orderNumber.startsWith(prefix)) {
        const number = parseInt(orderNumber.substring(prefix.length), 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    // Generate the next order number
    return `${prefix}${(maxNumber + 1).toString().padStart(5, '0')}`;
  }
}

// Create and export singleton instance
export const orderService = new OrderService();

export default orderService;
