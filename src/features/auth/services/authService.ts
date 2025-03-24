// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { z } from 'zod';
import { API_BASE_URL } from '../../../config';

// Type definitions with Zod validation
export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['admin', 'manager', 'cashier']),
  avatar: z.string().url(),
  permissions: z.array(z.string()),
  createdAt: z.string().or(z.date()).transform(val => new Date(val instanceof Date ? val : val)),
  lastLogin: z.string().or(z.date()).transform(val => new Date(val instanceof Date ? val : val))
});

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    token: z.string(),
    user: UserSchema,
    expiresAt: z.string().or(z.date()).transform(val => new Date(val instanceof Date ? val : val))
  }).optional(),
  message: z.string().optional()
});

export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

// Type inference
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

// API error handling
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Handle API response with validation
 */
async function handleResponse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    try {
      const validatedError = ErrorResponseSchema.parse(errorData);
      throw new ApiError(validatedError.message, response.status);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(errorData.message || 'An unknown error occurred', response.status);
    }
  }
  
  const data = await response.json();
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Validation error:', error);
    throw new ApiError('Invalid response format from server', 500);
  }
}

/**
 * Login a user with the backend API
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  const loginResponse = await handleResponse(response, LoginResponseSchema);
  
  if (!loginResponse.success || !loginResponse.data) {
    throw new ApiError(loginResponse.message || 'Login failed', 401);
  }
  
  // Store token in localStorage
  localStorage.setItem('authToken', loginResponse.data.token);
  localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
  
  return loginResponse.data.user;
}

/**
 * Register a new user
 */
export async function register(credentials: RegisterCredentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  const registerResponse = await handleResponse(response, LoginResponseSchema);
  
  if (!registerResponse.success || !registerResponse.data) {
    throw new ApiError(registerResponse.message || 'Registration failed', 400);
  }
  
  // Store token in localStorage
  localStorage.setItem('authToken', registerResponse.data.token);
  localStorage.setItem('user', JSON.stringify(registerResponse.data.user));
  
  return registerResponse.data.user;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      await handleResponse(response, ErrorResponseSchema);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Clear local storage regardless of API response
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

/**
 * Get the current user's information
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('authToken');
  const cachedUser = localStorage.getItem('user');
  
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const userData = await handleResponse(response, z.object({
      success: z.boolean(),
      data: UserSchema,
    }));
    
    if (!userData.success) {
      throw new ApiError('Failed to get user data', 500);
    }
    
    // Update cached user
    localStorage.setItem('user', JSON.stringify(userData.data));
    
    return userData.data;
  } catch (error) {
    // On API error, try to use cached user data
    if (cachedUser) {
      try {
        return UserSchema.parse(JSON.parse(cachedUser));
      } catch (e) {
        // Invalid cached data
        localStorage.removeItem('user');
      }
    }
    
    // If token is invalid/expired, clear auth data
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    
    return null;
  }
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken');
}

/**
 * Check if the current user has a specific permission
 */
export function hasPermission(permission: string): boolean {
  const cachedUser = localStorage.getItem('user');
  if (!cachedUser) return false;
  
  try {
    const user = UserSchema.parse(JSON.parse(cachedUser));
    return user.permissions.includes(permission);
  } catch (e) {
    return false;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new ApiError('Not authenticated', 401);
  }
  
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const usersResponse = await handleResponse(response, z.object({
    success: z.boolean(),
    data: z.array(UserSchema),
    message: z.string().optional()
  }));
  
  if (!usersResponse.success || !usersResponse.data) {
    throw new ApiError(usersResponse.message || 'Failed to fetch users', response.status);
  }
  
  return usersResponse.data;
}
