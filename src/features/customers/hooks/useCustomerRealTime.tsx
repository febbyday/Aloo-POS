/**
 * Customer Real-Time Hook
 * 
 * This hook provides real-time customer data updates via WebSocket connection.
 * It automatically subscribes to updates for a specific customer or all customers,
 * and integrates with the application's event bus.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket, useWebSocketMessage } from '../../../lib/websocket/hooks/useWebSocket';
import { eventBus, POS_EVENTS } from '../../../lib/events/event-bus';
import type { Customer } from '../types/customer.types';

// Direct import instead of dynamic import to avoid issues
import { customerService } from '../../../lib/api/services/customer-service';

/**
 * Hook to subscribe to real-time updates for a specific customer
 * 
 * @param customerId The ID of the customer to subscribe to, or undefined for all customers
 * @returns Object containing customer data, loading state, and error
 */
export function useCustomerRealTime(customerId?: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Get WebSocket connection and status
  const { connected, sendMessage } = useWebSocket();
  
  // Subscribe to customer updates
  useEffect(() => {
    if (!connected || !customerId) return;
    
    // Send subscription message for this customer
    sendMessage('customer:subscribe', { customerId });
    setIsSubscribed(true);
    
    return () => {
      // Unsubscribe when component unmounts or customerId changes
      sendMessage('customer:unsubscribe', { customerId });
      setIsSubscribed(false);
    };
  }, [connected, customerId, sendMessage]);
  
  // Listen for customer update events
  useWebSocketMessage('customer:updated', (data) => {
    if (customerId && data.id === customerId) {
      setCustomer(prevCustomer => ({
        ...(prevCustomer || {}),
        ...data
      }));
      
      // Also emit to event bus to keep local state in sync
      eventBus.emit(POS_EVENTS.CUSTOMER.UPDATED, data);
    }
  });
  
  // Listen for customer loyalty events
  useWebSocketMessage('customer:loyalty_changed', (data) => {
    if (customerId && data.customerId === customerId) {
      setCustomer(prevCustomer => {
        if (!prevCustomer) return null;
        
        return {
          ...prevCustomer,
          loyaltyPoints: data.newPoints,
          loyaltyTierId: data.tierId
        };
      });
      
      // Emit to event bus
      eventBus.emit(POS_EVENTS.CUSTOMER.LOYALTY_CHANGED, data);
    }
  });
  
  // Load initial customer data
  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    
    // Set loading state
    setLoading(true);
    setError(null);
    
    // Use direct import instead of dynamic import
    customerService.getById(customerId)
      .then(response => {
        if (response && response.data) {
          setCustomer(response.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading customer data:", err);
        setError(err);
        setLoading(false);
      });
  }, [customerId]);
  
  // Function to refresh customer data
  const refreshCustomer = useCallback(() => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    // Use direct import instead of dynamic import
    customerService.getById(customerId)
      .then(response => {
        if (response && response.data) {
          setCustomer(response.data);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [customerId]);
  
  return {
    customer,
    loading,
    error,
    isSubscribed,
    refreshCustomer
  };
}

/**
 * Hook to subscribe to all customer-related events
 * 
 * @param options Configuration options
 * @returns Object with callback registration and event bus methods
 */
interface UseCustomerEventsOptions {
  onCustomerCreated?: (customer: Customer) => void;
  onCustomerUpdated?: (customer: Customer) => void;
  onCustomerDeleted?: (customerId: string) => void;
  onLoyaltyChanged?: (data: { 
    customerId: string; 
    newPoints: number; 
    oldPoints: number;
    tierId?: string;
  }) => void;
}

export function useCustomerEvents(options: UseCustomerEventsOptions = {}) {
  const { 
    onCustomerCreated,
    onCustomerUpdated,
    onCustomerDeleted,
    onLoyaltyChanged
  } = options;
  
  // Subscribe to WebSocket messages for various customer events
  useWebSocketMessage('customer:created', (data) => {
    if (onCustomerCreated) onCustomerCreated(data);
    // Emit to event bus
    eventBus.emit(POS_EVENTS.CUSTOMER.CREATED, data);
  });
  
  useWebSocketMessage('customer:updated', (data) => {
    if (onCustomerUpdated) onCustomerUpdated(data);
    // Emit to event bus
    eventBus.emit(POS_EVENTS.CUSTOMER.UPDATED, data);
  });
  
  useWebSocketMessage('customer:deleted', (data) => {
    if (onCustomerDeleted) onCustomerDeleted(data.id);
    // Emit to event bus
    eventBus.emit(POS_EVENTS.CUSTOMER.DELETED, data);
  });
  
  useWebSocketMessage('customer:loyalty_changed', (data) => {
    if (onLoyaltyChanged) onLoyaltyChanged(data);
    // Emit to event bus
    eventBus.emit(POS_EVENTS.CUSTOMER.LOYALTY_CHANGED, data);
  });
  
  // Methods to manually emit events (useful for local state updates)
  const emitCustomerCreated = useCallback((customer: Customer) => {
    eventBus.emit(POS_EVENTS.CUSTOMER.CREATED, customer);
  }, []);
  
  const emitCustomerUpdated = useCallback((customer: Customer) => {
    eventBus.emit(POS_EVENTS.CUSTOMER.UPDATED, customer);
  }, []);
  
  const emitCustomerDeleted = useCallback((customerId: string) => {
    eventBus.emit(POS_EVENTS.CUSTOMER.DELETED, { id: customerId });
  }, []);
  
  const emitLoyaltyChanged = useCallback((data: { 
    customerId: string; 
    newPoints: number; 
    oldPoints: number;
    tierId?: string;
  }) => {
    eventBus.emit(POS_EVENTS.CUSTOMER.LOYALTY_CHANGED, data);
  }, []);
  
  return {
    emitCustomerCreated,
    emitCustomerUpdated,
    emitCustomerDeleted,
    emitLoyaltyChanged
  };
}

/**
 * Hook to track all customers in a list with real-time updates
 * 
 * This hook maintains a list of customers that automatically updates
 * when changes occur via WebSocket events.
 * 
 * @returns Object containing customers array, loading state, and error
 */
export function useCustomersRealTime() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Check WebSocket connection status
  const { connected } = useWebSocket();
  
  // Load initial customer data
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Use the directly imported customerService instead of dynamic import
    customerService.getAll()
      .then(response => {
        if (response && response.data) {
          setCustomers(response.data);
        } else {
          setCustomers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading customers:", err);
        setError(err);
        setLoading(false);
      });
  }, []);
  
  // Listen for customer created events
  useWebSocketMessage('customer:created', (newCustomer) => {
    setCustomers(prev => [...prev, newCustomer]);
  });
  
  // Listen for customer updated events
  useWebSocketMessage('customer:updated', (updatedCustomer) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === updatedCustomer.id 
          ? { ...customer, ...updatedCustomer } 
          : customer
      )
    );
  });
  
  // Listen for customer deleted events
  useWebSocketMessage('customer:deleted', (data) => {
    setCustomers(prev => 
      prev.filter(customer => customer.id !== data.id)
    );
  });
  
  // Listen for loyalty point changes
  useWebSocketMessage('customer:loyalty_changed', (data) => {
    setCustomers(prev => 
      prev.map(customer => {
        if (customer.id === data.customerId) {
          return {
            ...customer,
            loyaltyPoints: data.newPoints,
            loyaltyTierId: data.tierId || customer.loyaltyTierId
          };
        }
        return customer;
      })
    );
  });
  
  // Function to refresh customer list
  const refreshCustomers = useCallback(() => {
    setLoading(true);
    
    import('../services/customerService').then(({ getCustomers }) => {
      getCustomers()
        .then(data => {
          setCustomers(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    });
  }, []);
  
  return {
    customers,
    loading,
    error,
    connected,
    refreshCustomers
  };
}

export default {
  useCustomerRealTime,
  useCustomerEvents,
  useCustomersRealTime
}; 