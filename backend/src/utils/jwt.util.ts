// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';
import { UserRepository } from '../repositories/userRepository';

// Environment variables - these should be in .env file in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-should-be-in-env-file';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-should-be-in-env-file';
const TOKEN_EXPIRY = '24h'; // 24 hours
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Token blacklist storage (in-memory, should use Redis in production)
interface BlacklistedToken {
  token: string;
  expiresAt: Date;
}

class TokenBlacklist {
  private static blacklist: BlacklistedToken[] = [];

  /**
   * Add a token to the blacklist
   * @param token The token to blacklist
   * @param expiresAt When the token expires
   */
  static async add(token: string, expiresAt: Date): Promise<void> {
    this.blacklist.push({ token, expiresAt });
    await this.cleanupExpiredTokens();
  }

  /**
   * Check if a token is blacklisted
   * @param token The token to check
   * @returns True if blacklisted, false otherwise
   */
  static async check(token: string): Promise<boolean> {
    return this.blacklist.some(item => item.token === token);
  }

  /**
   * Clean up expired tokens from the blacklist
   */
  static async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    this.blacklist = this.blacklist.filter(item => item.expiresAt > now);
  }
}

// Run cleanup once a day
setInterval(() => {
  TokenBlacklist.cleanupExpiredTokens();
}, 24 * 60 * 60 * 1000);

/**
 * Generate Auth Tokens
 * @param user User to generate tokens for
 * @returns Object containing access token, refresh token and expiry
 */
export const generateAuthTokens = (user: User) => {
  // Create payload with user information
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };

  // Generate access token
  const token = jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Generate refresh token with different expiry
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Calculate expiry timestamp for client reference
  const expiresIn = 24 * 60 * 60; // 24 hours in seconds

  return {
    token,
    refreshToken,
    expiresIn
  };
};

/**
 * Verify an access token
 * @param token The token to verify
 * @returns Decoded token payload or throws error
 */
export const verifyAccessToken = async (token: string) => {
  // Check if token is blacklisted
  const isBlacklisted = await TokenBlacklist.check(token);
  if (isBlacklisted) {
    throw new Error('Token is blacklisted');
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify a refresh token
 * @param token The refresh token to verify
 * @returns Decoded token payload or throws error
 */
export const verifyRefreshToken = async (token: string) => {
  // Check if token is blacklisted
  const isBlacklisted = await TokenBlacklist.check(token);
  if (isBlacklisted) {
    throw new Error('Refresh token is blacklisted');
  }

  // Verify the refresh token
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    throw error;
  }
};

/**
 * Blacklist a token
 * @param token The token to blacklist
 * @param expiryTime Time in seconds until the token expires
 * @returns Success status
 */
export const blacklistToken = async (token: string, expiryTime = 86400): Promise<boolean> => {
  try {
    const expiresAt = new Date(Date.now() + expiryTime * 1000);
    await TokenBlacklist.add(token, expiresAt);
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

/**
 * Get permissions based on user role
 * @param role User role
 * @returns Array of permissions
 */
export const getUserPermissions = (role: UserRole): string[] => {
  switch (role) {
    case UserRole.ADMIN:
      return ['*']; // Admin has all permissions
    case UserRole.MANAGER:
      return [
        'sales.*', 
        'inventory.*', 
        'customers.*', 
        'reports.view', 
        'staff.view', 
        'staff.create'
      ];
    case UserRole.CASHIER:
      return [
        'sales.view', 
        'sales.create', 
        'inventory.view', 
        'customers.view'
      ];
    default:
      return [];
  }
};

export { TokenBlacklist };
