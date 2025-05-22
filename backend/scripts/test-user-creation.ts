/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * Test script for user creation through the API
 */

import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// This function will login to the admin account and save the response cookies for future requests
async function loginAsAdmin() {
  try {
    console.log('Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin'
    }, {
      withCredentials: true
    });
    
    console.log('Login successful');
    
    // The backend uses HttpOnly cookies for authentication that are automatically
    // stored by the browser. For our script, we need to manually extract and store
    // the Set-Cookie headers for subsequent requests
    const cookies = response.headers['set-cookie'];
    if (!cookies) {
      throw new Error('No cookies received from server');
    }
    
    // Return the response data and cookies
    return {
      data: response.data,
      cookies
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Login failed:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Login failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    throw error;
  }
}

async function createUser(cookies: string[]) {
  try {
    // Generate unique values to avoid conflicts
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    
    console.log(`Creating test user: ${username}`);
    
    const userData = {
      username,
      email: `${username}@example.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'CASHIER', // Use role as string based on auth.controller.ts implementation
      isActive: true
    };
    
    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: {
        Cookie: cookies.join('; ')
      },
      withCredentials: true
    });
    
    console.log('User created successfully:', response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('User creation failed:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error('User creation failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Login as admin to get authentication cookies
    const auth = await loginAsAdmin();
    
    // Create a test user
    await createUser(auth.cookies);
    
    console.log('Test completed successfully');
    process.exit(0);
  } catch (error: unknown) {
    console.error('Test failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Execute the main function
main();
