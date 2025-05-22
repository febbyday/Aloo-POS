/**
 * Legacy API Detection Script
 *
 * This script helps identify legacy API usage in the codebase.
 * It can be run during development to find code that needs to be migrated.
 *
 * Usage:
 * 1. Import this script in your main.ts file during development
 * 2. Check the console for warnings about legacy API usage
 * 3. Migrate the identified code to use the enhanced API client
 */

import { getLegacyDetectionStatus } from '../lib/api/legacy-detection';
import { initLegacyApiMonitoring } from '../lib/api/legacy-api-wrapper';

// Enable legacy API monitoring (safer approach)
initLegacyApiMonitoring();

// Add a global function to get the detection status
(window as any).__getLegacyApiUsage = () => {
  const status = getLegacyDetectionStatus();
  console.log('Legacy API usage detected in the following files:');
  status.reportedFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  return status;
};

// Log instructions
console.log(`
=== Legacy API Detection Enabled ===
Check the console for warnings about legacy API usage.
To see a summary of detected files, run: window.__getLegacyApiUsage()
`);

export default {
  name: 'legacy-api-detection',
  enabled: true
};
