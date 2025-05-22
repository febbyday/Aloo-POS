/**
 * Session Settings Component
 * 
 * This component provides user-accessible settings for managing sessions and trusted devices
 * as part of the main settings interface.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, UserCheck, Users, ExternalLink } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSessionManagement } from '@/features/auth/hooks/useSessionManagement';

const SessionSettings: React.FC = () => {
  const navigate = useNavigate();
  const { sessionManagement } = useAuth();
  const { activeSessions, hasMultipleDevices } = useSessionManagement();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sessions &amp; Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your active sessions and security settings for your account.
        </p>
      </div>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            View and manage your active login sessions across all your devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">
                {activeSessions || 0} active {activeSessions === 1 ? 'session' : 'sessions'}
              </p>
              {hasMultipleDevices && (
                <p className="text-sm text-muted-foreground mt-1">
                  You're currently logged in from multiple devices
                </p>
              )}
            </div>
            <Button
              onClick={() => navigate('/users/session')}
              className="flex items-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Security Preferences
          </CardTitle>
          <CardDescription>
            Configure security settings for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-device-notifications">New device login alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when your account is accessed from a new device
              </p>
            </div>
            <Switch id="new-device-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inactive-session-logout">Auto-logout inactive sessions</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out sessions that have been inactive for an extended period
              </p>
            </div>
            <Switch id="inactive-session-logout" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="suspicious-activity-alerts">Suspicious activity alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified of potentially suspicious login attempts
              </p>
            </div>
            <Switch id="suspicious-activity-alerts" defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Save Preferences
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SessionSettings;
