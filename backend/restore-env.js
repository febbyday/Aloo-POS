/**
 * Simple script to restore the environment file from local backup
 * Run with: node restore-env.js
 */
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

// Check if .env.local exists
if (!fs.existsSync(envLocalPath)) {
  console.error('❌ Error: .env.local file not found!');
  console.log('Please create a .env.local file first or copy from .env.example and update with real values.');
  process.exit(1);
}

// Copy .env.local to .env
try {
  fs.copyFileSync(envLocalPath, envPath);
  console.log('✅ Success: .env file has been restored from .env.local!');
} catch (error) {
  console.error('❌ Error restoring .env file:', error.message);
  process.exit(1);
} 