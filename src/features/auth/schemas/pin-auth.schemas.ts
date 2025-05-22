/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * PIN Authentication Schemas
 * 
 * This file contains Zod schemas for PIN-based authentication.
 */

import { z } from 'zod';

/**
 * PIN Login Request Schema
 * Defines the structure and validation rules for PIN login requests
 */
export const PinLoginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  pin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
  deviceId: z.string().optional(),
  rememberDevice: z.boolean().optional().default(false)
});

/**
 * PIN Setup Request Schema
 * Defines the structure and validation rules for setting up a PIN
 */
export const PinSetupRequestSchema = z.object({
  pin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
  confirmPin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
  currentPassword: z.string().min(1, 'Current password is required')
}).refine(data => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ["confirmPin"]
});

/**
 * PIN Change Request Schema
 * Defines the structure and validation rules for changing a PIN
 */
export const PinChangeRequestSchema = z.object({
  currentPin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
  newPin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits'),
  confirmPin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits')
}).refine(data => data.newPin === data.confirmPin, {
  message: "PINs don't match",
  path: ["confirmPin"]
}).refine(data => data.newPin !== data.currentPin, {
  message: "New PIN must be different from current PIN",
  path: ["newPin"]
});

/**
 * PIN Verification Request Schema
 * Defines the structure for PIN verification requests
 */
export const PinVerificationRequestSchema = z.object({
  pin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only digits')
});

/**
 * PIN Status Response Schema
 * Defines the structure for PIN status responses
 */
export const PinStatusResponseSchema = z.object({
  isPinEnabled: z.boolean(),
  lastPinChange: z.string().datetime().nullable().optional()
});

/**
 * Device Information Schema
 * Defines the structure for device information
 */
export const DeviceInfoSchema = z.object({
  deviceId: z.string(),
  deviceName: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  lastUsed: z.string().datetime(),
  isTrusted: z.boolean().default(false)
});

// Export types derived from schemas
export type PinLoginRequest = z.infer<typeof PinLoginRequestSchema>;
export type PinSetupRequest = z.infer<typeof PinSetupRequestSchema>;
export type PinChangeRequest = z.infer<typeof PinChangeRequestSchema>;
export type PinVerificationRequest = z.infer<typeof PinVerificationRequestSchema>;
export type PinStatusResponse = z.infer<typeof PinStatusResponseSchema>;
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;
