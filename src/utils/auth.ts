/**
 * Authentication Utilities
 * 
 * This module provides utility functions for authentication-related operations.
 */

import { jwtDecode } from 'jwt-decode';

/**
 * Token storage key
 */
export const TOKEN_KEY = 'pos_auth_token';

/**
 * Interface for decoded JWT token data
 */
export interface DecodedToken {
  userId: string;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
}

/**
 * Store authentication token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Retrieve authentication token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Get decoded token data
 */
export const getDecodedToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    return null;
  }
};

/**
 * Get user role from token
 */
export const getUserRole = (): string | null => {
  const decoded = getDecodedToken();
  return decoded ? decoded.role : null;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission: string): boolean => {
  const decoded = getDecodedToken();
  return decoded?.permissions?.includes(permission) || false;
}; 
