/**
 * PIN Setup Form Component
 *
 * A form for setting up a PIN for quick login with enhanced security features:
 * - PIN strength assessment
 * - Pattern detection
 * - Common PIN detection
 * - Secure PIN generation
 * - PIN history tracking
 * - PIN lockout mechanism
 */

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PinSetupRequestSchema, PinSetupRequest } from '../schemas/pin-auth.schemas';
import { pinAuthService } from '../services/pinAuthService';
import {
  evaluatePinStrength,
  PinStrength,
  validatePinComplexity,
  getPinStrengthFeedback,
  generateSecurePin,
  checkAndUpdatePinHistory,
  checkPinLockStatus,
  resetPinLockout,
  formatLockoutDuration,
  PinLockoutStatus
} from '../utils/pinSecurity';
import { useAuth } from '../hooks/useAuth';
import {
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Info,
  RefreshCw,
  Shield,
  AlarmClock,
  LockKeyhole,
  Unlock
} from 'lucide-react';

export interface PinSetupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

export function PinSetupForm({
  onSuccess,
  onError,
  onCancel
}: PinSetupFormProps) {
  const { user } = useAuth();
  const username = user?.username || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinValues, setPinValues] = useState<string[]>(['', '', '', '']);
  const [confirmPinValues, setConfirmPinValues] = useState<string[]>(['', '', '', '']);
  const [pinStrength, setPinStrength] = useState<PinStrength | null>(null);
  const [pinFeedback, setPinFeedback] = useState<{ message: string; suggestions?: string[] } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lockStatus, setLockStatus] = useState<PinLockoutStatus | null>(null);
  const [pinHistoryWarning, setPinHistoryWarning] = useState(false);
  const [remainingTimeDisplay, setRemainingTimeDisplay] = useState('');
  
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const confirmPinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch
  } = useForm<PinSetupRequest>({
    resolver: zodResolver(PinSetupRequestSchema),
    defaultValues: {
      pin: '',
      confirmPin: '',
      currentPassword: ''
    }
  });

  const currentPassword = watch('currentPassword');

  // Check lockout status when component mounts
  useEffect(() => {
    if (username) {
      checkLockoutStatus();
    }
  }, [username]);
  
  // Update remaining time display every second if locked
  useEffect(() => {
    if (!lockStatus?.isLocked) return;
    
    const timer = setInterval(() => {
      const updatedStatus = checkPinLockStatus(username);
      setLockStatus(updatedStatus);
      
      if (updatedStatus.isLocked) {
        setRemainingTimeDisplay(formatLockoutDuration(updatedStatus.remainingTime));
      } else {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lockStatus?.isLocked, username]);
  
  // Check lockout status
  const checkLockoutStatus = () => {
    if (!username) return;
    
    const status = checkPinLockStatus(username);
    setLockStatus(status);
    
    if (status.isLocked) {
      setRemainingTimeDisplay(formatLockoutDuration(status.remainingTime));
      setError(`Account is temporarily locked. Please try again in ${formatLockoutDuration(status.remainingTime)}.`);
    }
  };
  
  // Reset lockout status (admin function)
  const handleResetLockout = () => {
    if (!username) return;
    
    resetPinLockout(username);
    checkLockoutStatus();
    setError(null);
  };

  // Check PIN strength using the enhanced PIN security utility
  const checkPinStrength = (pin: string) => {
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setPinStrength(null);
      setPinFeedback(null);
      setPinHistoryWarning(false);
      return;
    }

    // Get comprehensive PIN strength evaluation and feedback
    const feedback = getPinStrengthFeedback(pin);
    setPinStrength(feedback.strength);
    setPinFeedback({
      message: feedback.message,
      suggestions: feedback.suggestions
    });
    
    // Check if PIN is in history (if user is available)
    if (username) {
      setPinHistoryWarning(!checkAndUpdatePinHistory(username, pin, 5));
    }
  };

  // Generate a secure PIN
  const generatePin = () => {
    const securePin = generateSecurePin();
    const pinDigits = securePin.split('');

    // Update PIN values
    setPinValues(pinDigits);

    // Update form value
    setValue('pin', securePin);
    trigger('pin');

    // Check PIN strength
    checkPinStrength(securePin);

    // Focus on the first confirm PIN input
    confirmPinInputRefs[0].current?.focus();
  };

  // Handle PIN input change
  const handlePinChange = (index: number, value: string, isConfirm: boolean = false) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Update PIN values
    const newPinValues = isConfirm ? [...confirmPinValues] : [...pinValues];
    const inputRefs = isConfirm ? confirmPinInputRefs : pinInputRefs;

    // If pasting multiple digits
    if (value.length > 1) {
      const digits = value.split('').slice(0, 4);
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 4) {
          newPinValues[index + i] = digits[i];
        }
      }

      if (isConfirm) {
        setConfirmPinValues(newPinValues);
      } else {
        setPinValues(newPinValues);
      }

      // Focus on the appropriate input
      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs[nextIndex].current?.focus();

      // Update form value
      const pinValue = newPinValues.join('');
      setValue(isConfirm ? 'confirmPin' : 'pin', pinValue);
      trigger(isConfirm ? 'confirmPin' : 'pin');

      // Check PIN strength if not confirm
      if (!isConfirm) {
        checkPinStrength(pinValue);
      }

      return;
    }

    // Handle single digit
    newPinValues[index] = value;

    if (isConfirm) {
      setConfirmPinValues(newPinValues);
    } else {
      setPinValues(newPinValues);
    }

    // Move focus to next input if a digit was entered
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Update form value
    const pinValue = newPinValues.join('');
    setValue(isConfirm ? 'confirmPin' : 'pin', pinValue);
    trigger(isConfirm ? 'confirmPin' : 'pin');

    // Check PIN strength if not confirm
    if (!isConfirm) {
      checkPinStrength(pinValue);
    }
  };

  // Handle key down events for navigation and deletion
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isConfirm: boolean = false) => {
    const inputRefs = isConfirm ? confirmPinInputRefs : pinInputRefs;
    const pinValueArray = isConfirm ? confirmPinValues : pinValues;

    // Handle backspace
    if (e.key === 'Backspace') {
      if (!pinValueArray[index] && index > 0) {
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

    // Handle Tab key to move between PIN and confirm PIN
    if (e.key === 'Tab' && !isConfirm && index === 3 && !e.shiftKey) {
      e.preventDefault();
      confirmPinInputRefs[0].current?.focus();
    }

    if (e.key === 'Tab' && isConfirm && index === 0 && e.shiftKey) {
      e.preventDefault();
      pinInputRefs[3].current?.focus();
    }
  };

  // Handle form submission
  const onSubmit = async (data: PinSetupRequest) => {
    try {
      // Check for account lockout first
      if (username) {
        const status = checkPinLockStatus(username);
        if (status.isLocked) {
          setError(`Account is temporarily locked. Please try again in ${formatLockoutDuration(status.remainingTime)}.`);
          return;
        }
      }
      
      setIsLoading(true);
      setError(null);

      // Check if PINs match
      if (data.pin !== data.confirmPin) {
        setError('PINs do not match');
        setIsLoading(false);
        return;
      }

      // Validate PIN complexity
      const validation = validatePinComplexity(data.pin);
      if (!validation.isValid) {
        setError(validation.message || 'PIN does not meet security requirements');
        setIsLoading(false);
        return;
      }

      // Check if PIN is too weak
      if (pinStrength === PinStrength.WEAK) {
        setError('PIN is too weak. Please choose a more secure PIN or use the generator.');
        setIsLoading(false);
        return;
      }
      
      // Check if PIN is in history
      if (username && !checkAndUpdatePinHistory(username, data.pin, 5)) {
        setError('You have used this PIN recently. Please choose a different PIN.');
        setIsLoading(false);
        return;
      }

      // Setup PIN
      const result = await pinAuthService.setupPin(data);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to set up PIN');
        onError?.(result.error || 'Failed to set up PIN');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
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
        
        {/* Lockout warning */}
        {lockStatus?.isLocked && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm flex items-center gap-2">
            <AlarmClock className="h-4 w-4" />
            <div className="flex-1">
              <p className="font-medium">Account temporarily locked</p>
              <p>Too many failed attempts. Try again in {remainingTimeDisplay}.</p>
            </div>
            {/* Admin unlock button - only shown for users with appropriate permissions */}
            {user?.roles?.includes('admin') && (
              <button
                type="button"
                onClick={handleResetLockout}
                className="text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 py-1 px-2 rounded flex items-center gap-1"
              >
                <Unlock className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        )}
        
        {/* Account status indicator */}
        {!lockStatus?.isLocked && lockStatus?.attempts > 0 && (
          <div className="bg-blue-100 text-blue-800 p-3 rounded-md text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>
              {lockStatus.attempts} failed attempt{lockStatus.attempts !== 1 ? 's' : ''} recorded. 
              Account will lock after {lockStatus.maxAttempts} failed attempts.
            </span>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">Set Up PIN for Quick Login</h3>
          <p className="text-sm text-muted-foreground">
            Create a 4-digit PIN to quickly log in to the POS system
          </p>
        </div>

        {/* PIN input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium block">
              Enter a 4-digit PIN
            </label>

            <button
              type="button"
              onClick={generatePin}
              className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              title="Generate a secure PIN"
              disabled={isLoading || lockStatus?.isLocked}
            >
              <RefreshCw className="h-3 w-3" />
              Generate Secure PIN
            </button>
          </div>

          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={pinInputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-xl border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                value={pinValues[index]}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading || lockStatus?.isLocked}
                autoComplete="off"
              />
            ))}
          </div>

          {errors.pin && (
            <p className="text-destructive text-xs">{errors.pin.message}</p>
          )}
          
          {/* PIN history warning */}
          {pinHistoryWarning && (
            <div className="text-amber-600 text-xs flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              <span>You have used this PIN recently. Please choose a different PIN.</span>
            </div>
          )}

          {/* PIN strength indicator */}
          {pinStrength && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      pinStrength === PinStrength.WEAK
                        ? 'bg-destructive w-1/3'
                        : pinStrength === PinStrength.MEDIUM
                          ? 'bg-yellow-500 w-2/3'
                          : 'bg-green-500 w-full'
                    }`}
                  />
                </div>
                <span className="text-xs font-medium">
                  {pinStrength === PinStrength.WEAK
                    ? 'Weak'
                    : pinStrength === PinStrength.MEDIUM
                      ? 'Medium'
                      : 'Strong'}
                </span>
                {pinStrength === PinStrength.WEAK && (
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                )}
                {pinStrength === PinStrength.MEDIUM && (
                  <Shield className="h-4 w-4 text-yellow-500" />
                )}
                {pinStrength === PinStrength.STRONG && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}

                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-xs flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="h-3 w-3 mr-1" />
                  {showSuggestions ? 'Hide' : 'Info'}
                </button>
              </div>

              {showSuggestions && pinFeedback && (
                <div className="bg-muted/50 p-2 rounded-md text-xs space-y-1">
                  <p>{pinFeedback.message}</p>
                  {pinFeedback.suggestions && pinFeedback.suggestions.length > 0 && (
                    <ul className="list-disc list-inside pl-1 pt-1">
                      {pinFeedback.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm PIN input */}
        <div className="space-y-2">
          <label className="text-sm font-medium block">
            Confirm your PIN
          </label>

          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={confirmPinInputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-xl border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                value={confirmPinValues[index]}
                onChange={(e) => handlePinChange(index, e.target.value, true)}
                onKeyDown={(e) => handleKeyDown(index, e, true)}
                disabled={isLoading || lockStatus?.isLocked}
                autoComplete="off"
              />
            ))}
          </div>

          {errors.confirmPin && (
            <p className="text-destructive text-xs">{errors.confirmPin.message}</p>
          )}
        </div>

        {/* Current password for verification */}
        <div className="space-y-2">
          <label className="text-sm font-medium block" htmlFor="currentPassword">
            Current Password (for verification)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              {...register('currentPassword')}
              type="password"
              id="currentPassword"
              className="pl-10 w-full h-10 border border-input rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
              disabled={isLoading || lockStatus?.isLocked}
              autoComplete="current-password"
            />
          </div>
          {errors.currentPassword && (
            <p className="text-destructive text-xs">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* Form actions */}
        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading || !currentPassword || lockStatus?.isLocked || pinHistoryWarning}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : lockStatus?.isLocked ? (
              <>
                <LockKeyhole className="h-4 w-4" />
                Account Locked
              </>
            ) : (
              'Set PIN'
            )}
          </button>
        </div>
        
        {/* Security information */}
        <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
          <p className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            For your security:
          </p>
          <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
            <li>Your PIN must be 4 digits and not easily guessable</li>
            <li>Avoid sequential numbers and repeated patterns</li>
            <li>PIN will be stored securely and never displayed</li>
            <li>Multiple failed attempts will temporarily lock your account</li>
            <li>You cannot reuse your recent PINs</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
