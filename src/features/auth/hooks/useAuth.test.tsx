/**
 * useAuth Hook Tests
 * 
 * Tests for the useAuth hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import { MemoryRouter } from 'react-router-dom';

// Mock the auth service
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    hasPermission: vi.fn(),
    hasRole: vi.fn(),
    init: vi.fn()
  }
}));

// Mock window.dispatchEvent
window.dispatchEvent = vi.fn();

// Wrapper component for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    (authService.isAuthenticated as any).mockReturnValue(false);
    (authService.getCurrentUser as any).mockReturnValue(null);
  });
  
  it('should provide authentication state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('permissions');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('hasPermission');
    expect(result.current).toHaveProperty('hasRole');
    expect(result.current).toHaveProperty('refreshAuth');
    expect(result.current).toHaveProperty('clearAuthError');
  });
  
  it('should handle successful login', async () => {
    // Mock successful login
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
    
    (authService.login as any).mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-token'
      }
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const loginResult = await result.current.login({
        username: 'testuser',
        password: 'password123'
      });
      
      expect(loginResult.success).toBe(true);
    });
    
    // After successful login, the user should be set
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.permissions).toEqual(['read:products']);
    expect(result.current.error).toBeNull();
    
    // Verify auth service was called
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });
  
  it('should handle login failure', async () => {
    // Mock failed login
    (authService.login as any).mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const loginResult = await result.current.login({
        username: 'testuser',
        password: 'wrongpassword'
      });
      
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
    });
    
    // After failed login, the user should still be null
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
    
    // Verify auth service was called
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'wrongpassword'
    });
  });
  
  it('should handle logout', async () => {
    // Mock authenticated state
    (authService.isAuthenticated as any).mockReturnValue(true);
    (authService.getCurrentUser as any).mockReturnValue({
      id: '1',
      username: 'testuser',
      roles: ['USER'],
      permissions: ['read:products']
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Verify initial authenticated state
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    
    // Perform logout
    await act(async () => {
      await result.current.logout();
    });
    
    // After logout, the user should be null
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    
    // Verify auth service was called
    expect(authService.logout).toHaveBeenCalled();
  });
  
  it('should check permissions correctly', () => {
    // Mock authenticated state with permissions
    (authService.isAuthenticated as any).mockReturnValue(true);
    (authService.getCurrentUser as any).mockReturnValue({
      id: '1',
      username: 'testuser',
      roles: ['USER'],
      permissions: ['read:products', 'write:products']
    });
    (authService.hasPermission as any).mockImplementation((permission: string) => {
      return ['read:products', 'write:products'].includes(permission);
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Check permissions
    expect(result.current.hasPermission('read:products')).toBe(true);
    expect(result.current.hasPermission('write:products')).toBe(true);
    expect(result.current.hasPermission('delete:products')).toBe(false);
    
    // Verify auth service was called
    expect(authService.hasPermission).toHaveBeenCalledWith('read:products');
    expect(authService.hasPermission).toHaveBeenCalledWith('write:products');
    expect(authService.hasPermission).toHaveBeenCalledWith('delete:products');
  });
  
  it('should check roles correctly', () => {
    // Mock authenticated state with roles
    (authService.isAuthenticated as any).mockReturnValue(true);
    (authService.getCurrentUser as any).mockReturnValue({
      id: '1',
      username: 'testuser',
      roles: ['USER', 'EDITOR'],
      permissions: []
    });
    (authService.hasRole as any).mockImplementation((role: string) => {
      return ['USER', 'EDITOR'].includes(role);
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Check roles
    expect(result.current.hasRole('USER')).toBe(true);
    expect(result.current.hasRole('EDITOR')).toBe(true);
    expect(result.current.hasRole('ADMIN')).toBe(false);
    
    // Verify auth service was called
    expect(authService.hasRole).toHaveBeenCalledWith('USER');
    expect(authService.hasRole).toHaveBeenCalledWith('EDITOR');
    expect(authService.hasRole).toHaveBeenCalledWith('ADMIN');
  });
  
  it('should refresh authentication', async () => {
    // Mock successful token refresh
    (authService.refreshToken as any).mockResolvedValue(true);
    (authService.getCurrentUser as any).mockReturnValue({
      id: '1',
      username: 'testuser',
      roles: ['USER'],
      permissions: ['read:products']
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Perform refresh
    await act(async () => {
      const refreshResult = await result.current.refreshAuth();
      expect(refreshResult).toBe(true);
    });
    
    // After refresh, the user should be set
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    
    // Verify auth service was called
    expect(authService.refreshToken).toHaveBeenCalled();
  });
  
  it('should clear authentication error', () => {
    // Mock initial state with error
    (authService.isAuthenticated as any).mockReturnValue(false);
    (authService.getCurrentUser as any).mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Set error manually (would normally be set by failed login)
    act(() => {
      result.current.login({
        username: 'testuser',
        password: 'wrongpassword'
      }).catch(() => {});
    });
    
    // Clear error
    act(() => {
      result.current.clearAuthError();
    });
    
    // Error should be null
    expect(result.current.error).toBeNull();
  });
});
