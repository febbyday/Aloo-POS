/**
 * Event Bus System for POS Application
 * 
 * This module provides a centralized event system for cross-module communication,
 * allowing different parts of the application to communicate without direct dependencies.
 */

type EventCallback<T = any> = (data: T) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();
  
  /**
   * Subscribe to an event
   * @param eventName Name of the event to subscribe to
   * @param callback Function to call when the event is emitted
   * @returns Subscription object with unsubscribe method
   */
  public subscribe<T = any>(eventName: string, callback: EventCallback<T>): EventSubscription {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    this.events.get(eventName)!.add(callback);
    
    return {
      unsubscribe: () => {
        const callbacks = this.events.get(eventName);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            this.events.delete(eventName);
          }
        }
      }
    };
  }
  
  /**
   * Emit an event with data
   * @param eventName Name of the event to emit
   * @param data Data to pass to subscribers
   */
  public emit<T = any>(eventName: string, data: T): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }
  
  /**
   * Remove all subscriptions for an event
   * @param eventName Name of the event to clear
   */
  public clearEvent(eventName: string): void {
    this.events.delete(eventName);
  }
  
  /**
   * Remove all subscriptions
   */
  public clearAll(): void {
    this.events.clear();
  }
  
  /**
   * Get all registered event names
   * @returns Array of event names
   */
  public getEventNames(): string[] {
    return Array.from(this.events.keys());
  }
  
  /**
   * Check if an event has subscribers
   * @param eventName Name of the event to check
   * @returns True if the event has subscribers
   */
  public hasSubscribers(eventName: string): boolean {
    const callbacks = this.events.get(eventName);
    return !!callbacks && callbacks.size > 0;
  }
  
  /**
   * Get the number of subscribers for an event
   * @param eventName Name of the event to check
   * @returns Number of subscribers
   */
  public subscriberCount(eventName: string): number {
    const callbacks = this.events.get(eventName);
    return callbacks ? callbacks.size : 0;
  }
}

// Create and export singleton instance
export const eventBus = new EventBus();

// Export event constants
export const POS_EVENTS = {
  // Product events
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  PRODUCT_INVENTORY_CHANGED: 'product:inventory:changed',
  PRODUCT_PRICE_CHANGED: 'product:price:changed',
  
  // Customer events
  CUSTOMER_CREATED: 'customer:created',
  CUSTOMER_UPDATED: 'customer:updated',
  CUSTOMER_DELETED: 'customer:deleted',
  CUSTOMER_LOYALTY_CHANGED: 'customer:loyalty:changed',
  
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  ORDER_STATUS_CHANGED: 'order:status:changed',
  ORDER_PAYMENT_STATUS_CHANGED: 'order:payment:status:changed',
  
  // Supplier events
  SUPPLIER_CREATED: 'supplier:created',
  SUPPLIER_UPDATED: 'supplier:updated',
  SUPPLIER_DELETED: 'supplier:deleted',
  SUPPLIER_RATING_CHANGED: 'supplier:rating:changed',
  
  // Inventory events
  INVENTORY_LOW: 'inventory:low',
  INVENTORY_OUT_OF_STOCK: 'inventory:out_of_stock',
  INVENTORY_RESTOCKED: 'inventory:restocked',
  
  // UI events
  UI_THEME_CHANGED: 'ui:theme:changed',
  UI_LANGUAGE_CHANGED: 'ui:language:changed',
  UI_NOTIFICATION: 'ui:notification',
  
  // System events
  SYSTEM_ERROR: 'system:error',
  SYSTEM_WARNING: 'system:warning',
  SYSTEM_INFO: 'system:info',
  
  // Authentication events
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_SESSION_EXPIRED: 'auth:session:expired',
};

export default eventBus;
