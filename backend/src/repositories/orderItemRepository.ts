import { prisma } from '../index';
import { OrderItem, Prisma } from '@prisma/client';

/**
 * Repository for OrderItem entity
 * Handles database operations for order items
 */
export class OrderItemRepository {
  /**
   * Find all order items with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrderItemWhereInput;
    orderBy?: Prisma.OrderItemOrderByWithRelationInput;
    include?: Prisma.OrderItemInclude;
  }): Promise<OrderItem[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.orderItem.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  /**
   * Find an order item by ID
   */
  async findById(
    id: string,
    include?: Prisma.OrderItemInclude
  ): Promise<OrderItem | null> {
    return prisma.orderItem.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find order items by order ID
   */
  async findByOrderId(
    orderId: string,
    include?: Prisma.OrderItemInclude
  ): Promise<OrderItem[]> {
    return prisma.orderItem.findMany({
      where: { orderId },
      include,
    });
  }

  /**
   * Create a new order item
   */
  async create(data: Prisma.OrderItemCreateInput): Promise<OrderItem> {
    return prisma.orderItem.create({
      data,
      include: {
        product: true,
      },
    });
  }

  /**
   * Create multiple order items in a batch
   */
  async createMany(data: Prisma.OrderItemCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.orderItem.createMany({
      data,
    });
  }

  /**
   * Update an existing order item
   */
  async update(
    id: string,
    data: Prisma.OrderItemUpdateInput
  ): Promise<OrderItem> {
    return prisma.orderItem.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  /**
   * Delete an order item
   */
  async delete(id: string): Promise<OrderItem> {
    return prisma.orderItem.delete({
      where: { id },
    });
  }

  /**
   * Delete all items for an order
   */
  async deleteByOrderId(orderId: string): Promise<Prisma.BatchPayload> {
    return prisma.orderItem.deleteMany({
      where: { orderId },
    });
  }

  /**
   * Count order items with optional filter
   */
  async count(where?: Prisma.OrderItemWhereInput): Promise<number> {
    return prisma.orderItem.count({
      where,
    });
  }

  /**
   * Get most popular products based on order items
   */
  async getPopularProducts(
    limit: number = 10,
    dateRange?: { start: Date; end: Date }
  ): Promise<any[]> {
    // Build where condition if date range is provided
    const where: Prisma.OrderItemWhereInput = {};
    
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.start,
        lte: dateRange.end,
      };
    }

    // Get products with their total quantities
    const products = await prisma.orderItem.groupBy({
      by: ['productId'],
      where,
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Fetch detailed product information
    const result = await Promise.all(
      products.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            retailPrice: true,
          },
        });

        return {
          productId: item.productId,
          name: product?.name,
          sku: product?.sku,
          totalQuantitySold: item._sum.quantity,
        };
      })
    );

    return result;
  }
}

// Export singleton instance
export const orderItemRepository = new OrderItemRepository(); 