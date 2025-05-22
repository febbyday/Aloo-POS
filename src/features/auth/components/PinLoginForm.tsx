/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 * 
 * PIN Login Form Component
 * 
 * A form for quick PIN-based authentication.
 */

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PinLoginRequestSchema, PinLoginRequest } from '../schemas/pin-auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { pinAuthService } from '../services/pinAuthService';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { isAccountLocked } from '../utils/securityUtils';
import { Loader2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface PinLoginFormProps {
  username: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  redirectUrl?: string;
}

export function PinLoginForm({ 
  username, 
  onSuccess, 
  onError, 
  onCancel,
  redirectUrl 
}: PinLoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinValues, setPinValues] = useState<string[]>(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger
  } = useForm<PinLoginRequest>({
    resolver: zodResolver(PinLoginRequestSchema),
    defaultValues: {
      username,
      pin: '',
      deviceId: getDeviceFingerprint(),
      rememberDevice: false
    }
  });
  
  // Check if account is locked
  useEffect(() => {
    const lockStatus = isAccountLocked(username);
    if (lockStatus.isLocked && lockStatus.remainingMs) {
      const remainingMinutes = Math.ceil(lockStatus.remainingMs / 60000);
      setError(`Too many failed login attempts. Please try again in ${remainingMinutes} minutes.`);
    }
  }, [username]);
  
  // Handle PIN input change
  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) {
      return;
    }
    
    // Update PIN values
    const newPinValues = [...pinValues];
    
    // If pasting multiple digits
    if (value.length > 1) {
      const digits = value.split('').slice(0, 4);
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 4) {
          newPinValues[index + i] = digits[i];
        }
      }
      setPinValues(newPinValues);
      
      // Focus on the appropriate input
      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs[nextIndex].current?.focus();
      
      // Update form value
      setValue('pin', newPinValues.join(''));
      trigger('pin');
      return;
    }
    
    // Handle single digit
    newPinValues[index] = value;
    setPinValues(newPinValues);
    
    // Move focus to next input if a digit was entered
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    
    // Update form value
    setValue('pin', newPinValues.join(''));
    trigger('pin');
  };
  
  // Handle key down events for navigation and deletion
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!pinValues[index] && index > 0) {
        // If current input is empty, move to previous input
        inputRefs[index - 1].current?.focus();
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: PinLoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if PIN is complete
      if (data.pin.length !== 4) {
        setError('Please enter a 4-digit PIN');
        setIsLoading(false);
        return;
      }
      
      // Login with PIN
      const result = await pinAuthService.loginWithPin({
        username: data.username,
        pin: data.pin,
        deviceId: data.deviceId,
        rememberDevice: data.rememberDevice
      });
      
      if (result.success) {
        onSuccess?.();
        
        // Redirect if URL is provided
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      } else {
        setError(result.error || 'PIN login failed');
        onError?.(result.error || 'PIN login failed');
        
        // Clear PIN values
        setPinValues(['', '', '', '']);
        setValue('pin', '');
        
        // Focus on first input
        inputRefs[0].current?.focus();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Clear PIN values
      setPinValues(['', '', '', '']);
      setValue('pin', '');
      
      // Focus on first input
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Username display */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">Enter PIN for</p>
          <p className="font-medium">{username}</p>
        </div>
        
        {/* PIN input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-center block">
            Enter your 4-digit PIN
          </label>
          
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-xl border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                value={pinValues[index]}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                autoComplete="off"
              />
            ))}
          </div>
          
          {errors.pin && (
            <p className="text-destructive text-xs text-center">{errors.pin.message}</p>
          )}
        </div>
        
        {/* Remember device checkbox */}
        <div className="flex items-center space-x-2 justify-center">
          <input
            id="rememberDevice"
            type="checkbox"
            className="h-4 w-4 border border-input rounded"
            disabled={isLoading}
            onChange={(e) => setValue('rememberDevice', e.target.checked)}
          />
          <label htmlFor="rememberDevice" className="text-sm">
            Remember this device
          </label>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Login with PIN
            </>
          )}
        </button>
        
        {/* Cancel button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md"
        >
          Use Password Instead
        </button>
      </form>
    </div>
  );
}
