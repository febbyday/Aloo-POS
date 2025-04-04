#!/usr/bin/env node

/**
 * Toggle Mock API Mode
 * 
 * This script toggles the VITE_DISABLE_MOCK environment variable in the .env.development file.
 * It helps developers quickly switch between using mock data and real API endpoints.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = path.resolve(path.join(__dirname, '..'), '.env.development');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main function
async function toggleMockMode() {
  try {
    // Read the current .env.development file
    const content = fs.readFileSync(envFile, 'utf8');
    
    // Check if VITE_DISABLE_MOCK exists in the file
    const mockRegex = /VITE_DISABLE_MOCK\s*=\s*(true|false)/;
    const match = content.match(mockRegex);
    
    if (match) {
      // Toggle the current value
      const currentValue = match[1];
      const newValue = currentValue === 'true' ? 'false' : 'true';
      
      // Confirm with the user
      const confirmMessage = `
Current setting: VITE_DISABLE_MOCK=${currentValue}
This means: ${currentValue === 'true' ? 'Using REAL API' : 'Using MOCK DATA'}

Do you want to change to: VITE_DISABLE_MOCK=${newValue}
This will: ${newValue === 'true' ? 'Use REAL API' : 'Use MOCK DATA'}

Confirm? (y/N): `;
      
      rl.question(confirmMessage, (answer) => {
        if (answer.toLowerCase() === 'y') {
          // Replace the value in the file
          const updatedContent = content.replace(
            mockRegex,
            `VITE_DISABLE_MOCK=${newValue}`
          );
          
          // Write the updated content back to the file
          fs.writeFileSync(envFile, updatedContent, 'utf8');
          
          console.log(`\n✅ VITE_DISABLE_MOCK has been changed to ${newValue}`);
          console.log(`The application will now ${newValue === 'true' ? 'use the REAL API' : 'use MOCK DATA'}`);
          console.log('\nRestart your development server for changes to take effect.');
        } else {
          console.log('\n❌ Operation canceled. No changes were made.');
        }
        
        rl.close();
      });
    } else {
      // Add VITE_DISABLE_MOCK if it doesn't exist
      rl.question('VITE_DISABLE_MOCK not found. Add it? (y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          rl.question('Use real API (true) or mock data (false)? (true/false): ', (value) => {
            if (value === 'true' || value === 'false') {
              const updatedContent = content + `\nVITE_DISABLE_MOCK=${value}\n`;
              fs.writeFileSync(envFile, updatedContent, 'utf8');
              
              console.log(`\n✅ VITE_DISABLE_MOCK=${value} has been added`);
              console.log(`The application will now ${value === 'true' ? 'use the REAL API' : 'use MOCK DATA'}`);
              console.log('\nRestart your development server for changes to take effect.');
            } else {
              console.log('\n❌ Invalid value. Expected "true" or "false".');
            }
            
            rl.close();
          });
        } else {
          console.log('\n❌ Operation canceled. No changes were made.');
          rl.close();
        }
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

// Run the script
toggleMockMode(); 