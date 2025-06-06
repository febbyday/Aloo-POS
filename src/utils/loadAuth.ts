/**
 * Authentication Loading Utility
 * 
 * This file initializes authentication when imported.
 * Import this file early in your application bootstrap process.
 */

import { initAuth } from './initAuth';

// Execute initialization immediately when this module is imported
console.log('Authentication module loaded, initializing...');
let authInitPromise: Promise<void> | undefined;

// Initialize authentication in a non-blocking way
if (typeof window !== 'undefined') {
  authInitPromise = initAuth().catch(error => {
    console.error('Failed to initialize authentication:', error);
  });
}

// Export a promise that resolves when authentication is initialized
export const authReady = (): Promise<void> => {
  if (!authInitPromise) {
    return Promise.resolve();
  }
  return authInitPromise;
};

// Add a window global for debugging
if (typeof window !== 'undefined') {
  (window as any).checkAuthInit = () => {
    console.log('Authentication initialization:', authInitPromise ? 'Running' : 'Not started');
    return authInitPromise;
  };
}
