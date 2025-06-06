import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Define User type based on Prisma schema
export type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'USER';
  isActive: boolean;
  avatar: string | null;
  createdAt: Date;
  lastLogin: Date | null;
  permissions: string[];
  updatedAt?: Date;
  // PIN Authentication
  pinHash?: string | null;
  isPinEnabled?: boolean;
  lastPinChange?: Date | null;
  failedPinAttempts?: number;
  pinLockedUntil?: Date | null;
};

// Define UserRole enum to match Prisma schema
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  USER = 'USER'
}

/**
 * User Repository
 *
 * Handles all database operations related to users
 */
export class UserRepository {
  /**
   * Find a user by their ID
   */
  static async findById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      return user as unknown as User;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Find a user by their username
   */
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });

      return user as unknown as User;
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  }

  /**
   * Find a user by their email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      return user as unknown as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Get all users
   */
  static async findAll(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany();
      return users as unknown as User[];
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }

  /**
   * Create a new user
   */
  static async create(data: Partial<User>): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(data.password!, 10);

      // Get default permissions based on role if no permissions are provided
      const role = data.role as UserRole;
      const permissions = data.permissions && data.permissions.length > 0
        ? data.permissions
        : getDefaultPermissions(role);

      const user = await prisma.user.create({
        data: {
          username: data.username!,
          password: hashedPassword,
          email: data.email!,
          firstName: data.firstName!,
          lastName: data.lastName!,
          role: role,
          isActive: data.isActive !== undefined ? data.isActive : true,
          avatar: data.avatar ?? null,
          permissions: permissions,
          isPinEnabled: data.isPinEnabled ?? false,
        },
      });
      return user as unknown as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update a user's information
   */
  static async update(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = bcrypt.hashSync(userData.password, 10);
    }

    try {
      // Update user with Prisma
      const user = await prisma.user.update({
        where: { id },
        data: userData as any
      });

      return user as unknown as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update a user's last login time
   */
  static async updateLastLogin(id: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          lastLogin: new Date()
        }
      });

      return user as unknown as User;
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  static async delete(id: string): Promise<User> {
    try {
      // Fetch the user before deletion
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found for deletion');
      }

      await prisma.user.delete({
        where: { id }
      });

      return user;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Check if any users exist in the database
   */
  static async hasUsers(): Promise<boolean> {
    try {
      const count = await prisma.user.count();
      return count > 0;
    } catch (error) {
      // If the table doesn't exist yet, return false
      console.error('Error checking if users exist:', error);
      return false;
    }
  }

  /**
   * Verify a password against a hashed password
   */
  static verifyPasswordHash(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  /**
   * Verify a user's password by ID
   */
  static async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await this.findById(userId);
      if (!user) return false;

      return this.verifyPasswordHash(password, user.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Hash a PIN
   */
  static async hashPin(pin: string): Promise<string> {
    return bcrypt.hash(pin, 10);
  }

  /**
   * Verify a user's PIN
   */
  static async verifyPin(userId: string, pin: string): Promise<boolean> {
    try {
      const user = await this.findById(userId);
      if (!user || !user.pinHash || !user.isPinEnabled) return false;

      return bcrypt.compareSync(pin, user.pinHash);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }
}

/**
 * Get default permissions based on user role
 */
function getDefaultPermissions(role: UserRole | string): string[] {
  switch (role) {
    case 'ADMIN':
    case UserRole.ADMIN:
      return [
        'users.read', 'users.create', 'users.update', 'users.delete',
        'products.read', 'products.create', 'products.update', 'products.delete',
        'sales.read', 'sales.create', 'sales.update', 'sales.delete',
        'reports.read', 'reports.create',
        'settings.read', 'settings.update'
      ];
    case 'MANAGER':
    case UserRole.MANAGER:
      return [
        'users.read',
        'products.read', 'products.create', 'products.update',
        'sales.read', 'sales.create', 'sales.update',
        'reports.read',
        'settings.read'
      ];
    case 'CASHIER':
    case UserRole.CASHIER:
      return [
        'products.read',
        'sales.read', 'sales.create',
        'reports.read'
      ];
    case 'USER':
    case UserRole.USER:
      return [
        'products.read',
        'sales.read'
      ];
    default:
      return [
        'products.read',
        'sales.read'
      ];
  }
}
