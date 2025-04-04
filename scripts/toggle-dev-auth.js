/**
 * Authentication Bypass Toggle Script
 * 
 * This script toggles the VITE_BYPASS_AUTH flag in the .env.development file
 * to enable or disable authentication bypass in development mode.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envFile = path.join(process.cwd(), '.env.development');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function toggleDevAuth() {
  try {
    const content = fs.readFileSync(envFile, 'utf8');
    const authRegex = /VITE_BYPASS_AUTH\s*=\s*(true|false)/;
    const match = content.match(authRegex);

    if (match) {
      const currentValue = match[1];
      const newValue = currentValue === 'true' ? 'false' : 'true';
      
      console.log(`Current setting: VITE_BYPASS_AUTH=${currentValue}`);
      console.log(`This will be changed to: VITE_BYPASS_AUTH=${newValue}`);
      
      const updatedContent = content.replace(
        authRegex,
        `VITE_BYPASS_AUTH=${newValue}`
      );
      
      fs.writeFileSync(envFile, updatedContent, 'utf8');
      console.log('\n✅ Auth bypass has been updated');
      console.log('Restart your development server for changes to take effect');
    } else {
      const appendContent = '\nVITE_BYPASS_AUTH=true\n';
      fs.appendFileSync(envFile, appendContent);
      console.log('\n✅ Auth bypass has been enabled');
      console.log('Restart your development server for changes to take effect');
    }
  } catch (error) {
    console.error('Error updating auth bypass:', error);
  } finally {
    rl.close();
  }
}

toggleDevAuth();
