/**
 * usePermissions Hook Tests
 * 
 * Tests for the usePermissions hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { useAuth } from './useAuth';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the useAuth hook
vi.mock('./useAuth', () => ({
  useAuth: vi.fn()
}));

// Wrapper component for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe('usePermissions Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for useAuth
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        username: 'testuser',
        roles: ['USER'],
        permissions: ['read:products', 'write:products']
      },
      permissions: ['read:products', 'write:products'],
      hasPermission: (permission: string) => ['read:products', 'write:products'].includes(permission),
      hasRole: (role: string) => ['USER'].includes(role)
    });
  });
  
  it('should provide permission utilities', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current).toHaveProperty('permissions');
    expect(result.current).toHaveProperty('hasPermission');
    expect(result.current).toHaveProperty('hasAllPermissions');
    expect(result.current).toHaveProperty('hasAnyPermission');
    expect(result.current).toHaveProperty('hasRole');
    expect(result.current).toHaveProperty('hasAllRoles');
    expect(result.current).toHaveProperty('hasAnyRole');
    expect(result.current).toHaveProperty('isAdmin');
    expect(result.current).toHaveProperty('isManager');
    expect(result.current).toHaveProperty('getHighestRole');
  });
  
  it('should check individual permissions correctly', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasPermission('read:products')).toBe(true);
    expect(result.current.hasPermission('write:products')).toBe(true);
    expect(result.current.hasPermission('delete:products')).toBe(false);
  });
  
  it('should check all permissions correctly', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasAllPermissions(['read:products', 'write:products'])).toBe(true);
    expect(result.current.hasAllPermissions(['read:products'])).toBe(true);
    expect(result.current.hasAllPermissions(['read:products', 'delete:products'])).toBe(false);
    expect(result.current.hasAllPermissions([])).toBe(true); // Empty array should return true
  });
  
  it('should check any permissions correctly', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasAnyPermission(['read:products', 'delete:products'])).toBe(true);
    expect(result.current.hasAnyPermission(['delete:products', 'update:products'])).toBe(false);
    expect(result.current.hasAnyPermission([])).toBe(true); // Empty array should return true
  });
  
  it('should check individual roles correctly', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasRole('USER')).toBe(true);
    expect(result.current.hasRole('ADMIN')).toBe(false);
  });
  
  it('should check all roles correctly', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasAllRoles(['USER'])).toBe(true);
    expect(result.current.hasAllRoles(['USER', 'ADMIN'])).toBe(false);
    expect(result.current.hasAllRoles([])).toBe(true); // Empty array should return true
  });
  
  it('should check any roles correctly', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasAnyRole(['USER', 'ADMIN'])).toBe(true);
    expect(result.current.hasAnyRole(['ADMIN', 'MANAGER'])).toBe(false);
    expect(result.current.hasAnyRole([])).toBe(true); // Empty array should return true
  });
  
  it('should check admin role correctly', () => {
    // Mock user with ADMIN role
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        username: 'admin',
        roles: ['ADMIN'],
        permissions: ['*']
      },
      permissions: ['*'],
      hasPermission: () => true,
      hasRole: (role: string) => ['ADMIN'].includes(role)
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isManager()).toBe(false);
  });
  
  it('should check manager role correctly', () => {
    // Mock user with MANAGER role
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        username: 'manager',
        roles: ['MANAGER'],
        permissions: ['read:*', 'write:*']
      },
      permissions: ['read:*', 'write:*'],
      hasPermission: () => true,
      hasRole: (role: string) => ['MANAGER'].includes(role)
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isManager()).toBe(true);
  });
  
  it('should get highest role correctly', () => {
    // Mock user with multiple roles
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        username: 'multiuser',
        roles: ['USER', 'MANAGER'],
        permissions: []
      },
      permissions: [],
      hasPermission: () => false,
      hasRole: (role: string) => ['USER', 'MANAGER'].includes(role)
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.getHighestRole()).toBe('MANAGER');
  });
  
  it('should handle user with no roles', () => {
    // Mock user with no roles
    (useAuth as any).mockReturnValue({
      user: {
        id: '1',
        username: 'noroles',
        roles: [],
        permissions: []
      },
      permissions: [],
      hasPermission: () => false,
      hasRole: () => false
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.getHighestRole()).toBeNull();
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isManager()).toBe(false);
    expect(result.current.hasAnyRole(['ADMIN', 'MANAGER', 'USER'])).toBe(false);
  });
  
  it('should handle null user', () => {
    // Mock null user (not authenticated)
    (useAuth as any).mockReturnValue({
      user: null,
      permissions: [],
      hasPermission: () => false,
      hasRole: () => false
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.getHighestRole()).toBeNull();
    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isManager()).toBe(false);
    expect(result.current.hasAnyPermission(['read:products'])).toBe(false);
  });
});
