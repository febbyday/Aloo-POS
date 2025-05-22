/**
 * Centralized Logger Utility
 *
 * This module provides a comprehensive logging system for the application
 * using Winston. It supports different log levels, context information,
 * and file-based logging for production environments.
 *
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - Context information for better traceability
 * - Console and file-based logging
 * - Log rotation for production environments
 * - Structured logging with metadata
 */

import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Define log levels and colors
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Define log directory
const LOG_DIR = process.env.LOG_DIR || 'logs';

// Create log directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Define console format (more readable for development)
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} ${level} ${contextStr}: ${message}${metaStr}`;
  })
);

// Create file transports for production
const fileTransports = process.env.NODE_ENV === 'production' ? [
  // Error logs - separate file
  new transports.DailyRotateFile({
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
  }),
  // Combined logs
  new transports.DailyRotateFile({
    filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
  })
] : [];

// Create the Winston logger
const winstonLogger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: { service: 'pos-backend' },
  transports: [
    // Console transport (always enabled)
    new transports.Console({
      format: consoleFormat
    }),
    // Add file transports for production
    ...fileTransports
  ],
  exitOnError: false
});

/**
 * Logger class that wraps Winston logger
 */
class Logger {
  private logger: WinstonLogger;
  private contextStack: string[] = [];

  constructor(winstonInstance: WinstonLogger) {
    this.logger = winstonInstance;
  }

  /**
   * Get the current context as a string
   */
  private getContext(): string | undefined {
    return this.contextStack.length > 0 ? this.contextStack.join(':') : undefined;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const childLogger = new Logger(this.logger);
    childLogger.contextStack = [...this.contextStack, context];
    return childLogger;
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | any, meta?: Record<string, any>): void {
    const context = this.getContext();
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack, ...error }
      : error;

    this.logger.error(message, {
      context,
      error: errorData,
      ...meta
    });
  }

  /**
   * Log a warning message
   */
  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, {
      context: this.getContext(),
      ...meta
    });
  }

  /**
   * Log an info message
   */
  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, {
      context: this.getContext(),
      ...meta
    });
  }

  /**
   * Log a debug message
   */
  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, {
      context: this.getContext(),
      ...meta
    });
  }

  /**
   * Log with specific metadata
   */
  withMeta(meta: Record<string, any>): {
    error: (message: string, error?: Error | any) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
  } {
    return {
      error: (message: string, error?: Error | any) => this.error(message, error, meta),
      warn: (message: string) => this.warn(message, meta),
      info: (message: string) => this.info(message, meta),
      debug: (message: string) => this.debug(message, meta)
    };
  }
}

// Create and export the logger instance
export const logger = new Logger(winstonLogger);

// Export helper functions for direct use
export const logError = (message: string, error?: Error | any, meta?: Record<string, any>): void => {
  logger.error(message, error, meta);
};

export const logWarn = (message: string, meta?: Record<string, any>): void => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: Record<string, any>): void => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, any>): void => {
  logger.debug(message, meta);
};

// Export default logger
export default logger;