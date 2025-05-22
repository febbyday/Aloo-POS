/**
 * @deprecated This config file is deprecated. Use the factory-based config instead.
 * Import from factory-config.ts:
 * import { SHOPS_CONFIG } from './factory-config';
 */

import { SHOPS_CONFIG as FactoryShopsConfig } from './factory-config';

// Re-export the factory-based config
export const SHOPS_CONFIG = FactoryShopsConfig;

export default SHOPS_CONFIG;
