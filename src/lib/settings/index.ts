// Export all settings-related types and utilities
export * from './types';
export * from './base-settings-service';
export * from './settings-factory';
export * from './settings-cache';

// Export a convenience function for creating settings services
import { SettingsFactory } from './settings-factory';
import { SettingsService, SettingsServiceOptions } from './types';

/**
 * Create a settings service for the specified module
 * Convenience function that uses the SettingsFactory
 * 
 * @param module The module name
 * @param options Configuration options for the service
 * @returns A settings service instance
 */
export function createSettingsService<T extends Record<string, any>>(
  module: string,
  options: Omit<SettingsServiceOptions<T>, 'module'>
): SettingsService<T> {
  return SettingsFactory.getService<T>(module, { ...options, module });
}
