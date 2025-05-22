import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/toast';
import { Progress } from '@/components/ui/progress';

// Define migration functions directly in this file since the scripts directory might not exist
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
async function migrateAllSettings(): Promise<MigrationResult[]> {
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
async function migrateSpecificModules(modules: string[]): Promise<MigrationResult[]> {
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
};

// No Typography import needed

/**
 * Settings Migration Tool Component
 *
 * This component provides a UI for migrating settings from localStorage to the database.
 */
const SettingsMigrationTool: React.FC = () => {
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState<MigrationResult[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // Get all settings modules from localStorage
  const loadAvailableModules = () => {
    const modules: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('settings_')) {
        // Extract module name from the key (remove 'settings_' prefix)
        const module = key.substring(9);
        modules.push(module);
      }
    }

    setAvailableModules(modules);
    // By default, select all modules
    setSelectedModules(modules);
  };

  // Handle migration of all settings
  const handleMigrateAll = async () => {
    try {
      setMigrating(true);
      setResults([]);
      setProgress(0);

      const results = await migrateAllSettings();
      setResults(results);

      const successCount = results.filter(r => r.success).length;
      if (successCount === results.length) {
        toast.success(`Successfully migrated all ${results.length} settings modules`);
      } else {
        toast.warning(`Migrated ${successCount} out of ${results.length} settings modules`);
      }
    } catch (error) {
      console.error('Error during migration:', error);
      toast.error('Error during migration. See console for details.');
    } finally {
      setMigrating(false);
      setProgress(100);
    }
  };

  // Handle migration of selected settings
  const handleMigrateSelected = async () => {
    if (selectedModules.length === 0) {
      toast.warning('Please select at least one module to migrate');
      return;
    }

    try {
      setMigrating(true);
      setResults([]);
      setProgress(0);

      const results = await migrateSpecificModules(selectedModules);
      setResults(results);

      const successCount = results.filter(r => r.success).length;
      if (successCount === results.length) {
        toast.success(`Successfully migrated ${results.length} selected settings modules`);
      } else {
        toast.warning(`Migrated ${successCount} out of ${results.length} selected settings modules`);
      }
    } catch (error) {
      console.error('Error during migration:', error);
      toast.error('Error during migration. See console for details.');
    } finally {
      setMigrating(false);
      setProgress(100);
    }
  };

  // Handle module selection change
  const handleModuleSelectionChange = (module: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, module]);
    } else {
      setSelectedModules(prev => prev.filter(m => m !== module));
    }
  };

  // Select or deselect all modules
  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedModules([...availableModules]);
    } else {
      setSelectedModules([]);
    }
  };

  // Load available modules when component mounts
  React.useEffect(() => {
    loadAvailableModules();
  }, []);

  return (
    <Card className="max-w-[800px] mx-auto">
      <CardHeader>
        <CardTitle>Settings Migration Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          This tool migrates settings from localStorage to the database.
          This is a one-time operation that should be performed after upgrading to the new settings architecture.
        </p>

        <Separator />

        <div>
          <h4 className="text-lg font-semibold mb-2">Available Modules</h4>
          <p className="text-sm text-muted-foreground mb-4">
            The following settings modules were found in localStorage:
          </p>

          {availableModules.length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedModules.length === availableModules.length}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </label>
              </div>

              <div className="border rounded-md divide-y">
                {availableModules.map(module => (
                  <div key={module} className="p-3 flex items-center gap-2">
                    <Checkbox
                      id={`module-${module}`}
                      checked={selectedModules.includes(module)}
                      onCheckedChange={(checked) => handleModuleSelectionChange(module, !!checked)}
                    />
                    <label
                      htmlFor={`module-${module}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {module}
                    </label>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm">No settings modules found in localStorage.</p>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={handleMigrateSelected}
              disabled={availableModules.length === 0 || selectedModules.length === 0 || migrating}
            >
              {migrating ? 'Migrating...' : 'Migrate Selected Modules'}
            </Button>

            <Button
              variant="outline"
              onClick={handleMigrateAll}
              disabled={availableModules.length === 0 || migrating}
            >
              {migrating ? 'Migrating...' : 'Migrate All Modules'}
            </Button>
          </div>

          {migrating && (
            <Progress value={progress} className="w-full" />
          )}
        </div>

        {results.length > 0 && (
          <>
            <Separator />

            <div>
              <h4 className="text-lg font-semibold mb-2">Migration Results</h4>
              <div className="border rounded-md divide-y">
                {results.map((result, index) => (
                  <div key={index} className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <span className="text-green-500">✅ Success</span>
                      ) : (
                        <span className="text-red-500">❌ Failed</span>
                      )}
                      <span className="font-medium">{result.module}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingsMigrationTool;
