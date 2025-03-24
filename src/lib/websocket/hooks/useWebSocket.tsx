/**
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

/**
 * Hook for initializing and managing WebSocket connection
 * @param options WebSocket connection options
 * @returns WebSocket connection status and control functions
 */
export function useWebSocket(options?: WebSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isReady, setIsReady] = useState<boolean>(false);
  
  // Initialize WebSocket if options are provided
  useEffect(() => {
    if (options) {
      // Initialize WebSocket client with options
      const client = initWebSocketClient(options);
      setIsReady(true);
      
      // Connect to WebSocket server
      client.connect();
      
      // Cleanup on unmount
      return () => {
        client.disconnect();
      };
    }
  }, [options]);
  
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
  useWebSocketMessage<T>(
    customerId ? `customer:${customerId}:update` : 'customer:update',
    callback,
    [customerId, ...deps]
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
  // Listen for all customer-related events
  useEventSubscription<T>('ws:customer:created', (data) => {
    callback('created', data);
  }, deps);
  
  useEventSubscription<T>('ws:customer:updated', (data) => {
    callback('updated', data);
  }, deps);
  
  useEventSubscription<T>('ws:customer:deleted', (data) => {
    callback('deleted', data);
  }, deps);
  
  useEventSubscription<T>('ws:customer:loyalty:changed', (data) => {
    callback('loyalty:changed', data);
  }, deps);
  
  useEventSubscription<T>('ws:customer:tier:changed', (data) => {
    callback('tier:changed', data);
  }, deps);
}

export default {
  useWebSocket,
  useWebSocketMessage,
  useCustomerUpdates,
  useCustomerEvents
}; 