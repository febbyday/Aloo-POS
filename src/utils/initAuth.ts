/**
 * Authentication Initialization Utility
 * 
 * This file provides functions to initialize authentication at application startup.
 */

import { api } from '@/lib/api';

/**
 * Initialize authentication
 * 
 * This function should be called at application startup to ensure proper 
 * authentication state before the application starts making API requests.
 */
export const initializeAuthentication = async (): Promise<void> => {
  try {
    console.log('Initializing authentication...');
    
    // Check if we have a token in localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('No authentication token found, will attempt to get one when needed.');
      return;
    }
    
    // Check token format and expiration
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format, clearing token.');
      localStorage.removeItem('authToken');
      return;
    }
    
    // Try to decode token and check expiration
    try {
      const payloadBase64 = parts[1];
      if (!payloadBase64) {
        console.warn('Token payload section is missing, clearing token.');
        localStorage.removeItem('authToken');
        return;
      }
      
      const payload = JSON.parse(atob(payloadBase64));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < now) {
        console.log(`Token expired at ${new Date(payload.exp * 1000).toLocaleString()}, clearing token.`);
        localStorage.removeItem('authToken');
      } else {
        console.log('Valid token found in localStorage.');
        if (payload.exp) {
          console.log(`Token expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
        }
      }
    } catch (error) {
      console.warn('Failed to decode token:', error);
      localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.error('Error initializing authentication:', error);
  }
};

/**
 * Export a function that can be called from app initialization code
 */
export const initAuth = (): Promise<void> => {
  // Only initialize in browser environment
  if (typeof window !== 'undefined') {
    return initializeAuthentication();
  }
  return Promise.resolve();
}; 