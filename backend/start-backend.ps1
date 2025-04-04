# Start Backend Server Script
Write-Host "====================================="
Write-Host "POS System Backend Setup - PowerShell"
Write-Host "====================================="

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Please run this script as Administrator"
    Write-Host "Right-click on PowerShell and select 'Run as Administrator'"
    exit 1
}

# Load environment variables
Write-Host "Loading environment variables..."
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "Env:$name" -Value $value
        }
    }
} else {
    Write-Host "Warning: .env file not found"
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Generate Prisma client
Write-Host "Generating Prisma client..."
try {
    npx prisma generate
    Write-Host "Prisma client generated successfully"
} catch {
    Write-Host "Error generating Prisma client: $_"
    exit 1
}

# Run database migrations
Write-Host "Running database migrations..."
try {
    npx prisma migrate dev
    Write-Host "Database migrations completed successfully"
} catch {
    Write-Host "Error running database migrations: $_"
    exit 1
}

# Start the development server
Write-Host "Starting development server..."
npm run dev 