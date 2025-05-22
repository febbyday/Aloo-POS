import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { generateTokens, verifyToken, addToBlacklist, isBlacklisted, setCookies, clearCookies, getTokenFromCookies } from '../utils/tokenUtil';
import { comparePasswords, hashPassword, comparePins } from '../utils/password.util';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenService } from '../services/refreshTokenService';
import { SessionManager } from '../services/sessionManager';
import { AuditLogger, AuthEvent, EventCategory, Severity } from '../services/auditLogger';
import { AuthenticationError, AuthErrorCode, ValidationError, ValidationErrorCode, handleError } from '../utils/errorTypes';
import { validatePinComplexity, isPinLocked, recordFailedPinAttempt, resetPinAttempts } from '../utils/pinSecurityUtils';
import { logger } from '../utils/logger';

// In-memory rate limiting
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const { username, password, email, name } = req.body;

      // Validate input
      if (!username || !password || !email) {
        throw new ValidationError(
          'Please provide username, password, and email',
          ValidationErrorCode.MISSING_REQUIRED_FIELD
        );
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        throw new ValidationError(
          'Username already exists',
          ValidationErrorCode.DUPLICATE_ENTRY,
          400,
          { field: 'username' }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Prepare user data - handle name vs firstName/lastName
      const [firstName, ...lastNameParts] = (name || username).split(' ');
      const lastName = lastNameParts.join(' ');

      // Create user
      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          username,
          password: hashedPassword,
          email,
          firstName: firstName, // Use firstName
          lastName: lastName || '', // Use lastName
          role: 'USER', // Default role - Ensure UserRole type exists or adjust
          isActive: true // Use isActive
        }
      });

      // Generate tokens
      const { token, refreshToken, expiresIn } = await generateTokens(user);

      // Generate refresh token
      const dbRefreshToken = await RefreshTokenService.generateRefreshToken(user.id);

      // Create session
      const session = await SessionManager.createSession(user.id, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Set cookies with token expiry
      setCookies(res, token, dbRefreshToken, session.id, expiresIn);

      // Log the event
      AuditLogger.getInstance().logAuthEvent(
        AuthEvent.REGISTER,
        'SUCCESS',
        user.id,
        { username, email, sessionId: session.id }
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName, // Use firstName
            lastName: user.lastName, // Use lastName
            role: user.role
          },
          expiresIn
        }
      });
    } catch (error) {
      // Log the event
      if (req.body.username) {
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.REGISTER,
          'FAILURE',
          undefined,
          // Safely access error message
          { username: req.body.username, error: error instanceof Error ? error.message : String(error) }
        );
      }

      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }

  /**
   * Login user and return tokens
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const ipAddress = req.ip;

      // Validate input
      if (!username || !password) {
        throw new ValidationError(
          'Please provide username and password',
          ValidationErrorCode.MISSING_REQUIRED_FIELD
        );
      }

      // Check rate limiting
      const userAttemptKey = `${username}_${ipAddress}`;
      const userAttempts = loginAttempts.get(userAttemptKey);

      if (userAttempts && userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
        // Check if lockout period has passed
        if (Date.now() < userAttempts.resetTime) {
          const minutesLeft = Math.ceil((userAttempts.resetTime - Date.now()) / 60000);

          // Log the event
          AuditLogger.getInstance().logAuthEvent(
            AuthEvent.RATE_LIMIT_EXCEEDED,
            'FAILURE',
            undefined,
            { username, ip: ipAddress }
          );

          throw new AuthenticationError(
            `Too many login attempts. Please try again in ${minutesLeft} minutes.`,
            AuthErrorCode.RATE_LIMIT_EXCEEDED,
            429
          );
        }

        // Reset attempts if lockout period has passed
        loginAttempts.delete(userAttemptKey);
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        // Increment failed attempts
        incrementLoginAttempts(userAttemptKey);

        // Log the event
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.LOGIN_FAILURE,
          'FAILURE',
          undefined,
          { username, reason: 'USER_NOT_FOUND', ip: ipAddress }
        );

        throw new AuthenticationError(
          'Invalid credentials',
          AuthErrorCode.INVALID_CREDENTIALS
        );
      }

      // Check if user is active
      if (!user.isActive) { // Use isActive
        // Log the event
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.LOGIN_FAILURE,
          'FAILURE',
          user.id,
          { username, reason: 'ACCOUNT_DISABLED', ip: ipAddress }
        );

        throw new AuthenticationError(
          'Account is disabled. Please contact support.',
          AuthErrorCode.ACCOUNT_LOCKED,
          403
        );
      }

      // Verify password
      const isPasswordValid = await comparePasswords(password, user.password);

      if (!isPasswordValid) {
        // Increment failed attempts
        incrementLoginAttempts(userAttemptKey);

        // Log the event
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.LOGIN_FAILURE,
          'FAILURE',
          user.id,
          { username, reason: 'INVALID_PASSWORD', ip: ipAddress }
        );

        throw new AuthenticationError(
          'Invalid credentials',
          AuthErrorCode.INVALID_CREDENTIALS
        );
      }

      // Reset login attempts on successful login
      loginAttempts.delete(userAttemptKey);

      // Generate tokens
      const { token, refreshToken, expiresIn } = await generateTokens(user);

      // Generate database refresh token
      const dbRefreshToken = await RefreshTokenService.generateRefreshToken(user.id);

      // Create session
      const session = await SessionManager.createSession(user.id, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Set cookies with token expiry
      setCookies(res, token, dbRefreshToken, session.id, expiresIn);

      // Log the event
      AuditLogger.getInstance().logAuthEvent(
        AuthEvent.LOGIN_SUCCESS,
        'SUCCESS',
        user.id,
        { username, sessionId: session.id, ip: ipAddress }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token, // Include token in response for compatibility
          accessToken: token, // Include accessToken as alias for token
          refreshToken: dbRefreshToken, // Include refreshToken for compatibility
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName, // Use firstName
            lastName: user.lastName, // Use lastName
            role: user.role
          },
          expiresIn
        }
      });
    } catch (error) {
      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }

  /**
   * Login user with PIN and return tokens
   */
  static async loginWithPin(req: Request, res: Response) {
    try {
      const { userId, pin } = req.body;
      const ipAddress = req.ip;

      // Validate input
      if (!userId || !pin) {
        throw new ValidationError(
          'Please provide userId and pin',
          ValidationErrorCode.MISSING_REQUIRED_FIELD
        );
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        // Log the event (generic, as we don't know if the user ID was valid)
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.PIN_LOGIN_FAILURE, // Use correct enum
          'FAILURE',
          undefined,
          { userId, reason: 'USER_NOT_FOUND', ip: ipAddress }
        );
        throw new AuthenticationError(
          'Invalid user or PIN',
          AuthErrorCode.INVALID_CREDENTIALS
        );
      }

      // Check if PIN login is enabled
      if (!user.isPinEnabled || !user.pinHash) {
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.PIN_LOGIN_FAILURE, // Use correct enum
          'FAILURE',
          user.id,
          { username: user.username, reason: 'PIN_NOT_ENABLED', ip: ipAddress }
        );
        throw new AuthenticationError(
          'PIN login is not enabled for this account.',
          AuthErrorCode.PIN_NOT_ENABLED, // Use correct enum
          403
        );
      }

      // Check PIN lockout using the enhanced PIN security utility
      const lockStatus = isPinLocked(userId);
      if (lockStatus.isLocked) {
        const minutesLeft = Math.ceil((lockStatus.remainingMs || 0) / 60000);

        logger.warn('PIN login attempted while PIN is locked', {
          userId,
          username: user.username,
          remainingMinutes: minutesLeft,
          attempts: lockStatus.attempts,
          ip: ipAddress
        });

        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.PIN_LOGIN_FAILURE,
          'FAILURE',
          user.id,
          { username: user.username, reason: 'PIN_LOCKED', ip: ipAddress }
        );

        throw new AuthenticationError(
          `PIN login locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
          AuthErrorCode.PIN_LOCKED,
          429
        );
      }

      // Verify PIN
      const isPinValid = await comparePins(pin, user.pinHash);

      if (!isPinValid) {
        // Record failed attempt using the enhanced PIN security utility
        const attemptResult = recordFailedPinAttempt(userId);

        logger.warn('Failed PIN login attempt', {
          userId,
          username: user.username,
          attempts: attemptResult.attempts,
          isLocked: attemptResult.isLocked,
          ip: ipAddress
        });

        // Update user with failed attempts in the database for persistence
        await prisma.user.update({
          where: { id: userId },
          data: {
            failedPinAttempts: attemptResult.attempts,
            pinLockedUntil: attemptResult.lockedUntil
          }
        });

        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.PIN_LOGIN_FAILURE,
          'FAILURE',
          user.id,
          {
            username: user.username,
            reason: 'INVALID_PIN',
            ip: ipAddress,
            attempts: attemptResult.attempts
          }
        );

        if (attemptResult.isLocked) {
          const remainingMinutes = Math.ceil(
            ((attemptResult.lockedUntil?.getTime() || 0) - Date.now()) / 60000
          );

          throw new AuthenticationError(
            `Invalid PIN. Account locked for ${remainingMinutes} minutes due to too many failed attempts.`,
            AuthErrorCode.PIN_LOCKED,
            429
          );
        } else {
          throw new AuthenticationError(
            'Invalid user or PIN',
            AuthErrorCode.INVALID_CREDENTIALS
          );
        }
      }

      // Reset failed attempts on successful login
      resetPinAttempts(userId);

      // Also update the database record
      if (user.failedPinAttempts > 0 || user.pinLockedUntil) {
        await prisma.user.update({
          where: { id: userId },
          data: { failedPinAttempts: 0, pinLockedUntil: null }
        });
      }

      logger.info('Successful PIN login', {
        userId,
        username: user.username,
        ip: ipAddress
      });

      // Check if user is active
      if (!user.isActive) { // Use isActive
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.PIN_LOGIN_FAILURE, // Use correct enum
          'FAILURE',
          user.id,
          { username: user.username, reason: 'ACCOUNT_DISABLED', ip: ipAddress }
        );
        throw new AuthenticationError(
          'Account is disabled. Please contact support.',
          AuthErrorCode.ACCOUNT_LOCKED,
          403
        );
      }

      // Generate tokens
      const { token, refreshToken, expiresIn } = await generateTokens(user);

      // Generate refresh token in DB
      const dbRefreshToken = await RefreshTokenService.generateRefreshToken(user.id);

      // Create session
      const session = await SessionManager.createSession(user.id, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
        // Removed: loginMethod: 'pin'
      });

      // Set cookies with token expiry
      setCookies(res, token, dbRefreshToken, session.id, expiresIn);

      // Log successful PIN login
      AuditLogger.getInstance().logAuthEvent(
        AuthEvent.PIN_LOGIN_SUCCESS, // Use correct enum
        'SUCCESS',
        user.id,
        { username: user.username, sessionId: session.id, ip: ipAddress }
      );

      return res.status(200).json({
        success: true,
        message: 'PIN Login successful',
        data: {
          token, // Include token in response for compatibility
          accessToken: token, // Include accessToken as alias for token
          refreshToken: dbRefreshToken, // Include refreshToken for compatibility
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName, // Use firstName
            lastName: user.lastName, // Use lastName
            role: user.role
          },
          expiresIn
        }
      });

    } catch (error) {
      const { status, response } = handleError(error);
      // Log using appropriate method
      AuditLogger.getInstance().logAuthEvent(
          AuthEvent.PIN_LOGIN_FAILURE,
          'FAILURE',
          req.body.userId,
          {
            reason: 'PIN_LOGIN_EXCEPTION',
            error: error instanceof Error ? error.message : String(error),
            ip: req.ip
          }
      );
      return res.status(status).json(response);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      // Get refresh token from cookies
      const refreshToken = req.cookies.refresh_token;
      const sessionId = req.cookies.session_id;

      if (!refreshToken) {
        throw new AuthenticationError(
          'Refresh token is required',
          AuthErrorCode.TOKEN_MISSING
        );
      }

      // Validate the refresh token
      const userId = await RefreshTokenService.validateRefreshToken(refreshToken);

      if (!userId) {
        throw new AuthenticationError(
          'Invalid or expired refresh token',
          AuthErrorCode.REFRESH_TOKEN_INVALID
        );
      }

      // Validate session if available
      if (sessionId) {
        const isSessionValid = await SessionManager.validateSession(sessionId);
        if (!isSessionValid) {
          throw new AuthenticationError(
            'Session has expired',
            AuthErrorCode.SESSION_EXPIRED
          );
        }
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AuthenticationError(
          'User not found',
          AuthErrorCode.USER_NOT_FOUND
        );
      }

      // Generate new token
      const { token, expiresIn } = await generateTokens(user);

      // Rotate refresh token (token rotation for security)
      const newRefreshToken = await RefreshTokenService.rotateRefreshToken(refreshToken);

      if (!newRefreshToken) {
        throw new AuthenticationError(
          'Failed to rotate refresh token',
          AuthErrorCode.REFRESH_TOKEN_INVALID
        );
      }

      // Create a new session or update existing one
      let newSessionId = sessionId;
      if (!sessionId) {
        const session = await SessionManager.createSession(user.id, {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
        newSessionId = session.id;
      } else {
        await SessionManager.updateSessionActivity(sessionId);
      }

      // Set cookies with new tokens and expiry
      setCookies(res, token, newRefreshToken, newSessionId, expiresIn);

      // Log the event
      AuditLogger.getInstance().logAuthEvent(
        AuthEvent.TOKEN_REFRESH,
        'SUCCESS',
        user.id,
        { sessionId: newSessionId }
      );

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          expiresIn
        }
      });
    } catch (error) {
      // Clear cookies if refresh failed
      clearCookies(res);

      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }

  /**
   * Logout user and invalidate tokens
   */
  static async logout(req: Request, res: Response) {
    try {
      const token = getTokenFromCookies(req);
      const refreshToken = req.cookies.refresh_token;
      const sessionId = req.cookies.session_id;

      // Get user ID from token if available
      let userId = '';
      if (token) {
        try {
          const decoded = verifyToken(token);
          userId = decoded.id;
        } catch (error) {
          // Ignore token verification errors during logout
        }
      }

      // Revoke refresh token if available
      if (refreshToken) {
        await RefreshTokenService.revokeRefreshToken(refreshToken);
      }

      // Terminate session if available
      if (sessionId) {
        await SessionManager.terminateSession(sessionId);
      }

      // Blacklist token if available
      if (token) {
        addToBlacklist(token);
      }

      // Clear cookies
      clearCookies(res);

      // Log the event
      if (userId) {
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.LOGOUT,
          'SUCCESS',
          userId,
          { sessionId }
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      // Clear cookies even if there's an error
      clearCookies(res);

      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }

  /**
   * Verify if the user's token is valid
   */
  static async verify(req: Request, res: Response) {
    try {
      const token = getTokenFromCookies(req);
      const sessionId = req.cookies.session_id;

      if (!token) {
        throw new AuthenticationError(
          'Token is required',
          AuthErrorCode.TOKEN_MISSING
        );
      }

      // Check if token is blacklisted
      if (isBlacklisted(token)) {
        throw new AuthenticationError(
          'Token has been invalidated',
          AuthErrorCode.TOKEN_BLACKLISTED
        );
      }

      // Verify the token
      const decoded = verifyToken(token);

      // Validate session if available
      if (sessionId) {
        const isSessionValid = await SessionManager.validateSession(sessionId);
        if (!isSessionValid) {
          throw new AuthenticationError(
            'Session has expired',
            AuthErrorCode.SESSION_EXPIRED
          );
        }
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        throw new AuthenticationError(
          'User not found',
          AuthErrorCode.USER_NOT_FOUND
        );
      }

      // Log the event
      AuditLogger.getInstance().logAuthEvent(
        AuthEvent.TOKEN_VALIDATION,
        'SUCCESS',
        user.id,
        { sessionId }
      );

      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName, // Use firstName
            lastName: user.lastName, // Use lastName
            role: user.role
          }
        }
      });
    } catch (error) {
      // Log the event if possible
      if (error instanceof AuthenticationError) {
        AuditLogger.getInstance().logAuthEvent(
          AuthEvent.TOKEN_VALIDATION,
          'FAILURE',
          undefined,
          { error: error.message, code: error.code }
        );
      }

      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }

  /**
   * Set CSRF token in cookie
   */
  static setCsrfCookie(req: Request, res: Response) {
    // This is handled by the CSRF middleware, just return success
    return res.status(200).json({
      success: true,
      message: 'CSRF token has been set'
    });
  }

  /**
   * Clear all authentication cookies
   */
  static clearCookies(req: Request, res: Response) {
    clearCookies(res);
    return res.status(200).json({
      success: true,
      message: 'Cookies have been cleared'
    });
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(req: Request, res: Response) {
    try {
      const token = getTokenFromCookies(req);

      if (!token) {
        throw new AuthenticationError(
          'Authentication token is required',
          AuthErrorCode.TOKEN_MISSING
        );
      }

      // Verify the token
      const decoded = verifyToken(token);

      // Get sessions
      const sessions = await SessionManager.getUserActiveSessions(decoded.id);

      // Map sessions to a user-friendly format
      const sessionData = sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        current: session.id === req.cookies.session_id
      }));

      return res.status(200).json({
        success: true,
        message: 'User sessions retrieved successfully',
        data: {
          sessions: sessionData
        }
      });
    } catch (error) {
      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }

  /**
   * Terminate a specific session
   */
  static async terminateSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const token = getTokenFromCookies(req);
      const currentSessionId = req.cookies.session_id;

      if (!token) {
        throw new AuthenticationError(
          'Authentication token is required',
          AuthErrorCode.TOKEN_MISSING
        );
      }

      // Verify the token
      const decoded = verifyToken(token);

      // Get the session
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        throw new ValidationError(
          'Session not found',
          ValidationErrorCode.INVALID_INPUT
        );
      }

      // Check if the session belongs to the current user
      if (session.userId !== decoded.id) {
        throw new AuthenticationError(
          'You do not have permission to terminate this session',
          AuthErrorCode.INSUFFICIENT_PERMISSIONS,
          403
        );
      }

      // Terminate the session
      await SessionManager.terminateSession(sessionId);

      // If terminating current session, clear cookies
      if (sessionId === currentSessionId) {
        clearCookies(res);
      }

      // Log the event
      AuditLogger.getInstance().logAuthEvent(
        AuthEvent.SESSION_TERMINATED,
        'SUCCESS',
        decoded.id,
        { sessionId }
      );

      return res.status(200).json({
        success: true,
        message: 'Session terminated successfully',
        data: {
          loggedOut: sessionId === currentSessionId
        }
      });
    } catch (error) {
      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }

  /**
   * Terminate all sessions except the current one
   */
  static async terminateAllSessions(req: Request, res: Response) {
    try {
      const token = getTokenFromCookies(req);
      const currentSessionId = req.cookies.session_id;

      if (!token) {
        throw new AuthenticationError(
          'Authentication token is required',
          AuthErrorCode.TOKEN_MISSING
        );
      }

      // Verify the token
      const decoded = verifyToken(token);

      // Terminate all sessions except current
      const terminatedCount = await SessionManager.terminateUserSessions(
        decoded.id,
        currentSessionId
      );

      // Revoke all refresh tokens except current
      await RefreshTokenService.revokeAllUserTokens(decoded.id);
      // Note: This is a simplification - ideally we would keep the current refresh token

      // Log the event
      AuditLogger.getInstance().logAuthEvent(
        AuthEvent.LOGOUT,
        'SUCCESS',
        decoded.id,
        { allSessions: true, exceptCurrent: true, terminatedCount }
      );

      return res.status(200).json({
        success: true,
        message: 'All other sessions terminated successfully',
        data: {
          terminatedCount
        }
      });
    } catch (error) {
      const { status, response } = handleError(error);
      return res.status(status).json(response);
    }
  }
}

/**
 * Helper function to increment login attempts
 */
function incrementLoginAttempts(key: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(key);

  if (!attempts) {
    loginAttempts.set(key, {
      count: 1,
      resetTime: now + LOCKOUT_TIME
    });
    return;
  }

  const newCount = attempts.count + 1;

  // If max attempts reached, set lockout time
  if (newCount >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(key, {
      count: newCount,
      resetTime: now + LOCKOUT_TIME
    });
  } else {
    loginAttempts.set(key, {
      count: newCount,
      resetTime: attempts.resetTime
    });
  }
}
