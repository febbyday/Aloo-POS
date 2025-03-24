# PowerShell script to start the backend server
Write-Host "====================================="
Write-Host "POS System Backend Setup - PowerShell"
Write-Host "====================================="

# Navigate to backend directory (if not already there)
# $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
# Set-Location $scriptPath

Write-Host "Setting up database..."
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generating Prisma client!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Checking database connection..."
npx prisma db pull
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error connecting to database! Please check your .env file and make sure PostgreSQL is running." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Starting backend server..."
npx ts-node-dev --respawn src/index.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error starting backend server!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Server stopped." 