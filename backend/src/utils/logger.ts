/**
 * Simple logger utility for the application
 * Provides consistent logging with timestamps and log levels
 */

// Log levels
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Function to format the current date/time
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Base logging function
const log = (level: LogLevel, message: string, ...args: any[]): void => {
  const timestamp = getTimestamp();
  const formattedMessage = `[${timestamp}] [${level}] ${message}`;
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, ...args);
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, ...args);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, ...args);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, ...args);
      break;
  }
};

// Create the logger object with all methods
export const logger = {
  debug: (message: string, ...args: any[]): void => {
    log(LogLevel.DEBUG, message, ...args);
  },
  
  info: (message: string, ...args: any[]): void => {
    log(LogLevel.INFO, message, ...args);
  },
  
  warn: (message: string, ...args: any[]): void => {
    log(LogLevel.WARN, message, ...args);
  },
  
  error: (message: string, ...args: any[]): void => {
    log(LogLevel.ERROR, message, ...args);
  }
}; 