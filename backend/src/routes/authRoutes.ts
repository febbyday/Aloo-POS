// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import express from 'express';
import { 
  login, 
  register, 
  logout, 
  refreshToken, 
  verifyToken, 
  setCookie, 
  clearCookie 
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { setCsrfToken, validateCsrfToken } from '../middleware/csrf';

// Create router
const router = express.Router();

// Apply CSRF protection to all routes
router.use(setCsrfToken);
router.use(validateCsrfToken);

/**
 * @route   POST /auth/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /auth/logout
 * @desc    Logout user and blacklist token
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /auth/verify
 * @desc    Verify token and get user info
 * @access  Private
 */
router.get('/verify', authenticate, verifyToken);

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh authentication token
 * @access  Public (with refresh token)
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /auth/set-cookie
 * @desc    Set authentication tokens as HttpOnly cookies
 * @access  Public
 */
router.post('/set-cookie', setCookie);

/**
 * @route   POST /auth/clear-cookie
 * @desc    Clear authentication cookies
 * @access  Public
 */
router.post('/clear-cookie', clearCookie);

export default router;
