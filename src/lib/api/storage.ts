import { deepClone } from '@/lib/utils';

// Storage types
export type StorageType = 'local' | 'session' | 'memory';

// Storage options
export interface StorageOptions {
  type?: StorageType;
  prefix?: string;
  expiresIn?: number; // Expiration time in milliseconds
  serializer?: <T>(value: T) => string;
  deserializer?: <T>(value: string) => T;
}

// Storage item with metadata
interface StorageItem<T> {
  value: T;
  expiry?: number; // Timestamp when the item expires
}

// Default storage options
const defaultOptions: StorageOptions = {
  type: 'local',
  prefix: 'pos_',
  serializer: JSON.stringify,
  deserializer: JSON.parse,
};

// In-memory storage fallback
const memoryStorageMap: Record<string, string> = {};

// Storage service class
export class StorageService {
  private options: StorageOptions;
  private storage: Storage | Record<string, string>;

  constructor(options: StorageOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.storage = this.getStorageByType(this.options.type!);
  }

  // Get storage by type
  private getStorageByType(type: StorageType): Storage | Record<string, string> {
    switch (type) {
      case 'local':
        return this.isStorageAvailable('localStorage') ? localStorage : memoryStorageMap;
      case 'session':
        return this.isStorageAvailable('sessionStorage') ? sessionStorage : memoryStorageMap;
      case 'memory':
      default:
        return memoryStorageMap;
    }
  }

  // Check if storage is available
  private isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Get prefixed key
  private getKey(key: string): string {
    return `${this.options.prefix}${key}`;
  }

  // Set item with optional expiration
  public set<T>(key: string, value: T, options?: Partial<StorageOptions>): void {
    const mergedOptions = { ...this.options, ...options };
    const prefixedKey = this.getKey(key);
    
    const item: StorageItem<T> = {
      value,
    };

    // Add expiry if specified
    if (mergedOptions.expiresIn) {
      item.expiry = Date.now() + mergedOptions.expiresIn;
    }

    try {
      const serialized = mergedOptions.serializer!(item);
      this.storage[prefixedKey] = serialized;
    } catch (error) {
      console.error(`Error storing item with key "${key}":`, error);
    }
  }

  // Get item and check expiration
  public get<T>(key: string, defaultValue?: T): T | undefined {
    const prefixedKey = this.getKey(key);
    const serialized = this.storage[prefixedKey];

    if (!serialized) {
      return defaultValue;
    }

    try {
      const item: StorageItem<T> = this.options.deserializer!(serialized);

      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.error(`Error retrieving item with key "${key}":`, error);
      return defaultValue;
    }
  }

  // Remove item
  public remove(key: string): void {
    const prefixedKey = this.getKey(key);
    delete this.storage[prefixedKey];
  }

  // Check if key exists
  public has(key: string): boolean {
    const prefixedKey = this.getKey(key);
    return prefixedKey in this.storage;
  }

  // Clear all items with the current prefix
  public clear(): void {
    if (this.storage === memoryStorageMap) {
      // For memory storage, only clear items with the current prefix
      Object.keys(memoryStorageMap).forEach(key => {
        if (key.startsWith(this.options.prefix!)) {
          delete memoryStorageMap[key];
        }
      });
    } else {
      // For localStorage and sessionStorage
      const storage = this.storage as Storage;
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.options.prefix!)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
    }
  }

  // Get all keys with the current prefix
  public keys(): string[] {
    if (this.storage === memoryStorageMap) {
      return Object.keys(memoryStorageMap)
        .filter(key => key.startsWith(this.options.prefix!))
        .map(key => key.slice(this.options.prefix!.length));
    } else {
      const storage = this.storage as Storage;
      const keys: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.options.prefix!)) {
          keys.push(key.slice(this.options.prefix!.length));
        }
      }

      return keys;
    }
  }

  // Get all items with the current prefix
  public getAll<T>(): Record<string, T> {
    const keys = this.keys();
    const result: Record<string, T> = {};

    keys.forEach(key => {
      const value = this.get<T>(key);
      if (value !== undefined) {
        result[key] = value;
      }
    });

    return result;
  }

  // Set multiple items at once
  public setMany(items: Record<string, any>, options?: Partial<StorageOptions>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value, options);
    });
  }

  // Remove multiple items at once
  public removeMany(keys: string[]): void {
    keys.forEach(key => this.remove(key));
  }
}

// Create and export singleton instances for different storage types
export const localStorageService = new StorageService({ type: 'local' });
export const sessionStorageService = new StorageService({ type: 'session' });
export const inMemoryStorage = new StorageService({ type: 'memory' });

// Entity storage class for storing collections of entities
export class EntityStorage<T extends { id: string }> {
  private storage: StorageService;
  private entityKey: string;

  constructor(entityKey: string, options: StorageOptions = {}) {
    this.storage = new StorageService(options);
    this.entityKey = entityKey;
  }

  // Get all entities
  public getAll(): T[] {
    return this.storage.get<T[]>(this.entityKey, []) || [];
  }

  // Save all entities
  public saveAll(entities: T[]): void {
    this.storage.set(this.entityKey, entities);
  }

  // Get entity by ID
  public getById(id: string): T | undefined {
    const entities = this.getAll();
    return entities.find(entity => entity.id === id);
  }

  // Add or update entity
  public save(entity: T): void {
    const entities = this.getAll();
    const index = entities.findIndex(e => e.id === entity.id);

    if (index >= 0) {
      // Update existing entity
      entities[index] = deepClone(entity);
    } else {
      // Add new entity
      entities.push(deepClone(entity));
    }

    this.saveAll(entities);
  }

  // Add or update multiple entities
  public saveMany(newEntities: T[]): void {
    const entities = this.getAll();
    const entitiesMap = new Map(entities.map(entity => [entity.id, entity]));

    // Update existing entities and add new ones
    newEntities.forEach(entity => {
      entitiesMap.set(entity.id, deepClone(entity));
    });

    this.saveAll(Array.from(entitiesMap.values()));
  }

  // Remove entity by ID
  public remove(id: string): void {
    const entities = this.getAll();
    const filteredEntities = entities.filter(entity => entity.id !== id);
    this.saveAll(filteredEntities);
  }

  // Remove multiple entities by ID
  public removeMany(ids: string[]): void {
    const entities = this.getAll();
    const filteredEntities = entities.filter(entity => !ids.includes(entity.id));
    this.saveAll(filteredEntities);
  }

  // Clear all entities
  public clear(): void {
    this.storage.remove(this.entityKey);
  }

  // Check if entity exists
  public exists(id: string): boolean {
    return this.getById(id) !== undefined;
  }

  // Count entities
  public count(): number {
    return this.getAll().length;
  }

  // Filter entities
  public filter(predicate: (entity: T) => boolean): T[] {
    const entities = this.getAll();
    return entities.filter(predicate);
  }

  // Find first entity matching predicate
  public find(predicate: (entity: T) => boolean): T | undefined {
    const entities = this.getAll();
    return entities.find(predicate);
  }
}

// Export default storage service
export default {
  localStorageService,
  sessionStorageService,
  inMemoryStorage,
  EntityStorage,
};
