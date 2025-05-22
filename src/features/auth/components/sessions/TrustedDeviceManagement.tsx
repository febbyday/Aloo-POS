/**
 * Trusted Device Management Component
 * 
 * Component for managing trusted devices in the session management system.
 * Allows users to view, add, and remove trusted devices.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShieldCheck, Trash, PlusCircle, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TrustedDevice } from '../../types/session.types';
import { formatDistanceToNow } from 'date-fns';

export const TrustedDeviceManagement: React.FC = () => {
  const { securitySettings, addTrustedDevice, removeTrustedDevice } = useAuth();
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [isCurrentDeviceTrusted, setIsCurrentDeviceTrusted] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<TrustedDevice | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Set trusted devices from security settings
  useEffect(() => {
    if (securitySettings.trustedDevices) {
      setTrustedDevices(securitySettings.trustedDevices);
      
      // Check if current device is trusted (placeholder implementation)
      const currentDeviceId = localStorage.getItem('deviceId');
      const isTrusted = securitySettings.trustedDevices.some(
        device => device.deviceId === currentDeviceId
      );
      setIsCurrentDeviceTrusted(isTrusted);
    }
  }, [securitySettings.trustedDevices]);

  // Handle toggling current device trust status
  const handleToggleTrustCurrentDevice = async () => {
    setIsProcessing(true);
    try {
      if (isCurrentDeviceTrusted) {
        // Find the current device in the trusted devices list
        const currentDeviceId = localStorage.getItem('deviceId');
        const currentDevice = trustedDevices.find(device => device.deviceId === currentDeviceId);
        
        if (currentDevice) {
          await removeTrustedDevice(currentDevice.deviceId);
          setIsCurrentDeviceTrusted(false);
        }
      } else {
        // Add current device to trusted devices
        await addTrustedDevice();
        setIsCurrentDeviceTrusted(true);
      }
    } catch (error) {
      console.error('Error toggling device trust status:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Open confirmation dialog for removing trusted device
  const confirmRemoveTrustedDevice = (device: TrustedDevice) => {
    setSelectedDevice(device);
    setIsAlertOpen(true);
  };

  // Handle removing trusted device
  const handleRemoveTrustedDevice = async () => {
    if (!selectedDevice) return;
    
    setIsProcessing(true);
    try {
      await removeTrustedDevice(selectedDevice.deviceId);
      // The trusted devices will be updated via the effect hook
    } catch (error) {
      console.error('Error removing trusted device:', error);
    } finally {
      setIsProcessing(false);
      setIsAlertOpen(false);
      setSelectedDevice(null);
    }
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Trusted Devices
          </CardTitle>
          <CardDescription>
            Trusted devices allow you to skip additional verification steps when logging in.
            Only mark devices as trusted if they are personal and secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trusted-device">Trust this device</Label>
                <p className="text-sm text-muted-foreground">
                  Mark your current device as trusted
                </p>
              </div>
              <Switch 
                id="trusted-device" 
                checked={isCurrentDeviceTrusted}
                onCheckedChange={handleToggleTrustCurrentDevice}
                disabled={isProcessing || securitySettings.isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Your Trusted Devices</h3>
            
            {trustedDevices.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">
                You don't have any trusted devices yet.
              </div>
            ) : (
              <div className="space-y-3">
                {trustedDevices.map((device) => (
                  <div 
                    key={device.deviceId} 
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div>
                      <p className="font-medium">{device.deviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {device.browser} on {device.os}
                      </p>
                      {device.trustedSince && (
                        <p className="text-xs text-muted-foreground">
                          Trusted since {formatDistanceToNow(new Date(device.trustedSince))} ago
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => confirmRemoveTrustedDevice(device)}
                      disabled={isProcessing}
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              Remove Trusted Device
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this trusted device?
              {selectedDevice && (
                <div className="mt-2 font-medium">
                  {selectedDevice.deviceName} ({selectedDevice.browser} on {selectedDevice.os})
                </div>
              )}
              <p className="mt-2">
                You'll need to complete additional verification steps when logging in from this device in the future.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveTrustedDevice}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrustedDeviceManagement;
