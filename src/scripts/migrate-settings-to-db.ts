/**
 * Settings Migration Script
 * 
 * This script migrates settings from localStorage to the database.
 * It should be run in the browser environment.
 */

import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { SettingsFactory } from '@/lib/settings/settings-factory';

interface MigrationResult {
  module: string;
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Get all settings modules from localStorage
 * Identifies settings by the 'settings_' prefix
 */
function getSettingsModulesFromLocalStorage(): string[] {
  const modules: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('settings_')) {
      // Extract module name from the key (remove 'settings_' prefix)
      const module = key.substring(9);
      modules.push(module);
    }
  }
  
  return modules;
}

/**
 * Get settings data from localStorage for a specific module
 */
function getSettingsFromLocalStorage(module: string): any {
  const key = `settings_${module}`;
  const data = localStorage.getItem(key);
  
  if (!data) {
    return null;
  }
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing settings for module ${module}:`, error);
    return null;
  }
}

/**
 * Migrate settings for a specific module to the database
 */
async function migrateModuleSettings(module: string): Promise<MigrationResult> {
  try {
    // Get settings from localStorage
    const settings = getSettingsFromLocalStorage(module);
    
    if (!settings) {
      return {
        module,
        success: false,
        message: `No settings found in localStorage for module ${module}`,
      };
    }
    
    // Send settings to the API
    await enhancedApiClient.post(
      'settings/MIGRATE',
      { settings },
      { module },
      {
        retry: {
          retries: 2,
          retryDelay: 1000,
        },
      }
    );
    
    return {
      module,
      success: true,
      message: `Successfully migrated settings for module ${module}`,
      data: settings,
    };
  } catch (error) {
    console.error(`Error migrating settings for module ${module}:`, error);
    return {
      module,
      success: false,
      message: `Error migrating settings for module ${module}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Migrate all settings from localStorage to the database
 */
export async function migrateAllSettings(): Promise<MigrationResult[]> {
  // Clear the settings factory instances to ensure we're working with fresh data
  SettingsFactory.clearInstances();
  
  // Get all modules from localStorage
  const modules = getSettingsModulesFromLocalStorage();
  
  if (modules.length === 0) {
    console.log('No settings found in localStorage');
    return [];
  }
  
  console.log(`Found ${modules.length} settings modules in localStorage:`, modules);
  
  // Migrate each module's settings
  const results: MigrationResult[] = [];
  
  for (const module of modules) {
    console.log(`Migrating settings for module ${module}...`);
    const result = await migrateModuleSettings(module);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ ${result.message}`);
    }
  }
  
  // Log overall results
  const successCount = results.filter(r => r.success).length;
  console.log(`Migration complete. ${successCount}/${results.length} modules migrated successfully.`);
  
  return results;
}

/**
 * Migrate settings for specific modules
 */
export async function migrateSpecificModules(modules: string[]): Promise<MigrationResult[]> {
  // Clear the settings factory instances to ensure we're working with fresh data
  SettingsFactory.clearInstances();
  
  if (modules.length === 0) {
    console.log('No modules specified for migration');
    return [];
  }
  
  console.log(`Migrating settings for ${modules.length} specified modules:`, modules);
  
  // Migrate each specified module's settings
  const results: MigrationResult[] = [];
  
  for (const module of modules) {
    console.log(`Migrating settings for module ${module}...`);
    const result = await migrateModuleSettings(module);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ ${result.message}`);
    }
  }
  
  // Log overall results
  const successCount = results.filter(r => r.success).length;
  console.log(`Migration complete. ${successCount}/${results.length} modules migrated successfully.`);
  
  return results;
}
