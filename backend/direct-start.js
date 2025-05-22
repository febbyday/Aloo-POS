// ES module syntax
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const scriptDir = dirname(__filename);
console.log('Script directory:', scriptDir);

// Verify server.ts exists
const serverPath = path.join(scriptDir, 'src', 'server.ts');
if (!fs.existsSync(serverPath)) {
    console.error(`Error: server.ts not found at ${serverPath}`);
    process.exit(1);
}

console.log('Starting backend server from:', scriptDir);
console.log('Server file:', serverPath);

// Execute ts-node directly to run the server
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const tscmd = ['ts-node', '--transpile-only', serverPath];

console.log('Command:', npx, tscmd.join(' '));

const child = spawn(npx, tscmd, {
    cwd: scriptDir,
    stdio: 'inherit',
    shell: true
});

child.on('error', (error) => {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
});

child.on('close', (code) => {
    if (code !== 0) {
        console.error(`Server exited with code ${code}`);
        process.exit(code);
    }
});

// Handle termination signals
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down server...');
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down server...');
    child.kill('SIGTERM');
});
