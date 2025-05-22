/**
 * Auth Services
 *
 * This module exports all services for the auth feature.
 * The enhanced-auth-service is now the standard implementation.
 */

// Import enhanced services
import enhancedAuthService from './enhanced-auth-service';
import { factoryPinAuthService } from './factory-pin-auth-service';

// Import legacy services for backward compatibility
import { authService as legacyAuthService } from './authService';
import { pinAuthService as legacyPinAuthService } from './pinAuthService';
import { factoryAuthService } from './factory-auth-service';

// Export enhanced service as the primary auth service
export const authService = enhancedAuthService;

// Continue using factory-based PIN auth service
export const pinAuthService = factoryPinAuthService;

// Export legacy services with deprecation warnings
/**
 * @deprecated Use the enhanced authService from index.ts instead
 */
export const legacyFactoryAuthService = factoryAuthService;

/**
 * @deprecated Use the enhanced authService from index.ts instead
 */
export { legacyAuthService };

/**
 * @deprecated Use the factory-based pinAuthService from index.ts instead
 */
export { legacyPinAuthService };

// Export default for backward compatibility
export default enhancedAuthService;
