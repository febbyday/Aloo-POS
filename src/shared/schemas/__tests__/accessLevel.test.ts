/**
 * Access Level Tests
 * 
 * Tests for the access level conversion utilities.
 */

import { describe, it, expect } from 'vitest';
import { AccessLevel, convertNumericAccessLevel, convertStringAccessLevel } from '../accessLevel';

describe('Access Level Utilities', () => {
  describe('convertNumericAccessLevel', () => {
    it('should convert numeric level 0 to NONE', () => {
      expect(convertNumericAccessLevel(0)).toBe(AccessLevel.NONE);
    });

    it('should convert numeric levels 1, 2, 3 to SELF', () => {
      expect(convertNumericAccessLevel(1)).toBe(AccessLevel.SELF);
      expect(convertNumericAccessLevel(2)).toBe(AccessLevel.SELF);
      expect(convertNumericAccessLevel(3)).toBe(AccessLevel.SELF);
    });

    it('should convert numeric level 5 to DEPARTMENT', () => {
      expect(convertNumericAccessLevel(5)).toBe(AccessLevel.DEPARTMENT);
    });

    it('should convert numeric levels 4, 6 and others to ALL', () => {
      expect(convertNumericAccessLevel(4)).toBe(AccessLevel.ALL);
      expect(convertNumericAccessLevel(6)).toBe(AccessLevel.ALL);
      expect(convertNumericAccessLevel(10)).toBe(AccessLevel.ALL); // Any other value
    });
  });

  describe('convertStringAccessLevel', () => {
    it('should convert NONE to numeric level 0', () => {
      expect(convertStringAccessLevel(AccessLevel.NONE)).toBe(0);
    });

    it('should convert SELF to numeric level 6', () => {
      expect(convertStringAccessLevel(AccessLevel.SELF)).toBe(6);
    });

    it('should convert DEPARTMENT to numeric level 5', () => {
      expect(convertStringAccessLevel(AccessLevel.DEPARTMENT)).toBe(5);
    });

    it('should convert ALL to numeric level 4', () => {
      expect(convertStringAccessLevel(AccessLevel.ALL)).toBe(4);
    });

    it('should handle default case', () => {
      // Test with an invalid value (should default to ALL)
      expect(convertStringAccessLevel('invalid' as AccessLevel)).toBe(4);
    });
  });
});
