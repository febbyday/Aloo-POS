/**
 * Profile Schemas
 *
 * Validation schemas for profile management operations
 */

import { z } from 'zod';
import { validatePinComplexity } from '../utils/pinSecurityUtils';

/**
 * Schema for profile update
 *
 * Validates profile update data with the following rules:
 * - username: Optional, min 3 characters
 * - email: Optional, valid email format
 * - firstName: Optional, min 1 character
 * - lastName: Optional, min 1 character
 */
export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
});

/**
 * Schema for password change
 *
 * Validates password change data with the following rules:
 * - currentPassword: Required
 * - newPassword: Required, min 8 characters, must include uppercase, lowercase, number, and special character
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

/**
 * Schema for avatar upload
 *
 * Validates avatar file with the following rules:
 * - file: Required
 * - mimetype: Must be an image type
 * - size: Max 2MB
 */
export const avatarUploadSchema = z.object({
  file: z.any()
    .refine(file => file !== undefined, 'Avatar file is required')
    .refine(
      file => file?.mimetype?.startsWith('image/'),
      'File must be an image (JPEG, PNG, GIF)'
    )
    .refine(
      file => file?.size <= 2 * 1024 * 1024,
      'Image size must be less than 2MB'
    ),
});

/**
 * Schema for PIN setup
 *
 * Validates PIN setup data with the following rules:
 * - pin: Required, exactly 4 digits, must pass complexity requirements
 * - confirmPin: Must match pin
 */
export const setupPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  confirmPin: z.string(),
})
.refine(data => data.pin === data.confirmPin, {
  message: 'PINs do not match',
  path: ['confirmPin'],
})
.refine(data => {
  const validation = validatePinComplexity(data.pin);
  return validation.isValid;
}, {
  message: 'PIN does not meet security requirements',
  path: ['pin'],
});

/**
 * Schema for PIN verification
 *
 * Validates PIN verification data with the following rules:
 * - pin: Required, exactly 4 digits
 */
export const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});

/**
 * Schema for PIN change
 *
 * Validates PIN change data with the following rules:
 * - currentPin: Required, exactly 4 digits
 * - newPin: Required, exactly 4 digits, must pass complexity requirements
 * - confirmPin: Must match newPin
 * - newPin must be different from currentPin
 */
export const changePinSchema = z.object({
  currentPin: z.string().regex(/^\d{4}$/, 'Current PIN must be exactly 4 digits'),
  newPin: z.string().regex(/^\d{4}$/, 'New PIN must be exactly 4 digits'),
  confirmPin: z.string(),
})
.refine(data => data.newPin === data.confirmPin, {
  message: 'PINs do not match',
  path: ['confirmPin'],
})
.refine(data => data.newPin !== data.currentPin, {
  message: 'New PIN must be different from current PIN',
  path: ['newPin'],
})
.refine(data => {
  const validation = validatePinComplexity(data.newPin);
  return validation.isValid;
}, {
  message: 'PIN does not meet security requirements',
  path: ['newPin'],
});
