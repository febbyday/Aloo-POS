import { prisma } from '../prisma';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/userRepository';

// Duration constants
const SESSION_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const SESSION_CLEANUP_INTERVAL = 1 * 60 * 60 * 1000; // 1 hour

/**
 * Session interface
 */
export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

/**
 * Session Activity interface
 */
interface SessionActivity {
  sessionId: string;
  activity: string;
  timestamp: Date;
  details?: Record<string, any>;
}

/**
 * Session Manager
 * Handles user session creation, validation, and management
 */
export class SessionManager {
  private static sessions = new Map<string, Session>();
  private static activities = new Map<string, SessionActivity[]>();

  /**
   * Create a new session for a user
   * 
   * @param userId User identifier
   * @param metadata Additional metadata for the session
   * @returns Created session
   */
  static async createSession(
    userId: string, 
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<Session> {
    // Verify the user exists
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create expiry time
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);

    try {
      // Create session in database
      const session = await prisma.session.create({
        data: {
          id: uuidv4(),
          userId,
          expiresAt,
          lastActivityAt: now,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          isActive: true
        }
      });

      // Store in memory for quicker access
      this.sessions.set(session.id, session);

      // Log session creation
      this.logActivity(session.id, 'SESSION_CREATED', { 
        userId,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent
      });

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Validate a session
   * 
   * @param sessionId Session identifier
   * @returns True if session is valid, false otherwise
   */
  static async validateSession(sessionId: string): Promise<boolean> {
    try {
      // Check in-memory cache first
      const cachedSession = this.sessions.get(sessionId);
      if (cachedSession) {
        const now = new Date();
        if (cachedSession.expiresAt > now && cachedSession.isActive) {
          // Update activity time and return valid
          await this.updateSessionActivity(sessionId);
          return true;
        }
        return false;
      }

      // Check database if not in memory
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
        return false;
      }

      // Check if session is active and not expired
      const now = new Date();
      if (session.expiresAt > now && session.isActive) {
        // Update activity time and cache in memory
        this.sessions.set(sessionId, session);
        await this.updateSessionActivity(sessionId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  /**
   * Update a session's last activity time
   * 
   * @param sessionId Session identifier
   * @returns Updated session or null if not found
   */
  static async updateSessionActivity(sessionId: string): Promise<Session | null> {
    try {
      const now = new Date();
      
      // Update in database
      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: { 
          lastActivityAt: now,
          // Extend expiry time with each activity
          expiresAt: new Date(now.getTime() + SESSION_TIMEOUT)
        }
      });

      // Update in memory
      if (updatedSession) {
        this.sessions.set(sessionId, updatedSession);
      }

      return updatedSession;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return null;
    }
  }

  /**
   * Terminate a session
   * 
   * @param sessionId Session identifier
   * @returns True if terminated successfully, false otherwise
   */
  static async terminateSession(sessionId: string): Promise<boolean> {
    try {
      // Update in database
      const result = await prisma.session.update({
        where: { id: sessionId },
        data: { isActive: false }
      });

      // Remove from memory
      this.sessions.delete(sessionId);
      
      // Log activity
      this.logActivity(sessionId, 'SESSION_TERMINATED');

      return !!result;
    } catch (error) {
      console.error('Error terminating session:', error);
      return false;
    }
  }

  /**
   * Terminate all sessions for a user
   * 
   * @param userId User identifier
   * @param exceptSessionId Optional session ID to keep active
   * @returns Number of sessions terminated
   */
  static async terminateUserSessions(
    userId: string, 
    exceptSessionId?: string
  ): Promise<number> {
    try {
      // Update in database
      const result = await prisma.session.updateMany({
        where: { 
          userId,
          isActive: true,
          id: exceptSessionId ? { not: exceptSessionId } : undefined
        },
        data: { isActive: false }
      });

      // Remove from memory
      for (const [id, session] of this.sessions.entries()) {
        if (session.userId === userId && (!exceptSessionId || id !== exceptSessionId)) {
          this.sessions.delete(id);
          // Log activity
          this.logActivity(id, 'SESSION_TERMINATED', { reason: 'USER_LOGOUT_ALL' });
        }
      }

      return result.count;
    } catch (error) {
      console.error('Error terminating user sessions:', error);
      return 0;
    }
  }

  /**
   * Clean up expired and inactive sessions
   * 
   * @returns Number of sessions cleaned up
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      
      // Find expired sessions
      const expiredSessions = await prisma.session.findMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { isActive: false }
          ]
        },
        select: { id: true }
      });
      
      // Delete from database
      const result = await prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { isActive: false }
          ]
        }
      });

      // Remove from memory
      for (const session of expiredSessions) {
        this.sessions.delete(session.id);
      }

      // Log cleanup
      console.log(`Cleaned up ${result.count} expired sessions`);
      
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get active sessions for a user
   * 
   * @param userId User identifier
   * @returns List of active sessions
   */
  static async getUserActiveSessions(userId: string): Promise<Session[]> {
    try {
      return await prisma.session.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Log session activity
   * 
   * @param sessionId Session identifier
   * @param activity Activity type
   * @param details Additional details
   */
  static logActivity(
    sessionId: string,
    activity: string,
    details?: Record<string, any>
  ): void {
    const timestamp = new Date();
    
    // Create activity record
    const activityRecord: SessionActivity = {
      sessionId,
      activity,
      timestamp,
      details
    };

    // Add to memory log
    const sessionActivities = this.activities.get(sessionId) || [];
    sessionActivities.push(activityRecord);
    this.activities.set(sessionId, sessionActivities);

    // Asynchronously log to database
    prisma.sessionActivity.create({
      data: {
        sessionId,
        activity,
        timestamp,
        details: details ? JSON.stringify(details) : null
      }
    }).catch(error => {
      console.error('Error logging session activity:', error);
    });
  }

  /**
   * Get session activities
   * 
   * @param sessionId Session identifier
   * @param limit Maximum number of activities to return
   * @returns List of session activities
   */
  static async getSessionActivities(
    sessionId: string,
    limit = 50
  ): Promise<SessionActivity[]> {
    try {
      const activities = await prisma.sessionActivity.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return activities.map(activity => ({
        ...activity,
        details: activity.details ? JSON.parse(activity.details as string) : undefined
      }));
    } catch (error) {
      console.error('Error getting session activities:', error);
      return [];
    }
  }
}

// Setup periodic cleanup
setInterval(() => {
  SessionManager.cleanupExpiredSessions()
    .catch(error => console.error('Error in session cleanup:', error));
}, SESSION_CLEANUP_INTERVAL);
