/**
 * useAuthenticatedFetch Hook Tests
 * 
 * Tests for the useAuthenticatedFetch hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';
import { useAuth } from './useAuth';
import { apiClient } from '@/lib/api/api-client';
import { AuthProvider } from '../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the useAuth hook
vi.mock('./useAuth', () => ({
  useAuth: vi.fn()
}));

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

// Mock window.dispatchEvent
window.dispatchEvent = vi.fn();

// Wrapper component for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>{children}</AuthProvider>
  </MemoryRouter>
);

describe('useAuthenticatedFetch Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for useAuth
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      refreshAuth: vi.fn().mockResolvedValue(true)
    });
  });
  
  it('should provide fetch methods', () => {
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    expect(result.current).toHaveProperty('get');
    expect(result.current).toHaveProperty('post');
    expect(result.current).toHaveProperty('put');
    expect(result.current).toHaveProperty('delete');
    expect(result.current).toHaveProperty('patch');
  });
  
  it('should make successful GET requests', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true,
      data: { id: 1, name: 'Test' }
    };
    
    (apiClient.get as any).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const response = await result.current.get('/api/test');
    
    expect(response).toEqual(mockResponse);
    expect(apiClient.get).toHaveBeenCalledWith('/api/test', {});
  });
  
  it('should handle unauthorized GET requests and refresh token', async () => {
    // Mock 401 response followed by successful response
    const unauthorizedResponse = {
      success: false,
      status: 401,
      error: 'Unauthorized'
    };
    
    const successResponse = {
      success: true,
      data: { id: 1, name: 'Test' }
    };
    
    (apiClient.get as any)
      .mockResolvedValueOnce(unauthorizedResponse)
      .mockResolvedValueOnce(successResponse);
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const response = await result.current.get('/api/test');
    
    // Should return the successful response after token refresh
    expect(response).toEqual(successResponse);
    
    // Should have called get twice (once with original request, once after refresh)
    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(apiClient.get).toHaveBeenCalledWith('/api/test', {});
    
    // Should have called refreshAuth
    const { refreshAuth } = useAuth();
    expect(refreshAuth).toHaveBeenCalled();
  });
  
  it('should handle failed token refresh', async () => {
    // Mock 401 response
    const unauthorizedResponse = {
      success: false,
      status: 401,
      error: 'Unauthorized'
    };
    
    (apiClient.get as any).mockResolvedValue(unauthorizedResponse);
    
    // Mock failed token refresh
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      refreshAuth: vi.fn().mockResolvedValue(false)
    });
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const response = await result.current.get('/api/test');
    
    // Should return error response
    expect(response.success).toBe(false);
    expect(response.error).toBe('Authentication failed');
    
    // Should have called get once
    expect(apiClient.get).toHaveBeenCalledTimes(1);
    
    // Should have called refreshAuth
    const { refreshAuth } = useAuth();
    expect(refreshAuth).toHaveBeenCalled();
    
    // Should have dispatched unauthorized event
    expect(window.dispatchEvent).toHaveBeenCalled();
  });
  
  it('should handle unauthenticated state', async () => {
    // Mock unauthenticated state
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      refreshAuth: vi.fn()
    });
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const response = await result.current.get('/api/test');
    
    // Should return error response
    expect(response.success).toBe(false);
    expect(response.error).toBe('Not authenticated');
    
    // Should not have called get
    expect(apiClient.get).not.toHaveBeenCalled();
    
    // Should have dispatched unauthorized event
    expect(window.dispatchEvent).toHaveBeenCalled();
  });
  
  it('should make successful POST requests', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true,
      data: { id: 1, name: 'Test' }
    };
    
    (apiClient.post as any).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const data = { name: 'Test' };
    const response = await result.current.post('/api/test', data);
    
    expect(response).toEqual(mockResponse);
    expect(apiClient.post).toHaveBeenCalledWith('/api/test', data, {});
  });
  
  it('should make successful PUT requests', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true,
      data: { id: 1, name: 'Updated Test' }
    };
    
    (apiClient.put as any).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const data = { name: 'Updated Test' };
    const response = await result.current.put('/api/test/1', data);
    
    expect(response).toEqual(mockResponse);
    expect(apiClient.put).toHaveBeenCalledWith('/api/test/1', data, {});
  });
  
  it('should make successful DELETE requests', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true
    };
    
    (apiClient.delete as any).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const response = await result.current.delete('/api/test/1');
    
    expect(response).toEqual(mockResponse);
    expect(apiClient.delete).toHaveBeenCalledWith('/api/test/1', {});
  });
  
  it('should make successful PATCH requests', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true,
      data: { id: 1, name: 'Partially Updated' }
    };
    
    (apiClient.patch as any).mockResolvedValue(mockResponse);
    
    const { result } = renderHook(() => useAuthenticatedFetch(), { wrapper });
    
    const data = { name: 'Partially Updated' };
    const response = await result.current.patch('/api/test/1', data);
    
    expect(response).toEqual(mockResponse);
    expect(apiClient.patch).toHaveBeenCalledWith('/api/test/1', data, {});
  });
});
