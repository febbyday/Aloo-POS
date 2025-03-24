import { prisma } from '../index';
import { Order, Prisma } from '@prisma/client';

/**
 * Repository for Order entity
 * Handles database operations for orders
 */
export class OrderRepository {
  /**
   * Find all orders with optional filtering and pagination
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrderWhereInput;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
    include?: Prisma.OrderInclude;
  }): Promise<Order[]> {
    const { skip, take, where, orderBy, include } = params;
    return prisma.order.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  /**
   * Find an order by ID
   */
  async findById(
    id: string,
    include?: Prisma.OrderInclude
  ): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find an order by order number
   */
  async findByOrderNumber(
    orderNumber: string,
    include?: Prisma.OrderInclude
  ): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { orderNumber },
      include,
    });
  }

  /**
   * Create a new order
   */
  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({
      data,
      include: {
        store: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Update an existing order
   */
  async update(
    id: string,
    data: Prisma.OrderUpdateInput
  ): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        store: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Delete an order
   */
  async delete(id: string): Promise<Order> {
    return prisma.order.delete({
      where: { id },
    });
  }

  /**
   * Count orders with optional filter
   */
  async count(where?: Prisma.OrderWhereInput): Promise<number> {
    return prisma.order.count({
      where,
    });
  }

  /**
   * Find orders by store ID with pagination
   */
  async findByStore(
    storeId: string,
    params: {
      skip?: number;
      take?: number;
      include?: Prisma.OrderInclude;
    }
  ): Promise<Order[]> {
    const { skip, take, include } = params;
    return prisma.order.findMany({
      where: {
        storeId,
      },
      skip,
      take,
      include,
    });
  }

  /**
   * Calculate sales summary for a period
   */
  async getSalesSummary(
    where: Prisma.OrderWhereInput,
    groupBy: 'day' | 'week' | 'month'
  ): Promise<any[]> {
    // This is a basic implementation
    // More sophisticated aggregation could be done with raw SQL or a separate analytics service
    
    let dateFormat: string;
    
    // Format dates according to grouping
    switch (groupBy) {
      case 'day':
        dateFormat = '%Y-%m-%d'; // YYYY-MM-DD
        break;
      case 'week':
        dateFormat = '%Y-%U'; // YYYY-WW (week number)
        break;
      case 'month':
        dateFormat = '%Y-%m'; // YYYY-MM
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    // Use a raw query for grouping
    const results = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, ${dateFormat}) as period,
        COUNT(*) as totalOrders,
        SUM(total) as revenue,
        AVG(total) as averageOrderValue
      FROM \`Order\`
      WHERE status != 'CANCELLED'
      GROUP BY period
      ORDER BY period DESC
    `;
    
    return results as any[];
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository(); 