/**
 * Batch-Enabled Settings Service
 * 
 * This module provides a settings service that uses batch requests
 * during initialization to improve performance.
 */

import { z } from 'zod';
import { useServiceBatchInit } from '../hooks/useServiceBatchInit';
import { RequestPriority } from '../api/initialization-batch-manager';
import { logger } from '../logging/logger';
import { performanceMonitor } from '../performance/performance-monitor';
import { settingsCache } from './settings-cache';

export interface BatchSettingsServiceOptions<T> {
  /**
   * Module name for the settings
   */
  module: string;
  
  /**
   * Default settings to use if none are found
   */
  defaultSettings: T;
  
  /**
   * Zod schema for validating settings
   */
  schema: z.ZodType<T>;
  
  /**
   * API endpoint for the settings
   */
  apiEndpoint?: string;
  
  /**
   * Whether to cache the settings
   * Default: true
   */
  cacheable?: boolean;
  
  /**
   * Default priority for requests
   * Default: RequestPriority.MEDIUM
   */
  defaultPriority?: RequestPriority;
}

/**
 * Batch-enabled settings service
 */
export class BatchSettingsService<T extends Record<string, any>> {
  private module: string;
  private defaultSettings: T;
  private schema: z.ZodType<T>;
  private apiEndpoint?: string;
  private cacheable: boolean;
  private storageKey: string;
  private settings: T | null = null;
  private defaultPriority: RequestPriority;
  
  // Add loading state to prevent duplicate load attempts
  private loading: Promise<T> | null = null;
  
  // Add sync throttling to prevent too many API calls
  private syncInProgress = false;
  private lastSyncTime = 0;
  private syncThrottleMs = 2000; // 2 seconds
  
  /**
   * Create a new batch-enabled settings service
   * 
   * @param options Settings service options
   */
  constructor(options: BatchSettingsServiceOptions<T>) {
    this.module = options.module;
    this.defaultSettings = options.defaultSettings;
    this.schema = options.schema;
    this.apiEndpoint = options.apiEndpoint;
    this.cacheable = options.cacheable ?? true;
    this.storageKey = `settings_${this.module}`;
    this.defaultPriority = options.defaultPriority ?? RequestPriority.MEDIUM;
    
    logger.debug(`Created batch-enabled settings service: ${this.module}`, { 
      module: this.module,
      apiEndpoint: this.apiEndpoint,
      cacheable: this.cacheable
    });
  }
  
  /**
   * Get settings
   * 
   * @returns Promise that resolves with the settings
   */
  async getSettings(): Promise<T> {
    // If we already have settings, return them
    if (this.settings) {
      return this.settings;
    }
    
    // If we're already loading settings, return the promise
    if (this.loading) {
      return this.loading;
    }
    
    // Start loading settings
    this.loading = this.loadSettings();
    
    try {
      // Wait for settings to load
      const settings = await this.loading;
      return settings;
    } finally {
      // Clear loading state
      this.loading = null;
    }
  }
  
  /**
   * Load settings
   * 
   * @returns Promise that resolves with the settings
   */
  private async loadSettings(): Promise<T> {
    performanceMonitor.markStart(`settings:load:${this.module}`);
    
    try {
      // First try to get settings from cache
      if (this.cacheable) {
        const cachedSettings = settingsCache.get<T>(this.storageKey);
        
        if (cachedSettings) {
          logger.debug(`Using cached settings for ${this.module}`);
          this.settings = cachedSettings;
          return cachedSettings;
        }
      }
      
      // If we have an API endpoint, try to load from API
      if (this.apiEndpoint) {
        try {
          const apiSettings = await this.loadFromApi();
          
          if (apiSettings) {
            // Cache the settings
            if (this.cacheable) {
              settingsCache.set(this.storageKey, apiSettings);
            }
            
            this.settings = apiSettings;
            return apiSettings;
          }
        } catch (error) {
          logger.error(`Error loading settings from API for ${this.module}:`, error);
          // Continue to load from localStorage
        }
      }
      
      // If we don't have settings yet, try to load from localStorage
      const localSettings = this.loadFromLocalStorage();
      
      if (localSettings) {
        // Cache the settings
        if (this.cacheable) {
          settingsCache.set(this.storageKey, localSettings);
        }
        
        this.settings = localSettings;
        
        // If we have an API endpoint, sync the settings to the API
        if (this.apiEndpoint) {
          this.syncToApi(localSettings).catch(error => {
            logger.error(`Error syncing settings to API for ${this.module}:`, error);
          });
        }
        
        return localSettings;
      }
      
      // If we don't have settings yet, use default settings
      logger.debug(`Using default settings for ${this.module}`);
      
      // Cache the settings
      if (this.cacheable) {
        settingsCache.set(this.storageKey, this.defaultSettings);
      }
      
      this.settings = this.defaultSettings;
      
      // If we have an API endpoint, sync the settings to the API
      if (this.apiEndpoint) {
        this.syncToApi(this.defaultSettings).catch(error => {
          logger.error(`Error syncing settings to API for ${this.module}:`, error);
        });
      }
      
      return this.defaultSettings;
    } finally {
      performanceMonitor.markEnd(`settings:load:${this.module}`);
    }
  }
  
  /**
   * Load settings from localStorage
   * 
   * @returns Settings or null if not found
   */
  private loadFromLocalStorage(): T | null {
    try {
      const storedSettings = localStorage.getItem(this.storageKey);
      
      if (!storedSettings) {
        return null;
      }
      
      const parsedSettings = JSON.parse(storedSettings);
      
      // Validate the settings
      return this.validateSettings(parsedSettings);
    } catch (error) {
      logger.error(`Error loading settings from localStorage for ${this.module}:`, error);
      return null;
    }
  }
  
  /**
   * Load settings from API
   * 
   * @returns Promise that resolves with the settings or null if not found
   */
  private async loadFromApi(): Promise<T | null> {
    if (!this.apiEndpoint) {
      return null;
    }
    
    try {
      // Create a service batch init hook
      const { batchGet } = useServiceBatchInit({
        serviceName: `settings:${this.module}`,
        autoInit: false
      });
      
      // Use batch request to fetch settings
      const response = await batchGet<T>(
        `settings/MODULE`,
        { module: this.module },
        this.defaultPriority
      );
      
      // Validate the settings
      return this.validateSettings(response);
    } catch (error) {
      logger.error(`Error loading settings from API for ${this.module}:`, error);
      return null;
    }
  }
  
  /**
   * Validate settings
   * 
   * @param settings Settings to validate
   * @returns Validated settings
   */
  private validateSettings(settings: any): T {
    try {
      // Parse the settings with the schema
      return this.schema.parse(settings);
    } catch (error) {
      logger.error(`Invalid settings for ${this.module}:`, error);
      
      // If the settings are invalid, use default settings
      return this.defaultSettings;
    }
  }
  
  /**
   * Update settings
   * 
   * @param settings Settings to update
   * @returns Promise that resolves when the settings are updated
   */
  async updateSettings(settings: Partial<T>): Promise<void> {
    performanceMonitor.markStart(`settings:update:${this.module}`);
    
    try {
      // Get current settings
      const currentSettings = await this.getSettings();
      
      // Merge current settings with new settings
      const updatedSettings = {
        ...currentSettings,
        ...settings
      };
      
      // Validate the settings
      const validatedSettings = this.validateSettings(updatedSettings);
      
      // Update local state
      this.settings = validatedSettings;
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(validatedSettings));
      
      // Cache the settings
      if (this.cacheable) {
        settingsCache.set(this.storageKey, validatedSettings);
      }
      
      // If we have an API endpoint, sync the settings to the API
      if (this.apiEndpoint) {
        await this.syncToApi(validatedSettings);
      }
    } finally {
      performanceMonitor.markEnd(`settings:update:${this.module}`);
    }
  }
  
  /**
   * Reset settings to defaults
   * 
   * @returns Promise that resolves when the settings are reset
   */
  async resetSettings(): Promise<void> {
    performanceMonitor.markStart(`settings:reset:${this.module}`);
    
    try {
      // Update local state
      this.settings = this.defaultSettings;
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultSettings));
      
      // Cache the settings
      if (this.cacheable) {
        settingsCache.set(this.storageKey, this.defaultSettings);
      }
      
      // If we have an API endpoint, sync the settings to the API
      if (this.apiEndpoint) {
        await this.syncToApi(this.defaultSettings);
      }
    } finally {
      performanceMonitor.markEnd(`settings:reset:${this.module}`);
    }
  }
  
  /**
   * Sync settings to the API
   * 
   * @param settings Settings to sync
   * @returns Promise that resolves when the settings are synced
   */
  private async syncToApi(settings: T): Promise<void> {
    if (!this.apiEndpoint || this.syncInProgress) {
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
      // Create a service batch init hook
      const { batchPost } = useServiceBatchInit({
        serviceName: `settings:${this.module}`,
        autoInit: false
      });
      
      // Use batch request to update settings
      await batchPost(
        'settings/UPDATE_MODULE',
        {
          module: this.module,
          settings
        },
        RequestPriority.LOW
      );
    } finally {
      this.syncInProgress = false;
    }
  }
}

/**
 * Create a batch-enabled settings service
 * 
 * @param module Module name for the settings
 * @param options Settings service options
 * @returns Batch-enabled settings service
 */
export function createBatchSettingsService<T extends Record<string, any>>(
  module: string,
  options: Omit<BatchSettingsServiceOptions<T>, 'module'>
): BatchSettingsService<T> {
  return new BatchSettingsService<T>({
    ...options,
    module
  });
}

export default BatchSettingsService;
