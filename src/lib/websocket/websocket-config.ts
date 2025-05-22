/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * WebSocket Configuration
 *
 * This file contains configuration settings for the WebSocket client including:
 * - WebSocket server URL
 * - Connection options
 * - Reconnection settings
 */

import { WebSocketOptions } from './websocket-client';
import { API_CONFIG } from '../api/api-config';

// Extract host and port from the API URL
const extractHostAndPort = (apiUrl: string): { host: string; port: string } => {
  // In development mode with empty API_URL, use localhost:5000 directly
  if (!apiUrl || apiUrl === '') {
    return {
      host: 'localhost',
      port: '5000'
    };
  }

  try {
    // Ensure the URL has a protocol prefix
    const urlWithProtocol = apiUrl.startsWith('http://') || apiUrl.startsWith('https://')
      ? apiUrl
      : `http://${apiUrl}`;

    const url = new URL(urlWithProtocol);
    return {
      host: url.hostname,
      port: url.port || (url.protocol === 'https:' ? '443' : '80')
    };
  } catch (e) {
    console.error('Failed to parse API URL:', e);
    // Fallback to default values
    return {
      host: 'localhost',
      port: '5000'
    };
  }
};

// Get host and port from API config
const { host, port } = extractHostAndPort(API_CONFIG.BASE_URL);

// WebSocket URL protocol (ws or wss)
// Determine if the API is using HTTPS to decide on WSS vs WS
const isSecure = API_CONFIG.BASE_URL.startsWith('https://') ||
                (window.location.protocol === 'https:' && !API_CONFIG.BASE_URL.startsWith('http://'));
const wsProtocol = isSecure ? 'wss' : 'ws';

// WebSocket Configuration
export const WS_CONFIG = {
  // WebSocket server URL (ensures port is always defined)
  WS_URL: `${wsProtocol}://${host}:${port}`,

  // Default reconnect interval in milliseconds
  RECONNECT_INTERVAL: 3000,

  // Maximum number of reconnect attempts
  MAX_RECONNECT_ATTEMPTS: 10,

  // Heartbeat interval in milliseconds
  HEARTBEAT_INTERVAL: 30000,

  // Debug mode
  DEBUG: import.meta.env.MODE === 'development'
};

// Log WebSocket configuration in development mode
if (import.meta.env.MODE === 'development') {
  console.log('WebSocket Configuration:', {
    wsUrl: WS_CONFIG.WS_URL,
    apiBaseUrl: API_CONFIG.BASE_URL,
    host,
    port,
    protocol: wsProtocol,
    reconnectInterval: WS_CONFIG.RECONNECT_INTERVAL,
    maxReconnectAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
    heartbeatInterval: WS_CONFIG.HEARTBEAT_INTERVAL,
    debug: WS_CONFIG.DEBUG
  });
}

/**
 * Get default WebSocket client options
 * @param token Optional authentication token
 * @returns WebSocket client options
 */
export function getWebSocketOptions(token?: string): WebSocketOptions {
  // Construct WebSocket URL with optional authentication token
  const url = token
    ? `${WS_CONFIG.WS_URL}/?token=${token}`
    : WS_CONFIG.WS_URL;

  return {
    url,
    reconnectInterval: WS_CONFIG.RECONNECT_INTERVAL,
    maxReconnectAttempts: WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
    heartbeatInterval: WS_CONFIG.HEARTBEAT_INTERVAL,
    debug: WS_CONFIG.DEBUG
  };
}

export default {
  WS_CONFIG,
  getWebSocketOptions
};
