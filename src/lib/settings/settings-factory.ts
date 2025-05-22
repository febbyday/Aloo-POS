import { BaseSettingsService } from './base-settings-service';
import { SettingsService, SettingsServiceOptions } from './types';

/**
 * Factory for creating settings services
 * Ensures that only one instance of a settings service exists per module
 */
export class SettingsFactory {
  private static instances: Map<string, SettingsService<any>> = new Map();
  
  /**
   * Get a settings service for the specified module
   * If the service already exists, returns the existing instance
   * Otherwise, creates a new instance
   * 
   * @param module The module name
   * @param options Configuration options for the service
   * @returns A settings service instance
   */
  static getService<T extends Record<string, any>>(
    module: string, 
    options: SettingsServiceOptions<T>
  ): SettingsService<T> {
    if (!this.instances.has(module)) {
      this.instances.set(
        module, 
        new BaseSettingsService<T>({ ...options, module })
      );
    }
    
    return this.instances.get(module) as SettingsService<T>;
  }
  
  /**
   * Clear all service instances
   * Useful for testing or when reloading the application
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}
