/**
 * Session Management Page
 * 
 * This page displays all active user sessions and allows the user to manage them.
 * Users can view details about each session and revoke sessions if needed.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserSession, SessionStatus } from '../types/session.types';
import { ActiveSessionsList } from '../components/sessions/ActiveSessionsList';
import { SessionHistoryList } from '../components/sessions/SessionHistoryList';
import { SessionDetailsModal } from '../components/sessions/SessionDetailsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, AlertTriangle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const SessionManagement: React.FC = () => {
  const { getSessions, revokeSession, revokeAllSessions, sessionManagement } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // Fetch sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userSessions = await getSessions();
      setSessions(userSessions);
    } catch (err) {
      setError('Failed to load sessions. Please try again later.');
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session revocation
  const handleRevokeSession = async (sessionId: string) => {
    try {
      setIsRevoking(true);
      const response = await revokeSession(sessionId, 'Manually revoked by user');
      
      if (response.success) {
        // Update sessions list after successful revocation
        await fetchSessions();
        setIsModalOpen(false);
      } else {
        setError(response.error || 'Failed to revoke session');
      }
    } catch (err) {
      setError('An error occurred while revoking the session');
      console.error('Error revoking session:', err);
    } finally {
      setIsRevoking(false);
    }
  };

  // Handle revoking all other sessions
  const handleRevokeAllSessions = async () => {
    if (window.confirm('Are you sure you want to log out from all other devices? This cannot be undone.')) {
      try {
        setIsRevoking(true);
        const response = await revokeAllSessions('Manually revoked by user');
        
        if (response.success) {
          // Update sessions list after successful revocation
          await fetchSessions();
        } else {
          setError(response.error || 'Failed to revoke all sessions');
        }
      } catch (err) {
        setError('An error occurred while revoking sessions');
        console.error('Error revoking all sessions:', err);
      } finally {
        setIsRevoking(false);
      }
    }
  };

  // View session details
  const handleViewSessionDetails = (session: UserSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  // Active and historical sessions
  const activeSessions = sessions.filter(session => session.active);
  const historicalSessions = sessions.filter(session => !session.active);

  // Loading state skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">Session Management</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Device & Session Security
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices. You can log out from unused or unrecognized devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">
                <strong>{sessionManagement.activeSessions}</strong> active {sessionManagement.activeSessions === 1 ? 'session' : 'sessions'}
              </p>
              {sessionManagement.hasMultipleDevices && (
                <p className="text-sm text-muted-foreground mt-1">
                  You're logged in on multiple devices
                </p>
              )}
            </div>
            <Button
              variant="destructive"
              onClick={handleRevokeAllSessions}
              disabled={isRevoking || activeSessions.length <= 1}
              className="flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out from all other devices
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Sessions ({activeSessions.length})</TabsTrigger>
          <TabsTrigger value="history">Session History ({historicalSessions.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <LoadingSkeleton />
          ) : activeSessions.length > 0 ? (
            <ActiveSessionsList 
              sessions={activeSessions} 
              onViewDetails={handleViewSessionDetails} 
              onRevokeSession={handleRevokeSession} 
              isRevoking={isRevoking}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active sessions found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          {isLoading ? (
            <LoadingSkeleton />
          ) : historicalSessions.length > 0 ? (
            <SessionHistoryList 
              sessions={historicalSessions} 
              onViewDetails={handleViewSessionDetails} 
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No session history found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRevokeSession={handleRevokeSession}
          isRevoking={isRevoking}
        />
      )}
    </div>
  );
};

export default SessionManagement;
