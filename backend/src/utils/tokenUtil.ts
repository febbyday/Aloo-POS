// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import jwt from 'jsonwebtoken';
import { Response, Request } from 'express';
import { User, UserRole } from '@prisma/client';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';
const TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

// Token Blacklist (in memory - use Redis in production)
const tokenBlacklist = new Set<string>();

// Role permissions mapping
const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: [
    'user:read', 'user:write', 'user:delete',
    'product:read', 'product:write', 'product:delete',
    'order:read', 'order:write', 'order:delete',
    'report:read', 'report:write', 'report:delete',
    'setting:read', 'setting:write',
    'role:read', 'role:write', 'role:delete'
  ],
  MANAGER: [
    'user:read',
    'product:read', 'product:write', 
    'order:read', 'order:write', 'order:delete',
    'report:read', 'report:write',
    'setting:read'
  ],
  CASHIER: [
    'product:read',
    'order:read', 'order:write',
    'report:read'
  ],
  USER: [
    'product:read',
    'order:read'
  ]
};

/**
 * Generate tokens for a user
 * 
 * @param user User object
 * @returns Tokens and expiry
 */
export const generateTokens = async (user: User): Promise<{ token: string; refreshToken: string; expiresIn: number }> => {
  // Create token payload
  const tokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  // Generate access token
  const token = jwt.sign(
    tokenPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Generate refresh token with different expiry
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Calculate expiry in seconds for client-side handling
  const expiry = jwt.decode(token) as { exp: number };
  const expiresIn = expiry.exp * 1000 - Date.now();

  return { token, refreshToken, expiresIn };
};

/**
 * Verify JWT token
 * 
 * @param token JWT token
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Verify refresh token
 * 
 * @param refreshToken Refresh token
 * @returns Decoded token payload
 */
export const verifyRefreshToken = (refreshToken: string): any => {
  try {
    return jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Add token to blacklist
 * 
 * @param token Token to blacklist
 */
export const addToBlacklist = (token: string): void => {
  tokenBlacklist.add(token);
  
  // In a production environment, you would set an expiry time based on the token's expiry
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 3600000); // Clean up after 1 hour
};

/**
 * Check if token is blacklisted
 * 
 * @param token Token to check
 * @returns True if blacklisted
 */
export const isBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

/**
 * Set authentication cookies
 * 
 * @param res Express response object
 * @param token JWT token
 * @param refreshToken Refresh token
 * @param sessionId Session ID
 */
export const setCookies = (
  res: Response, 
  token: string, 
  refreshToken: string,
  sessionId: string
): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Set token cookie - short-lived, HttpOnly for XSS protection
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 3600000 // 1 hour in milliseconds
  });
  
  // Set refresh token cookie - longer lived, HttpOnly
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
  
  // Set session cookie
  res.cookie('session_id', sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 12 * 60 * 60 * 1000 // 12 hours in milliseconds
  });
};

/**
 * Clear authentication cookies
 * 
 * @param res Express response object
 */
export const clearCookies = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Clear token cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  
  // Clear refresh token cookie
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  
  // Clear session cookie
  res.clearCookie('session_id', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
};

/**
 * Get permissions for a user role
 * 
 * @param role User role
 * @returns Array of permissions
 */
export const getUserPermissions = (role: UserRole): string[] => {
  return rolePermissions[role] || [];
};

/**
 * Check if user has a specific permission
 * 
 * @param userRole User role
 * @param requiredPermission Required permission
 * @returns True if user has the permission
 */
export const hasPermission = (userRole: UserRole, requiredPermission: string): boolean => {
  const permissions = getUserPermissions(userRole);
  return permissions.includes(requiredPermission);
};

/**
 * Get token from request cookies or authorization header
 * 
 * @param req Express request object
 * @returns Token or undefined
 */
export const getTokenFromCookies = (req: Request): string | undefined => {
  // First try to get from cookies
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  
  // Then try to get from authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return undefined;
};
