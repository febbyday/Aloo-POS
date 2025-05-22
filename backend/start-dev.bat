@echo off
echo Starting POS backend server...
cd %~dp0
echo Current directory: %cd%
call npm run dev
