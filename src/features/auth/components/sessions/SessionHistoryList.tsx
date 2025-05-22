/**
 * Session History List Component
 * 
 * Displays a list of historical (inactive) user sessions with options to view details.
 */
import React from 'react';
import { UserSession, SessionStatus } from '../../types/session.types';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Info, Clock, Ban, Laptop, Smartphone, Tablet, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SessionHistoryListProps {
  sessions: UserSession[];
  onViewDetails: (session: UserSession) => void;
}

export const SessionHistoryList: React.FC<SessionHistoryListProps> = ({
  sessions,
  onViewDetails
}) => {
  // Function to get appropriate device icon
  const getDeviceIcon = (session: UserSession) => {
    const { deviceInfo } = session;
    
    if (deviceInfo.isMobile) return <Smartphone className="h-5 w-5" />;
    if (deviceInfo.isTablet) return <Tablet className="h-5 w-5" />;
    return <Laptop className="h-5 w-5" />;
  };

  // Function to get session status icon
  const getStatusIcon = (session: UserSession) => {
    if (session.revoked) return <Ban className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  // Function to get status text
  const getStatusText = (session: UserSession) => {
    if (session.revoked) {
      return `Revoked ${session.revokedAt ? formatDistanceToNow(new Date(session.revokedAt)) + ' ago' : ''}`;
    }
    return 'Expired';
  };

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const statusIcon = getStatusIcon(session);
        const statusText = getStatusText(session);
        const deviceIcon = getDeviceIcon(session);
        const ended = session.revokedAt ? new Date(session.revokedAt) : new Date(session.expiresAt);
        const started = new Date(session.startedAt);
        
        return (
          <Card key={session.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{deviceIcon}</div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        {session.deviceInfo.deviceName || 'Unknown Device'}
                      </h3>
                      <Badge variant="outline" className="ml-2 flex items-center">
                        {statusIcon}
                        <span className="ml-1">{statusText}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.deviceInfo.browser} on {session.deviceInfo.os}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>Started: {format(started, 'PPP')} at {format(started, 'p')}</p>
                      <p>Ended: {format(ended, 'PPP')} at {format(ended, 'p')}</p>
                      <p>IP Address: {session.ipAddress}</p>
                      {session.revokedReason && (
                        <p className="text-destructive">
                          Reason: {session.revokedReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(session)}
                >
                  <Info className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SessionHistoryList;
