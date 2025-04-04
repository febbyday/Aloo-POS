/**
 * User Routes
 * 
 * API routes for user management
 */

import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  changePassword,
  resetPassword
} from '../controllers/userController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get all users - requires authentication and admin role
router.get('/', authenticateJWT, authorizeRoles(['ADMIN', 'MANAGER']), getAllUsers);

// Get user by ID - requires authentication
router.get('/:id', authenticateJWT, getUserById);

// Create a new user - requires authentication and admin role
router.post('/', authenticateJWT, authorizeRoles(['ADMIN']), createUser);

// Update an existing user - requires authentication and admin role
router.put('/:id', authenticateJWT, authorizeRoles(['ADMIN']), updateUser);

// Delete a user - requires authentication and admin role
router.delete('/:id', authenticateJWT, authorizeRoles(['ADMIN']), deleteUser);

// Change user password - requires authentication
router.post('/:id/change-password', authenticateJWT, changePassword);

// Reset user password (admin only) - requires authentication and admin role
router.post('/:id/reset-password', authenticateJWT, authorizeRoles(['ADMIN']), resetPassword);

export default router;

