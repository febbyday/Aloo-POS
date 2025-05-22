/**
 * Centralized Logging Service
 * 
 * Provides standardized logging functionality with different log levels,
 * context support, and integration with external logging services.
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Log entry structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string | undefined;
  data?: any | undefined;
  tags?: Record<string, string> | undefined;
}

// Logger configuration
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteUrl?: string;
  batchSize?: number;
  flushInterval?: number;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: import.meta.env.PROD ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: import.meta.env.PROD,
  remoteUrl: import.meta.env.VITE_LOG_SERVICE_URL,
  batchSize: 10,
  flushInterval: 10000 // 10 seconds
};

/**
 * Logger class for centralized logging
 */
class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private contextStack: string[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Set up flush timer if remote logging is enabled
    if (this.config.enableRemote && this.config.flushInterval) {
      this.flushInterval = setInterval(() => this.flush(), this.config.flushInterval);
    }
  }

  /**
   * Push a context onto the stack
   */
  pushContext(context: string): void {
    this.contextStack.push(context);
  }

  /**
   * Pop a context from the stack
   */
  popContext(): string | undefined {
    return this.contextStack.pop();
  }

  /**
   * Get the current context
   */
  private getCurrentContext(): string | undefined {
    return this.contextStack.length > 0 ? this.contextStack.join('.') : undefined;
  }

  /**
   * Log a message at the specified level
   */
  private log(level: LogLevel, message: string, data?: any, tags?: Record<string, string>): void {
    // Skip if below minimum level
    if (this.shouldSkip(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.getCurrentContext(),
      data,
      tags
    };

    // Log to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Add to buffer for remote logging if enabled
    if (this.config.enableRemote) {
      this.logBuffer.push(entry);
      
      // Flush if buffer is full
      if (this.logBuffer.length >= (this.config.batchSize || 10)) {
        this.flush();
      }
    }
  }

  /**
   * Check if a log level should be skipped
   */
  private shouldSkip(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    
    return currentLevelIndex < minLevelIndex;
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message, context, data } = entry;
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(formattedMessage, data || '');
        break;
    }
  }

  /**
   * Flush the log buffer to the remote logging service
   */
  async flush(): Promise<void> {
    if (!this.config.enableRemote || this.logBuffer.length === 0) return;
    
    const entries = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      if (this.config.remoteUrl) {
        await fetch(this.config.remoteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ logs: entries }),
          keepalive: true
        });
      }
    } catch (error) {
      // If remote logging fails, log to console as fallback
      console.error('Failed to send logs to remote service:', error);
      
      // Put the entries back in the buffer for the next attempt
      // but limit the buffer size to prevent memory issues
      const maxBufferSize = (this.config.batchSize || 10) * 5;
      this.logBuffer = [...entries, ...this.logBuffer].slice(0, maxBufferSize);
    }
  }

  /**
   * Clean up resources when the logger is no longer needed
   */
  dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Flush any remaining logs
    this.flush();
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any, tags?: Record<string, string>): void {
    this.log(LogLevel.DEBUG, message, data, tags);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any, tags?: Record<string, string>): void {
    this.log(LogLevel.INFO, message, data, tags);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any, tags?: Record<string, string>): void {
    this.log(LogLevel.WARN, message, data, tags);
  }

  /**
   * Log an error message
   */
  error(message: string, data?: any, tags?: Record<string, string>): void {
    this.log(LogLevel.ERROR, message, data, tags);
  }

  /**
   * Log a critical error message
   */
  critical(message: string, data?: any, tags?: Record<string, string>): void {
    this.log(LogLevel.CRITICAL, message, data, tags);
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): Logger {
    const childLogger = new Logger(this.config);
    childLogger.contextStack = [...this.contextStack, context];
    return childLogger;
  }

  /**
   * Create a logger with specific tags
   */
  withTags(tags: Record<string, string>): {
    debug: (message: string, data?: any) => void;
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, data?: any) => void;
    critical: (message: string, data?: any) => void;
  } {
    return {
      debug: (message: string, data?: any) => this.debug(message, data, tags),
      info: (message: string, data?: any) => this.info(message, data, tags),
      warn: (message: string, data?: any) => this.warn(message, data, tags),
      error: (message: string, data?: any) => this.error(message, data, tags),
      critical: (message: string, data?: any) => this.critical(message, data, tags)
    };
  }
}

// Create and export singleton instance
export const logger = new Logger();

// Export a function to create a new logger with custom config
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  return new Logger(config);
}

export default logger;
