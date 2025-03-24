// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import express, { Request, Response, NextFunction, RequestHandler } from 'express';

// Create router
const router = express.Router();

// Types for our auth system
interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'cashier';
  avatar: string;
  createdAt: Date;
  lastLogin: Date;
  permissions: string[];
}

interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
}

// Mock database for users
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    email: 'admin@pos-system.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: 'https://avatars.githubusercontent.com/u/12345678',
    createdAt: new Date('2023-01-01'),
    lastLogin: new Date(),
    permissions: ['shops.read', 'shops.write', 'shops.delete', 'products.read', 'products.write', 'products.delete']
  },
  {
    id: '2',
    username: 'manager',
    password: 'manager123',
    email: 'manager@pos-system.com',
    firstName: 'Store',
    lastName: 'Manager',
    role: 'manager',
    avatar: 'https://avatars.githubusercontent.com/u/23456789',
    createdAt: new Date('2023-03-15'),
    lastLogin: new Date(),
    permissions: ['shops.read', 'products.read', 'products.write']
  },
  {
    id: '3',
    username: 'cashier',
    password: 'cashier123',
    email: 'cashier@pos-system.com',
    firstName: 'Checkout',
    lastName: 'Cashier',
    role: 'cashier',
    avatar: 'https://avatars.githubusercontent.com/u/34567890',
    createdAt: new Date('2023-06-01'),
    lastLogin: new Date(),
    permissions: ['products.read']
  }
];

// Mock active sessions
const sessions: Record<string, Session> = {};

// Helper function to generate a UUID
const generateUUID = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// ===== Route Handler Functions =====

/**
 * Handle login request
 */
const handleLogin: RequestHandler = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide username and password'
    });
  }

  // Find the user
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Create a session token
  const token = generateUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // Token valid for 1 day

  // Store session
  sessions[token] = {
    token,
    userId: user.id,
    expiresAt
  };

  // Update last login
  user.lastLogin = new Date();

  // Don't send password back
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      token,
      user: userWithoutPassword,
      expiresAt
    }
  });
};

/**
 * Handle register request
 */
const handleRegister: RequestHandler = (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;

  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }

  // Check if username already exists
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Username already exists'
    });
  }

  // Create new user
  const newUser: User = {
    id: generateUUID(),
    username,
    password,
    email,
    firstName,
    lastName,
    role: 'cashier', // Default role
    avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
    createdAt: new Date(),
    lastLogin: new Date(),
    permissions: ['products.read'] // Default permissions
  };

  users.push(newUser);

  // Create session token
  const token = generateUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1);

  // Store session
  sessions[token] = {
    token,
    userId: newUser.id,
    expiresAt
  };

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    data: {
      token,
      user: userWithoutPassword,
      expiresAt
    }
  });
};

/**
 * Handle logout request
 */
const handleLogout: RequestHandler = (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }

  // Remove session
  delete sessions[token];

  res.json({
    success: true,
    message: 'Successfully logged out'
  });
};

/**
 * Handle get current user info request
 */
const handleGetCurrentUser: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const session = sessions[token];

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (new Date() > session.expiresAt) {
    delete sessions[token];
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  const user = users.find(u => u.id === session.userId);

  if (!user) {
    delete sessions[token];
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword
  });
};

/**
 * Handle get all users request (admin only)
 */
const handleGetAllUsers: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const session = sessions[token];

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  const user = users.find(u => u.id === session.userId);

  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // Remove passwords from users
  const usersWithoutPasswords = users.map(({ password: _, ...rest }) => rest);

  res.json({
    success: true,
    data: usersWithoutPasswords
  });
};

// ===== Routes =====

/**
 * @route   POST /auth/login
 * @desc    Authenticate a user and return a token
 * @access  Public
 */
router.post('/login', handleLogin);

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', handleRegister);

/**
 * @route   POST /auth/logout
 * @desc    Logout a user
 * @access  Private
 */
router.post('/logout', handleLogout);

/**
 * @route   GET /auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', handleGetCurrentUser);

/**
 * @route   GET /auth/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/users', handleGetAllUsers);

export default router;
