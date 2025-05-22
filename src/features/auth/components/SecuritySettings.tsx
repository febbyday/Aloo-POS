/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * Security Settings Component
 * 
 * A component for managing security settings, including PIN setup and trusted devices.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PinSetupForm } from './PinSetupForm';
import { TrustedDevice } from '../types/auth.types';
import { Loader2, Shield, Lock, Smartphone, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export interface SecuritySettingsProps {
  onClose?: () => void;
}

export function SecuritySettings({ onClose }: SecuritySettingsProps) {
  const { 
    user, 
    isPinAuthEnabled, 
    pinAuthStatus, 
    securitySettings,
    setupPin,
    changePin,
    disablePin,
    isPinEnabled,
    addTrustedDevice,
    removeTrustedDevice
  } = useAuth();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showPinSetup, setShowPinSetup] = useState<boolean>(false);
  const [showPinChange, setShowPinChange] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Load PIN status on mount
  useEffect(() => {
    const loadPinStatus = async () => {
      try {
        await isPinEnabled();
        setIsLoading(false);
      } catch (error) {
        setError('Failed to load security settings');
        setIsLoading(false);
      }
    };
    
    loadPinStatus();
  }, [isPinEnabled]);
  
  // Handle PIN setup
  const handleSetupPin = async (pin: string, confirmPin: string, currentPassword: string) => {
    setError(null);
    setSuccess(null);
    
    try {
      const result = await setupPin(pin, confirmPin, currentPassword);
      
      if (result.success) {
        setSuccess('PIN setup successfully');
        setShowPinSetup(false);
      } else {
        setError(result.error || 'Failed to set up PIN');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };
  
  // Handle PIN change
  const handleChangePin = async (currentPin: string, newPin: string, confirmPin: string) => {
    setError(null);
    setSuccess(null);
    
    try {
      const result = await changePin(currentPin, newPin, confirmPin);
      
      if (result.success) {
        setSuccess('PIN changed successfully');
        setShowPinChange(false);
      } else {
        setError(result.error || 'Failed to change PIN');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };
  
  // Handle PIN disable
  const handleDisablePin = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      const result = await disablePin();
      
      if (result.success) {
        setSuccess('PIN disabled successfully');
      } else {
        setError(result.error || 'Failed to disable PIN');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };
  
  // Handle add trusted device
  const handleAddTrustedDevice = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      const result = await addTrustedDevice();
      
      if (result.success) {
        setSuccess('Device added to trusted devices');
      } else {
        setError(result.error || 'Failed to add device');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };
  
  // Handle remove trusted device
  const handleRemoveTrustedDevice = async (deviceId: string) => {
    setError(null);
    setSuccess(null);
    
    try {
      const result = await removeTrustedDevice(deviceId);
      
      if (result.success) {
        setSuccess('Device removed from trusted devices');
      } else {
        setError(result.error || 'Failed to remove device');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (showPinSetup) {
    return (
      <div className="p-4">
        <button
          onClick={() => setShowPinSetup(false)}
          className="mb-4 text-sm text-primary flex items-center"
        >
          ← Back to Security Settings
        </button>
        
        <PinSetupForm
          onSuccess={() => {
            setShowPinSetup(false);
            setSuccess('PIN setup successfully');
          }}
          onError={(error) => setError(error)}
          onCancel={() => setShowPinSetup(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Security Settings
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/15 text-green-500 p-3 rounded-md text-sm flex items-center">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}
      
      {/* PIN Authentication */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Lock className="h-4 w-4 mr-2 text-primary" />
          PIN Authentication
        </h3>
        
        <p className="text-sm text-muted-foreground">
          Set up a 4-digit PIN for quick login to the POS system.
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">Status:</span>
            {pinAuthStatus.isEnabled ? (
              <span className="text-green-500 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Enabled
              </span>
            ) : (
              <span className="text-muted-foreground">Not enabled</span>
            )}
          </div>
          
          {pinAuthStatus.isEnabled ? (
            <div className="space-x-2">
              <button
                onClick={() => setShowPinChange(true)}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
              >
                Change PIN
              </button>
              <button
                onClick={handleDisablePin}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded-md text-sm"
                disabled={pinAuthStatus.isLoading}
              >
                {pinAuthStatus.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Disable PIN'
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPinSetup(true)}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
              disabled={pinAuthStatus.isLoading}
            >
              {pinAuthStatus.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Set Up PIN'
              )}
            </button>
          )}
        </div>
        
        {pinAuthStatus.lastChanged && (
          <p className="text-xs text-muted-foreground">
            Last changed: {new Date(pinAuthStatus.lastChanged).toLocaleString()}
          </p>
        )}
      </div>
      
      {/* Trusted Devices */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-medium flex items-center">
          <Smartphone className="h-4 w-4 mr-2 text-primary" />
          Trusted Devices
        </h3>
        
        <p className="text-sm text-muted-foreground">
          Manage devices that are trusted for quick login.
        </p>
        
        <div className="space-y-2">
          {securitySettings.trustedDevices.length > 0 ? (
            securitySettings.trustedDevices.map((device: TrustedDevice) => (
              <div key={device.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Last used: {new Date(device.lastUsed).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveTrustedDevice(device.id)}
                  className="text-destructive hover:text-destructive/80"
                  disabled={securitySettings.isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No trusted devices</p>
          )}
        </div>
        
        <button
          onClick={handleAddTrustedDevice}
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
          disabled={securitySettings.isLoading}
        >
          {securitySettings.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Trust This Device'
          )}
        </button>
      </div>
    </div>
  );
}
