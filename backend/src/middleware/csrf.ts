import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * CSRF Protection Middleware
 *
 * This middleware implements the Double Submit Cookie pattern for CSRF protection.
 * It sets a CSRF token in both a cookie and expects the same token in request headers
 * for non-GET requests, protecting against Cross-Site Request Forgery attacks.
 *
 * Security features:
 * - Uses cryptographically secure random tokens
 * - Token rotation on each request
 * - Token expiration
 * - Strict validation
 */

// Secret for CSRF token generation and validation
const CSRF_SECRET = process.env.CSRF_SECRET || 'your-csrf-secret-key-should-be-in-env-file';
// Token expiry time (24 hours by default)
const TOKEN_EXPIRY_MS = parseInt(process.env.CSRF_TOKEN_EXPIRY_MS || '86400000', 10);
// Cookie domain
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

// In-memory token storage (use Redis in production)
const csrfTokens: Map<string, { token: string, expires: Date }> = new Map();

/**
 * Generate a new CSRF token with HMAC for additional security
 *
 * @param sessionId The session ID to bind the token to
 * @returns A new cryptographically secure CSRF token
 */
export const generateCsrfToken = (sessionId?: string): string => {
  // Generate random bytes for the token
  const randomBytes = crypto.randomBytes(32).toString('hex');

  // If session ID is provided, create an HMAC to bind the token to the session
  if (sessionId) {
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(`${randomBytes}:${sessionId}`);
    const signature = hmac.digest('hex');
    return `${randomBytes}.${signature}`;
  }

  return randomBytes;
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
 *
 * This middleware generates a new CSRF token and sets it in a cookie.
 * It also adds the token to the response headers for SPA applications.
 */
export const setCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Get the session ID from cookies or generate a new one
  const sessionId = req.cookies?.session_id || crypto.randomBytes(16).toString('hex');

  // Generate a new token bound to the session
  const token = generateCsrfToken(sessionId);

  // Store token with expiry
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);
  csrfTokens.set(sessionId, { token, expires });

  // Common cookie options
  const isProduction = process.env.NODE_ENV === 'production';

  // Set CSRF token cookie - NOT HttpOnly so JavaScript can access it
  res.cookie('csrf_token', token, {
    httpOnly: false, // Must be accessible from JavaScript
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: TOKEN_EXPIRY_MS
  });

  // Set session ID cookie if not already set - HttpOnly for security
  if (!req.cookies?.session_id) {
    res.cookie('session_id', sessionId, {
      httpOnly: true, // Prevent JavaScript access
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: COOKIE_DOMAIN,
      path: '/',
      maxAge: TOKEN_EXPIRY_MS
    });
  }

  // Also set the token in the response header for SPA applications
  res.setHeader('X-CSRF-Token', token);

  // Log CSRF token generation (debug level only)
  logger.debug('CSRF token generated', {
    sessionId,
    tokenGenerated: true,
    path: req.path
  });

  next();
};

/**
 * Middleware to validate CSRF token
 *
 * This middleware validates the CSRF token for non-idempotent requests (POST, PUT, DELETE, etc.)
 * It compares the token in the request header with the token stored for the session.
 *
 * @param req Express request object
 * @param res Express response object
 * @param next Next middleware function
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Methods that don't modify state don't need CSRF protection
  const exemptMethods = ['GET', 'HEAD', 'OPTIONS'];

  // Skip validation for exempt methods
  if (exemptMethods.includes(req.method)) {
    return next();
  }

  // Get the CSRF token from headers (multiple possible header names for compatibility)
  const csrfToken =
    req.headers['x-csrf-token'] ||
    req.headers['x-xsrf-token'] ||
    req.body?._csrf;

  // Get the session ID from cookies
  const sessionId = req.cookies?.session_id;

  // If no session ID or token, reject the request
  if (!sessionId || !csrfToken) {
    logger.warn('CSRF validation failed: Missing token or session', {
      path: req.path,
      method: req.method,
      hasToken: !!csrfToken,
      hasSession: !!sessionId,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      message: 'CSRF protection: Token missing or invalid',
      error: 'CSRF_TOKEN_MISSING'
    });
  }

  // Get the stored token data for this session
  const storedData = csrfTokens.get(sessionId);

  // If no stored token or token doesn't match, reject the request
  if (!storedData || storedData.token !== csrfToken) {
    logger.warn('CSRF validation failed: Token mismatch', {
      path: req.path,
      method: req.method,
      hasStoredToken: !!storedData,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      message: 'CSRF protection: Token validation failed',
      error: 'CSRF_TOKEN_INVALID'
    });
  }

  // Check if token is expired
  if (storedData.expires < new Date()) {
    // Remove expired token
    csrfTokens.delete(sessionId);

    logger.warn('CSRF validation failed: Token expired', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      message: 'CSRF protection: Token expired',
      error: 'CSRF_TOKEN_EXPIRED'
    });
  }

  // Generate a new token for the next request (token rotation)
  const newToken = generateCsrfToken(sessionId);
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);
  csrfTokens.set(sessionId, { token: newToken, expires });

  // Set the new token in the response
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('csrf_token', newToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    domain: COOKIE_DOMAIN,
    path: '/',
    maxAge: TOKEN_EXPIRY_MS
  });

  // Also set the new token in the response header
  res.setHeader('X-CSRF-Token', newToken);

  // Log successful validation (debug level only)
  logger.debug('CSRF token validated successfully', {
    path: req.path,
    method: req.method,
    tokenRotated: true
  });

  // Token is valid, proceed to the next middleware
  next();
};
