/**
 * Main export file for the backend API
 * 
 * This file only exports shared resources.
 * Server initialization is handled in server.ts
 * Prisma client is now imported from './lib/prisma'
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ProcessManager } from './utils/process-manager';
import { Server } from 'http';

// Initialize environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 600 // Preflight request results can be cached for 10 minutes
}));
app.use(express.json());

// Import all routes
import routes from './routes/index';

// Routes
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configuration endpoint
app.get('/api/v1/config', (req, res) => {
  res.json({
    version: '1.0.0',
    useMock: false,
    features: {
      inventory: true,
      customers: true,
      reporting: true
    },
    apiBase: '/api/v1'
  });
});

// API routes
app.use('/api/v1', routes);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

/**
 * Main server entry point
 * Handles server startup, port checking, and graceful shutdown
 */
async function startServer() {
  let server: Server;
  try {
    // Check if port is available
    const isAvailable = await ProcessManager.isPortAvailable(PORT);
    
    if (!isAvailable) {
      console.log(`Port ${PORT} is in use. Attempting to kill the process...`);
      const killed = await ProcessManager.killProcessOnPort(PORT);
      
      if (!killed) {
        console.error(`Failed to free port ${PORT}. Please choose a different port or manually kill the process.`);
        process.exit(1);
      }
      
      console.log(`Successfully freed port ${PORT}`);
    }

    // Start the server
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/api/v1/health`);
      console.log(`Config available at http://localhost:${PORT}/api/v1/config`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

// Export Prisma from lib/prisma instead of initializing here
export { default as prisma } from './lib/prisma';

// No server initialization code here - server.ts handles that 