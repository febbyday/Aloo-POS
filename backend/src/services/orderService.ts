import { Order, OrderItem, Prisma, OrderStatus, PaymentStatus, Product } from '@prisma/client';
import { orderRepository, OrderRepository } from '../repositories/orderRepository';
import { orderItemRepository, OrderItemRepository } from '../repositories/orderItemRepository';
import { productService } from './productService';
import { prisma } from '../index';

/**
 * OrderService
 * Handles business logic for orders
 */
export class OrderService {
  private repository: OrderRepository;
  private itemRepository: OrderItemRepository;

  constructor(repository: OrderRepository, itemRepository: OrderItemRepository) {
    this.repository = repository;
    this.itemRepository = itemRepository;
  }

  /**
   * Get all orders with optional filtering and pagination
   */
  async getAllOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    storeId?: string;
    startDate?: Date;
    endDate?: Date;
    minTotal?: number;
    maxTotal?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
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
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    // Search by order number
    if (search) {
      where.orderNumber = {
        contains: search,
      };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by payment status
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Filter by store
    if (storeId) {
      where.storeId = storeId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    // Filter by total range
    if (minTotal !== undefined || maxTotal !== undefined) {
      where.total = {};
      
      if (minTotal !== undefined) {
        where.total.gte = minTotal;
      }
      
      if (maxTotal !== undefined) {
        where.total.lte = maxTotal;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.OrderOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Include related data
    const include: Prisma.OrderInclude = {
      store: {
        select: { id: true, name: true },
      },
      _count: {
        select: { items: true },
      },
    };

    // Get orders
    const orders = await this.repository.findAll({
      skip,
      take: limit,
      where,
      orderBy,
      include,
    });

    // Get total count
    const total = await this.repository.count(where);

    return {
      orders,
      total,
      page,
      limit,
    };
  }

  /**
   * Get an order by ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    return this.repository.findById(id, {
      store: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      },
    });
  }

  /**
   * Get an order by order number
   */
  async getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.repository.findByOrderNumber(orderNumber, {
      store: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      },
    });
  }

  /**
   * Generate a new order number
   */
  private async generateOrderNumber(): Promise<string> {
    // Get the current date
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Get current count of orders today
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));
    
    const todayOrderCount = await this.repository.count({
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    });
    
    // Generate sequence number
    const sequence = (todayOrderCount + 1).toString().padStart(4, '0');
    
    // Final order number format: YY-MM-DD-XXXX
    return `${year}${month}${day}-${sequence}`;
  }

  /**
   * Calculate order totals from items
   */
  private calculateOrderTotals(items: Array<{
    quantity: number;
    price: number | string | any;
    discount?: number | string | any;
    tax?: number | string | any;
  }>): { subtotal: number; tax: number; discount: number; total: number } {
    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    for (const item of items) {
      const itemPrice = Number(item.price);
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;
      tax += Number(item.tax || 0);
      discount += Number(item.discount || 0);
    }

    const total = subtotal + tax - discount;

    return {
      subtotal,
      tax,
      discount,
      total,
    };
  }

  /**
   * Create a new order
   */
  async createOrder(data: {
    storeId?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: string;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
      price?: number;
      discount?: number;
      tax?: number;
    }>;
  }): Promise<Order> {
    // If no items, throw error
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Process and validate items
    const processedItems = await Promise.all(
      data.items.map(async (item) => {
        // Get product
        const product = await productService.getProductById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        // Use provided price or default to product's retail price
        const price = item.price !== undefined ? item.price : Number(product.retailPrice);
        
        // Calculate tax and discount if not provided
        // This is a simplified example - in real world, tax calculation could be more complex
        const tax = item.tax !== undefined ? item.tax : 0;
        const discount = item.discount !== undefined ? item.discount : 0;

        return {
          productId: item.productId,
          quantity: item.quantity,
          price,
          tax,
          discount,
          product,
        };
      })
    );

    // Calculate order totals
    const { subtotal, tax, discount, total } = this.calculateOrderTotals(processedItems);

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Use a transaction to ensure all operations succeed or fail together
    return prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: data.status || OrderStatus.PENDING,
          paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
          paymentMethod: data.paymentMethod,
          subtotal,
          tax,
          discount,
          total,
          notes: data.notes,
          store: data.storeId ? { connect: { id: data.storeId } } : undefined,
          items: {
            create: processedItems.map(item => ({
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              tax: item.tax,
              product: {
                connect: { id: item.productId },
              },
            })),
          },
        },
        include: {
          store: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock if order is completed
      if (order.status === OrderStatus.COMPLETED) {
        for (const item of processedItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return order;
    });
  }

  /**
   * Update an existing order
   */
  async updateOrder(
    id: string,
    data: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      paymentMethod?: string;
      notes?: string;
      storeId?: string | null;
    }
  ): Promise<Order> {
    // Get the current order to check for status changes
    const currentOrder = await this.repository.findById(id);
    if (!currentOrder) {
      throw new Error('Order not found');
    }

    // Check if order is being set to COMPLETED
    const completingOrder = 
      data.status === OrderStatus.COMPLETED && 
      currentOrder.status !== OrderStatus.COMPLETED;

    // Check if order is being cancelled
    const cancellingOrder = 
      data.status === OrderStatus.CANCELLED && 
      currentOrder.status !== OrderStatus.CANCELLED;

    // Update store connection
    let storeConnect: Prisma.OrderUpdateInput["store"] = undefined;
    if (data.storeId === null) {
      storeConnect = { disconnect: true };
    } else if (data.storeId) {
      storeConnect = { connect: { id: data.storeId } };
    }

    // Use a transaction
    return prisma.$transaction(async (tx) => {
      // Get order items if we need to adjust stock
      const orderItems = (completingOrder || cancellingOrder) 
        ? await tx.orderItem.findMany({
            where: { orderId: id },
            include: { product: true },
          })
        : [];

      // Update order
      const order = await tx.order.update({
        where: { id },
        data: {
          status: data.status,
          paymentStatus: data.paymentStatus,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          store: storeConnect,
        },
        include: {
          store: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Handle stock adjustments based on status changes
      if (completingOrder) {
        // Decrease stock for each item
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      } else if (cancellingOrder && currentOrder.status === OrderStatus.COMPLETED) {
        // Increase stock for each item (return to inventory)
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      return order;
    });
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<Order> {
    // Get the current order to check status
    const currentOrder = await this.repository.findById(id, {
      items: { include: { product: true } },
    });
    
    if (!currentOrder) {
      throw new Error('Order not found');
    }

    // Use a transaction
    return prisma.$transaction(async (tx) => {
      // If order was completed, return items to inventory
      if (currentOrder.status === OrderStatus.COMPLETED && currentOrder.items) {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Delete order items first
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Delete the order
      return tx.order.delete({
        where: { id },
      });
    });
  }

  /**
   * Get sales summary data
   */
  async getSalesSummary(
    period: 'day' | 'week' | 'month',
    dateRange?: { start: Date; end: Date }
  ): Promise<any[]> {
    // Build where condition if date range is provided
    const where: Prisma.OrderWhereInput = {
      status: OrderStatus.COMPLETED,
    };
    
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    return this.repository.getSalesSummary(where, period);
  }
}

// Export singleton instance
export const orderService = new OrderService(orderRepository, orderItemRepository); 