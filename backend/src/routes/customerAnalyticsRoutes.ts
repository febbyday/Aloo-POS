import express from 'express';
import prisma from '../lib/prisma';

/**
 * Router for customer analytics endpoints
 */
const router = express.Router();

/**
 * GET /api/v1/customer-analytics/metrics/:customerId
 * Get key metrics for a specific customer
 */
router.get('/metrics/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    
    if (!customer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }
    
    // Get metrics data
    const [
      orderCount,
      totalSpent,
      averageOrderValue,
      lastPurchase
    ] = await Promise.all([
      prisma.order.count({
        where: { customerId }
      }),
      prisma.order.aggregate({
        where: { customerId },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: { customerId },
        _avg: { total: true }
      }),
      prisma.order.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate purchase frequency
    let purchaseFrequency = null;
    if (orderCount > 1 && lastPurchase) {
      const firstOrder = await prisma.order.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'asc' }
      });
      
      if (firstOrder) {
        const timeSpan = lastPurchase.createdAt.getTime() - firstOrder.createdAt.getTime();
        const daysBetween = timeSpan / (1000 * 60 * 60 * 24);
        purchaseFrequency = orderCount / (daysBetween / 30); // Orders per month
      }
    }

    // Get most purchased products
    const mostPurchasedProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          customerId
        }
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get product details for the most purchased products
    const productIds = mostPurchasedProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    // Combine product data with quantity data
    const topProducts = mostPurchasedProducts.map(item => {
      const productData = products.find(p => p.id === item.productId);
      return {
        product: productData,
        totalQuantity: item._sum.quantity
      };
    });

    res.json({
      data: {
        orderCount,
        totalSpent: totalSpent._sum.total || 0,
        averageOrderValue: averageOrderValue._avg.total || 0,
        lastPurchase: lastPurchase?.createdAt,
        purchaseFrequency,
        topProducts
      },
      success: true,
      message: 'Customer metrics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch customer metrics',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * GET /api/v1/customer-analytics/lifetime-value/:customerId
 * Calculate customer lifetime value
 */
router.get('/lifetime-value/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    
    if (!customer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }
    
    // Calculate lifetime value metrics
    const [
      totalSpent,
      orderCount,
      firstPurchase
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { customerId },
        _sum: { total: true }
      }),
      prisma.order.count({
        where: { customerId }
      }),
      prisma.order.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'asc' }
      })
    ]);
    
    let customerAgeMonths = 0;
    let lifetimeValue = 0;
    let monthlyValue = 0;
    
    if (firstPurchase) {
      // Calculate customer age in months
      const customerAge = Date.now() - firstPurchase.createdAt.getTime();
      customerAgeMonths = customerAge / (1000 * 60 * 60 * 24 * 30);
      
      // Calculate lifetime value
      lifetimeValue = totalSpent._sum.total || 0;
      
      // Calculate monthly value (if customer has been around for at least a month)
      if (customerAgeMonths >= 1) {
        monthlyValue = lifetimeValue / customerAgeMonths;
      } else {
        monthlyValue = lifetimeValue;
      }
    }
    
    res.json({
      data: {
        lifetimeValue,
        monthlyValue,
        customerAgeMonths,
        totalOrders: orderCount,
        averageOrderValue: orderCount > 0 ? (totalSpent._sum.total || 0) / orderCount : 0,
        firstPurchaseDate: firstPurchase?.createdAt
      },
      success: true,
      message: 'Customer lifetime value calculated successfully'
    });
  } catch (error) {
    console.error('Error calculating customer lifetime value:', error);
    res.status(500).json({
      error: 'Failed to calculate customer lifetime value',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * GET /api/v1/customer-analytics/loyalty-activity/:customerId
 * Get customer loyalty program activity
 */
router.get('/loyalty-activity/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });
    
    if (!customer) {
      return res.status(404).json({ 
        error: 'Customer not found',
        success: false,
        message: 'Customer not found',
        data: null
      });
    }
    
    // Get loyalty transactions
    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: true
      }
    });
    
    // Calculate points by type
    const pointsByType = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.type]) {
        acc[transaction.type] = 0;
      }
      acc[transaction.type] += transaction.points;
      return acc;
    }, {} as Record<string, number>);
    
    res.json({
      data: {
        currentPoints: customer.loyaltyPoints,
        membershipLevel: customer.membershipLevel,
        transactions,
        pointsByType
      },
      success: true,
      message: 'Customer loyalty activity retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer loyalty activity:', error);
    res.status(500).json({
      error: 'Failed to fetch customer loyalty activity',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * GET /api/v1/customer-analytics/segment-distribution
 * Get distribution of customers across segments
 */
router.get('/segment-distribution', async (req, res) => {
  try {
    // Get customer distribution by membership level
    const membershipDistribution = await prisma.customer.groupBy({
      by: ['membershipLevel'],
      _count: true,
    });
    
    // Count total customers
    const totalCustomers = await prisma.customer.count();
    
    // Calculate percentages
    const segmentData = membershipDistribution.map(segment => ({
      segment: segment.membershipLevel,
      count: segment._count,
      percentage: (segment._count / totalCustomers) * 100
    }));
    
    res.json({
      data: {
        segments: segmentData,
        totalCustomers
      },
      success: true,
      message: 'Customer segment distribution retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer segment distribution:', error);
    res.status(500).json({
      error: 'Failed to fetch customer segment distribution',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

export default router; 