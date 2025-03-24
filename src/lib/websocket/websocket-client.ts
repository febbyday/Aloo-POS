/**
 * WebSocket Client for POS Application
 * 
 * This module provides a WebSocket client for real-time communication between
 * the server and the client. It integrates with the eventBus system for 
 * broadcasting events across the application.
 */

import { eventBus, POS_EVENTS } from '../events/event-bus';

// WebSocket connection status
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket client options
export interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

// WebSocket message structure
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

// Default options
const DEFAULT_OPTIONS: Partial<WebSocketOptions> = {
  reconnectInterval: 3000,      // 3 seconds between reconnect attempts
  maxReconnectAttempts: 10,     // Maximum number of reconnect attempts
  heartbeatInterval: 30000,     // Send heartbeat every 30 seconds
  debug: false                  // Disable debug logs by default
};

/**
 * WebSocket Client that integrates with the event bus
 */
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private options: WebSocketOptions;
  private reconnectAttempts: number = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  
  /**
   * Create a new WebSocket client
   * @param options WebSocket connection options
   */
  constructor(options: WebSocketOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.log('WebSocket client initialized');
  }
  
  /**
   * Get the current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }
  
  /**
   * Connect to the WebSocket server
   */
  public connect(): void {
    if (this.socket) {
      this.log('Already connected or connecting, ignoring connect call');
      return;
    }
    
    this.setStatus(ConnectionStatus.CONNECTING);
    
    try {
      this.socket = new WebSocket(this.options.url);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      
      this.log('Connecting to WebSocket server:', this.options.url);
    } catch (error) {
      this.handleError(error as Event);
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.clearTimers();
    
    if (this.socket) {
      this.log('Disconnecting from WebSocket server');
      this.socket.close();
      this.socket = null;
    }
    
    this.setStatus(ConnectionStatus.DISCONNECTED);
  }
  
  /**
   * Send a message to the WebSocket server
   * @param type Message type
   * @param data Message data
   */
  public send<T = any>(type: string, data: T): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.log('Cannot send message, socket not connected');
      return;
    }
    
    const message: WebSocketMessage<T> = {
      type,
      data,
      timestamp: Date.now()
    };
    
    this.log('Sending message:', message);
    this.socket.send(JSON.stringify(message));
  }
  
  // Handle WebSocket open event
  private handleOpen(event: Event): void {
    this.log('WebSocket connection established');
    this.setStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;
    
    // Start heartbeat to keep connection alive
    this.startHeartbeat();
    
    // Emit connection event
    eventBus.emit(POS_EVENTS.SYSTEM_INFO, {
      message: 'Real-time connection established',
      source: 'WebSocketClient'
    });
  }
  
  // Handle WebSocket close event
  private handleClose(event: CloseEvent): void {
    this.log('WebSocket connection closed', event.code, event.reason);
    this.socket = null;
    this.clearTimers();
    
    if (this.status !== ConnectionStatus.DISCONNECTED) {
      this.setStatus(ConnectionStatus.DISCONNECTED);
      this.attemptReconnect();
    }
  }
  
  // Handle WebSocket error event
  private handleError(event: Event): void {
    this.log('WebSocket error:', event);
    this.setStatus(ConnectionStatus.ERROR);
    
    // Emit error event
    eventBus.emit(POS_EVENTS.SYSTEM_ERROR, {
      message: 'WebSocket connection error',
      source: 'WebSocketClient',
      error: event
    });
    
    // Attempt to reconnect
    this.attemptReconnect();
  }
  
  // Handle WebSocket message event
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.log('Received message:', message);
      
      // Emit the message as an event on the event bus
      eventBus.emit(`ws:${message.type}`, message.data);
      
    } catch (error) {
      this.log('Error parsing WebSocket message:', error);
    }
  }
  
  // Attempt to reconnect to the WebSocket server
  private attemptReconnect(): void {
    if (this.reconnectTimer !== null) {
      return;
    }
    
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 0)) {
      this.log('Maximum reconnect attempts reached, giving up');
      
      // Emit error event
      eventBus.emit(POS_EVENTS.SYSTEM_WARNING, {
        message: 'Failed to reconnect to real-time server after multiple attempts',
        source: 'WebSocketClient'
      });
      
      return;
    }
    
    this.reconnectAttempts++;
    this.setStatus(ConnectionStatus.RECONNECTING);
    
    this.log(`Reconnecting (attempt ${this.reconnectAttempts})...`);
    
    // Emit reconnecting event
    eventBus.emit(POS_EVENTS.SYSTEM_INFO, {
      message: `Reconnecting to real-time server (attempt ${this.reconnectAttempts})`,
      source: 'WebSocketClient'
    });
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.options.reconnectInterval);
  }
  
  // Start heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatTimer = window.setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, this.options.heartbeatInterval);
  }
  
  // Clear heartbeat timer
  private clearHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  // Clear all timers
  private clearTimers(): void {
    this.clearHeartbeat();
    
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  // Update connection status
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.log('Connection status changed:', status);
      
      // Emit status change event
      eventBus.emit('ws:status', status);
    }
  }
  
  // Log message if debug is enabled
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }
}

// Create and export singleton instance with default options
let wsClient: WebSocketClient | null = null;

/**
 * Initialize the WebSocket client with the given options
 * @param options WebSocket connection options
 * @returns WebSocket client instance
 */
export function initWebSocketClient(options: WebSocketOptions): WebSocketClient {
  if (wsClient) {
    wsClient.disconnect();
  }
  
  wsClient = new WebSocketClient(options);
  return wsClient;
}

/**
 * Get the WebSocket client instance
 * @returns WebSocket client instance or null if not initialized
 */
export function getWebSocketClient(): WebSocketClient | null {
  return wsClient;
}

export default {
  initWebSocketClient,
  getWebSocketClient,
  ConnectionStatus
}; 