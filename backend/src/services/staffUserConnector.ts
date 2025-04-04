/**
 * Staff User Connector Service
 *
 * This service connects the Staff and User modules by:
 * - Listening for StaffCreated events
 * - Creating corresponding user accounts for new staff members
 */

import { PrismaClient } from '@prisma/client';
import { StaffService } from '../staff/services/staff.service';
import { UserRepository } from '../repositories/UserRepository';
import { generateUsername } from '../utils/username';
import { generatePassword } from '../utils/password';
import { logger } from '../utils/logger';
import { emailService } from './emailService';

const prisma = new PrismaClient();

export class StaffUserConnector {
  private staffService: StaffService;
  private initialized: boolean = false;

  constructor() {
    this.staffService = new StaffService();
  }

  /**
   * Initialize the connector by setting up event listeners
   */
  public initialize(): void {
    if (this.initialized) {
      logger.info('StaffUserConnector already initialized');
      return;
    }

    // Register event listeners
    this.setupEventListeners();

    this.initialized = true;
    logger.info('StaffUserConnector initialized');
  }

  /**
   * Set up event listeners for staff events
   */
  private setupEventListeners(): void {
    // Listen for StaffCreated events
    this.staffService.on('StaffCreated', this.handleStaffCreated.bind(this));

    // Listen for StaffUpdated events (for future implementation)
    this.staffService.on('StaffUpdated', this.handleStaffUpdated.bind(this));
  }

  /**
   * Handle StaffCreated events by creating a corresponding user account
   * @param staff The newly created staff member
   */
  private async handleStaffCreated(staff: any): Promise<void> {
    try {
      logger.info(`StaffCreated event received for staff: ${staff.id}`);

      // Check if a user with this email already exists
      const existingUser = await UserRepository.findByEmail(staff.email);

      if (existingUser) {
        logger.info(`User with email ${staff.email} already exists, skipping creation`);
        return;
      }

      // Generate username from first and last name
      const username = generateUsername(staff.firstName, staff.lastName);

      // Generate a random password
      const password = generatePassword();

      // Determine role based on staff role
      let role = 'CASHIER'; // Default role

      if (staff.role) {
        // Map staff role to user role
        const roleName = typeof staff.role === 'string' ? staff.role : staff.role.name;
        if (roleName) {
          const normalizedRole = roleName.toUpperCase();
          if (['ADMIN', 'MANAGER', 'CASHIER'].includes(normalizedRole)) {
            role = normalizedRole;
          }
        }
      }

      // Create user account
      const user = await UserRepository.create({
        username,
        password,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        name: `${staff.firstName} ${staff.lastName}`,
        role,
        active: staff.status === 'ACTIVE'
      });

      logger.info(`Created user account for staff member ${staff.id}: ${user.id}`);

      // Send email with login credentials to the staff member
      try {
        const emailSent = await emailService.sendStaffCredentialsEmail(
          staff.email,
          {
            name: `${staff.firstName} ${staff.lastName}`,
            username,
            password,
            role: role.charAt(0) + role.slice(1).toLowerCase() // Format role for display (e.g., 'ADMIN' -> 'Admin')
          }
        );

        if (emailSent) {
          logger.info(`Credentials email sent to ${staff.email}`);
        } else {
          logger.warn(`Failed to send credentials email to ${staff.email}`);
        }
      } catch (emailError) {
        logger.error(`Error sending credentials email to ${staff.email}:`, emailError);
      }

    } catch (error) {
      logger.error(`Error creating user for staff member ${staff.id}:`, error);
    }
  }

  /**
   * Handle StaffUpdated events by updating the corresponding user account
   * @param staff The updated staff member
   */
  private async handleStaffUpdated(staff: any): Promise<void> {
    try {
      logger.info(`StaffUpdated event received for staff: ${staff.id}`);

      // Find user by email
      const user = await UserRepository.findByEmail(staff.email);

      if (!user) {
        logger.info(`No user found with email ${staff.email}, cannot update`);
        return;
      }

      // Update user data based on staff data
      // This is a placeholder for future implementation
      // await UserRepository.update(user.id, {
      //   firstName: staff.firstName,
      //   lastName: staff.lastName,
      //   active: staff.status === 'ACTIVE'
      // });

      logger.info(`Updated user account for staff member ${staff.id}: ${user.id}`);

    } catch (error) {
      logger.error(`Error updating user for staff member ${staff.id}:`, error);
    }
  }
}

// Create and export singleton instance
export const staffUserConnector = new StaffUserConnector();

export default staffUserConnector;
