/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * React Hooks for WebSocket Integration
 * 
 * This module provides React hooks for using the WebSocket client in components.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getWebSocketClient, 
  initWebSocketClient, 
  ConnectionStatus, 
  WebSocketOptions 
} from '../websocket-client';
import { useEventSubscription } from '../../events/hooks/useEventBus';
import { getWebSocketOptions } from '../websocket-config';

/**
 * Hook for initializing and managing WebSocket connection
 * @param customOptions Optional custom WebSocket connection options (overrides defaults)
 * @returns WebSocket connection status and control functions
 */
export function useWebSocket(customOptions?: Partial<WebSocketOptions>) {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isReady, setIsReady] = useState<boolean>(false);
  
  // Initialize WebSocket with proper configuration
  useEffect(() => {
    try {
      // Get authentication token if available (from localStorage or cookie)
      const authToken = localStorage.getItem('auth_token') || '';
      
      // Get default options with authentication token if available
      const defaultOptions = getWebSocketOptions(authToken);
      
      // Merge with any custom options
      const options = { ...defaultOptions, ...customOptions };
      
      // Initialize WebSocket client with options
      const client = initWebSocketClient(options);
      setIsReady(true);
      
      // Connect to WebSocket server
      client.connect();
      
      // Log connection attempt in development
      if (import.meta.env.MODE === 'development') {
        console.log('WebSocket connecting to:', options.url);
      }
      
      // Cleanup on unmount
      return () => {
        client.disconnect();
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      setStatus(ConnectionStatus.ERROR);
      return undefined;
    }
  }, [customOptions]);
  
  // Subscribe to WebSocket status changes
  useEventSubscription('ws:status', (newStatus: ConnectionStatus) => {
    setStatus(newStatus);
  }, []);
  
  // Callback to send a message
  const sendMessage = useCallback(<T = any>(type: string, data: T) => {
    const client = getWebSocketClient();
    if (client && status === ConnectionStatus.CONNECTED) {
      client.send(type, data);
      return true;
    }
    return false;
  }, [status]);
  
  // Callback to manually connect
  const connect = useCallback(() => {
    const client = getWebSocketClient();
    if (client) {
      client.connect();
    }
  }, []);
  
  // Callback to manually disconnect
  const disconnect = useCallback(() => {
    const client = getWebSocketClient();
    if (client) {
      client.disconnect();
    }
  }, []);
  
  return {
    status,
    isReady,
    isConnected: status === ConnectionStatus.CONNECTED,
    sendMessage,
    connect,
    disconnect
  };
}

/**
 * Hook for subscribing to WebSocket messages
 * @param messageType The type of message to subscribe to
 * @param callback Function to call when a message is received
 * @param deps Dependencies array (similar to useEffect)
 */
export function useWebSocketMessage<T = any>(
  messageType: string,
  callback: (data: T) => void,
  deps: React.DependencyList = []
): void {
  useEventSubscription<T>(`ws:${messageType}`, callback, deps);
}

/**
 * Hook for subscribing to customer real-time updates
 * @param customerId ID of the customer to subscribe to updates for (optional)
 * @param callback Function to call when a customer update is received
 * @param deps Dependencies array (similar to useEffect)
 */
export function useCustomerUpdates<T = any>(
  customerId: string | null,
  callback: (data: T) => void,
  deps: React.DependencyList = []
): void {
  // Get WebSocket connection status
  const { isConnected, sendMessage } = useWebSocket();
  
  // Subscribe to customer updates when connected
  useEffect(() => {
    if (isConnected && customerId) {
      // Send subscribe message to WebSocket server
      sendMessage('customer:subscribe', { customerId });
    }
  }, [isConnected, customerId, sendMessage]);
  
  // Listen for customer update events
  useWebSocketMessage<T>(
    'customer:updated', 
    (data) => {
      callback(data);
    },
    deps
  );
  
  // Listen for customer loyalty change events
  useWebSocketMessage<T>(
    'customer:loyalty_changed',
    (data) => {
      callback(data);
    },
    deps
  );
}

/**
 * Hook for subscribing to all customer real-time events
 * @param callback Function to call when any customer event is received
 * @param deps Dependencies array (similar to useEffect)
 */
export function useCustomerEvents<T = any>(
  callback: (eventType: string, data: T) => void,
  deps: React.DependencyList = []
): void {
  // Listen for customer created events
  useWebSocketMessage<T>(
    'customer:created',
    (data) => {
      callback('created', data);
    },
    deps
  );
  
  // Listen for customer updated events
  useWebSocketMessage<T>(
    'customer:updated',
    (data) => {
      callback('updated', data);
    },
    deps
  );
  
  // Listen for customer deleted events
  useWebSocketMessage<T>(
    'customer:deleted',
    (data) => {
      callback('deleted', data);
    },
    deps
  );
  
  // Listen for customer loyalty changed events
  useWebSocketMessage<T>(
    'customer:loyalty_changed',
    (data) => {
      callback('loyalty_changed', data);
    },
    deps
  );
}

export default {
  useWebSocket,
  useWebSocketMessage,
  useCustomerUpdates,
  useCustomerEvents
};