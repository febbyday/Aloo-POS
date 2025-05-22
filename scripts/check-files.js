const fs = require('fs');
const path = require('path');

// Files to check
const FILES_TO_CHECK = [
  'src/features/shops/services/shopService.ts',
  'src/features/shops/test-api-connection.ts',
  'src/features/suppliers/services/suppliersConnector.ts',
  'src/lib/auth/authService.ts',
];

// Check if files exist
FILES_TO_CHECK.forEach(filePath => {
  const fullPath = path.resolve(__dirname, '..', filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`File exists: ${filePath}`);
    } else {
      console.log(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error.message);
  }
});
