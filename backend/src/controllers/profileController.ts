/**
 * Profile Controller
 *
 * Handles user profile management operations including:
 * - Getting the current user's profile
 * - Updating profile information
 * - Changing password
 * - Uploading avatar
 */

import { Request, Response } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { FileStorageService } from '../services/fileStorage';
import { z } from 'zod';
import {
  updateProfileSchema,
  changePasswordSchema,
  avatarUploadSchema,
  setupPinSchema,
  verifyPinSchema,
  changePinSchema
} from '../schemas/profileSchemas';
import {
  validatePinComplexity,
  isCommonPin,
  evaluatePinStrength,
  PinStrength,
  recordFailedPinAttempt,
  isPinLocked,
  resetPinAttempts
} from '../utils/pinSecurityUtils';
import { logger } from '../utils/logger';

// Initialize file storage service
const fileStorage = new FileStorageService({
  basePath: process.env.FILE_STORAGE_PATH || './uploads',
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  maxFileSize: 2 * 1024 * 1024, // 2MB
  compression: true,
  accessControl: 'public',
  storageType: 'local',
});

// Initialize file storage service with configuration

/**
 * Get current user profile
 * @route GET /api/v1/auth/profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove sensitive information
    const { password, ...userData } = user;

    return res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

/**
 * Update user profile
 * @route POST /api/v1/auth/profile/update
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Validate request body
    try {
      updateProfileSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const existingUser = await UserRepository.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user data
    const { username, email, firstName, lastName, fullName } = req.body;

    // If fullName is provided, split it into firstName and lastName
    let firstNameToUse = firstName;
    let lastNameToUse = lastName;

    if (fullName && !firstName && !lastName) {
      const nameParts = fullName.trim().split(' ');
      if (nameParts.length >= 2) {
        firstNameToUse = nameParts[0];
        lastNameToUse = nameParts.slice(1).join(' ');
      } else {
        firstNameToUse = fullName;
      }
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== existingUser.username) {
      const userWithSameUsername = await UserRepository.findByUsername(username);
      if (userWithSameUsername && userWithSameUsername.id !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const userWithSameEmail = await UserRepository.findByEmail(email);
      if (userWithSameEmail && userWithSameEmail.id !== userId) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Update user
    const updatedUser = await UserRepository.update(userId, {
      username: username || existingUser.username,
      email: email || existingUser.email,
      firstName: firstNameToUse || existingUser.firstName,
      lastName: lastNameToUse || existingUser.lastName
    });

    // Remove sensitive information
    const { password, ...userData } = updatedUser;

    return res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
};

/**
 * Change user password
 * @route POST /api/v1/auth/profile/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    try {
      changePasswordSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const { currentPassword, newPassword } = req.body;

    const isPasswordValid = await UserRepository.verifyPassword(userId, currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    await UserRepository.update(userId, { password: newPassword });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

/**
 * Upload user avatar
 * @route POST /api/v1/auth/profile/upload-avatar
 */
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const user = await UserRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if file was uploaded and validate it
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    // Validate the file
    try {
      avatarUploadSchema.parse({ file: req.file });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // Upload file to storage
    const result = await fileStorage.uploadFile(req.file, 'avatars', { userId });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    // Update user with new avatar URL
    const updatedUser = await UserRepository.update(userId, {
      avatar: result.file.url
    });

    // Return avatar URL
    return res.status(200).json({
      success: true,
      data: {
        avatarUrl: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
};

/**
 * Setup PIN for user
 * @route POST /api/v1/auth/profile/setup-pin
 */
export const setupPin = async (req: Request, res: Response) => {
  try {
    // Validate request body
    try {
      setupPinSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const user = await UserRepository.findById(userId);

    if (!user) {
      logger.warn('PIN setup attempted for non-existent user', { userId });
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get PIN from request
    const { pin } = req.body;

    // Validate PIN complexity
    const pinValidation = validatePinComplexity(pin);
    if (!pinValidation.isValid) {
      logger.warn('PIN setup rejected due to complexity requirements', {
        userId,
        reason: pinValidation.message
      });

      return res.status(400).json({
        success: false,
        error: pinValidation.message || 'PIN does not meet security requirements'
      });
    }

    // Check PIN strength
    const pinStrength = evaluatePinStrength(pin);
    if (pinStrength === PinStrength.WEAK) {
      logger.warn('PIN setup rejected due to weak PIN', { userId });

      return res.status(400).json({
        success: false,
        error: 'PIN is too weak. Please choose a more secure PIN.'
      });
    }

    // Hash the PIN
    const hashedPin = await UserRepository.hashPin(pin);

    // Update user with PIN
    await UserRepository.update(userId, {
      pinHash: hashedPin,
      isPinEnabled: true,
      lastPinChange: new Date(),
      failedPinAttempts: 0,
      pinLockedUntil: null
    });

    logger.info('PIN setup successfully', { userId });

    return res.status(200).json({
      success: true,
      message: 'PIN setup successfully'
    });
  } catch (error) {
    logger.error('Error setting up PIN', error, { userId: req.user?.id });

    return res.status(500).json({
      success: false,
      error: 'Failed to setup PIN'
    });
  }
};

/**
 * Verify PIN
 * @route POST /api/v1/auth/profile/verify-pin
 */
export const verifyPin = async (req: Request, res: Response) => {
  try {
    // Validate request body
    try {
      verifyPinSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const user = await UserRepository.findById(userId);

    if (!user) {
      logger.warn('PIN verification attempted for non-existent user', { userId });
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if PIN is enabled
    if (!user.isPinEnabled) {
      logger.warn('PIN verification attempted for user without PIN enabled', { userId });
      return res.status(400).json({
        success: false,
        error: 'PIN is not enabled for this user'
      });
    }

    // Check if PIN is locked using the enhanced PIN security utility
    const lockStatus = isPinLocked(userId);
    if (lockStatus.isLocked) {
      const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000);

      logger.warn('PIN verification attempted while locked', {
        userId,
        remainingMinutes,
        attempts: lockStatus.attempts
      });

      return res.status(403).json({
        success: false,
        error: `PIN is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        lockedUntil: lockStatus.lockedUntil,
        attempts: lockStatus.attempts
      });
    }

    // Verify PIN
    const { pin } = req.body;
    const isPinValid = await UserRepository.verifyPin(userId, pin);

    if (!isPinValid) {
      // Record failed attempt using the enhanced PIN security utility
      const attemptResult = recordFailedPinAttempt(userId);

      logger.warn('Failed PIN verification attempt', {
        userId,
        attempts: attemptResult.attempts,
        isLocked: attemptResult.isLocked
      });

      // Update user with failed attempts in the database for persistence
      await UserRepository.update(userId, {
        failedPinAttempts: attemptResult.attempts,
        pinLockedUntil: attemptResult.lockedUntil
      });

      if (attemptResult.isLocked) {
        const remainingMinutes = Math.ceil(
          ((attemptResult.lockedUntil?.getTime() || 0) - Date.now()) / 60000
        );

        return res.status(403).json({
          success: false,
          error: `PIN is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          attempts: attemptResult.attempts,
          maxAttempts: 5,
          lockedUntil: attemptResult.lockedUntil
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid PIN',
        attempts: attemptResult.attempts,
        maxAttempts: 5
      });
    }

    // Reset failed attempts on successful verification
    resetPinAttempts(userId);

    // Also update the database record
    await UserRepository.update(userId, {
      failedPinAttempts: 0,
      pinLockedUntil: null
    });

    logger.info('PIN verified successfully', { userId });

    return res.status(200).json({
      success: true,
      message: 'PIN verified successfully'
    });
  } catch (error) {
    logger.error('Error verifying PIN', error, { userId: req.user?.id });

    return res.status(500).json({
      success: false,
      error: 'Failed to verify PIN'
    });
  }
};

/**
 * Change PIN
 * @route POST /api/v1/auth/profile/change-pin
 */
export const changePin = async (req: Request, res: Response) => {
  try {
    // Validate request body
    try {
      changePinSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const user = await UserRepository.findById(userId);

    if (!user) {
      logger.warn('PIN change attempted for non-existent user', { userId });
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if PIN is enabled
    if (!user.isPinEnabled) {
      logger.warn('PIN change attempted for user without PIN enabled', { userId });
      return res.status(400).json({
        success: false,
        error: 'PIN is not enabled for this user'
      });
    }

    // Check if PIN is locked
    const lockStatus = isPinLocked(userId);
    if (lockStatus.isLocked) {
      const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000);

      logger.warn('PIN change attempted while PIN is locked', {
        userId,
        remainingMinutes,
        attempts: lockStatus.attempts
      });

      return res.status(403).json({
        success: false,
        error: `PIN is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        lockedUntil: lockStatus.lockedUntil,
        attempts: lockStatus.attempts
      });
    }

    // Verify current PIN
    const { currentPin, newPin } = req.body;
    const isPinValid = await UserRepository.verifyPin(userId, currentPin);

    if (!isPinValid) {
      // Record failed attempt
      const attemptResult = recordFailedPinAttempt(userId);

      logger.warn('PIN change failed due to incorrect current PIN', {
        userId,
        attempts: attemptResult.attempts,
        isLocked: attemptResult.isLocked
      });

      // Update user with failed attempts in the database for persistence
      await UserRepository.update(userId, {
        failedPinAttempts: attemptResult.attempts,
        pinLockedUntil: attemptResult.lockedUntil
      });

      if (attemptResult.isLocked) {
        const remainingMinutes = Math.ceil(
          ((attemptResult.lockedUntil?.getTime() || 0) - Date.now()) / 60000
        );

        return res.status(403).json({
          success: false,
          error: `PIN is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          attempts: attemptResult.attempts,
          maxAttempts: 5,
          lockedUntil: attemptResult.lockedUntil
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Current PIN is incorrect',
        attempts: attemptResult.attempts,
        maxAttempts: 5
      });
    }

    // Validate new PIN complexity
    const pinValidation = validatePinComplexity(newPin);
    if (!pinValidation.isValid) {
      logger.warn('PIN change rejected due to complexity requirements', {
        userId,
        reason: pinValidation.message
      });

      return res.status(400).json({
        success: false,
        error: pinValidation.message || 'New PIN does not meet security requirements'
      });
    }

    // Check PIN strength
    const pinStrength = evaluatePinStrength(newPin);
    if (pinStrength === PinStrength.WEAK) {
      logger.warn('PIN change rejected due to weak new PIN', { userId });

      return res.status(400).json({
        success: false,
        error: 'New PIN is too weak. Please choose a more secure PIN.'
      });
    }

    // Check if new PIN is the same as current PIN
    if (newPin === currentPin) {
      logger.warn('PIN change rejected because new PIN is the same as current PIN', { userId });

      return res.status(400).json({
        success: false,
        error: 'New PIN must be different from current PIN'
      });
    }

    // Hash the new PIN
    const hashedPin = await UserRepository.hashPin(newPin);

    // Reset failed attempts
    resetPinAttempts(userId);

    // Update user with new PIN
    await UserRepository.update(userId, {
      pinHash: hashedPin,
      lastPinChange: new Date(),
      failedPinAttempts: 0,
      pinLockedUntil: null
    });

    logger.info('PIN changed successfully', { userId });

    return res.status(200).json({
      success: true,
      message: 'PIN changed successfully'
    });
  } catch (error) {
    logger.error('Error changing PIN', error, { userId: req.user?.id });

    return res.status(500).json({
      success: false,
      error: 'Failed to change PIN'
    });
  }
};

/**
 * Disable PIN
 * @route POST /api/v1/auth/profile/disable-pin
 */
export const disablePin = async (req: Request, res: Response) => {
  try {
    // Validate request body
    try {
      verifyPinSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // User ID is available from the authenticated request
    const userId = req.user.id;

    // Get user from repository
    const user = await UserRepository.findById(userId);

    if (!user) {
      logger.warn('PIN disable attempted for non-existent user', { userId });
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if PIN is enabled
    if (!user.isPinEnabled) {
      logger.warn('PIN disable attempted for user without PIN enabled', { userId });
      return res.status(400).json({
        success: false,
        error: 'PIN is not enabled for this user'
      });
    }

    // Check if PIN is locked
    const lockStatus = isPinLocked(userId);
    if (lockStatus.isLocked) {
      const remainingMinutes = Math.ceil((lockStatus.remainingMs || 0) / 60000);

      logger.warn('PIN disable attempted while PIN is locked', {
        userId,
        remainingMinutes,
        attempts: lockStatus.attempts
      });

      return res.status(403).json({
        success: false,
        error: `PIN is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        lockedUntil: lockStatus.lockedUntil,
        attempts: lockStatus.attempts
      });
    }

    // Verify PIN
    const { pin } = req.body;
    const isPinValid = await UserRepository.verifyPin(userId, pin);

    if (!isPinValid) {
      // Record failed attempt
      const attemptResult = recordFailedPinAttempt(userId);

      logger.warn('PIN disable failed due to incorrect PIN', {
        userId,
        attempts: attemptResult.attempts,
        isLocked: attemptResult.isLocked
      });

      // Update user with failed attempts in the database for persistence
      await UserRepository.update(userId, {
        failedPinAttempts: attemptResult.attempts,
        pinLockedUntil: attemptResult.lockedUntil
      });

      if (attemptResult.isLocked) {
        const remainingMinutes = Math.ceil(
          ((attemptResult.lockedUntil?.getTime() || 0) - Date.now()) / 60000
        );

        return res.status(403).json({
          success: false,
          error: `PIN is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          attempts: attemptResult.attempts,
          maxAttempts: 5,
          lockedUntil: attemptResult.lockedUntil
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid PIN',
        attempts: attemptResult.attempts,
        maxAttempts: 5
      });
    }

    // Reset failed attempts
    resetPinAttempts(userId);

    // Disable PIN
    await UserRepository.update(userId, {
      isPinEnabled: false,
      pinHash: null,
      failedPinAttempts: 0,
      pinLockedUntil: null
    });

    logger.info('PIN disabled successfully', { userId });

    return res.status(200).json({
      success: true,
      message: 'PIN disabled successfully'
    });
  } catch (error) {
    logger.error('Error disabling PIN', error, { userId: req.user?.id });

    return res.status(500).json({
      success: false,
      error: 'Failed to disable PIN'
    });
  }
};