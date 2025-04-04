// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

/**
 * Role Setup Utility
 * 
 * This script helps set up initial roles in the backend for development
 */

import { roleService } from '../services/roleService';
import { authService } from '@/features/auth/services/authService';
import { ApiHealth, ApiStatus } from '@/lib/api/api-health';
import { apiClient } from '@/lib/api/api-client';
import { AUTH_EVENTS } from '@/features/auth/types/auth.types';
import { permissionTemplates } from '../types/permissions';
import { apiConfig } from '@/lib/api/config';

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

// Default roles for offline/development mode
const DEFAULT_ROLES = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full system access',
    permissions: permissionTemplates.administrator,
    isActive: true
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Store management access',
    permissions: permissionTemplates.storeManager,
    isActive: true
  },
  {
    id: '3',
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
      console.log('API is not available, using development fallback for roles');
      
      if (isDevelopment) {
        // In development mode, just store the default roles in localStorage
        localStorage.setItem('default_roles', JSON.stringify(DEFAULT_ROLES));
        console.log('Development fallback: Default roles stored locally');
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, { 
          roles: DEFAULT_ROLES.map(r => r.name),
          mode: 'development-fallback'
        });
      } else {
        console.log('API is not available and not in development mode, aborting role setup');
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.SKIPPED, { reason: 'API not available' });
      }
      return;
    }
    
    // Initial delay to ensure token is settled
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try a direct ping to verify API responsiveness
    try {
      const pingResult = await apiHealth.ping();
      if (!pingResult) {
        console.log('API ping failed, using development fallback');
        if (isDevelopment) {
          localStorage.setItem('default_roles', JSON.stringify(DEFAULT_ROLES));
          dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, { 
            roles: DEFAULT_ROLES.map(r => r.name),
            mode: 'development-fallback'
          });
        } else {
          dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.SKIPPED, { reason: 'API ping failed' });
        }
        return;
      }
    } catch (pingError) {
      console.error('Error pinging API:', pingError);
      if (isDevelopment) {
        localStorage.setItem('default_roles', JSON.stringify(DEFAULT_ROLES));
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, { 
          roles: DEFAULT_ROLES.map(r => r.name),
          mode: 'development-fallback'
        });
      } else {
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.SKIPPED, { reason: 'API ping error' });
      }
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
          const existingRole = existingRoles.find(r => r.name.toLowerCase() === role.name.toLowerCase());
          
          if (existingRole) {
            console.log(`Updating existing role: ${role.name}`);
            await roleService.updateRole(existingRole.id, {
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
          if (isDevelopment) {
            console.log(`Development fallback: Using default role for ${role.name}`);
          } else {
            dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, { 
              error: `Error setting up role ${role.name}`,
              originalError: roleError.message
            });
          }
        }
      }
      
      console.log('Default roles setup completed successfully');
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, { roles: defaultRoles.map(r => r.name) });
      
    } catch (rolesError: any) {
      console.error('Error setting up default roles:', rolesError);
      
      if (isDevelopment) {
        console.log('Using development fallback for roles');
        localStorage.setItem('default_roles', JSON.stringify(DEFAULT_ROLES));
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, { 
          roles: DEFAULT_ROLES.map(r => r.name),
          mode: 'development-fallback'
        });
      } else {
        dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, { 
          error: 'Error setting up default roles',
          originalError: rolesError.message
        });
      }
    }
    
  } catch (error) {
    console.error('Error setting up default roles:', error);
    
    if (isDevelopment) {
      console.log('Using development fallback for roles due to error');
      localStorage.setItem('default_roles', JSON.stringify(DEFAULT_ROLES));
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.COMPLETED, { 
        roles: DEFAULT_ROLES.map(r => r.name),
        mode: 'development-fallback'
      });
    } else {
      // Check if error is related to authentication
      const errorMessage = error instanceof Error ? error.message : String(error);
      dispatchRoleSetupEvent(ROLES_SETUP_EVENTS.FAILED, { 
        error: 'Error setting up default roles',
        originalError: errorMessage
      });
    }
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