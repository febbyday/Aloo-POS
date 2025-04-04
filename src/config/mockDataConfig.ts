// This file controls mock data settings across the application
// Set to false to use real API data or true to use mock data

// Main flag that controls mock data usage
export const useMockData = false;

// Module names type
type ModuleName = 'roles' | 'staff' | 'inventory' | 'sales' | 'customers' | 'reports' | 'settings' | 'employment-types' | 'employment-statuses';

// Module-specific mock data flags
interface MockModuleConfig {
  [key: string]: boolean;
}

// Mock data configuration type
interface MockDataConfig {
  useMockData: boolean;
  modules: Record<ModuleName, boolean>;
  shouldUseMockData: (module?: ModuleName) => boolean;
}

// Module-specific mock data flags - all inherit from the main flag
export const mockDataConfig: MockDataConfig = {
  // Global setting
  useMockData: useMockData,
  
  // Module-specific settings (override if needed)
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
  
  // Helper function to check if mock data should be used for a specific module
  shouldUseMockData: (module?: ModuleName) => {
    // If no module specified, return global setting
    if (!module) return mockDataConfig.useMockData;
    
    // If module specified, check module-specific setting (or fall back to global)
    return mockDataConfig.modules[module];
  }
}; 