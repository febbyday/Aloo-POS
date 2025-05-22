import { useEffect } from 'react';
import { settingsCache } from './settings-cache';
import { createSettingsService } from './index';

// List of commonly used settings modules that should be preloaded
// These are the settings that are most likely to be accessed frequently
// Prioritized by importance and frequency of access
const PRELOAD_MODULES = [
  // High priority - load these first
  'appearance',
  'theme',

  // Medium priority - only load these if needed
  'company',
  'system',
  'security',

  // Lower priority - only load on demand
  // 'notification',
  // 'receipt',
  // 'email'
];

// Use a more conservative batched preloading approach to prevent UI freezing
const BATCH_SIZE = 2; // Load only 2 modules at a time (reduced from 3)
const BATCH_DELAY = 800; // 800ms between batches (increased from 300ms)
const INITIAL_DELAY = 1000; // 1000ms before starting preload (increased from 500ms)

/**
 * Component that preloads frequently used settings
 * This helps improve performance by loading settings in the background
 * before they are needed by specific settings pages
 */
export function SettingsPreloader() {
  useEffect(() => {
    // Check if we're in a settings page - only preload if we're actually in settings
    const isSettingsPage = window.location.pathname.includes('/settings');
    if (!isSettingsPage) {
      return; // Don't preload if we're not in settings
    }

    // Get the most frequently accessed modules from the cache
    const frequentModules = settingsCache.getFrequentlyAccessedModules();

    // Prioritize only high priority modules and frequently accessed ones
    // This reduces the initial load significantly
    const highPriorityModules = PRELOAD_MODULES.slice(0, 2); // Just appearance and theme
    const modulesToPreload = [...new Set([...highPriorityModules, ...frequentModules])];

    // Check which modules are already in cache and don't need preloading
    const modulesNeedingPreload = modulesToPreload.filter(module => {
      const cacheKey = `settings_${module}`;
      return !settingsCache.get(cacheKey);
    });

    // Skip preloading if all modules are already cached
    if (modulesNeedingPreload.length === 0) {
      return;
    }

    // Use a more efficient sequential preloading approach to prevent UI blocking
    let currentIndex = 0;
    let preloadTimerId: number | null = null;

    const preloadNext = () => {
      if (currentIndex >= modulesNeedingPreload.length) {
        return; // Done preloading
      }

      const module = modulesNeedingPreload[currentIndex];
      currentIndex++;

      // Create a temporary service for this module
      const service = createSettingsService(module, {
        defaultSettings: {},
        apiEndpoint: `settings/${module}`,
        cacheable: true
      });

      // Load one module at a time
      service.getSettings()
        .then(() => console.log(`Preloaded settings for ${module}`))
        .catch(error => console.warn(`Failed to preload settings for ${module}:`, error))
        .finally(() => {
          // Schedule the next module with a delay
          preloadTimerId = window.setTimeout(preloadNext, BATCH_DELAY);
        });
    };

    // Start preloading after initial delay
    const initialTimerId = window.setTimeout(preloadNext, INITIAL_DELAY);

    // Cleanup function to prevent memory leaks
    return () => {
      window.clearTimeout(initialTimerId);
      if (preloadTimerId) {
        window.clearTimeout(preloadTimerId);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
