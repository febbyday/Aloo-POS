// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

/**
 * CSRF protection middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 */

// Secret for CSRF token generation
const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-should-be-in-env-file';

// In-memory token storage (use Redis in production)
const csrfTokens: Map<string, { token: string, expires: Date }> = new Map();

/**
 * Generate a new CSRF token
 * 
 * @returns A new random CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Clean up expired CSRF tokens
 */
const cleanupExpiredTokens = (): void => {
  const now = new Date();
  
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

/**
 * Middleware to set CSRF token cookie
 */
export const setCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = generateCsrfToken();
  const sessionId = req.cookies?.session_id || crypto.randomBytes(16).toString('hex');
  
  // Store token with expiry (24 hours)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  csrfTokens.set(sessionId, { token, expires });
  
  // Set cookies
  res.cookie('csrf_token', token, {
    httpOnly: false, // Needs to be accessible from JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.cookie('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  next();
};

/**
 * Middleware to validate CSRF token
 * Exempt GET, HEAD, and OPTIONS methods as they should be idempotent
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  const exemptMethods = ['GET', 'HEAD', 'OPTIONS'];
  
  // Skip validation for exempt methods
  if (exemptMethods.includes(req.method)) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionId = req.cookies?.session_id;
  
  // If no session ID or token, reject
  if (!sessionId || !csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing or invalid'
    });
  }
  
  // Get stored token
  const storedData = csrfTokens.get(sessionId);
  
  // Validate token
  if (!storedData || storedData.token !== csrfToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed'
    });
  }
  
  // Check if token is expired
  if (storedData.expires < new Date()) {
    csrfTokens.delete(sessionId);
    return res.status(403).json({
      success: false,
      message: 'CSRF token expired'
    });
  }
  
  // Token is valid, proceed
  next();
};
