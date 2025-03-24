/**
 * Directory Structure Standardization Script for POS System
 * 
 * This script ensures that all feature modules follow a consistent directory structure.
 * It creates missing directories and generates placeholder files where needed.
 * 
 * Usage:
 * 1. Run in dry-run mode: node standardize-directories.js --dry-run
 * 2. Run to apply changes: node standardize-directories.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.resolve(__dirname, '..');
const FEATURES_DIR = path.join(ROOT_DIR, 'src', 'features');
const DRY_RUN = process.argv.includes('--dry-run');

// Standard directories that should exist in each feature module
const STANDARD_DIRECTORIES = [
  'components',
  'hooks',
  'services',
  'context',
  'types',
  'utils',
  'pages'
];

// Placeholder file templates
const PLACEHOLDER_TEMPLATES = {
  index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Feature
 * 
 * This module exports components, hooks, and utilities for the ${featureName} feature.
 */

// Re-export components
export * from './components';

// Re-export hooks
export * from './hooks';

// Re-export types
export * from './types';

// Re-export context
export * from './context';
`,

  components_index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Components
 * 
 * This module exports all components for the ${featureName} feature.
 */

// Export all components here
`,

  hooks_index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Hooks
 * 
 * This module exports all custom hooks for the ${featureName} feature.
 */

// Export all hooks here
`,

  services_index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Services
 * 
 * This module exports all services for the ${featureName} feature.
 */

// Export all services here
`,

  context_index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Context
 * 
 * This module exports context providers for the ${featureName} feature.
 */

// Export all context providers here
`,

  types_index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Types
 * 
 * This module exports type definitions for the ${featureName} feature.
 */

// Export all types here
`,

  utils_index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Utilities
 * 
 * This module exports utility functions for the ${featureName} feature.
 */

// Export all utilities here
`,

  pages_index: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Pages
 * 
 * This module exports page components for the ${featureName} feature.
 */

// Export all pages here
`,

  service_placeholder: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Service
 * 
 * This service handles API calls and data operations for the ${featureName} feature.
 */

import { ${capitalizeFirstLetter(featureName)} } from '../types';

export const ${featureName}Service = {
  /**
   * Fetch all ${featureName} items
   */
  fetchAll: async (): Promise<${capitalizeFirstLetter(featureName)}[]> => {
    // Implementation goes here
    return [];
  },

  /**
   * Fetch a single ${featureName} by ID
   */
  fetchById: async (id: string): Promise<${capitalizeFirstLetter(featureName)} | null> => {
    // Implementation goes here
    return null;
  },

  /**
   * Create a new ${featureName}
   */
  create: async (data: Partial<${capitalizeFirstLetter(featureName)}>): Promise<${capitalizeFirstLetter(featureName)}> => {
    // Implementation goes here
    return {} as ${capitalizeFirstLetter(featureName)};
  },

  /**
   * Update an existing ${featureName}
   */
  update: async (id: string, data: Partial<${capitalizeFirstLetter(featureName)}>): Promise<${capitalizeFirstLetter(featureName)}> => {
    // Implementation goes here
    return {} as ${capitalizeFirstLetter(featureName)};
  },

  /**
   * Delete a ${featureName}
   */
  delete: async (id: string): Promise<boolean> => {
    // Implementation goes here
    return true;
  }
};
`,

  hook_placeholder: (featureName) => `/**
 * use${capitalizeFirstLetter(featureName)} Hook
 * 
 * This hook provides state management and operations for ${featureName}.
 */

import { useState, useEffect } from 'react';
import { ${featureName}Service } from '../services/${featureName}Service';
import { ${capitalizeFirstLetter(featureName)} } from '../types';

export interface Use${capitalizeFirstLetter(featureName)}Options {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function use${capitalizeFirstLetter(featureName)}(options: Use${capitalizeFirstLetter(featureName)}Options = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;
  
  const [items, setItems] = useState<${capitalizeFirstLetter(featureName)}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ${featureName}Service.fetchAll();
      setItems(data);
      setTotalItems(data.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      fetchItems();
    }
  }, [page, pageSize]);

  return {
    items,
    loading,
    error,
    page,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    refresh: fetchItems
  };
}
`,

  context_placeholder: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Context
 * 
 * This context provides state management for the ${featureName} feature.
 */

import { createContext, useContext, ReactNode, useState } from 'react';
import { ${capitalizeFirstLetter(featureName)} } from '../types';

interface ${capitalizeFirstLetter(featureName)}ContextValue {
  items: ${capitalizeFirstLetter(featureName)}[];
  selectedItem: ${capitalizeFirstLetter(featureName)} | null;
  loading: boolean;
  error: Error | null;
  setSelectedItem: (item: ${capitalizeFirstLetter(featureName)} | null) => void;
  refresh: () => Promise<void>;
}

const ${capitalizeFirstLetter(featureName)}Context = createContext<${capitalizeFirstLetter(featureName)}ContextValue | undefined>(undefined);

interface ${capitalizeFirstLetter(featureName)}ProviderProps {
  children: ReactNode;
}

export function ${capitalizeFirstLetter(featureName)}Provider({ children }: ${capitalizeFirstLetter(featureName)}ProviderProps) {
  const [items, setItems] = useState<${capitalizeFirstLetter(featureName)}[]>([]);
  const [selectedItem, setSelectedItem] = useState<${capitalizeFirstLetter(featureName)} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    // Implementation goes here
  };

  return (
    <${capitalizeFirstLetter(featureName)}Context.Provider 
      value={{ 
        items, 
        selectedItem, 
        loading, 
        error, 
        setSelectedItem, 
        refresh 
      }}
    >
      {children}
    </${capitalizeFirstLetter(featureName)}Context.Provider>
  );
}

export function use${capitalizeFirstLetter(featureName)}Context() {
  const context = useContext(${capitalizeFirstLetter(featureName)}Context);
  
  if (context === undefined) {
    throw new Error('use${capitalizeFirstLetter(featureName)}Context must be used within a ${capitalizeFirstLetter(featureName)}Provider');
  }
  
  return context;
}
`,

  types_placeholder: (featureName) => `/**
 * ${capitalizeFirstLetter(featureName)} Types
 * 
 * This file defines types for the ${featureName} feature.
 */

/**
 * ${capitalizeFirstLetter(featureName)} entity
 */
export interface ${capitalizeFirstLetter(featureName)} {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Add other properties specific to this entity
}

/**
 * ${capitalizeFirstLetter(featureName)} form values
 */
export interface ${capitalizeFirstLetter(featureName)}FormValues {
  name: string;
  // Add other form fields
}

/**
 * ${capitalizeFirstLetter(featureName)} filter options
 */
export interface ${capitalizeFirstLetter(featureName)}FilterOptions {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  // Add other filter options
}
`
};

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to convert kebab-case to camelCase
function kebabToCamel(string) {
  return string.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Create directory if it doesn't exist
function createDirectoryIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    if (!DRY_RUN) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } else {
      console.log(`Would create directory: ${dirPath}`);
    }
    return true;
  }
  return false;
}

// Create file if it doesn't exist
function createFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content);
      console.log(`Created file: ${filePath}`);
    } else {
      console.log(`Would create file: ${filePath}`);
    }
    return true;
  }
  return false;
}

// Process a feature module
function processFeatureModule(featurePath, featureName) {
  console.log(`\nProcessing feature: ${featureName}`);
  
  // Create standard directories
  STANDARD_DIRECTORIES.forEach(dir => {
    const dirPath = path.join(featurePath, dir);
    createDirectoryIfNotExists(dirPath);
    
    // Create index.ts in each directory
    const indexPath = path.join(dirPath, 'index.ts');
    const templateKey = `${dir}_index`;
    if (PLACEHOLDER_TEMPLATES[templateKey]) {
      createFileIfNotExists(indexPath, PLACEHOLDER_TEMPLATES[templateKey](featureName));
    }
  });
  
  // Create feature index.ts
  const featureIndexPath = path.join(featurePath, 'index.ts');
  createFileIfNotExists(featureIndexPath, PLACEHOLDER_TEMPLATES.index(featureName));
  
  // Create placeholder files for key functionality
  const servicePath = path.join(featurePath, 'services', `${featureName}Service.ts`);
  createFileIfNotExists(servicePath, PLACEHOLDER_TEMPLATES.service_placeholder(featureName));
  
  const hookPath = path.join(featurePath, 'hooks', `use${capitalizeFirstLetter(featureName)}.tsx`);
  createFileIfNotExists(hookPath, PLACEHOLDER_TEMPLATES.hook_placeholder(featureName));
  
  const contextPath = path.join(featurePath, 'context', `${capitalizeFirstLetter(featureName)}Context.tsx`);
  createFileIfNotExists(contextPath, PLACEHOLDER_TEMPLATES.context_placeholder(featureName));
  
  const typesPath = path.join(featurePath, 'types', `${featureName}.types.ts`);
  createFileIfNotExists(typesPath, PLACEHOLDER_TEMPLATES.types_placeholder(featureName));
}

// Main function to process all feature modules
function standardizeDirectories() {
  console.log('Standardizing directory structure for POS system features...');
  
  if (DRY_RUN) {
    console.log('Running in dry-run mode. No changes will be made.');
  }
  
  // Get all feature modules
  const features = fs.readdirSync(FEATURES_DIR);
  
  features.forEach(feature => {
    const featurePath = path.join(FEATURES_DIR, feature);
    const stats = fs.statSync(featurePath);
    
    if (stats.isDirectory()) {
      // Convert kebab-case to camelCase for feature name
      const featureName = kebabToCamel(feature);
      
      // Process this feature module
      processFeatureModule(featurePath, featureName);
    }
  });
  
  console.log('\nDirectory standardization complete!');
  
  if (DRY_RUN) {
    console.log('This was a dry run. Run without --dry-run to apply changes.');
  }
}

// Run the main function
standardizeDirectories();
