/**
 * Deprecation Tracker
 * 
 * Utility for tracking usage of deprecated routes and APIs.
 * This helps identify which deprecated features are still being used
 * and by whom, to inform decisions about when to remove them.
 */

import fs from 'fs';
import path from 'path';
import { Request } from 'express';

// Define the structure of a deprecation log entry
interface DeprecationLogEntry {
  timestamp: string;
  route: string;
  method: string;
  ip: string;
  userAgent: string;
  referer?: string;
  userId?: string;
}

// Configuration
const LOG_DIR = process.env.DEPRECATION_LOG_DIR || 'logs/deprecation';
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 5;

/**
 * Ensure the log directory exists
 */
function ensureLogDir(): string {
  const logDir = path.resolve(process.cwd(), LOG_DIR);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
}

/**
 * Get the current log file path
 */
function getLogFilePath(): string {
  const logDir = ensureLogDir();
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logDir, `deprecation-${date}.log`);
}

/**
 * Rotate log files if needed
 */
function rotateLogsIfNeeded(logFilePath: string): void {
  try {
    // Check if file exists and is too large
    if (fs.existsSync(logFilePath)) {
      const stats = fs.statSync(logFilePath);
      if (stats.size >= MAX_LOG_SIZE) {
        // Rotate logs
        const logDir = path.dirname(logFilePath);
        const baseName = path.basename(logFilePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newName = path.join(logDir, `${baseName}.${timestamp}`);
        fs.renameSync(logFilePath, newName);
        
        // Clean up old log files
        const logFiles = fs.readdirSync(logDir)
          .filter(file => file.startsWith('deprecation-') && file !== baseName)
          .map(file => path.join(logDir, file))
          .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
        
        if (logFiles.length > MAX_LOG_FILES) {
          logFiles.slice(MAX_LOG_FILES).forEach(file => {
            try {
              fs.unlinkSync(file);
            } catch (err) {
              console.error(`Failed to delete old log file ${file}:`, err);
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error rotating log files:', err);
  }
}

/**
 * Log a deprecation warning
 * @param req Express request object
 * @param routeName Name of the deprecated route
 */
export function logDeprecatedRouteUsage(req: Request, routeName: string): void {
  try {
    const logFilePath = getLogFilePath();
    rotateLogsIfNeeded(logFilePath);
    
    const entry: DeprecationLogEntry = {
      timestamp: new Date().toISOString(),
      route: routeName,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
      referer: req.headers.referer,
      userId: (req as any).user?.id // Assuming user ID is available in req.user.id
    };
    
    // Append to log file
    fs.appendFileSync(
      logFilePath, 
      JSON.stringify(entry) + '\n',
      { encoding: 'utf8' }
    );
    
    // Also log to console for immediate visibility
    console.warn(
      `DEPRECATED ROUTE ACCESSED: ${routeName}\n` +
      `Details: Method=${entry.method}, URL=${req.originalUrl}, IP=${entry.ip}\n` +
      `User-Agent: ${entry.userAgent}\n` +
      `User ID: ${entry.userId || 'Not authenticated'}\n` +
      `Referer: ${entry.referer || 'None'}\n` +
      `This route will be removed in version 2.0.0.`
    );
  } catch (err) {
    // Don't let logging errors affect the application
    console.error('Error logging deprecation warning:', err);
  }
}

/**
 * Generate a report of deprecated route usage
 * @returns Summary of deprecated route usage
 */
export function generateDeprecationReport(): any {
  try {
    const logDir = ensureLogDir();
    const logFiles = fs.readdirSync(logDir)
      .filter(file => file.startsWith('deprecation-'))
      .map(file => path.join(logDir, file));
    
    const entries: DeprecationLogEntry[] = [];
    
    // Read all log files
    logFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const entry = JSON.parse(line);
            entries.push(entry);
          } catch (err) {
            console.error(`Error parsing log line in ${file}:`, err);
          }
        });
      } catch (err) {
        console.error(`Error reading log file ${file}:`, err);
      }
    });
    
    // Generate summary
    const summary = {
      totalRequests: entries.length,
      byRoute: {} as Record<string, number>,
      byIP: {} as Record<string, number>,
      byUserAgent: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      byDate: {} as Record<string, number>
    };
    
    entries.forEach(entry => {
      // Count by route
      summary.byRoute[entry.route] = (summary.byRoute[entry.route] || 0) + 1;
      
      // Count by IP
      summary.byIP[entry.ip] = (summary.byIP[entry.ip] || 0) + 1;
      
      // Count by user agent
      summary.byUserAgent[entry.userAgent] = (summary.byUserAgent[entry.userAgent] || 0) + 1;
      
      // Count by user ID
      if (entry.userId) {
        summary.byUser[entry.userId] = (summary.byUser[entry.userId] || 0) + 1;
      }
      
      // Count by date
      const date = entry.timestamp.split('T')[0];
      summary.byDate[date] = (summary.byDate[date] || 0) + 1;
    });
    
    return {
      summary,
      recentEntries: entries.slice(-100) // Return the most recent 100 entries
    };
  } catch (err) {
    console.error('Error generating deprecation report:', err);
    return { error: 'Failed to generate report', details: err };
  }
}
