#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const scriptDir = dirname(__filename);

// Run the dev script from the backend directory
const child = spawn('npm', ['run', 'dev'], {
  cwd: scriptDir,
  stdio: 'inherit',
  shell: true
});

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
