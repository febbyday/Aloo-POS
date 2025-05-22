@echo off
setlocal

echo Service Migration Script Runner
echo ==============================
echo.

set DRY_RUN=false
set VERBOSE=true
set CREATE_BACKUPS=true

:parse_args
if "%~1"=="" goto :run
if /i "%~1"=="--dry-run" set DRY_RUN=true
if /i "%~1"=="--no-backups" set CREATE_BACKUPS=false
if /i "%~1"=="--quiet" set VERBOSE=false
shift
goto :parse_args

:run
echo Configuration:
echo - Dry Run: %DRY_RUN%
echo - Create Backups: %CREATE_BACKUPS%
echo - Verbose: %VERBOSE%
echo.

echo Updating configuration in script...
powershell -Command "(Get-Content scripts\service-migration.js) -replace 'dryRun: .*,', 'dryRun: %DRY_RUN%,' -replace 'createBackups: .*,', 'createBackups: %CREATE_BACKUPS%,' -replace 'verbose: .*,', 'verbose: %VERBOSE%,' | Set-Content scripts\service-migration.js"

echo Running migration script...
node scripts\service-migration.js

echo.
echo Migration completed.

endlocal
