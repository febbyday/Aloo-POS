/**
 * Active Sessions List Component
 * 
 * Displays a list of all active user sessions with options to view details or revoke.
 */
import React from 'react';
import { UserSession } from '../../types/session.types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Info, Laptop, Smartphone, Tablet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActiveSessionsListProps {
  sessions: UserSession[];
  onViewDetails: (session: UserSession) => void;
  onRevokeSession: (sessionId: string) => Promise<void>;
  isRevoking: boolean;
}

export const ActiveSessionsList: React.FC<ActiveSessionsListProps> = ({
  sessions,
  onViewDetails,
  onRevokeSession,
  isRevoking
}) => {
  // Function to get appropriate device icon
  const getDeviceIcon = (session: UserSession) => {
    const { deviceInfo } = session;
    
    if (deviceInfo.isMobile) return <Smartphone className="h-5 w-5" />;
    if (deviceInfo.isTablet) return <Tablet className="h-5 w-5" />;
    return <Laptop className="h-5 w-5" />;
  };

  // Function to determine if this is the current session
  const isCurrentSession = (session: UserSession) => {
    // We would check against the current session ID stored in context
    // This is a placeholder implementation - should be replaced with actual logic
    return localStorage.getItem('currentSessionId') === session.id;
  };

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const current = isCurrentSession(session);
        const deviceIcon = getDeviceIcon(session);
        const lastActive = new Date(session.lastActiveAt);
        const started = new Date(session.startedAt);
        
        return (
          <Card key={session.id} className={current ? 'border-primary' : ''}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{deviceIcon}</div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        {session.deviceInfo.deviceName || 'Unknown Device'} 
                        {current && <Badge className="ml-2">Current Session</Badge>}
                      </h3>
                      {session.deviceInfo.isTrusted && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="ml-2">Trusted</Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This is a trusted device</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.deviceInfo.browser} on {session.deviceInfo.os}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>Last active: {formatDistanceToNow(lastActive)} ago</p>
                      <p>Started: {formatDistanceToNow(started)} ago</p>
                      <p>IP Address: {session.ipAddress}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(session)}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  
                  {!current && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onRevokeSession(session.id)}
                      disabled={isRevoking}
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ActiveSessionsList;
