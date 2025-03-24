#!/usr/bin/env node

/**
 * Development server startup script for POS System backend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Run the server with ts-node-dev
const tscChild = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/server.ts'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

// Handle process exit
process.on('SIGINT', () => {
  tscChild.kill('SIGINT');
  process.exit(0);
});

tscChild.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

console.log('Starting development server...'); 