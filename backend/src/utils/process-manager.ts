import { exec } from 'child_process';
import { platform } from 'os';

/**
 * ProcessManager utility class for handling process and port management
 */
export class ProcessManager {
  /**
   * Kills a process running on a specific port
   * @param port The port number to check and kill process on
   * @returns Promise<boolean> indicating success
   */
  static async killProcessOnPort(port: number): Promise<boolean> {
    const command = platform() === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t`;

    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        if (error || !stdout) {
          resolve(false);
          return;
        }

        const pid = platform() === 'win32'
          ? stdout.split('\n')[0].split(' ').filter(Boolean).pop()
          : stdout.trim();

        if (!pid) {
          resolve(false);
          return;
        }

        const killCommand = platform() === 'win32'
          ? `taskkill /F /PID ${pid}`
          : `kill -9 ${pid}`;

        exec(killCommand, (killError) => {
          resolve(!killError);
        });
      });
    });
  }

  /**
   * Checks if a port is available
   * @param port The port number to check
   * @returns Promise<boolean> indicating if port is available
   */
  static async isPortAvailable(port: number): Promise<boolean> {
    const net = require('net');
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(true);
        }
      });

      server.once('listening', () => {
        server.close(() => {
          resolve(true);
        });
      });

      server.listen(port);
    });
  }
} 