# PowerShell script to start the backend development server

Write-Host "Starting POS Backend Server..." -ForegroundColor Green

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path -Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Make sure the server is built
Write-Host "Building server..." -ForegroundColor Yellow
npm run build

# Start the development server
Write-Host "Starting server..." -ForegroundColor Green
npx ts-node-dev --respawn --transpile-only src/index.ts 