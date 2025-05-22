import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { devController } from './controllers/dev.controller';

// Initialize API router directly to avoid ESM import issues
const apiRouter = express.Router();

// Set up basic routes directly
apiRouter.get('/', (req, res) => {
  res.json({ message: 'POS System API' });
});

// Define development mode flag
dotenv.config();
const isDevelopment = process.env.NODE_ENV !== 'production';

// In development mode, use the DevController to handle all API requests
// This prevents 404 errors for endpoints that haven't been implemented yet
if (isDevelopment) {
  // Log requests to API endpoints
  apiRouter.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });

  // Add routes for all HTTP methods to handle any request
  apiRouter.get('/v1/*', devController.handleGet.bind(devController));
  apiRouter.post('/v1/*', devController.handleWrite.bind(devController));
  apiRouter.put('/v1/*', devController.handleWrite.bind(devController));
  apiRouter.patch('/v1/*', devController.handleWrite.bind(devController));
  apiRouter.delete('/v1/*', devController.handleWrite.bind(devController));
}

// Add specific API health check endpoint (outside the catch-all route)
apiRouter.get('/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add temporary product attributes endpoint
apiRouter.get('/v1/products/attributes', (req, res) => {
  // Return empty array for now to prevent 404 errors
  res.status(200).json([]);
});

// Add temporary categories endpoint
apiRouter.get('/v1/categories', (req, res) => {
  // Return example categories data
  res.status(200).json([
    {
      id: 'cat-1',
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      slug: 'electronics',
      parentId: null,
      level: 0,
      image: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-2',
      name: 'Computers',
      description: 'Desktop computers, laptops, and accessories',
      slug: 'computers',
      parentId: 'cat-1',
      level: 1,
      image: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

// Add temporary notifications endpoints
apiRouter.get('/v1/notifications', (req, res) => {
  // Return empty notifications list
  res.status(200).json({
    notifications: [],
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0
    }
  });
});

apiRouter.get('/v1/notifications/unread/count', (req, res) => {
  // Return zero unread notifications
  res.status(200).json({ count: 0 });
});

// Add temporary settings endpoints
apiRouter.get('/v1/settings/pricing', (req, res) => {
  // Return default pricing settings
  res.status(200).json({
    id: 'pricing-settings',
    taxIncludedByDefault: true,
    defaultTaxRate: 10,
    roundToNearestUnit: true,
    roundingUnit: 0.05,
    showDiscountedPrices: true,
    currency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'before'
  });
});

apiRouter.get('/v1/settings/theme', (req, res) => {
  // Return default theme settings with all required fields based on the Zod schema
  res.status(200).json({
    id: 'theme-settings',
    theme: 'system',
    accentColor: '#0284c7',
    fontSize: 'medium',
    borderRadius: 'medium',
    animation: {
      enabled: true,
      reducedMotion: false
    },
    layout: {
      sidebarCollapsed: false,
      contentWidth: 'contained',
      menuPosition: 'side',
      compactMode: false
    },
    cards: {
      shadow: 'medium',
      hover: true
    },
    tables: {
      striped: true,
      compact: false,
      bordered: false
    }
  });
});

const app = express();
// Use port 5000 as specified in previous sessions
const port = process.env.PORT || 5000;

// Middleware

// Enhanced CORS configuration for development
const corsOptions = {
  origin: isDevelopment ? true : (process.env.FRONTEND_URL || 'http://localhost:3000'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token', 'X-CSRF-Token', 'Accept', 'cache-control', 'pragma'],
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Log CORS preflight requests in development
if (isDevelopment) {
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      console.log('CORS Preflight Request:', {
        origin: req.headers.origin,
        method: req.method,
        path: req.path,
        headers: req.headers
      });
    }
    next();
  });
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});