// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { prisma } from '../prisma';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/userRepository';
import * as crypto from 'crypto';

// Constants
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // 7 days

/**
 * Interface for RefreshToken entity
 */
interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refresh Token Service
 * Handles all operations related to refresh tokens including generation,
 * validation, rotation, and revocation
 */
export class RefreshTokenService {
  /**
   * Generate a new refresh token for a user
   * 
   * @param userId The ID of the user to generate a token for
   * @returns The generated refresh token string
   */
  static async generateRefreshToken(userId: string): Promise<string> {
    // Verify user exists
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a cryptographically secure token
    const tokenBuffer = crypto.randomBytes(40);
    const token = tokenBuffer.toString('hex');
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    try {
      // Store token in database
      await prisma.refreshToken.create({
        data: {
          id: uuidv4(),
          token,
          userId,
          expiresAt,
          isRevoked: false
        }
      });

      return token;
    } catch (error) {
      console.error('Failed to generate refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Validate a refresh token
   * 
   * @param token The refresh token to validate
   * @returns The user ID associated with the token if valid, null otherwise
   */
  static async validateRefreshToken(token: string): Promise<string | null> {
    try {
      // Find the token in database
      const refreshToken = await prisma.refreshToken.findFirst({
        where: {
          token,
          isRevoked: false,
          expiresAt: {
            gt: new Date() // Not expired
          }
        }
      });

      if (!refreshToken) {
        return null;
      }

      return refreshToken.userId;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }
  }

  /**
   * Rotate a refresh token (invalidate old token and generate new one)
   * This implements token rotation security practice
   * 
   * @param oldToken The old refresh token to rotate
   * @returns The new refresh token if successful, null otherwise
   */
  static async rotateRefreshToken(oldToken: string): Promise<string | null> {
    // Start a transaction to ensure atomicity
    try {
      return await prisma.$transaction(async (tx) => {
        // Find and validate the old token
        const oldRefreshToken = await tx.refreshToken.findFirst({
          where: {
            token: oldToken,
            isRevoked: false,
            expiresAt: {
              gt: new Date()
            }
          }
        });

        if (!oldRefreshToken) {
          throw new Error('Invalid or expired refresh token');
        }

        // Revoke the old token
        await tx.refreshToken.update({
          where: { id: oldRefreshToken.id },
          data: { isRevoked: true }
        });

        // Generate a new token
        const tokenBuffer = crypto.randomBytes(40);
        const newToken = tokenBuffer.toString('hex');
        
        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        // Store the new token
        await tx.refreshToken.create({
          data: {
            id: uuidv4(),
            token: newToken,
            userId: oldRefreshToken.userId,
            expiresAt,
            isRevoked: false
          }
        });

        return newToken;
      });
    } catch (error) {
      console.error('Error rotating refresh token:', error);
      return null;
    }
  }

  /**
   * Revoke a refresh token
   * 
   * @param token The refresh token to revoke
   * @returns True if successful, false otherwise
   */
  static async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      // Find and update the token
      const result = await prisma.refreshToken.updateMany({
        where: {
          token,
          isRevoked: false
        },
        data: {
          isRevoked: true
        }
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      return false;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   * 
   * @param userId The ID of the user to revoke tokens for
   * @returns The number of tokens revoked
   */
  static async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const result = await prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false
        },
        data: {
          isRevoked: true
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error revoking user tokens:', error);
      return 0;
    }
  }

  /**
   * Clean up expired tokens from the database
   * 
   * @returns The number of tokens cleaned up
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }
}
