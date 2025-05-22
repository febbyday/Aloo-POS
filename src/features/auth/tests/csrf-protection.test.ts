/**
 * CSRF Protection Tests
 * 
 * This file contains tests for the CSRF protection functionality.
 */

import { getCsrfToken, hasCsrfToken, refreshCsrfToken, addCsrfHeader } from '../utils/csrfProtection';

// Mock fetch for testing
global.fetch = jest.fn();

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('CSRF Protection', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Clear cookies
    document.cookie = '';
  });

  describe('getCsrfToken', () => {
    it('should return null when no token is present', () => {
      expect(getCsrfToken()).toBeNull();
    });

    it('should return the token when present in cookies', () => {
      document.cookie = 'csrf_token=test-token';
      expect(getCsrfToken()).toBe('test-token');
    });

    it('should handle multiple cookies', () => {
      document.cookie = 'other=value; csrf_token=test-token; another=value';
      expect(getCsrfToken()).toBe('test-token');
    });
  });

  describe('hasCsrfToken', () => {
    it('should return false when no token is present', () => {
      expect(hasCsrfToken()).toBe(false);
    });

    it('should return true when token is present', () => {
      document.cookie = 'csrf_token=test-token';
      expect(hasCsrfToken()).toBe(true);
    });
  });

  describe('addCsrfHeader', () => {
    it('should add CSRF token to headers', () => {
      document.cookie = 'csrf_token=test-token';
      const headers = addCsrfHeader({});
      expect(headers).toEqual({
        'X-CSRF-Token': 'test-token'
      });
    });

    it('should preserve existing headers', () => {
      document.cookie = 'csrf_token=test-token';
      const headers = addCsrfHeader({
        'Content-Type': 'application/json'
      });
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'test-token'
      });
    });

    it('should not add token if not present', () => {
      const headers = addCsrfHeader({
        'Content-Type': 'application/json'
      });
      expect(headers).toEqual({
        'Content-Type': 'application/json'
      });
    });
  });

  describe('refreshCsrfToken', () => {
    it('should make a request to refresh the token', async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await refreshCsrfToken();
      
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/auth/csrf-token',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: expect.objectContaining({
            'Accept': 'application/json'
          })
        })
      );
    });

    it('should handle failed requests', async () => {
      // Mock failed response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Server Error'
      });

      const result = await refreshCsrfToken();
      
      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      const result = await refreshCsrfToken();
      
      expect(result).toBe(false);
    });
  });
});
