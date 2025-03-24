import express from 'express';
import prisma from '../lib/prisma';

/**
 * Router for customer reports endpoints
 */
const router = express.Router();

/**
 * GET /api/v1/customer-reports/customer-segments
 * Generate a report on customer segments
 */
router.get('/customer-segments', async (req, res) => {
  try {
    const segments = await prisma.customer.groupBy({
      by: ['membershipLevel'],
      _count: {
        id: true
      },
      _sum: {
        totalSpent: true,
        loyaltyPoints: true
      }
    });
    
    // Calculate percentages and add additional metrics
    const totalCustomers = await prisma.customer.count();
    
    const enrichedSegments = await Promise.all(segments.map(async (segment) => {
      // Average order value per segment
      const avgOrderValue = await prisma.order.aggregate({
        where: {
          customer: {
            membershipLevel: segment.membershipLevel
          }
        },
        _avg: {
          total: true
        }
      });
      
      // Average orders per customer in this segment
      const totalOrders = await prisma.order.count({
        where: {
          customer: {
            membershipLevel: segment.membershipLevel
          }
        }
      });
      
      const percentage = (segment._count.id / totalCustomers) * 100;
      const averageSpent = segment._sum.totalSpent ? segment._sum.totalSpent / segment._count.id : 0;
      const averagePoints = segment._sum.loyaltyPoints ? segment._sum.loyaltyPoints / segment._count.id : 0;
      const ordersPerCustomer = totalOrders / segment._count.id;
      
      return {
        segment: segment.membershipLevel,
        customerCount: segment._count.id,
        percentage,
        totalSpent: segment._sum.totalSpent || 0,
        averageSpent,
        totalLoyaltyPoints: segment._sum.loyaltyPoints || 0,
        averageLoyaltyPoints: averagePoints,
        averageOrderValue: avgOrderValue._avg.total || 0,
        ordersPerCustomer
      };
    }));
    
    res.json({
      data: {
        segments: enrichedSegments,
        totalCustomers,
        reportDate: new Date()
      },
      success: true,
      message: 'Customer segments report generated successfully'
    });
  } catch (error) {
    console.error('Error generating segment report:', error);
    res.status(500).json({
      error: 'Failed to generate segment report',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * GET /api/v1/customer-reports/retention
 * Generate a customer retention report
 */
router.get('/retention', async (req, res) => {
  try {
    // Time periods for cohort analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    
    // Active customers in different time periods
    const [
      activeThirtyDays,
      activeNinetyDays,
      activeOneYear,
      totalCustomers
    ] = await Promise.all([
      prisma.customer.count({
        where: {
          lastPurchase: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.customer.count({
        where: {
          lastPurchase: {
            gte: ninetyDaysAgo
          }
        }
      }),
      prisma.customer.count({
        where: {
          lastPurchase: {
            gte: oneYearAgo
          }
        }
      }),
      prisma.customer.count()
    ]);
    
    // Calculate retention rates
    const thirtyDayRetention = totalCustomers > 0 ? (activeThirtyDays / totalCustomers) * 100 : 0;
    const ninetyDayRetention = totalCustomers > 0 ? (activeNinetyDays / totalCustomers) * 100 : 0;
    const oneYearRetention = totalCustomers > 0 ? (activeOneYear / totalCustomers) * 100 : 0;
    
    // Get counts of at-risk customers (90-180 days since last purchase)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const atRiskCustomers = await prisma.customer.count({
      where: {
        lastPurchase: {
          gte: sixMonthsAgo,
          lt: ninetyDaysAgo
        }
      }
    });
    
    // Get counts of churned customers (180+ days since last purchase)
    const churnedCustomers = await prisma.customer.count({
      where: {
        lastPurchase: {
          lt: sixMonthsAgo
        }
      }
    });
    
    res.json({
      data: {
        activeCustomers: {
          thirtyDays: activeThirtyDays,
          ninetyDays: activeNinetyDays,
          oneYear: activeOneYear
        },
        retentionRates: {
          thirtyDays: thirtyDayRetention,
          ninetyDays: ninetyDayRetention,
          oneYear: oneYearRetention
        },
        atRiskCustomers,
        churnedCustomers,
        totalCustomers,
        reportDate: new Date()
      },
      success: true,
      message: 'Customer retention report generated successfully'
    });
  } catch (error) {
    console.error('Error generating retention report:', error);
    res.status(500).json({
      error: 'Failed to generate retention report',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * GET /api/v1/customer-reports/acquisition
 * Generate a customer acquisition report
 */
router.get('/acquisition', async (req, res) => {
  try {
    // Get all customers with their creation dates
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        createdAt: true
      }
    });
    
    // Group customers by month and year
    const customersByMonth: Record<string, number> = {};
    
    customers.forEach(customer => {
      const date = customer.createdAt;
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!customersByMonth[yearMonth]) {
        customersByMonth[yearMonth] = 0;
      }
      
      customersByMonth[yearMonth]++;
    });
    
    // Convert to array sorted by date
    const acquisitionData = Object.entries(customersByMonth)
      .map(([yearMonth, count]) => ({
        period: yearMonth,
        newCustomers: count
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
    
    // Calculate growth rates
    const growthRates = [];
    for (let i = 1; i < acquisitionData.length; i++) {
      const current = acquisitionData[i].newCustomers;
      const previous = acquisitionData[i-1].newCustomers;
      
      const growthRate = previous > 0 
        ? ((current - previous) / previous) * 100 
        : current > 0 ? 100 : 0;
      
      growthRates.push({
        period: acquisitionData[i].period,
        growthRate
      });
    }
    
    res.json({
      data: {
        acquisitionByMonth: acquisitionData,
        growthRates,
        totalCustomers: customers.length,
        reportDate: new Date()
      },
      success: true,
      message: 'Customer acquisition report generated successfully'
    });
  } catch (error) {
    console.error('Error generating acquisition report:', error);
    res.status(500).json({
      error: 'Failed to generate acquisition report',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

/**
 * GET /api/v1/customer-reports/loyalty-program
 * Generate a loyalty program performance report
 */
router.get('/loyalty-program', async (req, res) => {
  try {
    // Get loyalty distribution
    const loyaltyDistribution = await prisma.customer.groupBy({
      by: ['membershipLevel'],
      _count: true,
      _sum: {
        loyaltyPoints: true
      }
    });
    
    // Get total loyalty points
    const totalPoints = await prisma.customer.aggregate({
      _sum: {
        loyaltyPoints: true
      }
    });
    
    // Get recent loyalty transactions
    const recentTransactions = await prisma.loyaltyTransaction.findMany({
      take: 100,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    // Calculate transactions by type
    const transactionTypes = await prisma.loyaltyTransaction.groupBy({
      by: ['type'],
      _count: true,
      _sum: {
        points: true
      }
    });
    
    res.json({
      data: {
        membershipDistribution: loyaltyDistribution.map(level => ({
          level: level.membershipLevel,
          customerCount: level._count,
          totalPoints: level._sum.loyaltyPoints || 0,
          pointsPercentage: totalPoints._sum.loyaltyPoints 
            ? ((level._sum.loyaltyPoints || 0) / totalPoints._sum.loyaltyPoints) * 100 
            : 0
        })),
        transactionTypes: transactionTypes.map(type => ({
          type: type.type,
          count: type._count,
          totalPoints: type._sum.points || 0
        })),
        recentTransactions,
        totalPointsIssued: totalPoints._sum.loyaltyPoints || 0,
        reportDate: new Date()
      },
      success: true,
      message: 'Loyalty program report generated successfully'
    });
  } catch (error) {
    console.error('Error generating loyalty program report:', error);
    res.status(500).json({
      error: 'Failed to generate loyalty program report',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      data: null
    });
  }
});

export default router; 