/**
 * Login Page Tests
 * 
 * Tests for the login page component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { useAuth } from '../hooks/useAuth';
import { MemoryRouter } from 'react-router-dom';

// Mock the useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: '/dashboard' } })
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for useAuth
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn().mockResolvedValue({ success: true })
    });
  });
  
  it('should render the login form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
  
  it('should redirect if already authenticated', async () => {
    // Mock authenticated state
    (useAuth as any).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn()
    });
    
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    
    // Should redirect to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
  
  it('should handle form submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin
    });
    
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Should call login with correct values
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        rememberMe: false
      });
    });
  });
  
  it('should display error message', () => {
    // Mock error state
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid credentials',
      login: vi.fn()
    });
    
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    
    // Should display error message
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
  
  it('should show loading state during submission', async () => {
    // Mock loading state
    const mockLogin = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 100);
      });
    });
    
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      error: null,
      login: mockLogin
    });
    
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Should show loading state
    expect(screen.getByText(/Signing in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeDisabled();
  });
});
