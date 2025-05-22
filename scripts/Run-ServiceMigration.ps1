# Service Migration Script Runner

param(
    [switch]$DryRun,
    [switch]$NoBackups,
    [switch]$Quiet
)

Write-Host "Service Migration Script Runner" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$dryRunValue = if ($DryRun) { "true" } else { "false" }
$createBackupsValue = if ($NoBackups) { "false" } else { "true" }
$verboseValue = if ($Quiet) { "false" } else { "true" }

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "- Dry Run: $dryRunValue"
Write-Host "- Create Backups: $createBackupsValue"
Write-Host "- Verbose: $verboseValue"
Write-Host ""

Write-Host "Updating configuration in script..." -ForegroundColor Yellow
$scriptContent = Get-Content -Path "scripts\service-migration.js"
$scriptContent = $scriptContent -replace 'dryRun: .*,', "dryRun: $dryRunValue,"
$scriptContent = $scriptContent -replace 'createBackups: .*,', "createBackups: $createBackupsValue,"
$scriptContent = $scriptContent -replace 'verbose: .*,', "verbose: $verboseValue,"
$scriptContent | Set-Content -Path "scripts\service-migration.js"

Write-Host "Running migration script..." -ForegroundColor Green
node scripts\service-migration.js

Write-Host ""
Write-Host "Migration completed." -ForegroundColor Green
