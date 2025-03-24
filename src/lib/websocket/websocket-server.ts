/**
 * WebSocket Server for POS Application
 * 
 * This module provides a WebSocket server implementation for real-time
 * communication with clients. It integrates with Express and provides
 * event-based communication.
 */

import * as WebSocket from 'ws';
import * as http from 'http';
import * as url from 'url';
import { EventEmitter } from 'events';

// WebSocket server options
export interface WebSocketServerOptions {
  server: http.Server;
  path?: string;
  heartbeatInterval?: number;
  debug?: boolean;
}

// Client connection info
interface ClientConnection {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  metadata: Record<string, any>;
}

// Message structure
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

/**
 * WebSocket Server implementation
 */
export class WebSocketServer extends EventEmitter {
  private wss: WebSocket.Server;
  private clients: Map<string, ClientConnection> = new Map();
  private options: WebSocketServerOptions;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  /**
   * Create a new WebSocket server
   * @param options Server options
   */
  constructor(options: WebSocketServerOptions) {
    super();
    
    this.options = {
      path: '/ws',
      heartbeatInterval: 30000, // 30 seconds
      debug: false,
      ...options
    };
    
    // Create WebSocket server
    this.wss = new WebSocket.Server({
      server: options.server,
      path: this.options.path
    });
    
    // Set up event handlers
    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleServerError.bind(this));
    
    // Start heartbeat to check for disconnected clients
    this.startHeartbeat();
    
    this.log('WebSocket server initialized');
  }
  
  /**
   * Broadcast a message to all connected clients
   * @param type Message type
   * @param data Message data
   * @param excludeClientId Optionally exclude a client from the broadcast
   */
  public broadcast<T = any>(type: string, data: T, excludeClientId?: string): void {
    const message: WebSocketMessage<T> = {
      type,
      data,
      timestamp: Date.now()
    };
    
    const messageStr = JSON.stringify(message);
    
    this.log(`Broadcasting message to ${this.clients.size} clients:`, type);
    
    for (const [clientId, client] of this.clients.entries()) {
      if (excludeClientId && clientId === excludeClientId) {
        continue;
      }
      
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    }
  }
  
  /**
   * Send a message to a specific client
   * @param clientId ID of the client to send the message to
   * @param type Message type
   * @param data Message data
   * @returns true if the message was sent, false otherwise
   */
  public sendToClient<T = any>(clientId: string, type: string, data: T): boolean {
    const client = this.clients.get(clientId);
    
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    const message: WebSocketMessage<T> = {
      type,
      data,
      timestamp: Date.now()
    };
    
    this.log(`Sending message to client ${clientId}:`, type);
    client.ws.send(JSON.stringify(message));
    return true;
  }
  
  /**
   * Send a message to clients that match specific metadata
   * @param metadataKey Key to match in the client metadata
   * @param metadataValue Value to match in the client metadata
   * @param type Message type
   * @param data Message data
   * @returns Number of clients the message was sent to
   */
  public sendToClientsWithMetadata<T = any>(
    metadataKey: string,
    metadataValue: any,
    type: string,
    data: T
  ): number {
    let count = 0;
    const message = JSON.stringify({
      type,
      data,
      timestamp: Date.now()
    });
    
    for (const [_, client] of this.clients.entries()) {
      if (
        client.ws.readyState === WebSocket.OPEN &&
        client.metadata[metadataKey] === metadataValue
      ) {
        client.ws.send(message);
        count++;
      }
    }
    
    this.log(`Sent message to ${count} clients with ${metadataKey}=${metadataValue}`);
    return count;
  }
  
  /**
   * Get the number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }
  
  /**
   * Close the WebSocket server
   */
  public close(): void {
    this.log('Closing WebSocket server');
    
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Close all client connections
    for (const [_, client] of this.clients.entries()) {
      client.ws.terminate();
    }
    
    this.clients.clear();
    
    // Close server
    this.wss.close();
  }
  
  // Handle new WebSocket connection
  private handleConnection(ws: WebSocket, req: http.IncomingMessage): void {
    // Generate client ID and extract query parameters
    const clientId = this.generateClientId();
    const parsedUrl = url.parse(req.url || '', true);
    const query = parsedUrl.query || {};
    
    // Setup client info
    const clientInfo: ClientConnection = {
      id: clientId,
      ws,
      isAlive: true,
      metadata: { ...query }
    };
    
    // Add to clients map
    this.clients.set(clientId, clientInfo);
    
    this.log(`Client connected: ${clientId}, total clients: ${this.clients.size}`);
    
    // Setup event handlers
    ws.on('message', (data: WebSocket.Data) => this.handleMessage(clientId, data));
    ws.on('close', () => this.handleClose(clientId));
    ws.on('error', (error) => this.handleClientError(clientId, error));
    ws.on('pong', () => this.handlePong(clientId));
    
    // Emit connection event
    this.emit('connection', {
      clientId,
      metadata: clientInfo.metadata,
      ip: req.socket.remoteAddress
    });
    
    // Send welcome message to client
    this.sendToClient(clientId, 'welcome', {
      clientId,
      message: 'Connected to POS WebSocket server',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle incoming message from client
  private handleMessage(clientId: string, data: WebSocket.Data): void {
    try {
      // Parse message
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      
      this.log(`Received message from client ${clientId}:`, message.type);
      
      // Emit message event
      this.emit('message', {
        clientId,
        type: message.type,
        data: message.data,
        timestamp: message.timestamp
      });
      
      // Handle specific message types
      if (message.type === 'heartbeat') {
        // Update client's isAlive flag
        const client = this.clients.get(clientId);
        if (client) {
          client.isAlive = true;
        }
      } else if (message.type === 'updateMetadata') {
        // Update client metadata
        this.updateClientMetadata(clientId, message.data);
      }
    } catch (error) {
      this.log(`Error parsing message from client ${clientId}:`, error);
    }
  }
  
  // Handle client disconnection
  private handleClose(clientId: string): void {
    // Remove client from map
    this.clients.delete(clientId);
    
    this.log(`Client disconnected: ${clientId}, remaining clients: ${this.clients.size}`);
    
    // Emit disconnection event
    this.emit('disconnection', { clientId });
  }
  
  // Handle client errors
  private handleClientError(clientId: string, error: Error): void {
    this.log(`Error from client ${clientId}:`, error);
    
    // Emit error event
    this.emit('clientError', {
      clientId,
      error
    });
  }
  
  // Handle server errors
  private handleServerError(error: Error): void {
    this.log('WebSocket server error:', error);
    
    // Emit error event
    this.emit('error', error);
  }
  
  // Handle pong response from client
  private handlePong(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.isAlive = true;
    }
  }
  
  // Start heartbeat interval to check for disconnected clients
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [clientId, client] of this.clients.entries()) {
        if (!client.isAlive) {
          this.log(`Client ${clientId} is not responding, terminating connection`);
          client.ws.terminate();
          this.clients.delete(clientId);
          continue;
        }
        
        // Mark as not alive until we get a pong back
        client.isAlive = false;
        
        // Send ping
        client.ws.ping();
      }
    }, this.options.heartbeatInterval);
  }
  
  // Update client metadata
  private updateClientMetadata(clientId: string, metadata: Record<string, any>): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.metadata = { ...client.metadata, ...metadata };
      this.log(`Updated metadata for client ${clientId}:`, client.metadata);
    }
  }
  
  // Generate a unique client ID
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // Log message if debug is enabled
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[WebSocketServer]', ...args);
    }
  }
}

/**
 * Create a WebSocket server attached to an HTTP server
 * @param server HTTP server to attach to
 * @param options Additional options
 * @returns WebSocket server instance
 */
export function createWebSocketServer(
  server: http.Server,
  options: Omit<WebSocketServerOptions, 'server'> = {}
): WebSocketServer {
  return new WebSocketServer({ server, ...options });
}

export default {
  WebSocketServer,
  createWebSocketServer
}; 