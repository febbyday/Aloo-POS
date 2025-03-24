@echo off
echo ===================================
echo POS System Backend Setup
echo ===================================

echo Setting up database...
call npx ts-node scripts/setup-db.ts

if %ERRORLEVEL% NEQ 0 (
  echo Error setting up database!
  pause
  exit /b %ERRORLEVEL%
)

echo Starting backend server...
call npx ts-node-dev --respawn src/index.ts

pause 