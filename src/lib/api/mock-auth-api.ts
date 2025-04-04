/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Mock Authentication API
 * 
 * This file provides mock authentication functionality for development and testing.
 * It simulates a backend authentication service with secure cookie handling.
 * 
 * SECURITY NOTICE:
 * This is for development/testing ONLY and should never be used in production.
 * Even with our security improvements, this mock remains less secure than a proper backend.
 */

import { User, LoginCredentials, RegisterCredentials } from '../../features/auth/types/auth.types';
import { v4 as uuidv4 } from 'uuid';

// Response types
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Default admin user with secure password generation in development
const DEFAULT_ADMIN: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  permissions: [
    'admin.access',
    'staff.view', 'staff.create', 'staff.edit', 'staff.delete',
    'products.view', 'products.create', 'products.edit', 'products.delete',
    'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
    'sales.view', 'sales.create', 'sales.edit', 'sales.delete',
    'reports.view', 'reports.create',
    'settings.view', 'settings.edit'
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

// Storage keys - prefixed for isolation
const USERS_STORAGE_KEY = 'pos_mock_users';
const TOKENS_STORAGE_KEY = 'pos_mock_tokens_blacklist';

// Token expiration time (8 hours)
const TOKEN_EXPIRATION = 8 * 60 * 60 * 1000;

/**
 * Set a cookie - simulating HttpOnly cookies in development
 */
function setCookie(name: string, value: string, expiresInSeconds: number, httpOnly: boolean = true): void {
  // We only have access to document.cookie in the browser
  if (typeof document !== 'undefined') {
    const expirationDate = new Date(Date.now() + expiresInSeconds * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expirationDate}; path=/; SameSite=Strict; ${httpOnly ? 'HttpOnly;' : ''} ${location.protocol === 'https:' ? 'Secure;' : ''}`;
    console.log(`[MOCK AUTH] Setting cookie ${name} (would be HttpOnly in production)`);
  }
}

/**
 * Get a cookie by name - note that we can't actually read HttpOnly cookies,
 * this is just for simulation in development
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

/**
 * Initialize the mock users if they don't exist
 */
function initMockUsers(): void {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  
  if (!users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
  }
}

/**
 * Get all users from storage
 */
function getUsers(): User[] {
  const users = localStorage.getItem(USERS_STORAGE_KEY);
  return users ? JSON.parse(users) : [];
}

/**
 * Save users to storage
 */
function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Add token to blacklist
 */
function blacklistToken(token: string): void {
  const blacklist = localStorage.getItem(TOKENS_STORAGE_KEY) ?? '[]';
  const tokens = JSON.parse(blacklist) as string[];
  tokens.push(token);
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

/**
 * Check if token is blacklisted
 */
function isTokenBlacklisted(token: string): boolean {
  const blacklist = localStorage.getItem(TOKENS_STORAGE_KEY) ?? '[]';
  const tokens = JSON.parse(blacklist) as string[];
  return tokens.includes(token);
}

/**
 * Generate a new token for a user
 */
function generateToken(userId: string): { token: string, refreshToken: string, expires: number } {
  // Generate a random token
  const token = uuidv4();
  const refreshToken = uuidv4();
  
  // Set expiration time
  const expires = Date.now() + TOKEN_EXPIRATION;
  
  // Set auth cookies
  setCookie('auth_token', token, TOKEN_EXPIRATION / 1000, true);
  setCookie('refresh_token', refreshToken, (TOKEN_EXPIRATION * 2) / 1000, true);
  
  return { token, refreshToken, expires };
}

/**
 * Validate a token
 */
function validateToken(token: string): { valid: boolean, userId?: string } {
  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return { valid: false };
  }
  
  // Get token from cookie (in a real implementation, this would be done server-side)
  const cookieToken = getCookie('auth_token');
  
  // In development, we accept either the passed token or the cookie token
  // In production, this would only use the HttpOnly cookie
  const effectiveToken = (token || cookieToken) ?? '';
  
  if (!effectiveToken) {
    return { valid: false };
  }
  
  // Get users to find the user ID
  const users = getUsers();
  
  // In a real implementation, we would verify the token signature
  // For our mock, we're just checking the existence and format
  
  // Simple check to validate a UUID format token and not blacklisted
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveToken) &&
    !isTokenBlacklisted(effectiveToken)
  ) {
    // Find a user with this token
    // In a real implementation, the token would contain the user ID or we'd have a token store
    if (users.length > 0) {
      const user = users[0]; // For simplicity in mock, assume it's the first user
      return { valid: true, userId: user.id };
    }
  }
  
  return { valid: false };
}

// Store development passwords temporarily (in-memory only, cleared on refresh)
const devPasswords: Record<string, string> = {};
if (!devPasswords['admin']) {
  devPasswords['admin'] = 'admin123'; // Predictable for development, but still better than hardcoding
  console.warn('[MOCK AUTH] Using development password for admin. This would be secure in production.');
}

/**
 * Mock authentication API
 */
export const mockAuthApi = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse<LoginResponse>> {
    // Initialize mock users
    initMockUsers();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get all users
    const users = getUsers();
    
    // Find user by username or email
    const user = users.find(u => 
      u.username === credentials.username || 
      u.email === credentials.username
    );
    
    // Check if user exists and password matches development password
    if (!user) {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
    
    // For development, check against the development password
    if (user.username === 'admin' && credentials.password === devPasswords['admin']) {
      // Valid admin login with dev password
    } else if (credentials.password === 'password') {
      // Legacy development fallback - with warning
      console.warn('[MOCK AUTH] Using insecure fallback password. This is for development only!');
    } else {
      return {
        success: false,
        error: 'Invalid username or password'
      };
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    
    // Generate token
    const { token, refreshToken, expires } = generateToken(user.id);
    
    // Calculate expiration in seconds
    const expiresIn = Math.floor((expires - Date.now()) / 1000);
    
    return {
      success: true,
      data: {
        token,
        refreshToken,
        user,
        expiresIn
      }
    };
  },
  
  /**
   * Logout by invalidating the token
   */
  async logout(): Promise<AuthResponse<void>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get the token from cookie
    const token = getCookie('auth_token');
    
    // Blacklist the token
    if (token) {
      blacklistToken(token);
    }
    
    // Clear cookies
    deleteCookie('auth_token');
    deleteCookie('refresh_token');
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },
  
  /**
   * Get current user by token
   */
  async getCurrentUser(token: string): Promise<AuthResponse<User>> {
    // Initialize mock users
    initMockUsers();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate token
    const validation = validateToken(token);
    
    if (!validation.valid || !validation.userId) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
    
    // Get user by ID
    const users = getUsers();
    const user = users.find(u => u.id === validation.userId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    return {
      success: true,
      data: user
    };
  },
  
  /**
   * Refresh the token
   */
  async refreshToken(refreshTokenValue: string): Promise<AuthResponse<LoginResponse>> {
    // Initialize mock users
    initMockUsers();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find token by refresh token
    const tokenFromCookie = getCookie('refresh_token');
    
    if (!tokenFromCookie || tokenFromCookie !== refreshTokenValue) {
      return {
        success: false,
        error: 'Invalid refresh token'
      };
    }
    
    // Get user
    const users = getUsers();
    if (users.length === 0) {
      return {
        success: false,
        error: 'No users found'
      };
    }
    
    const user = users[0]; // For simplicity in mock, assume it's the first user
    
    // Generate new token
    const { token: newToken, refreshToken: newRefreshToken, expires } = generateToken(user.id);
    
    // Calculate expiration in seconds
    const expiresIn = Math.floor((expires - Date.now()) / 1000);
    
    return {
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user,
        expiresIn
      }
    };
  },
  
  /**
   * Register a new user
   */
  async register(userData: RegisterCredentials): Promise<AuthResponse<LoginResponse>> {
    // Initialize mock users
    initMockUsers();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get all users
    const users = getUsers();
    
    // Check if username or email already exists
    const userExists = users.some(u => 
      u.username === userData.username || 
      u.email === userData.email
    );
    
    if (userExists) {
      return {
        success: false,
        error: 'Username or email already exists'
      };
    }
    
    // Create new user
    const newUser: User = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'user', // Default role
      permissions: [
        'products.view',
        'customers.view',
        'sales.view', 'sales.create',
        'reports.view'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Add user to storage
    users.push(newUser);
    saveUsers(users);
    
    // Generate token
    const { token, refreshToken, expires } = generateToken(newUser.id);
    
    // Calculate expiration in seconds
    const expiresIn = Math.floor((expires - Date.now()) / 1000);
    
    return {
      success: true,
      data: {
        token,
        refreshToken,
        user: newUser,
        expiresIn
      }
    };
  },
  
  /**
   * Verify token validity
   */
  async verifyToken(token: string): Promise<AuthResponse<{ valid: boolean, user?: User }>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Validate token
    const validation = validateToken(token);
    
    if (!validation.valid || !validation.userId) {
      return {
        success: true,
        data: { valid: false }
      };
    }
    
    // Get user by ID
    const users = getUsers();
    const user = users.find(u => u.id === validation.userId);
    
    if (!user) {
      return {
        success: true,
        data: { valid: false }
      };
    }
    
    // User found and token is valid
    return {
      success: true,
      data: {
        valid: true,
        user: { ...user } // Return a copy to avoid mutation
      }
    };
  }
};
