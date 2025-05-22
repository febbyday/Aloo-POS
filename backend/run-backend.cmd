@echo off
cd %~dp0
echo Starting backend server...
echo Current directory: %cd%
call npx ts-node-dev --respawn --transpile-only --esm src/server.ts
