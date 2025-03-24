/**
 * Customers Module Structure
 * 
 * /features/customers/
 * ├── components/          # UI Components
 * ├── pages/              # Route Pages
 * ├── hooks/              # Custom Hooks
 * ├── services/           # Business Logic
 * ├── utils/              # Helper Functions
 * ├── context/            # State Management
 * └── types/              # Type Definitions
 */

// Core exports
export * from './pages/CustomersPage';
export * from './hooks/useCustomers';
export * from './services/customerService';

// Type definitions
export type { 
  Customer,
  CustomerFilter,
  CustomerGroup,
  CustomerSettings
} from './types';

// Context providers
export { 
  CustomersProvider,
  useCustomersContext 
} from './context/CustomersContext';

