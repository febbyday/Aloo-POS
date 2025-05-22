/**
 * Auth Service Tests
 * 
 * Tests for the authentication service.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './authService';
import { apiClient } from '@/lib/api/api-client';

// Mock the API client
vi.mock('@/lib/api/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.dispatchEvent
window.dispatchEvent = vi.fn();

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Reset mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Mock successful login response
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: ['USER'],
        permissions: ['read:products'],
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600
        }
      };
      
      (apiClient.post as any).mockResolvedValue(mockResponse);
      
      // Call login
      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });
      
      // Verify result
      expect(result.success).toBe(true);
      expect(result.data?.user).toEqual(mockUser);
      expect(result.data?.token).toBe('mock-token');
      
      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
      
      // Verify event dispatch
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
    
    it('should handle login failure', async () => {
      // Mock failed login response
      const mockResponse = {
        success: false,
        error: 'Invalid credentials'
      };
      
      (apiClient.post as any).mockResolvedValue(mockResponse);
      
      // Call login
      const result = await authService.login({
        username: 'testuser',
        password: 'wrongpassword'
      });
      
      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      
      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'wrongpassword'
      });
      
      // Verify event dispatch
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
    
    it('should handle API errors', async () => {
      // Mock API error
      (apiClient.post as any).mockRejectedValue(new Error('Network error'));
      
      // Call login
      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });
      
      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      
      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
      
      // Verify event dispatch
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });
  
  describe('logout', () => {
    it('should successfully logout', async () => {
      // Mock successful logout response
      const mockResponse = {
        success: true
      };
      
      (apiClient.post as any).mockResolvedValue(mockResponse);
      
      // Call logout
      await authService.logout();
      
      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      
      // Verify event dispatch
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
    
    it('should handle API errors during logout', async () => {
      // Mock API error
      (apiClient.post as any).mockRejectedValue(new Error('Network error'));
      
      // Call logout
      await authService.logout();
      
      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      
      // Verify event dispatch (should still dispatch logout event)
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });
  
  describe('verifyToken', () => {
    it('should successfully verify a valid token', async () => {
      // Mock successful verification response
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        roles: ['USER'],
        permissions: ['read:products'],
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      const mockResponse = {
        success: true,
        data: {
          isValid: true,
          user: mockUser
        }
      };
      
      (apiClient.get as any).mockResolvedValue(mockResponse);
      
      // Call verifyToken
      const result = await authService.verifyToken();
      
      // Verify result
      expect(result.isValid).toBe(true);
      expect(result.user).toEqual(mockUser);
      
      // Verify API call
      expect(apiClient.get).toHaveBeenCalledWith('/auth/verify');
    });
    
    it('should handle invalid token', async () => {
      // Mock invalid token response
      const mockResponse = {
        success: false,
        error: 'Invalid token'
      };
      
      (apiClient.get as any).mockResolvedValue(mockResponse);
      
      // Call verifyToken
      const result = await authService.verifyToken();
      
      // Verify result
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid token');
      
      // Verify API call
      expect(apiClient.get).toHaveBeenCalledWith('/auth/verify');
    });
  });
  
  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Mock successful refresh response
      const mockResponse = {
        success: true,
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 3600
        }
      };
      
      (apiClient.post as any).mockResolvedValue(mockResponse);
      
      // Call refreshToken
      const result = await authService.refreshToken();
      
      // Verify result
      expect(result).toBe(true);
      
      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh-token');
      
      // Verify event dispatch
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
    
    it('should handle refresh token failure', async () => {
      // Mock failed refresh response
      const mockResponse = {
        success: false,
        error: 'Invalid refresh token'
      };
      
      (apiClient.post as any).mockResolvedValue(mockResponse);
      
      // Call refreshToken
      const result = await authService.refreshToken();
      
      // Verify result
      expect(result).toBe(false);
      
      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh-token');
      
      // Verify event dispatch
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });
});
