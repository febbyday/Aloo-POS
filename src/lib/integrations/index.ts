/**
 * Integrations Module Index
 * 
 * This file exports all the components, hooks, and utilities from the integrations module
 */

// Export service integrator
import { serviceIntegrator } from './service-integrator';
export { serviceIntegrator };

// Export hooks
import { useServiceIntegration } from './hooks/useServiceIntegration';
export { useServiceIntegration };

// Export default object with all components
export default {
  integrator: serviceIntegrator,
  hooks: {
    useServiceIntegration,
  },
};
