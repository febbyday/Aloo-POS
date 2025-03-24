/**
 * Server Initialization for WebSocket and Event Bus Integration
 * 
 * This module initializes the WebSocket server and connects it with the Event Bus
 * for real-time communication between the server and clients.
 */

import * as http from 'http';
import * as express from 'express';
import { createWebSocketServer } from '../websocket/websocket-server';
import { createWebSocketEventBridge } from './websocket-integration';
import { eventBus, POS_EVENTS } from './event-bus';
import { logger } from '../utils/logger';

/**
 * Initialize WebSocket server and integrate with Event Bus
 * 
 * @param server HTTP server instance to attach WebSocket to
 * @param app Express application instance
 * @returns Object containing WebSocket server and event bridge
 */
export function initializeRealTimeServer(
  server: http.Server,
  app: express.Application
) {
  logger.info('Initializing WebSocket server and Event Bus integration');
  
  // Create WebSocket server
  const wss = createWebSocketServer(server, {
    path: '/ws',
    debug: process.env.NODE_ENV !== 'production'
  });
  
  // Connect WebSocket server with Event Bus
  const eventBridge = createWebSocketEventBridge(wss, {
    debug: process.env.NODE_ENV !== 'production',
    // Optionally exclude sensitive events
    excludedEvents: [
      POS_EVENTS.SYSTEM.ERROR,
      POS_EVENTS.AUTH.LOGIN_FAILED,
      POS_EVENTS.AUTH.PASSWORD_CHANGED
    ]
  });
  
  // Middleware to provide WebSocket server to routes
  app.use((req, res, next) => {
    req.wss = wss;
    next();
  });
  
  // Set up health check endpoint
  app.get('/api/v1/ws-health', (req, res) => {
    res.json({
      status: 'online',
      clients: wss.getClientCount(),
      uptime: process.uptime()
    });
  });
  
  // Set up server events
  setupServerEvents(wss);
  
  logger.info(`WebSocket server initialized with ${wss.getClientCount()} clients`);
  
  return {
    wss,
    eventBridge
  };
}

/**
 * Set up server-side event handlers
 * @param wss WebSocket server instance
 */
function setupServerEvents(wss: any) {
  // Handle server startup
  eventBus.emit(POS_EVENTS.SYSTEM.SERVER_STARTED, {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
  
  // Handle WebSocket connections
  wss.on('connection', (event: any) => {
    const { clientId, metadata, ip } = event;
    
    logger.info(`Client connected: ${clientId} from ${ip}`);
    
    // Emit event to the bus
    eventBus.emit(POS_EVENTS.SYSTEM.CLIENT_CONNECTED, {
      clientId,
      metadata,
      ip,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle WebSocket disconnections
  wss.on('disconnection', (event: any) => {
    const { clientId } = event;
    
    logger.info(`Client disconnected: ${clientId}`);
    
    // Emit event to the bus
    eventBus.emit(POS_EVENTS.SYSTEM.CLIENT_DISCONNECTED, {
      clientId,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle server shutdown
  const handleShutdown = () => {
    logger.info('Server shutting down, closing WebSocket connections');
    
    // Notify clients
    wss.broadcast('system:shutdown', {
      message: 'Server is shutting down for maintenance.',
      timestamp: new Date().toISOString()
    });
    
    // Close WebSocket server
    wss.close();
    
    // Emit shutdown event
    eventBus.emit(POS_EVENTS.SYSTEM.SERVER_STOPPING, {
      timestamp: new Date().toISOString()
    });
    
    // Allow time for messages to be sent before exiting
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  };
  
  // Register shutdown handlers
  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

/**
 * Augment Express Request interface to include WebSocket server
 */
declare global {
  namespace Express {
    interface Request {
      wss: any;
    }
  }
}

export default {
  initializeRealTimeServer
}; 