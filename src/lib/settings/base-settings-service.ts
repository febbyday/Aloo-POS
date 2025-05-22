import { z } from 'zod';
import { SettingsMetadata, SettingsService, SettingsServiceOptions, StorageType } from './types';
import { settingsCache } from './settings-cache';
import { enhancedApiClient } from '../api/enhanced-api-client';
import { ApiError } from '../api/error-handler';

/**
 * Base implementation of the SettingsService interface
 * Provides common functionality for all settings services
 */
export class BaseSettingsService<T extends Record<string, any>> implements SettingsService<T> {
  protected readonly module: string;
  protected readonly defaultSettings: T;
  protected readonly schema?: z.ZodSchema<T> | undefined;
  protected readonly apiEndpoint?: string | undefined;
  protected readonly cacheable: boolean;
  protected settings: T | null = null;
  protected storageKey: string;
  protected storageType: StorageType;
  protected syncInProgress: boolean = false;
  protected lastSyncTime: number = 0;
  protected readonly syncThrottleMs: number = 5000; // 5 seconds

  // Add loading state to prevent duplicate load attempts
  private loading: Promise<T> | null = null;

  constructor(options: SettingsServiceOptions<T>) {
    this.module = options.module;
    this.defaultSettings = options.defaultSettings;
    this.schema = options.schema;
    this.apiEndpoint = options.apiEndpoint;
    this.cacheable = options.cacheable ?? true;
    this.storageKey = `settings_${this.module}`;
    this.storageType = this.apiEndpoint ? 'hybrid' : 'local';

    // Set up online/offline event listeners if we're using API
    if (this.apiEndpoint && typeof window !== 'undefined') {
      this.setupNetworkListeners();
    }
  }

  /**
   * Set up network status event listeners
   * These will trigger sync when the network status changes
   */
  private setupNetworkListeners(): void {
    // Handle coming back online
    window.addEventListener('online', this.handleOnline);

    // Handle going offline
    window.addEventListener('offline', this.handleOffline);
  }

  /**
   * Clean up network listeners
   * Call this when the service is no longer needed
   */
  public cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Handle coming back online
   * Sync settings with the API
   */
  private handleOnline = (): void => {
    console.log(`Network is online, syncing settings for ${this.module}`);
    this.syncWithApi().catch(err => {
      console.warn(`Failed to sync settings for ${this.module} after coming online:`, err);
    });
  };

  /**
   * Handle going offline
   * Log the offline status
   */
  private handleOffline = (): void => {
    console.log(`Network is offline, settings for ${this.module} will use localStorage`);
  };

  /**
   * Get the current settings
   * Optimized to prioritize cached and local data for faster loading
   * Syncs with API in the background if needed
   */
  async getSettings(): Promise<T> {
    // If we're already loading settings, return the existing promise to prevent duplicate requests
    if (this.loading) {
      return this.loading;
    }

    // Create a new loading promise with a timeout to prevent UI blocking
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Settings loading timeout')), 5000); // 5 second timeout
    });

    // Create the loading promise
    this.loading = this._loadSettings();

    try {
      // Race the loading promise against the timeout
      const result = await Promise.race([this.loading, timeoutPromise])
        .catch(error => {
          // If timeout occurs, log warning and return defaults or cached data
          if (error.message === 'Settings loading timeout') {
            console.warn(`Loading settings for ${this.module} timed out, using defaults or cached data`);

            // Try to get from cache
            if (this.cacheable) {
              const cached = settingsCache.get<T>(this.storageKey);
              if (cached) return cached;
            }

            // Try to get from localStorage
            const storedSettings = localStorage.getItem(this.storageKey);
            if (storedSettings) {
              try {
                return this.validateSettings(JSON.parse(storedSettings));
              } catch (e) {
                // Ignore parsing errors
              }
            }

            // Return defaults as last resort
            return { ...this.defaultSettings };
          }

          // Re-throw other errors
          throw error;
        });

      return result;
    } finally {
      // Clear the loading promise when done
      this.loading = null;
    }
  }

  /**
   * Safely load settings with performance optimizations
   * This utility method helps prevent UI freezing when loading settings
   * @param callback The function to execute for loading
   * @returns A promise that resolves with the result of the callback
   */
  protected async safeLoadWithTimeout<R>(callback: () => Promise<R>, timeoutMs: number = 5000): Promise<R> {
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    });

    try {
      // Race the callback against the timeout
      return await Promise.race([callback(), timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message === 'Operation timed out') {
        console.warn(`Operation timed out for ${this.module} settings`);
        throw new Error(`Settings operation timed out for ${this.module}`);
      }
      throw error;
    }
  }

  /**
   * Internal method to load settings from various sources
   * This is wrapped by getSettings() to prevent duplicate requests
   */
  private async _loadSettings(): Promise<T> {
    // Try to get from cache first for fastest response
    if (this.cacheable) {
      const cached = settingsCache.get<T>(this.storageKey);
      if (cached) {
        // If we have cached data, use it immediately

        // Update in-memory reference
        this.settings = cached;

        // Then trigger a background refresh if we're online and have an API endpoint
        // but only if the cache hasn't been updated recently (within 60 seconds)
        const cacheStats = settingsCache.getEntryStats(this.storageKey);
        const shouldRefreshInBackground =
          this.apiEndpoint &&
          navigator.onLine &&
          (!cacheStats || Date.now() - cacheStats.lastAccessed > 60000);

        if (shouldRefreshInBackground) {
          // Use requestIdleCallback or setTimeout to make this non-blocking
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
              this.refreshFromApiInBackground().catch(() => {
                // Silent catch - this is just background optimization
              });
            }, { timeout: 2000 });
          } else {
            setTimeout(() => {
              this.refreshFromApiInBackground().catch(() => {
                // Silent catch - this is just background optimization
              });
            }, 300);
          }
        }

        return cached;
      }
    }

    // If we have settings in memory, return them immediately
    if (this.settings) {
      return this.settings;
    }

    // Try to load from localStorage next (still fast)
    const storedSettings = localStorage.getItem(this.storageKey);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        const validated = this.validateSettings(parsed);
        this.settings = validated;

        // Cache the settings
        if (this.cacheable) {
          settingsCache.set(this.storageKey, validated);
        }

        // If we have an API endpoint, trigger a background refresh
        // This ensures we eventually get the latest data without blocking the UI
        if (this.apiEndpoint && navigator.onLine) {
          // Use requestIdleCallback or setTimeout to make this non-blocking
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
              this.refreshFromApiInBackground().catch(() => {
                // Silent catch - this is just background optimization
              });
            }, { timeout: 2000 });
          } else {
            setTimeout(() => {
              this.refreshFromApiInBackground().catch(() => {
                // Silent catch - this is just background optimization
              });
            }, 200);
          }
        }

        return validated;
      } catch (error) {
        console.error(`Error parsing stored settings for ${this.module}:`, error);
      }
    }

    // If we don't have cached or local data, return defaults immediately and refresh in background
    this.settings = { ...this.defaultSettings };

    // If we're online and have an API endpoint, load from API in background
    if (this.apiEndpoint && navigator.onLine) {
      // Use requestIdleCallback or setTimeout to make this non-blocking
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          this.refreshFromApiInBackground().catch(() => {
            // Silent catch - this is just background optimization
          });
        }, { timeout: 2000 });
      } else {
        setTimeout(() => {
          this.refreshFromApiInBackground().catch(() => {
            // Silent catch - this is just background optimization
          });
        }, 100);
      }
    }

    return this.settings;
  }

  /**
   * Refresh settings from API in the background
   * This is used to update cached settings without blocking the UI
   */
  async refreshFromApiInBackground(): Promise<void> {
    // Skip if already refreshing
    if (this._refreshInProgress) {
      return;
    }

    // Skip if no API endpoint or offline
    if (!this.apiEndpoint || !navigator.onLine) {
      return;
    }

    this._refreshInProgress = true;

    try {
      // Use a longer timeout for background operations since they're not blocking the UI
      const apiSettings = await this.safeLoadWithTimeout(
        () => this.loadFromApi(),
        5000 // 5 second timeout for background operations (increased from 3s)
      );

      if (apiSettings) {
        // Update in-memory settings
        this.settings = apiSettings;

        // Update localStorage - do this in a try/catch to handle storage errors
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(apiSettings));
        } catch (storageError) {
          console.warn(`Failed to save settings to localStorage: ${storageError}`);
        }

        // Update cache
        if (this.cacheable) {
          settingsCache.set(this.storageKey, apiSettings);
        }

        // Dispatch an event that settings were updated
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('settings-updated', {
            detail: { module: this.module }
          }));
        }
      }
    } catch (error) {
      // Log as a warning rather than an error - this is a background operation
      // and shouldn't disrupt the user experience
      console.warn(`Background refresh from API failed for ${this.module}:`, error);
    } finally {
      this._refreshInProgress = false;
    }
  }

  // Track if a refresh is in progress to prevent duplicate refreshes
  private _refreshInProgress: boolean = false;

  /**
   * Load settings from the API
   * Optimized with shorter timeouts and better error handling
   * @returns The settings loaded from the API, or null if loading failed
   */
  private async loadFromApi(): Promise<T | null> {
    if (!this.apiEndpoint || !navigator.onLine) {
      return null;
    }

    try {
      // Use our safe loading utility with a timeout to prevent UI blocking
      const response = await enhancedApiClient.get<T>(
        'settings/MODULE',
        { module: this.module },
        {
          retry: {
            maxRetries: 1,             // Maximum number of retry attempts
            initialDelay: 500,         // Initial delay between retries in ms
            maxDelay: 2000,            // Maximum delay between retries
            backoffFactor: 1.5         // Backoff factor for exponential delay
          },
          timeout: 3000,               // 3 second timeout for settings
          cache: 'default'             // Allow browser caching
        }
      );

      // Validate the response data
      const validated = this.validateSettings(response);
      this.settings = validated;

      // Cache the settings
      if (this.cacheable) {
        settingsCache.set(this.storageKey, validated);
      }

      // Also store in localStorage for offline access
      localStorage.setItem(this.storageKey, JSON.stringify(validated));

      return validated;
    } catch (error) {
      // If it's a 404, the settings don't exist yet on the server
      if (error instanceof ApiError && error.status === 404) {
        // This is expected for new settings, don't log as an error
        return null;
      }

      // For timeout errors, log a warning instead of an error
      if (error instanceof ApiError && error.type === 'timeout') {
        console.warn(`Timeout loading settings from API for ${this.module}, using cached/local data`);
      } else if (error instanceof ApiError && error.type === 'network') {
        console.warn(`Network error loading settings for ${this.module}, using cached/local data`);
      } else {
        console.warn(`Error loading settings from API for ${this.module}:`, error);
      }

      return null;
    }
  }

  /**
   * Save the settings
   * Saves to localStorage and API if available
   */
  async saveSettings(settings: T): Promise<void> {
    // Validate the settings
    const validated = this.validateSettings(settings);
    this.settings = validated;

    // Save to localStorage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(validated));
    } catch (error) {
      console.error(`Error saving settings to localStorage for ${this.module}:`, error);
      throw new Error(`Failed to save settings for ${this.module}`);
    }

    // Update cache
    if (this.cacheable) {
      settingsCache.set(this.storageKey, validated);
    }

    // Save to API if available
    if (this.apiEndpoint && navigator.onLine) {
      try {
        await this.syncToApi(validated);
      } catch (error) {
        console.error(`Error saving settings to API for ${this.module}:`, error);
        // Don't throw here - we've already saved to localStorage, so the user can continue working
        // The settings will be synced when they're online again
      }
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<T> {
    // Remove from localStorage
    localStorage.removeItem(this.storageKey);

    // Clear cache
    if (this.cacheable) {
      settingsCache.invalidate(this.storageKey);
    }

    // Reset in-memory settings
    this.settings = { ...this.defaultSettings };

    // Reset in API if available
    if (this.apiEndpoint && navigator.onLine) {
      try {
        await this.syncToApi(this.settings);
      } catch (error) {
        console.error(`Error resetting settings in API for ${this.module}:`, error);
      }
    }

    return this.settings;
  }

  /**
   * Get a specific setting value
   * Optimized to prioritize cached and local data
   */
  async getSettingValue<K extends keyof T>(key: K): Promise<T[K]> {
    // If we have settings in memory, return the value immediately
    if (this.settings && key in this.settings) {
      // Trigger a background refresh if we're online and have an API endpoint
      if (this.apiEndpoint && navigator.onLine) {
        // Use setTimeout to make this non-blocking
        setTimeout(() => {
          this.refreshSettingValueInBackground(key).catch(err => {
            console.warn(`Background refresh of setting ${String(key)} failed:`, err);
          });
        }, 0);
      }
      return this.settings[key];
    }

    // Try to get from cache
    if (this.cacheable) {
      const cached = settingsCache.get<T>(this.storageKey);
      if (cached && key in cached) {
        // If we have settings in cache, use them and trigger a background refresh
        if (this.apiEndpoint && navigator.onLine) {
          setTimeout(() => {
            this.refreshSettingValueInBackground(key).catch(err => {
              console.warn(`Background refresh of setting ${String(key)} failed:`, err);
            });
          }, 0);
        }
        return cached[key];
      }
    }

    // Try to load from localStorage
    const storedSettings = localStorage.getItem(this.storageKey);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        const validated = this.validateSettings(parsed);

        if (key in validated) {
          // Update in-memory settings
          this.settings = validated;

          // Cache the settings
          if (this.cacheable) {
            settingsCache.set(this.storageKey, validated);
          }

          // Trigger a background refresh
          if (this.apiEndpoint && navigator.onLine) {
            setTimeout(() => {
              this.refreshSettingValueInBackground(key).catch(err => {
                console.warn(`Background refresh of setting ${String(key)} failed:`, err);
              });
            }, 0);
          }

          return validated[key];
        }
      } catch (error) {
        console.error(`Error parsing stored settings for ${this.module}:`, error);
      }
    }

    // If we don't have the value locally, try to get it from the API with a short timeout
    if (this.apiEndpoint && navigator.onLine) {
      try {
        // Create a promise that rejects after a short timeout
        const timeoutPromise = new Promise<{ [key: string]: any }>((_, reject) => {
          setTimeout(() => reject(new Error('API request timeout')), 1500); // 1.5 second timeout
        });

        // Race the API request against the timeout
        const response = await Promise.race([
          enhancedApiClient.get<{ [key: string]: any }>(
            'settings/SETTING',
            { module: this.module, key: key as string },
            {
              retry: {
                maxRetries: 0,             // No retries for individual settings
                initialDelay: 0,           // No delay between retries
                maxDelay: 0,               // No maximum delay
                backoffFactor: 1           // No backoff
              },
              cache: 'default'  // Allow browser caching
            }
          ),
          timeoutPromise
        ]);

        if (response && key in response) {
          // Update the in-memory settings with this value
          if (this.settings) {
            this.settings[key] = response[key as string];
          } else {
            // Initialize settings if needed
            this.settings = { ...this.defaultSettings, [key]: response[key as string] };
          }

          // Update localStorage and cache
          if (this.settings) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            if (this.cacheable) {
              settingsCache.set(this.storageKey, this.settings);
            }
          }

          return response[key as string] as T[K];
        }
      } catch (error) {
        // Fall back to default value
        console.warn(`Error or timeout fetching setting ${String(key)} from API for ${this.module}, using default:`, error);
      }
    }

    // Fall back to getting from full settings or default
    if (!this.settings) {
      this.settings = { ...this.defaultSettings };
    }

    return this.settings[key];
  }

  /**
   * Refresh a specific setting value in the background
   * This is used to update cached settings without blocking the UI
   */
  private async refreshSettingValueInBackground<K extends keyof T>(key: K): Promise<void> {
    if (!this.apiEndpoint || !navigator.onLine) {
      return;
    }

    try {
      const response = await enhancedApiClient.get<{ [key: string]: any }>(
        'settings/SETTING',
        { module: this.module, key: key as string },
        {
          retry: {
            maxRetries: 0,             // No retries for background refreshes
            initialDelay: 0,           // No delay between retries
            maxDelay: 0,               // No maximum delay
            backoffFactor: 1           // No backoff
          },
          cache: 'no-cache'  // Get fresh data for background refresh
        }
      );

      if (response && key in response) {
        // Update the in-memory settings with this value
        if (this.settings) {
          this.settings[key] = response[key as string];
        } else {
          // Initialize settings if needed
          this.settings = { ...this.defaultSettings, [key]: response[key as string] };
        }

        // Update localStorage and cache
        if (this.settings) {
          localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
          if (this.cacheable) {
            settingsCache.set(this.storageKey, this.settings);
          }
        }

        // Dispatch an event that the setting was updated
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('setting-updated', {
            detail: { module: this.module, key: key }
          }));
        }
      }
    } catch (error) {
      console.warn(`Background refresh of setting ${String(key)} failed for ${this.module}:`, error);
    }
  }

  /**
   * Update a specific setting value
   */
  async updateSettingValue<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    // Get current settings
    const settings = await this.getSettings();

    // Update the value
    settings[key] = value;

    // Save to localStorage and cache
    localStorage.setItem(this.storageKey, JSON.stringify(settings));
    if (this.cacheable) {
      settingsCache.set(this.storageKey, settings);
    }

    // Update in-memory settings
    this.settings = settings;

    // If we have an API endpoint and we're online, update the specific setting
    if (this.apiEndpoint && navigator.onLine) {
      try {
        await enhancedApiClient.put<any>(
          'settings/UPDATE_SETTING',
          { value },
          { module: this.module, key: key as string },
          {
            retry: {
              maxRetries: 2,
              initialDelay: 1000
            }
          }
        );
      } catch (error) {
        console.error(`Error updating setting ${String(key)} in API for ${this.module}:`, error);
        // Don't throw - we've already updated localStorage
      }
    }
  }

  /**
   * Get metadata about the settings service
   */
  getMetadata(): SettingsMetadata {
    // Create the base metadata object
    const metadata: SettingsMetadata = {
      module: this.module,
      storageType: this.storageType,
      cacheable: this.cacheable,
      syncStatus: {
        syncInProgress: this.syncInProgress,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
      }
    };

    // Only add optional properties if they have values
    if (this.schema) {
      metadata.schema = this.schema;
    }
    
    if (this.settings) {
      metadata.lastUpdated = new Date();
    }
    
    if (this.apiEndpoint) {
      metadata.apiEndpoint = this.apiEndpoint;
    }

    // Add lastSyncTime only if we have a valid time
    if (this.lastSyncTime > 0) {
      if (!metadata.syncStatus) {
        metadata.syncStatus = {
          syncInProgress: this.syncInProgress,
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
        };
      }
      metadata.syncStatus.lastSyncTime = new Date(this.lastSyncTime);
    }

    return metadata;
  }

  /**
   * Validate settings against the schema
   * If no schema is provided, returns the settings as-is
   */
  private validateSettings(settings: unknown): T {
    if (this.schema) {
      try {
        return this.schema.parse(settings);
      } catch (error) {
        console.error(`Validation error for ${this.module} settings:`, error);
        return { ...this.defaultSettings };
      }
    }

    return settings as T;
  }

  /**
   * Force synchronization with the API
   * This can be called to manually trigger a sync
   */
  async syncWithApi(): Promise<boolean> {
    if (!this.apiEndpoint || !navigator.onLine) {
      return false;
    }

    try {
      // First try to get the latest from the API
      const apiSettings = await this.loadFromApi();

      if (apiSettings) {
        // API has settings, use them
        this.settings = apiSettings;
        return true;
      } else {
        // API doesn't have settings yet, push our local settings
        if (this.settings) {
          await this.syncToApi(this.settings);
          return true;
        } else {
          // No local settings either, load them first
          await this.getSettings();
          if (this.settings) {
            await this.syncToApi(this.settings);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error(`Error syncing settings with API for ${this.module}:`, error);
      return false;
    }
  }

  /**
   * Check if settings are in sync with the API
   */
  async checkSyncStatus(): Promise<{ inSync: boolean; localUpdated?: Date; apiUpdated?: Date }> {
    if (!this.apiEndpoint || !navigator.onLine) {
      return { inSync: false };
    }

    try {
      // Get local settings
      const localSettings = await this.getSettings();
      const localJson = JSON.stringify(localSettings);

      // Get API settings
      const apiSettings = await this.loadFromApi();
      if (!apiSettings) {
        return { inSync: false };
      }

      const apiJson = JSON.stringify(apiSettings);

      return {
        inSync: localJson === apiJson,
        localUpdated: new Date(),
        apiUpdated: new Date()
      };
    } catch (error) {
      console.error(`Error checking sync status for ${this.module}:`, error);
      return { inSync: false };
    }
  }

  /**
   * Sync settings to the API
   * @param settings The settings to sync
   */
  private async syncToApi(settings: T): Promise<void> {
    if (!this.apiEndpoint || !navigator.onLine || this.syncInProgress) {
      return;
    }

    // Throttle API calls to prevent too many requests
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncThrottleMs) {
      return;
    }

    this.syncInProgress = true;
    this.lastSyncTime = now;

    try {
      // Use the settings endpoint registry with the module parameter
      await enhancedApiClient.put<T>(
        'settings/UPDATE_MODULE',
        settings,
        { module: this.module },
        {
          retry: {
            maxRetries: 2,
            initialDelay: 1000
          }
        }
      );
    } finally {
      this.syncInProgress = false;
    }
  }
}
