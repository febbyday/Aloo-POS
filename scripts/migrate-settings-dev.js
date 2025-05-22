/**
 * Settings Migration Script for Development
 * 
 * This script helps migrate settings from localStorage to the database during development.
 * It simulates the browser environment and sends settings to the API.
 * 
 * Usage:
 *   node scripts/migrate-settings-dev.js [--module=module-name] [--dry-run]
 * 
 * Options:
 *   --module: Migrate only the specified module
 *   --dry-run: Show what would be migrated without making API calls
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Set your auth token here or in env
const STORAGE_FILE = path.join(__dirname, '../dev-localStorage.json');
const DRY_RUN = process.argv.includes('--dry-run');
const SPECIFIC_MODULE = process.argv.find(arg => arg.startsWith('--module='))?.split('=')[1];

// Mock localStorage
const localStorage = {
  _data: {},
  
  // Load data from file if it exists
  _load() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const data = fs.readFileSync(STORAGE_FILE, 'utf8');
        this._data = JSON.parse(data);
        console.log(`Loaded ${Object.keys(this._data).length} items from localStorage file`);
      }
    } catch (error) {
      console.error('Error loading localStorage data:', error);
    }
  },
  
  // Save data to file
  _save() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this._data, null, 2));
    } catch (error) {
      console.error('Error saving localStorage data:', error);
    }
  },
  
  // Get item from storage
  getItem(key) {
    return this._data[key] || null;
  },
  
  // Set item in storage
  setItem(key, value) {
    this._data[key] = value;
    this._save();
  },
  
  // Remove item from storage
  removeItem(key) {
    delete this._data[key];
    this._save();
  },
  
  // Clear all items
  clear() {
    this._data = {};
    this._save();
  },
  
  // Get all keys
  get length() {
    return Object.keys(this._data).length;
  },
  
  // Get key at index
  key(index) {
    return Object.keys(this._data)[index] || null;
  }
};

// Load localStorage data
localStorage._load();

/**
 * Get all settings modules from localStorage
 */
function getSettingsModulesFromLocalStorage() {
  const modules = [];
  
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
function getSettingsFromLocalStorage(module) {
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
async function migrateModuleSettings(module) {
  try {
    // Get settings from localStorage
    const settings = getSettingsFromLocalStorage(module);
    
    if (!settings) {
      console.error(`No settings found in localStorage for module ${module}`);
      return {
        module,
        success: false,
        message: `No settings found in localStorage for module ${module}`,
      };
    }
    
    console.log(`Found settings for module ${module}:`, settings);
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would migrate settings for module ${module}`);
      return {
        module,
        success: true,
        message: `[DRY RUN] Would migrate settings for module ${module}`,
        data: settings,
      };
    }
    
    // Send settings to the API
    const response = await axios.post(
      `${API_URL}/settings/${module}/migrate`,
      { settings },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    );
    
    console.log(`API Response:`, response.data);
    
    return {
      module,
      success: true,
      message: `Successfully migrated settings for module ${module}`,
      data: settings,
      response: response.data,
    };
  } catch (error) {
    console.error(`Error migrating settings for module ${module}:`, error.response?.data || error.message);
    return {
      module,
      success: false,
      message: `Error migrating settings for module ${module}: ${error.response?.data?.message || error.message}`,
    };
  }
}

/**
 * Migrate all settings from localStorage to the database
 */
async function migrateAllSettings() {
  // Get all modules from localStorage
  const modules = SPECIFIC_MODULE ? [SPECIFIC_MODULE] : getSettingsModulesFromLocalStorage();
  
  if (modules.length === 0) {
    console.log('No settings found in localStorage');
    return [];
  }
  
  console.log(`Found ${modules.length} settings modules in localStorage:`, modules);
  
  // Migrate each module's settings
  const results = [];
  
  for (const module of modules) {
    console.log(`\nMigrating settings for module ${module}...`);
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
  console.log(`\nMigration complete. ${successCount}/${results.length} modules migrated successfully.`);
  
  return results;
}

// Run the migration
migrateAllSettings().catch(error => {
  console.error('Error during migration:', error);
  process.exit(1);
});
