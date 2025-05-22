#!/usr/bin/env node

// This script ensures the backend server starts from the correct directory
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const scriptsDir = dirname(__filename);
const backendDir = resolve(scriptsDir, '..');

// Check if server.ts exists in the expected location
const serverPath = resolve(backendDir, 'src', 'server.ts');
if (!fs.existsSync(serverPath)) {
  console.error(`Error: server.ts file not found at expected path: ${serverPath}`);
  process.exit(1);
}

console.log(`Starting backend server from directory: ${backendDir}`);
console.log(`Using server file: ${serverPath}`);

// Use process.env to pass the script path to ts-node-dev
console.log('Command to execute:', 'npx ts-node-dev --respawn --transpile-only --esm src/server.ts');

// Run ts-node-dev with explicit parameters
const child = spawn(
  'npx',
  ['ts-node-dev', '--respawn', '--transpile-only', '--esm', 'src/server.ts'],
  {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
    shell: true
  }
);

child.on('error', (error) => {
  console.error(`Error starting dev server: ${error.message}`);
  process.exit(1);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Dev server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down backend server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down backend server...');
  child.kill('SIGTERM');
});
