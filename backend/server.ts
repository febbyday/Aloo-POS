/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 *
 * Main Server Entry Point
 *
 * This file is the entry point for the backend server.
 * It imports and configures the Express application and starts the server.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routes from './src/routes/index'; // Import the main routes index
import { requestLogger, errorLogger } from './src/middleware/requestLogger';
import { logger } from './src/utils/logger';
import { AppError, ErrorType, sendErrorResponse } from './src/utils/errorHandling';
import { setCsrfToken } from './src/middleware/csrf';
import { cacheMiddleware } from './src/middleware/cache-middleware';
import { initQueryProfiling } from './src/utils/query-profiler';
import prisma from './src/prisma';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10); // Ensure PORT is always a number

// Initialize logger
logger.info('Initializing server', { port: PORT, environment: process.env.NODE_ENV });

// Initialize query profiling in development mode
if (process.env.NODE_ENV === 'development') {
  initQueryProfiling(prisma);
  logger.info('Query profiling enabled for development');
}

// Middleware
// Log CORS preflight requests in development
if (process.env.NODE_ENV === 'development') {
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

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000',
    process.env.CORS_ORIGIN // Support custom origin from env
  ].filter(Boolean) as string[],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'x-csrf-token', 'X-CSRF-Token', 'Cache-Control', 'Pragma', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Total-Count', 'X-CSRF-Token']
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-cookie-secret-key-should-be-in-env-file'));

// Use Morgan for development logging and our custom logger for all environments
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Add request logger middleware
app.use(requestLogger);

// Add CSRF protection to all routes
// This will set a CSRF token cookie for all requests
app.use(setCsrfToken);

// Add response caching middleware for GET requests
// Only enable in production to avoid caching during development
if (process.env.NODE_ENV === 'production') {
  app.use(cacheMiddleware());
  logger.info('Response caching enabled for production');
}

// Add root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the POS System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      api: '/api/v1'
    }
  });
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Performance monitoring endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/v1/performance', (req, res) => {
    const { getQueryStats } = require('./src/utils/query-optimizer');
    const { getCacheStats } = require('./src/middleware/cache-middleware');
    const { generateOptimizationRecommendations } = require('./src/utils/query-profiler');

    res.json({
      queryStats: getQueryStats(),
      cacheStats: getCacheStats(),
      recommendations: generateOptimizationRecommendations()
    });
  });
}

// Mount all routes from main router
app.use('/api/v1', routes);

// Add 404 handler for undefined routes
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl || req.url}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  sendErrorResponse(
    res,
    new AppError('Route not found', 404, ErrorType.NOT_FOUND),
    404,
    req
  );
});

// Add error logger middleware
app.use(errorLogger);

// Add global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle AppError instances
  if (err instanceof AppError) {
    return sendErrorResponse(res, err, err.statusCode, req);
  }

  // Handle other errors
  const statusCode = 500;
  return sendErrorResponse(res, err, statusCode, req);
});

// Helper for graceful server startup with fallback ports
const startServer = (port: number, maxRetries = 3) => {
  const server = app.listen(port, () => {
    logger.info(`Server started successfully`, {
      port,
      apiUrl: `http://localhost:${port}/api/v1`,
      environment: process.env.NODE_ENV
    });

    // Also log to console for visibility
    console.log(`✅ Server running on port ${port}`);
    console.log(`✅ API available at http://localhost:${port}/api/v1`);
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE' && maxRetries > 0) {
      logger.warn(`Port ${port} is busy, trying port ${port + 1}...`, {
        currentPort: port,
        nextPort: port + 1,
        retriesLeft: maxRetries - 1
      });

      console.log(`⚠️ Port ${port} is busy, trying port ${port + 1}...`);
      startServer(port + 1, maxRetries - 1);
    } else {
      logger.error(`Failed to start server`, err, {
        port,
        critical: true
      });

      console.error(`❌ Failed to start server: ${err.message}`);
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  return server;
};

// Start the server if this file is run directly
// In ES modules, we can check if the current module is the entry point
// by comparing import.meta.url against process.argv[1]
const isMainModule = import.meta.url.endsWith(process.argv[1]);
if (isMainModule) {
  startServer(PORT);
}

export default app;
