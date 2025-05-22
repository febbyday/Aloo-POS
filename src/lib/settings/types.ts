import { z } from 'zod';

/**
 * Core settings service interface
 * Defines the contract for all settings services
 */
export interface SettingsService<T> {
  // Core CRUD operations
  getSettings(): Promise<T>;
  saveSettings(settings: T): Promise<void>;
  resetSettings(): Promise<T>;

  // Optional operations
  getSettingValue<K extends keyof T>(key: K): Promise<T[K]>;
  updateSettingValue<K extends keyof T>(key: K, value: T[K]): Promise<void>;

  // Synchronization operations
  syncWithApi?(): Promise<boolean>;
  checkSyncStatus?(): Promise<{ inSync: boolean; localUpdated?: Date; apiUpdated?: Date }>;

  // Cleanup
  cleanup?(): void;

  // Metadata
  getMetadata(): SettingsMetadata;
}

/**
 * Metadata for settings services
 */
export interface SettingsMetadata {
  module: string;
  storageType: 'local' | 'remote' | 'hybrid';
  cacheable: boolean;
  schema?: z.ZodSchema<any>;
  lastUpdated?: Date;
  apiEndpoint?: string;
  syncStatus?: {
    lastSyncTime?: Date;
    syncInProgress: boolean;
    isOnline: boolean;
  };
}

/**
 * Options for creating a settings service
 */
export interface SettingsServiceOptions<T> {
  module: string;
  defaultSettings: T;
  schema?: z.ZodSchema<T>;
  apiEndpoint?: string;
  cacheable?: boolean;
}

/**
 * Storage types for settings
 */
export type StorageType = 'local' | 'remote' | 'hybrid';
