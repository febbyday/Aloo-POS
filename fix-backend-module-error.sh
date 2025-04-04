#!/bin/bash

echo "Fixing backend module compatibility issues..."
echo ""

# Run the fix-backend-imports script
npm run fix-backend-imports

echo ""
echo "Fix completed! Please restart your backend server."
echo ""