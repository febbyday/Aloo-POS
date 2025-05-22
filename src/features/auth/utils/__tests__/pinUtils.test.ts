/**
 * PIN Authentication Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { shouldEnablePinForRole, updatePinEnablement, isValidPinFormat, isCommonPin } from '../pinUtils';
import { UserRole } from '../../types/auth.types';

describe('PIN Authentication Utilities', () => {
  describe('shouldEnablePinForRole', () => {
    it('should enable PIN for CASHIER role', () => {
      expect(shouldEnablePinForRole(UserRole.CASHIER)).toBe(true);
    });

    it('should enable PIN for MANAGER role', () => {
      expect(shouldEnablePinForRole(UserRole.MANAGER)).toBe(true);
    });

    it('should enable PIN for ADMIN role', () => {
      expect(shouldEnablePinForRole(UserRole.ADMIN)).toBe(true);
    });

    it('should not enable PIN for USER role', () => {
      expect(shouldEnablePinForRole(UserRole.USER)).toBe(false);
    });

    it('should handle string role values', () => {
      expect(shouldEnablePinForRole('CASHIER')).toBe(true);
      expect(shouldEnablePinForRole('USER')).toBe(false);
    });
  });

  describe('updatePinEnablement', () => {
    it('should set isPinEnabled to true for CASHIER role', () => {
      const userData = { role: UserRole.CASHIER };
      const result = updatePinEnablement(userData);
      expect(result.isPinEnabled).toBe(true);
    });

    it('should set isPinEnabled to false for USER role', () => {
      const userData = { role: UserRole.USER };
      const result = updatePinEnablement(userData);
      expect(result.isPinEnabled).toBe(false);
    });

    it('should not override existing isPinEnabled value if provided', () => {
      const userData = { role: UserRole.CASHIER, isPinEnabled: false };
      const result = updatePinEnablement(userData);
      expect(result.isPinEnabled).toBe(false);
    });

    it('should preserve other user data', () => {
      const userData = { role: UserRole.MANAGER, name: 'John Doe', email: 'john@example.com' };
      const result = updatePinEnablement(userData);
      expect(result).toEqual({
        role: UserRole.MANAGER,
        name: 'John Doe',
        email: 'john@example.com',
        isPinEnabled: true
      });
    });
  });

  describe('isValidPinFormat', () => {
    it('should return true for valid 4-digit PIN', () => {
      expect(isValidPinFormat('1234')).toBe(true);
      expect(isValidPinFormat('0000')).toBe(true);
      expect(isValidPinFormat('9999')).toBe(true);
    });

    it('should return false for PINs with non-digit characters', () => {
      expect(isValidPinFormat('123a')).toBe(false);
      expect(isValidPinFormat('12.4')).toBe(false);
      expect(isValidPinFormat('12-4')).toBe(false);
    });

    it('should return false for PINs with incorrect length', () => {
      expect(isValidPinFormat('123')).toBe(false);
      expect(isValidPinFormat('12345')).toBe(false);
      expect(isValidPinFormat('')).toBe(false);
    });
  });

  describe('isCommonPin', () => {
    it('should return true for common PINs', () => {
      expect(isCommonPin('1234')).toBe(true);
      expect(isCommonPin('0000')).toBe(true);
      expect(isCommonPin('1111')).toBe(true);
      expect(isCommonPin('2023')).toBe(true);
    });

    it('should return false for less common PINs', () => {
      expect(isCommonPin('7294')).toBe(false);
      expect(isCommonPin('3571')).toBe(false);
      expect(isCommonPin('8426')).toBe(false);
    });
  });
});
