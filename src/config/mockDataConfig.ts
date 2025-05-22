// This file controls mock data settings across the application
// All mock data has been removed from the application
// This file is kept for backward compatibility

// Main flag that controls mock data usage - always false
export const useMockData = false;

// Module names type
type ModuleName = 'roles' | 'staff' | 'inventory' | 'sales' | 'customers' | 'reports' | 'settings' | 'employment-types' | 'employment-statuses';

// Mock data configuration type
interface MockDataConfig {
  useMockData: boolean;
  modules: Record<ModuleName, boolean>;
  shouldUseMockData: () => boolean;
}

// Module-specific mock data flags - all set to false
export const mockDataConfig: MockDataConfig = {
  // Global setting
  useMockData: false,

  // Module-specific settings - all false
  modules: {
    roles: false,
    staff: false,
    inventory: false,
    sales: false,
    customers: false,
    reports: false,
    settings: false,
    'employment-types': false,
    'employment-statuses': false
  },

  // Helper function to check if mock data should be used - always returns false
  shouldUseMockData(): boolean {
    return false;
  }
};