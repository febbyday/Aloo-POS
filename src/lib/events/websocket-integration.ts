/**
 * WebSocket Integration with Event Bus
 * 
 * This module integrates the WebSocket server with the application's event bus system,
 * allowing real-time updates to be broadcasted to connected clients.
 */

import { WebSocketServer } from '../websocket/websocket-server';
import { eventBus, POS_EVENTS } from '../events/event-bus';
import type { WebSocketMessage } from '../websocket/websocket-server';

/**
 * WebSocket Event Bridge configuration options
 */
export interface WebSocketEventBridgeOptions {
  // Whether to enable debug logging
  debug?: boolean;
  
  // List of event types to exclude from broadcasting
  excludedEvents?: string[];
}

/**
 * Maps event types to their corresponding WebSocket message types
 */
const EVENT_TO_WS_MESSAGE_MAP: Record<string, string> = {
  // Product events
  [POS_EVENTS.PRODUCT.CREATED]: 'product:created',
  [POS_EVENTS.PRODUCT.UPDATED]: 'product:updated',
  [POS_EVENTS.PRODUCT.DELETED]: 'product:deleted',
  [POS_EVENTS.PRODUCT.INVENTORY_CHANGED]: 'product:inventory_changed',
  
  // Customer events
  [POS_EVENTS.CUSTOMER.CREATED]: 'customer:created',
  [POS_EVENTS.CUSTOMER.UPDATED]: 'customer:updated',
  [POS_EVENTS.CUSTOMER.DELETED]: 'customer:deleted',
  [POS_EVENTS.CUSTOMER.LOYALTY_CHANGED]: 'customer:loyalty_changed',
  
  // Order events
  [POS_EVENTS.ORDER.CREATED]: 'order:created',
  [POS_EVENTS.ORDER.UPDATED]: 'order:updated',
  [POS_EVENTS.ORDER.STATUS_CHANGED]: 'order:status_changed',
  [POS_EVENTS.ORDER.PAYMENT_RECEIVED]: 'order:payment_received',
  
  // Staff events
  [POS_EVENTS.STAFF.CREATED]: 'staff:created',
  [POS_EVENTS.STAFF.UPDATED]: 'staff:updated',
  [POS_EVENTS.STAFF.DELETED]: 'staff:deleted',
  
  // System events
  [POS_EVENTS.SYSTEM.SETTING_CHANGED]: 'system:setting_changed',
  [POS_EVENTS.SYSTEM.SYNC_COMPLETED]: 'system:sync_completed',
  [POS_EVENTS.SYSTEM.DATABASE_UPDATED]: 'system:database_updated'
};

/**
 * WebSocket Event Bridge
 * 
 * Bidirectional bridge between the application's event bus and WebSocket server.
 * - Events from the application are broadcasted to WebSocket clients
 * - Messages from WebSocket clients can trigger application events
 */
export class WebSocketEventBridge {
  private wss: WebSocketServer;
  private options: WebSocketEventBridgeOptions;
  private eventHandlers: Map<string, Function> = new Map();
  
  /**
   * Create a new WebSocket Event Bridge
   * @param wss WebSocket server instance
   * @param options Configuration options
   */
  constructor(wss: WebSocketServer, options: WebSocketEventBridgeOptions = {}) {
    this.wss = wss;
    this.options = {
      debug: false,
      excludedEvents: [],
      ...options
    };
    
    this.log('WebSocket Event Bridge initialized');
  }
  
  /**
   * Start the event bridge
   * This establishes bidirectional communication between the event bus and WebSocket
   */
  public start(): void {
    this.log('Starting WebSocket Event Bridge');
    
    // Set up WebSocket message handlers
    this.setupWebSocketHandlers();
    
    // Set up event bus handlers
    this.setupEventBusHandlers();
  }
  
  /**
   * Stop the event bridge
   * This removes all event listeners
   */
  public stop(): void {
    this.log('Stopping WebSocket Event Bridge');
    
    // Remove all event bus handlers
    for (const [eventType, handler] of this.eventHandlers.entries()) {
      eventBus.off(eventType, handler as any);
    }
    
    this.eventHandlers.clear();
    
    // Remove WebSocket server message handler
    this.wss.removeAllListeners('message');
  }
  
  /**
   * Set up WebSocket server message handlers
   * Listens for messages from clients and triggers corresponding events
   */
  private setupWebSocketHandlers(): void {
    this.wss.on('message', (event) => {
      const { clientId, type, data } = event;
      
      this.log(`Received WebSocket message: ${type} from client ${clientId}`);
      
      // Handle specific message types from clients
      switch (type) {
        case 'customer:subscribe':
          // Client wants to subscribe to customer updates
          if (data && data.customerId) {
            const client = this.wss.getClient(clientId);
            if (client) {
              // Update client metadata to track subscription
              this.wss.updateClientMetadata(clientId, {
                subscribedToCustomer: data.customerId
              });
              
              this.log(`Client ${clientId} subscribed to customer ${data.customerId}`);
            }
          }
          break;
          
        case 'order:subscribe':
          // Client wants to subscribe to order updates
          if (data && data.orderId) {
            this.wss.updateClientMetadata(clientId, {
              subscribedToOrder: data.orderId
            });
            
            this.log(`Client ${clientId} subscribed to order ${data.orderId}`);
          }
          break;
          
        case 'inventory:check':
          // Client requests inventory check
          if (data && data.productId) {
            // Emit event to check inventory
            eventBus.emit(POS_EVENTS.PRODUCT.INVENTORY_CHECK_REQUESTED, {
              productId: data.productId,
              requestedBy: clientId
            });
          }
          break;
          
        case 'client:info':
          // Client is sending information about itself
          if (data) {
            this.wss.updateClientMetadata(clientId, data);
            this.log(`Updated client ${clientId} metadata:`, data);
          }
          break;
          
        default:
          // For unhandled message types, check if there's a corresponding event
          const eventType = this.findEventTypeForMessage(type);
          if (eventType) {
            // Forward the message to the event bus
            this.log(`Forwarding WebSocket message to event bus: ${eventType}`);
            eventBus.emit(eventType, {
              ...data,
              _source: 'websocket',
              _clientId: clientId
            });
          }
      }
    });
  }
  
  /**
   * Set up event bus handlers
   * Listens for application events and broadcasts them to WebSocket clients
   */
  private setupEventBusHandlers(): void {
    // Register handlers for all mapped events
    for (const [eventType, messageType] of Object.entries(EVENT_TO_WS_MESSAGE_MAP)) {
      // Skip excluded events
      if (this.options.excludedEvents?.includes(eventType)) {
        this.log(`Skipping excluded event: ${eventType}`);
        continue;
      }
      
      // Create handler for this event type
      const handler = (data: any) => {
        // Skip events that originated from WebSocket to prevent loops
        if (data && data._source === 'websocket') {
          return;
        }
        
        this.log(`Handling event: ${eventType} -> ${messageType}`);
        
        // Determine if this event is for a specific entity
        let entityId = null;
        let entityType = null;
        
        // Extract entity info based on event type
        if (eventType.includes('CUSTOMER')) {
          entityType = 'customer';
          entityId = data?.customerId || data?.id;
        } else if (eventType.includes('ORDER')) {
          entityType = 'order';
          entityId = data?.orderId || data?.id;
        } else if (eventType.includes('PRODUCT')) {
          entityType = 'product';
          entityId = data?.productId || data?.id;
        } else if (eventType.includes('STAFF')) {
          entityType = 'staff';
          entityId = data?.staffId || data?.id;
        }
        
        // If we have entity info, try targeted delivery
        if (entityType && entityId) {
          // Send to clients subscribed to this entity
          const subscribedKey = `subscribedTo${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;
          const sentCount = this.wss.sendToClientsWithMetadata(
            subscribedKey,
            entityId,
            messageType,
            data
          );
          
          this.log(`Sent ${messageType} to ${sentCount} clients subscribed to ${entityType} ${entityId}`);
          
          // If no subscribed clients, fall back to broadcast
          if (sentCount === 0) {
            this.wss.broadcast(messageType, data);
          }
        } else {
          // Broadcast to all clients for general events
          this.wss.broadcast(messageType, data);
        }
      };
      
      // Register the handler
      eventBus.on(eventType, handler);
      
      // Keep track of handler for cleanup
      this.eventHandlers.set(eventType, handler);
      
      this.log(`Registered handler for event: ${eventType}`);
    }
  }
  
  /**
   * Find corresponding event type for a WebSocket message type
   * @param messageType WebSocket message type
   * @returns Event bus event type or null if not found
   */
  private findEventTypeForMessage(messageType: string): string | null {
    for (const [eventType, wsType] of Object.entries(EVENT_TO_WS_MESSAGE_MAP)) {
      if (wsType === messageType) {
        return eventType;
      }
    }
    return null;
  }
  
  /**
   * Log message if debug is enabled
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[WebSocketEventBridge]', ...args);
    }
  }
}

/**
 * Create and configure a WebSocket Event Bridge
 * @param wss WebSocket server instance
 * @param options Configuration options
 * @returns Configured WebSocket Event Bridge
 */
export function createWebSocketEventBridge(
  wss: WebSocketServer,
  options?: WebSocketEventBridgeOptions
): WebSocketEventBridge {
  const bridge = new WebSocketEventBridge(wss, options);
  bridge.start();
  return bridge;
}

export default {
  WebSocketEventBridge,
  createWebSocketEventBridge
}; 