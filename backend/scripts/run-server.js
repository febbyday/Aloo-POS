#!/usr/bin/env node

// Simple script to run the backend server without ts-node-dev
import { exec } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = resolve(__dirname, '..');

console.log(`Starting server from ${backendDir}`);

// Use tsx which has better ESM compatibility
const command = 'npx tsx src/server.ts';

const serverProcess = exec(command, { 
  cwd: backendDir,
  env: process.env
});

serverProcess.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

serverProcess.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  serverProcess.kill('SIGTERM');
});
