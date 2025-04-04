import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './lib/prisma'; // Import prisma from dedicated file
import staffRoutes from './routes/staffRoutes';
import staffRoutesV2 from './staff/routes/staff.routes'; // Import new staff routes
import roleRoutes from './routes/roleRoutes';
import employmentTypeRoutes from './routes/employmentTypeRoutes';
import employmentStatusRoutes from './routes/employmentStatusRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import supplierRoutes from './routes/supplierRoutes';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import shopRoutes from './routes/shopRoutes';
import customerRoutes from './routes/customerRoutes';
import customerGroupRoutes from './routes/customerGroupRoutes';
import customerAnalyticsRoutes from './routes/customerAnalyticsRoutes';
import customerReportsRoutes from './routes/customerReportsRoutes';
import loyaltyRoutes from './routes/loyaltyRoutes';
import auditRoutes from './routes/auditRoutes';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { staffUserConnector } from './services/staffUserConnector';
import { emailService } from './services/emailService';
import { notificationService } from './services/notificationService';

// Initialize environment variables
dotenv.config();

/**
 * Check database connection before starting the server
 * @returns {Promise<void>}
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000; // Change default to 5000

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
// Check if each route exists before using it (defensive approach)
if (shopRoutes) app.use('/api/v1/shops', shopRoutes);
if (productRoutes) app.use('/api/v1/products', productRoutes);
if (categoryRoutes) app.use('/api/v1/categories', categoryRoutes);
if (supplierRoutes) app.use('/api/v1/suppliers', supplierRoutes);
if (orderRoutes) app.use('/api/v1/orders', orderRoutes);
if (authRoutes) app.use('/api/v1/auth', authRoutes);
if (roleRoutes) app.use('/api/v1/roles', roleRoutes);
if (employmentTypeRoutes) app.use('/api/v1/employment-types', employmentTypeRoutes);
if (employmentStatusRoutes) app.use('/api/v1/employment-statuses', employmentStatusRoutes);

// Use the new staff routes from the staff directory
if (staffRoutesV2) {
  console.log('Registering staff routes V2...');
  app.use('/api/v1/staff', staffRoutesV2);
} else if (staffRoutes) {
  console.log('Falling back to original staff routes...');
  app.use('/api/v1/staff', staffRoutes);
}

if (customerRoutes) app.use('/api/v1/customers', customerRoutes);

// Customer-related routes
if (customerGroupRoutes) app.use('/api/v1/customer-groups', customerGroupRoutes);
if (customerAnalyticsRoutes) app.use('/api/v1/customer-analytics', customerAnalyticsRoutes);
if (customerReportsRoutes) app.use('/api/v1/customer-reports', customerReportsRoutes);

// Loyalty routes - ensure proper registration
if (loyaltyRoutes) {
  console.log('Registering loyalty routes...');
  app.use('/api/v1/loyalty', loyaltyRoutes);
} else {
  console.error('Loyalty routes not found!');
}

// Audit logs routes
if (auditRoutes) {
  app.use('/api/v1/audit-logs', auditRoutes);
}

// User routes
if (userRoutes) {
  console.log('Registering user routes...');
  app.use('/api/v1/users', userRoutes);
}

// Notification routes
if (notificationRoutes) {
  console.log('Registering notification routes...');
  app.use('/api/v1/notifications', notificationRoutes);
}

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the POS System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      staff: '/api/v1/staff',
      roles: '/api/v1/roles',
      employmentTypes: '/api/v1/employment-types',
      employmentStatuses: '/api/v1/employment-statuses',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      suppliers: '/api/v1/suppliers',
      orders: '/api/v1/orders',
      auth: '/api/v1/auth',
      shops: '/api/v1/shops',
      customers: '/api/v1/customers',
      customerGroups: '/api/v1/customer-groups',
      customerAnalytics: '/api/v1/customer-analytics',
      customerReports: '/api/v1/customer-reports',
      loyalty: '/api/v1/loyalty',
      auditLogs: '/api/v1/audit-logs',
      users: '/api/v1/users'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});

// Modified server startup to check database connection first
async function startServer() {
  try {
    // Check database connection before starting the server
    await checkDatabaseConnection();

    // Initialize the staff-user connector service
    staffUserConnector.initialize();
    console.log('✅ Staff-User connector service initialized');

    // Initialize the email service
    emailService.initialize();
    console.log('✅ Email service initialized');

    // Initialize the notification service
    notificationService.initialize();
    console.log('✅ Notification service initialized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
