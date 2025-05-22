/**
 * Session Details Modal
 * 
 * Modal component that displays detailed information about a user session.
 * Provides options to revoke the session if it's active.
 */
import React from 'react';
import { UserSession } from '../../types/session.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { 
  Ban, 
  LogOut, 
  Clock, 
  Calendar, 
  Globe,
  MapPin,
  MonitorSmartphone,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SessionDetailsModalProps {
  session: UserSession;
  isOpen: boolean;
  onClose: () => void;
  onRevokeSession: (sessionId: string) => Promise<void>;
  isRevoking: boolean;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  isOpen,
  onClose,
  onRevokeSession,
  isRevoking
}) => {
  const isCurrentSession = () => {
    // Placeholder - should be replaced with actual logic
    return localStorage.getItem('currentSessionId') === session.id;
  };

  const isCurrent = isCurrentSession();
  const started = new Date(session.startedAt);
  const lastActive = new Date(session.lastActiveAt);
  const expires = new Date(session.expiresAt);
  const revoked = session.revokedAt ? new Date(session.revokedAt) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
          <DialogDescription>
            Detailed information about this user session.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              {session.deviceInfo.deviceName || 'Unknown Device'}
            </h3>
            {session.active ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
            )}
          </div>
          
          {isCurrent && (
            <Badge className="mb-4">Current Session</Badge>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Device Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <MonitorSmartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Device Type:</span>
                </div>
                <div>
                  {session.deviceInfo.deviceType || 
                    (session.deviceInfo.isMobile ? 'Mobile' : 
                     session.deviceInfo.isTablet ? 'Tablet' : 'Desktop')}
                </div>
                
                <div className="flex items-center">
                  <span className="text-muted-foreground ml-6">Browser:</span>
                </div>
                <div>{session.deviceInfo.browser} {session.deviceInfo.browserVersion}</div>
                
                <div className="flex items-center">
                  <span className="text-muted-foreground ml-6">Operating System:</span>
                </div>
                <div>{session.deviceInfo.os} {session.deviceInfo.osVersion}</div>
                
                {session.deviceInfo.isTrusted && (
                  <>
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Trusted Device:</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-600">Yes</span>
                      {session.deviceInfo.trustedSince && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (since {format(new Date(session.deviceInfo.trustedSince), 'PP')})
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Location Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">IP Address:</span>
                </div>
                <div>{session.ipAddress}</div>
                
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                </div>
                <div>Location data unavailable</div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Timing Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Started:</span>
                </div>
                <div>{format(started, 'PPP')} at {format(started, 'p')}</div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Active:</span>
                </div>
                <div>{format(lastActive, 'PPP')} at {format(lastActive, 'p')}</div>
                
                {session.active ? (
                  <>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Expires:</span>
                    </div>
                    <div>{format(expires, 'PPP')} at {format(expires, 'p')}</div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <Ban className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {session.revoked ? 'Revoked:' : 'Expired:'}
                      </span>
                    </div>
                    <div>
                      {revoked 
                        ? `${format(revoked, 'PPP')} at ${format(revoked, 'p')}` 
                        : `${format(expires, 'PPP')} at ${format(expires, 'p')}`}
                    </div>
                    
                    {session.revoked && session.revokedReason && (
                      <>
                        <div className="flex items-center">
                          <span className="text-muted-foreground ml-6">Reason:</span>
                        </div>
                        <div className="text-destructive">{session.revokedReason}</div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {session.active && !isCurrent && (
            <Button 
              variant="destructive" 
              onClick={() => onRevokeSession(session.id)}
              disabled={isRevoking}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Revoke Session
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailsModal;
