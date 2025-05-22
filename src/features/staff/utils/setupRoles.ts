/**
 * Role Setup Utility
 *
 * This script helps set up initial roles in the backend for development
 */

import { roleService } from '@/features/users/services';
import { authService } from '@/features/auth/services/authService';
import { ApiHealth, ApiStatus } from '@/lib/api/api-health';
import { apiClient } from '@/lib/api/api-client';
import { AUTH_EVENTS } from '@/features/auth/types/auth.types';
import { permissionTemplates } from '@/features/users/types/permissions';
import { CreateRoleData } from '@/features/users/types/role';
import { permissionsToStringArray } from '@/shared/utils/permissionUtils';

// Initialize API health monitoring
const apiHealth = new ApiHealth(apiClient);

// Development mode check
const isDevelopment = import.meta.env.MODE === 'development';

// Event name constants
const ROLES_SETUP_EVENTS = {
  STARTED: 'roles:setup:started',
  COMPLETED: 'roles:setup:completed',
  FAILED: 'roles:setup:failed',
  SKIPPED: 'roles:setup:skipped'
};

// Define default roles to create if they don't exist in the database
interface DefaultRole extends CreateRoleData {
  name: string;
  description: string;
  permissions: Record<string, any>;
  isActive: boolean;
}

const DEFAULT_ROLES: DefaultRole[] = [
  {
    name: 'Admin',
    description: 'Full system access',
    permissions: permissionTemplates.administrator,
    isActive: true
  },
  {
    name: 'Manager',
    description: 'Store management access',
    permissions: permissionTemplates.storeManager,
    isActive: true
  },
  {
    name: 'Cashier',
    description: 'Sales and basic inventory access',
    permissions: permissionTemplates.cashier,
    isActive: true
  }
];

/**
 * Dispatch role setup event
 */
function dispatchRoleSetupEvent(eventName: string, detail: Record<string, any> = {}): void {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(eventName, {
      detail: {
        timestamp: new Date().toISOString(),
        ...detail
      }
    });

    window.dispatchEvent(event);
    console.log(`Role Setup: Dispatched ${eventName} event`, detail);
  }
}

/**
 * Set up default roles for the system
 */
export async function setupDefaultRoles(): Promise<void> {
  try {
    console.log('Preparing to set up default roles...');
    dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.STARTED);

    // First, check if user is authenticated
    if (!authService.isAuthenticated()) {
      console.log('User is not authenticated, skipping role setup');
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.SKIPPED, { reason: 'Not authenticated' });
      return;
    }

    // Check API availability first
    const apiAvailable = apiHealth.getStatus() === ApiStatus.AVAILABLE;
    if (!apiAvailable) {
      console.log('API is not available, but roles must use real API data');

      // Even in development mode, don't use mock data for roles
      console.log('Roles require a real API connection - no fallback available');
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, {
        reason: 'API not available',
        message: 'Real API connection is required for roles'
      });
      return;
    }

    // Initial delay to ensure token is settled
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Try a direct ping to verify API responsiveness
    try {
      const pingResult = await apiHealth.ping();
      if (!pingResult) {
        console.log('API ping failed, roles require a real API connection');
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, {
          reason: 'API ping failed',
          message: 'Roles require a real API connection - no fallback available'
        });
        return;
      }
    } catch (pingError) {
      console.error('Error pinging API:', pingError);
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, {
        reason: 'API ping error',
        message: 'Roles require a real API connection - no fallback available'
      });
      return;
    }

    // Validate token with exponential backoff retry strategy
    let attempt = 1;
    const maxAttempts = 3;
    let isTokenValid = false;

    while (attempt <= maxAttempts && !isTokenValid) {
      try {
        console.log(`Validating token, attempt ${attempt}/${maxAttempts}`);
        isTokenValid = await authService.checkTokenValidity();

        if (isTokenValid) {
          console.log('Token is valid, proceeding with role setup');
          break;
        } else {
          // If token validation fails, but we're in early attempts, try a refresh
          if (attempt < maxAttempts) {
            console.log('Token validation failed, attempting refresh');
            const refreshed = await authService.refreshToken();
            if (refreshed) {
              console.log('Token refreshed successfully, will retry validation');
              // Add delay before next attempt
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      } catch (error) {
        console.warn(`Token validation error on attempt ${attempt}:`, error);
      }

      // Exponential backoff before retry (1s, 2s, 4s, etc.)
      const backoffTime = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      attempt++;
    }

    if (!isTokenValid) {
      console.log('Failed to validate token after multiple attempts');

      if (isDevelopment) {
        console.log('Using development fallback for roles');
        localStorage.setItem('default_roles', JSON.stringify(DEFAULT_ROLES));
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, {
          roles: DEFAULT_ROLES.map(r => r.name),
          mode: 'development-fallback'
        });
      } else {
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.SKIPPED, { reason: 'Token validation failed' });
      }
      return;
    }

    console.log('Setting up default roles...');

    // Get existing roles
    try {
      const existingRoles = await roleService.getAllRoles();

      // Define default roles with permissions
      const defaultRoles = [
        {
          name: 'Admin',
          description: 'Full system access',
          permissions: permissionTemplates.administrator,
          isActive: true
        },
        {
          name: 'Manager',
          description: 'Store management access',
          permissions: permissionTemplates.storeManager,
          isActive: true
        },
        {
          name: 'Cashier',
          description: 'Sales and basic inventory access',
          permissions: permissionTemplates.cashier,
          isActive: true
        }
      ];

      // Create or update each role
      for (const role of defaultRoles) {
        try {
          // Type assertion to tell TypeScript that existingRoles elements have name property
          const existingRole = existingRoles.find(r => {
            const typedRole = r as unknown as { name: string, id: string };
            return typedRole.name.toLowerCase() === role.name.toLowerCase();
          });

          if (existingRole) {
            // Type assertion for existingRole to access its id property
            const typedExistingRole = existingRole as unknown as { id: string };
            console.log(`Updating existing role: ${role.name}`);
            await roleService.updateRole(typedExistingRole.id, {
              name: role.name,
              description: role.description,
              permissions: role.permissions,
              isActive: role.isActive
            });
          } else {
            console.log(`Creating new role: ${role.name}`);
            await roleService.createRole({
              name: role.name,
              description: role.description,
              permissions: role.permissions,
              isActive: role.isActive
            });
          }
        } catch (roleError: any) {
          console.error(`Error setting up role ${role.name}:`, roleError);

          // Always fail if there's an error - no fallbacks to mock data
          dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, {
            error: `Error setting up role ${role.name}`,
            message: 'Real API connection required - no fallback available',
            originalError: roleError.message
          });

          // Continue trying to set up other roles
          continue;
        }
      }

      console.log('Default roles setup completed successfully');
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, { roles: defaultRoles.map(r => r.name) });

    } catch (rolesError: any) {
      console.error('Error setting up default roles:', rolesError);

      // Never fall back to mock data - always require real API data
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, {
        error: 'Error setting up default roles',
        message: 'Real API connection required - no fallback available',
        originalError: rolesError.message
      });
    }
  } catch (error) {
    console.error('Error setting up default roles:', error);

    // Never use mock data fallbacks for roles, always require real API data
    const errorMessage = error instanceof Error ? error.message : String(error);
    dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, {
      error: 'Error setting up default roles',
      message: 'Roles require a real API connection - no fallback available',
      originalError: errorMessage
    });
  }
}

/**
 * Initialize roles manually if needed
 */
export function initRoles(): void {
  if (typeof window !== 'undefined') {
    setupDefaultRoles().catch(err => {
      console.error('Error initializing roles:', err);
    });
  }
}

// Set up event listeners for authentication events
if (typeof window !== 'undefined') {
  // Listen for authentication success to trigger role setup
  window.addEventListener(AUTH_EVENTS.LOGIN_SUCCESS, () => {
    console.log('Authentication successful, setting up roles...');

    // Delay role setup to ensure authentication is complete
    setTimeout(() => {
      setupDefaultRoles().catch(err => {
        console.error('Error setting up roles after login:', err);
      });
    }, 2000); // Increased timeout to allow for API connection attempts
  });
}