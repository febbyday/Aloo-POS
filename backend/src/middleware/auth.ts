import { Request, Response, NextFunction } from 'express';
import { verifyToken, isBlacklisted, getTokenFromCookies } from '../utils/tokenUtil';
import { prisma } from '../prisma';
import { SessionManager } from '../services/sessionManager';
import { AuditLogger, SecurityEvent } from '../services/auditLogger';
import { AuthenticationError, AuthErrorCode, handleError } from '../utils/errorTypes';

/**
 * Authentication middleware
 * Verifies the user's authentication token and attaches user data to the request
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or Authorization header
    const token = getTokenFromCookies(req);

    // Check if token exists
    if (!token) {
      throw new AuthenticationError(
        'Authentication required',
        AuthErrorCode.TOKEN_MISSING,
        401
      );
    }

    // Check if token is blacklisted
    if (isBlacklisted(token)) {
      throw new AuthenticationError(
        'Token has been invalidated',
        AuthErrorCode.TOKEN_BLACKLISTED,
        401
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if session is valid (if session ID is present)
    if (req.cookies.session_id) {
      const sessionValid = await SessionManager.validateSession(req.cookies.session_id);
      if (!sessionValid) {
        throw new AuthenticationError(
          'Session has expired',
          AuthErrorCode.SESSION_EXPIRED,
          401
        );
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      throw new AuthenticationError(
        'User not found',
        AuthErrorCode.USER_NOT_FOUND,
        401
      );
    }

    // For security, verify user is active
    if (!user.isActive) {
      throw new AuthenticationError(
        'User account is inactive',
        AuthErrorCode.USER_INACTIVE,
        401
      );
    }

    // Attach user to request
    req.user = user;

    // Log successful authentication
    try {
      const auditLogger = AuditLogger.getInstance();
      auditLogger.logSecurityEvent(
        SecurityEvent.AUTHENTICATION_SUCCESS,
        'SUCCESS',
        undefined,
        {
          userId: user.id,
          username: user.username,
          method: 'jwt'
        }
      );
    } catch (logError) {
      // If audit logging fails, just log to console and continue
      console.warn('Failed to log authentication success to audit log:', logError);
    }

    // Continue to the next middleware
    next();
  } catch (error) {
    // Log authentication error
    console.error('Authentication error:', error);

    try {
      const auditLogger = AuditLogger.getInstance();
      auditLogger.logSecurityEvent(
        SecurityEvent.AUTHENTICATION_FAILURE,
        'FAILURE',
        undefined,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          token: getTokenFromCookies(req) ? '[REDACTED]' : 'None'
        }
      );
    } catch (logError) {
      // If audit logging fails, just log to console and continue
      console.warn('Failed to log authentication error to audit log:', logError);
    }

    // Handle error
    return handleError(error, res);
  }
};

/**
 * Role-based authorization middleware
 * Verifies the user has the required role
 *
 * @param requiredRoles Array of allowed roles
 */
export const authorizeRoles = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError(
          'Authentication required',
          AuthErrorCode.UNAUTHORIZED,
          401
        );
      }

      // Check if user has required role
      const userRole = req.user.role || '';

      // Admin role has access to everything
      if (userRole === 'ADMIN') {
        return next();
      }

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.includes(userRole);

      if (!hasRequiredRole) {
        // Log the authorization failure
        try {
          const auditLogger = AuditLogger.getInstance();
          auditLogger.logSecurityEvent(
            SecurityEvent.AUTHORIZATION_FAILED,
            'FAILURE',
            undefined,
            {
              requiredRoles,
              userRole,
              path: req.path,
              method: req.method
            }
          );
        } catch (logError) {
          // If audit logging fails, just log to console and continue
          console.warn('Failed to log authorization failure to audit log:', logError);
        }

        throw new AuthenticationError(
          'Access denied: insufficient permissions',
          AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          403
        );
      }

      next();
    } catch (error) {
      handleError(error, res);
    }
  };
};

// Add user interface extension to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Export authenticate as an alias for authenticateJWT for backward compatibility
 */
export const authenticate = authenticateJWT;