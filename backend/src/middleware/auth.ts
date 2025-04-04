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
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
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
    
    // Attach user to request object
    req.user = user;
    
    next();
  } catch (error: unknown) {
    // Handle token verification errors
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: {
          code: AuthErrorCode.TOKEN_INVALID
        }
      });
    }
    
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: {
          code: AuthErrorCode.TOKEN_EXPIRED
        }
      });
    }
    
    // Handle other authentication errors
    if (error instanceof AuthenticationError) {
      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
    
    // Handle unexpected errors
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: {
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
};

/**
 * Role-based authorization middleware
 * Verifies the user has the required role
 * 
 * @param requiredRoles Array of allowed roles
 */
export const authorize = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Make sure user is authenticated and attached to request
      if (!req.user) {
        throw new AuthenticationError(
          'Authentication required',
          AuthErrorCode.TOKEN_MISSING,
          401
        );
      }
      
      // Check if user has one of the required roles
      if (!requiredRoles.includes(req.user.role)) {
        // Log unauthorized access attempt
        AuditLogger.getInstance().logSecurityEvent(
          SecurityEvent.PERMISSION_DENIED,
          'FAILURE',
          req.user.id,
          {
            requiredRoles,
            userRole: req.user.role,
            endpoint: req.originalUrl,
            method: req.method
          }
        );
        
        throw new AuthenticationError(
          'Insufficient permissions',
          AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          403
        );
      }
      
      next();
    } catch (error: unknown) {
      if (error instanceof AuthenticationError) {
        const { status, response } = handleError(error);
        return res.status(status).json(response);
      }
      
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization',
        error: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
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