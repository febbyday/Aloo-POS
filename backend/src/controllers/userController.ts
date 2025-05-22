/**
 * User Controller
 *
 * Handles user management operations
 */

import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { RoleRepository } from '../repositories/RoleRepository';
import { validateRequest } from '../middleware/validation';
import { z, ZodError } from 'zod';
import { generateJWT } from '../utils/auth';
import { hashPassword } from '../utils/password';
import { shouldEnablePinForRole } from '../utils/pinUtils';
import { passwordSchema } from '../utils/validation-utils';

// Create user schema
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  password: passwordSchema,
  role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']),
  avatar: z.string().nullable().optional(),
});

// Update user schema
const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().optional(),
});

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserRepository.findAll();

    // Remove sensitive information
    const sanitizedUsers = users.map(user => {
      const { password, ...userData } = user;
      return userData;
    });

    return res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await UserRepository.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const { password, ...userData } = user;

    return res.status(200).json(userData);
  } catch (error) {
    console.error(`Error fetching user with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod schema
    try {
      createUserSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    const { username, email, firstName, lastName, password, role, avatar } = req.body;

    // Check if username already exists
    const existingUser = await UserRepository.findByUsername(username);

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await UserRepository.findByEmail(email);

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user
    const user = await UserRepository.create({
      username,
      email,
      firstName,
      lastName,
      password,
      role,
      avatar: avatar || null,
      isPinEnabled: shouldEnablePinForRole(role), // Enable PIN for staff roles based on shared utility function
    });

    // Remove sensitive information
    const { password: _, ...userData } = user;

    return res.status(201).json(userData);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate request body using Zod schema
    try {
      updateUserSchema.parse(req.body);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      throw validationError;
    }

    // Check if user exists
    const existingUser = await UserRepository.findById(id);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, email, firstName, lastName, password, role, avatar } = req.body;

    // Check if username is being changed and already exists
    if (username && username !== existingUser.username) {
      const userWithUsername = await UserRepository.findByUsername(username);

      if (userWithUsername && userWithUsername.id !== id) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const userWithEmail = await UserRepository.findByEmail(email);

      if (userWithEmail && userWithEmail.id !== id) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update user
    const updatedUser = await UserRepository.update(id, {
      username,
      email,
      firstName,
      lastName,
      password,
      role,
      avatar,
      // Update isPinEnabled based on role if role is changing
      ...(role && role !== existingUser.role ? {
        isPinEnabled: shouldEnablePinForRole(role)
      } : {})
    });

    // Remove sensitive information
    const { password: _, ...userData } = updatedUser;

    return res.status(200).json(userData);
  } catch (error) {
    console.error(`Error updating user with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete a user
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await UserRepository.findById(id);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await UserRepository.delete(id);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(`Error deleting user with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Change user password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate request body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Check if user exists
    const user = await UserRepository.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = UserRepository.verifyPassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await UserRepository.update(id, { password: hashedPassword });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(`Error changing password for user with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
};

/**
 * Reset user password (admin only)
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validate request body
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    // Check if user exists
    const user = await UserRepository.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await UserRepository.update(id, { password: hashedPassword });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(`Error resetting password for user with ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};
