// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { prisma } from '../prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * Event categories
 */
export enum EventCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SECURITY = 'SECURITY',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SYSTEM = 'SYSTEM',
  DATA = 'DATA'
}

/**
 * Severity levels
 */
export enum Severity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Auth event types
 */
export enum AuthEvent {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TOKEN_VALIDATION = 'TOKEN_VALIDATION',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_TERMINATED = 'SESSION_TERMINATED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

/**
 * Security event types
 */
export enum SecurityEvent {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  UNUSUAL_LOGIN_LOCATION = 'UNUSUAL_LOGIN_LOCATION',
  BRUTE_FORCE_ATTEMPT = 'BRUTE_FORCE_ATTEMPT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSIONS_CHANGED = 'PERMISSIONS_CHANGED'
}

/**
 * Audit event interface
 */
export interface AuditEvent {
  id?: string;
  category: EventCategory;
  type: string;
  timestamp?: Date;
  userId?: string;
  username?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  action?: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  severity: Severity;
  details?: Record<string, any>;
}

/**
 * Date range interface for queries
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Audit Logger
 * Records and manages audit events for security and compliance
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private bufferEnabled: boolean = false;
  private eventBuffer: AuditEvent[] = [];
  private bufferSize: number = 100;
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Enable buffering of events to reduce database load
   * Events will be flushed periodically or when buffer is full
   * 
   * @param bufferSize Maximum buffer size before flushing
   * @param intervalMs Flush interval in milliseconds
   */
  public enableBuffering(bufferSize: number = 100, intervalMs: number = 10000): void {
    this.bufferEnabled = true;
    this.bufferSize = bufferSize;
    
    // Setup interval to flush buffer
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    this.flushInterval = setInterval(() => {
      this.flushBuffer().catch(err => 
        console.error('Error flushing audit log buffer:', err)
      );
    }, intervalMs);
  }

  /**
   * Disable buffering and flush any remaining events
   */
  public async disableBuffering(): Promise<void> {
    this.bufferEnabled = false;
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    await this.flushBuffer();
  }

  /**
   * Log an audit event
   * 
   * @param event Audit event to log
   */
  public async logEvent(event: AuditEvent): Promise<void> {
    // Add default values
    const fullEvent: AuditEvent = {
      ...event,
      id: event.id || uuidv4(),
      timestamp: event.timestamp || new Date()
    };
    
    // If buffering is enabled, add to buffer
    if (this.bufferEnabled) {
      this.eventBuffer.push(fullEvent);
      
      // Flush if buffer is full
      if (this.eventBuffer.length >= this.bufferSize) {
        await this.flushBuffer();
      }
      
      return;
    }
    
    // Otherwise, write directly to database
    await this.writeEventToDatabase(fullEvent);
  }

  /**
   * Log an authentication event
   * 
   * @param type Authentication event type
   * @param status Success or failure
   * @param userId User ID if available
   * @param details Additional details
   */
  public async logAuthEvent(
    type: AuthEvent,
    status: 'SUCCESS' | 'FAILURE' | 'WARNING',
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    // Determine severity based on event type and status
    let severity = Severity.INFO;
    if (status === 'FAILURE') {
      if ([
        AuthEvent.LOGIN_FAILURE,
        AuthEvent.RATE_LIMIT_EXCEEDED
      ].includes(type as AuthEvent)) {
        severity = Severity.WARNING;
      } else {
        severity = Severity.ERROR;
      }
    }
    
    // Create and log the event
    await this.logEvent({
      category: EventCategory.AUTHENTICATION,
      type,
      userId,
      status,
      severity,
      details
    });
  }

  /**
   * Log a security event
   * 
   * @param type Security event type
   * @param status Success or failure
   * @param userId User ID if available
   * @param details Additional details
   */
  public async logSecurityEvent(
    type: SecurityEvent,
    status: 'SUCCESS' | 'FAILURE' | 'WARNING',
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    // Determine severity based on event type
    let severity = Severity.WARNING;
    if ([
      SecurityEvent.BRUTE_FORCE_ATTEMPT,
      SecurityEvent.SUSPICIOUS_ACTIVITY,
      SecurityEvent.CSRF_VIOLATION
    ].includes(type as SecurityEvent)) {
      severity = Severity.ERROR;
    }
    if (type === SecurityEvent.UNUSUAL_LOGIN_LOCATION) {
      severity = Severity.WARNING;
    }
    
    // Create and log the event
    await this.logEvent({
      category: EventCategory.SECURITY,
      type,
      userId,
      status,
      severity,
      details
    });
  }

  /**
   * Get audit events by criteria
   * 
   * @param criteria Search criteria
   * @param limit Maximum events to return
   * @param offset Pagination offset
   * @returns Matching audit events
   */
  public async getEvents(
    criteria: {
      category?: EventCategory;
      type?: string;
      userId?: string;
      dateRange?: DateRange;
      severity?: Severity;
      status?: 'SUCCESS' | 'FAILURE' | 'WARNING';
    },
    limit: number = 100,
    offset: number = 0
  ): Promise<{ events: any[]; total: number }> {
    try {
      // Build where clause based on criteria
      const where: any = {};
      
      if (criteria.category) {
        where.category = criteria.category;
      }
      
      if (criteria.type) {
        where.type = criteria.type;
      }
      
      if (criteria.userId) {
        where.userId = criteria.userId;
      }
      
      if (criteria.severity) {
        where.severity = criteria.severity;
      }
      
      if (criteria.status) {
        where.status = criteria.status;
      }
      
      if (criteria.dateRange) {
        where.timestamp = {
          gte: criteria.dateRange.from,
          lte: criteria.dateRange.to
        };
      }
      
      // Get total count
      const total = await prisma.auditLog.count({ where });
      
      // Get events
      const events = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      });
      
      // Parse details JSON
      const parsedEvents = events.map(event => ({
        ...event,
        details: event.details ? JSON.parse(event.details as string) : undefined
      }));
      
      return { events: parsedEvents, total };
    } catch (error) {
      console.error('Error retrieving audit events:', error);
      return { events: [], total: 0 };
    }
  }

  /**
   * Export audit log within date range
   * 
   * @param dateRange Date range to export
   * @returns Array of audit events
   */
  public async exportAuditLog(dateRange: DateRange): Promise<any[]> {
    try {
      const events = await prisma.auditLog.findMany({
        where: {
          timestamp: {
            gte: dateRange.from,
            lte: dateRange.to
          }
        },
        orderBy: { timestamp: 'asc' }
      });
      
      // Parse details JSON
      return events.map(event => ({
        ...event,
        details: event.details ? JSON.parse(event.details as string) : undefined
      }));
    } catch (error) {
      console.error('Error exporting audit log:', error);
      return [];
    }
  }

  /**
   * Write an event to the database
   * 
   * @param event Event to write
   */
  private async writeEventToDatabase(event: AuditEvent): Promise<void> {
    try {
      // Convert details to JSON string
      const details = event.details ? JSON.stringify(event.details) : null;
      
      // Write to database
      await prisma.auditLog.create({
        data: {
          id: event.id!,
          category: event.category,
          type: event.type,
          timestamp: event.timestamp!,
          userId: event.userId || null,
          username: event.username || null,
          sessionId: event.sessionId || null,
          ipAddress: event.ipAddress || null,
          userAgent: event.userAgent || null,
          resourceId: event.resourceId || null,
          resourceType: event.resourceType || null,
          action: event.action || null,
          status: event.status,
          severity: event.severity,
          details
        }
      });
    } catch (error) {
      console.error('Error writing audit event to database:', error);
      // In case of error, log to console at minimum
      console.warn('Audit event that failed to write:', event);
    }
  }

  /**
   * Flush buffered events to database
   */
  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }
    
    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];
    
    try {
      // Write events in chunks to avoid overwhelming the database
      const chunkSize = 25;
      for (let i = 0; i < eventsToFlush.length; i += chunkSize) {
        const chunk = eventsToFlush.slice(i, i + chunkSize);
        await Promise.all(chunk.map(event => this.writeEventToDatabase(event)));
      }
    } catch (error) {
      console.error('Error flushing audit event buffer:', error);
      // Put events back in buffer to retry later
      this.eventBuffer = [...eventsToFlush, ...this.eventBuffer];
    }
  }
}
