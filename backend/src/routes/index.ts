import express from 'express';
import customerRoutes from './customerRoutes';
import customerGroupRoutes from './customerGroupRoutes';
import staffRoutes from './staffRoutes';
import roleRoutes from './roleRoutes';
import shopRoutes from './shopRoutes';
import storeRoutes from './storeRoutes';
import authRoutes from './auth.routes';
import employmentTypeRoutes from './employmentTypeRoutes';
import employmentStatusRoutes from './employmentStatusRoutes';
import productRoutes from './productRoutes';
import categoryRoutes from './categoryRoutes';
import orderRoutes from './orderRoutes';
import supplierRoutes from './supplierRoutes';
import loyaltyRoutes from './loyaltyRoutes';
import customerReportsRoutes from './customerReportsRoutes';
import customerAnalyticsRoutes from './customerAnalyticsRoutes';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Configuration endpoint for clients
 */
router.get('/config', (req, res) => {
  res.json({
    useMock: false,
    apiVersion: 'v1',
    features: {
      loyalty: true,
      inventory: true,
      customers: true,
      staff: true,
      products: true,
      orders: true
    }
  });
});

// Mount all routes
router.use('/customers', customerRoutes);
router.use('/customer-groups', customerGroupRoutes);
router.use('/staff', staffRoutes);
router.use('/roles', roleRoutes);
router.use('/shops', shopRoutes);
router.use('/stores', storeRoutes);
router.use('/auth', authRoutes);
router.use('/employment-types', employmentTypeRoutes);
router.use('/employment-statuses', employmentStatusRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/customer-reports', customerReportsRoutes);
router.use('/customer-analytics', customerAnalyticsRoutes);

export default router; 