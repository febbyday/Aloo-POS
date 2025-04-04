// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { 
  generateAuthTokens, 
  verifyAccessToken, 
  verifyRefreshToken, 
  blacklistToken,
  getUserPermissions
} from '../utils/jwt.util';
import { PasswordUtil } from '../utils/password.util';

// Initialize Prisma client
const prisma = new PrismaClient();

// Environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';
const TOKEN_EXPIRY = '24h'; // 24 hours

// Rate limiting implementation (in-memory, use Redis in production)
class RateLimiter {
  private static attempts: Map<string, { count: number, timestamp: number }> = new Map();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  static async checkLimit(identifier: string): Promise<void> {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (userAttempts) {
      // Reset counter if lockout period has passed
      if (now - userAttempts.timestamp > this.LOCKOUT_DURATION) {
        this.attempts.set(identifier, { count: 1, timestamp: now });
        return;
      }

      // Check if user is locked out
      if (userAttempts.count >= this.MAX_ATTEMPTS) {
        const remainingTime = Math.ceil((userAttempts.timestamp + this.LOCKOUT_DURATION - now) / 60000);
        throw new Error(`Too many login attempts. Please try again after ${remainingTime} minutes.`);
      }

      // Increment attempt counter
      this.attempts.set(identifier, { 
        count: userAttempts.count + 1, 
        timestamp: userAttempts.timestamp 
      });
    } else {
      // First attempt
      this.attempts.set(identifier, { count: 1, timestamp: now });
    }
  }

  static resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * Login handler
 * Authenticates user and returns tokens
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
    return;
  }

  try {
    // Apply rate limiting using IP address + username as identifier
    const identifier = `${req.ip}:${username}`;
    await RateLimiter.checkLimit(identifier);

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
      return;
    }

    // Reset rate limiting after successful login
    RateLimiter.resetAttempts(identifier);

    // Generate auth tokens
    const { token, refreshToken, expiresIn } = generateAuthTokens(user);

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Set secure cookies
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user info and tokens
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          permissions: getUserPermissions(user.role)
        },
        token,
        refreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    const statusCode = errorMessage.includes('Too many login attempts') ? 429 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage
    });
  }
};

/**
 * Register handler
 * Creates a new user account
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, password, email, firstName, lastName, role } = req.body;

  // Validate required fields
  if (!username || !password || !email) {
    res.status(400).json({
      success: false,
      message: 'Username, password and email are required'
    });
    return;
  }

  try {
    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
      return;
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validate(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet security requirements',
        details: passwordValidation.errors
      });
      return;
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(password);

    // Determine role (default to CASHIER unless specified differently)
    const userRole = role || UserRole.CASHIER;

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: userRole,
        lastLoginAt: new Date() // First login is now
      }
    });

    // Generate tokens for the new user
    const { token, refreshToken, expiresIn } = generateAuthTokens(newUser);

    // Set cookies
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn * 1000
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          permissions: getUserPermissions(newUser.role)
        },
        token,
        refreshToken,
        expiresIn
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user account'
    });
  }
};

/**
 * Logout handler
 * Invalidates tokens and clears cookies
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the token from cookies or header
    const token = req.cookies.auth_token || 
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (token) {
      // Blacklist the token
      await blacklistToken(token);
    }

    // Clear cookies
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

/**
 * Refresh token handler
 * Issues a new access token using refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookies or request body
    const refreshToken = req.cookies.refresh_token || req.body.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Generate new tokens (token rotation for security)
    const tokens = generateAuthTokens(user);

    // Blacklist the old refresh token
    await blacklistToken(refreshToken);

    // Set new tokens as cookies
    res.cookie('auth_token', tokens.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.expiresIn * 1000
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return new tokens
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          permissions: getUserPermissions(user.role)
        },
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

/**
 * Verify token handler
 * Checks if the current token is valid and returns user info
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from cookies or header
    const token = req.cookies.auth_token || 
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is missing'
      });
      return;
    }

    // Verify the token
    const decoded = await verifyAccessToken(token);
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Return user info
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          permissions: getUserPermissions(user.role)
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Set cookie handler
 * Sets auth cookies from tokens (useful for clients that can't set HttpOnly cookies)
 */
export const setCookie = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, refreshToken, expiresIn } = req.body;
    
    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Token is required'
      });
      return;
    }
    
    // Set cookies
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: (expiresIn || 24 * 60 * 60) * 1000
    });
    
    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    res.json({
      success: true,
      message: 'Cookies set successfully'
    });
  } catch (error) {
    console.error('Set cookie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting cookies'
    });
  }
};

/**
 * Clear cookie handler
 * Clears auth cookies
 */
export const clearCookie = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
    
    res.json({
      success: true,
      message: 'Cookies cleared successfully'
    });
  } catch (error) {
    console.error('Clear cookie error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cookies'
    });
  }
};
