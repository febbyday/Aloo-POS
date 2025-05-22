/**
 * PIN Security Utilities
 * 
 * This module provides comprehensive PIN security features including:
 * - Common PIN detection
 * - PIN complexity validation
 * - Pattern detection
 * - PIN lockout mechanism
 * - Brute force protection
 * - PIN history tracking
 * - Security alerts
 */

// Import the auth service using default import to fix type errors
import authService from '../services/factory-auth-service';

// Storage keys for PIN security
const PIN_ATTEMPT_COUNT_KEY = 'pin_attempt_count';
const PIN_LOCKOUT_TIME_KEY = 'pin_lockout_time';
const PIN_LAST_ATTEMPT_KEY = 'pin_last_attempt_time';
const PIN_HISTORY_KEY = 'pin_history';

/**
 * List of common PINs to reject
 * These are the most commonly used PINs based on data breaches and studies
 */
export const COMMON_PINS = [
  // Sequential patterns
  '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
  '1234', '2345', '3456', '4567', '5678', '6789', '9876', '8765', '7654', '6543', '5432', '4321', '3210',
  '0123', '1230', '0987', '9870',
  
  // Repeating patterns
  '1212', '2121', '1313', '3131', '1414', '4141', '1515', '5151', '1616', '6161',
  '1717', '7171', '1818', '8181', '1919', '9191', '2020', '0202', '2323', '3232',
  '2424', '4242', '2525', '5252', '2626', '6262', '2727', '7272', '2828', '8282',
  '2929', '9292', '3030', '0303', '3434', '4343', '3535', '5353', '3636', '6363',
  '3737', '7373', '3838', '8383', '3939', '9393', '4040', '0404', '4545', '5454',
  '4646', '6464', '4747', '7474', '4848', '8484', '4949', '9494', '5050', '0505',
  '5656', '6565', '5757', '7575', '5858', '8585', '5959', '9595', '6060', '0606',
  '6767', '7676', '6868', '8686', '6969', '9696', '7070', '0707', '7878', '8787',
  '7979', '9797', '8080', '0808', '8989', '9898', '9090', '0909',
  
  // Common combinations
  '1122', '2211', '1133', '3311', '1144', '4411', '1155', '5511', '1166', '6611',
  '1177', '7711', '1188', '8811', '1199', '9911', '2233', '3322', '2244', '4422',
  '2255', '5522', '2266', '6622', '2277', '7722', '2288', '8822', '2299', '9922',
  '3344', '4433', '3355', '5533', '3366', '6633', '3377', '7733', '3388', '8833',
  '3399', '9933', '4455', '5544', '4466', '6644', '4477', '7744', '4488', '8844',
  '4499', '9944', '5566', '6655', '5577', '7755', '5588', '8855', '5599', '9955',
  '6677', '7766', '6688', '8866', '6699', '9966', '7788', '8877', '7799', '9977',
  '8899', '9988',
  
  // Years (recent and common)
  '1900', '1901', '1902', '1903', '1904', '1905', '1906', '1907', '1908', '1909',
  '1910', '1911', '1912', '1913', '1914', '1915', '1916', '1917', '1918', '1919',
  '1920', '1921', '1922', '1923', '1924', '1925', '1926', '1927', '1928', '1929',
  '1930', '1931', '1932', '1933', '1934', '1935', '1936', '1937', '1938', '1939',
  '1940', '1941', '1942', '1943', '1944', '1945', '1946', '1947', '1948', '1949',
  '1950', '1951', '1952', '1953', '1954', '1955', '1956', '1957', '1958', '1959',
  '1960', '1961', '1962', '1963', '1964', '1965', '1966', '1967', '1968', '1969',
  '1970', '1971', '1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979',
  '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989',
  '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999',
  '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009',
  '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019',
  '2020', '2021', '2022', '2023', '2024', '2025',
  
  // Months and dates
  '0101', '0102', '0103', '0104', '0105', '0106', '0107', '0108', '0109', '0110',
  '0111', '0112', '0201', '0202', '0203', '0204', '0205', '0206', '0207', '0208',
  '0209', '0210', '0211', '0212', '0301', '0302', '0303', '0304', '0305', '0306',
  '0307', '0308', '0309', '0310', '0311', '0312', '0401', '0402', '0403', '0404',
  '0405', '0406', '0407', '0408', '0409', '0410', '0411', '0412', '0501', '0502',
  '0503', '0504', '0505', '0506', '0507', '0508', '0509', '0510', '0511', '0512',
  '0601', '0602', '0603', '0604', '0605', '0606', '0607', '0608', '0609', '0610',
  '0611', '0612', '0701', '0702', '0703', '0704', '0705', '0706', '0707', '0708',
  '0709', '0710', '0711', '0712', '0801', '0802', '0803', '0804', '0805', '0806',
  '0807', '0808', '0809', '0810', '0811', '0812', '0901', '0902', '0903', '0904',
  '0905', '0906', '0907', '0908', '0909', '0910', '0911', '0912', '1001', '1002',
  '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010', '1011', '1012',
  '1101', '1102', '1103', '1104', '1105', '1106', '1107', '1108', '1109', '1110',
  '1111', '1112', '1201', '1202', '1203', '1204', '1205', '1206', '1207', '1208',
  '1209', '1210', '1211', '1212'
];

/**
 * PIN strength levels
 */
export enum PinStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong'
}

/**
 * PIN lockout durations (in milliseconds)
 */
export enum LockoutDuration {
  SHORT = 60 * 1000, // 1 minute
  MEDIUM = 5 * 60 * 1000, // 5 minutes
  LONG = 30 * 60 * 1000, // 30 minutes
  EXTENDED = 60 * 60 * 1000 // 1 hour
}

/**
 * PIN lockout configuration
 */
export interface PinLockoutConfig {
  maxAttempts: number;
  lockoutDuration: LockoutDuration;
  attemptWindow: number;
  progressiveMode: boolean;
}

/**
 * Default PIN lockout configuration
 */
export const DEFAULT_LOCKOUT_CONFIG: PinLockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: LockoutDuration.MEDIUM,
  attemptWindow: 10 * 60 * 1000, // 10 minutes window to count attempts
  progressiveMode: true // Progressively increase lockout durations
};

/**
 * PIN lockout status
 */
export interface PinLockoutStatus {
  isLocked: boolean;
  remainingTime: number;
  attempts: number;
  maxAttempts: number;
  timeUntilReset: number;
}

/**
 * Type for PIN security event types
 */
export type PinSecurityEventType = 
  | 'PIN_LOCKOUT' 
  | 'PIN_LOCKOUT_RESET' 
  | 'PIN_CHANGE' 
  | 'PIN_FAILED_ATTEMPT' 
  | 'PIN_SECURITY_ALERT';

/**
 * Check if a PIN is common and should be rejected
 * @param pin PIN to check
 * @returns True if PIN is common and should be rejected
 */
export function isCommonPin(pin: string): boolean {
  return COMMON_PINS.includes(pin);
}

/**
 * Check if PIN contains sequential digits (e.g., 1234, 4321)
 * @param pin PIN to check
 * @returns True if PIN contains sequential digits
 */
export function hasSequentialDigits(pin: string): boolean {
  const sequences = [
    '0123', '1234', '2345', '3456', '4567', '5678', '6789',
    '9876', '8765', '7654', '6543', '5432', '4321', '3210'
  ];
  
  for (const sequence of sequences) {
    if (pin.includes(sequence)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if PIN has repeated digits (e.g., 1111, 2222)
 * @param pin PIN to check
 * @returns True if PIN has repeated digits
 */
export function hasRepeatedDigits(pin: string): boolean {
  return /(\d)\1{3}/.test(pin);
}

/**
 * Check if PIN has pairs of repeated digits (e.g., 1212, 2323)
 * @param pin PIN to check
 * @returns True if PIN has pairs of repeated digits
 */
export function hasRepeatedPairs(pin: string): boolean {
  return /^(\d)(\d)\1\2$/.test(pin);
}

/**
 * Check if PIN is a common year (e.g., 1990, 2000)
 * @param pin PIN to check
 * @returns True if PIN is a common year
 */
export function isCommonYear(pin: string): boolean {
  const pinNum = parseInt(pin, 10);
  return (pinNum >= 1900 && pinNum <= 2025);
}

/**
 * Check if PIN is a date format (MMDD or DDMM)
 * @param pin PIN to check
 * @returns True if PIN is a date format
 */
export function isDateFormat(pin: string): boolean {
  // Check MMDD format
  const mm = parseInt(pin.substring(0, 2), 10);
  const dd = parseInt(pin.substring(2, 4), 10);
  
  if ((mm >= 1 && mm <= 12) && (dd >= 1 && dd <= 31)) {
    return true;
  }
  
  // Check DDMM format
  const dd2 = parseInt(pin.substring(0, 2), 10);
  const mm2 = parseInt(pin.substring(2, 4), 10);
  
  if ((dd2 >= 1 && dd2 <= 31) && (mm2 >= 1 && mm2 <= 12)) {
    return true;
  }
  
  return false;
}

/**
 * Evaluate PIN strength based on various criteria
 * @param pin PIN to evaluate
 * @returns PIN strength level
 */
export function evaluatePinStrength(pin: string): PinStrength {
  // Check basic format
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return PinStrength.WEAK;
  }
  
  // Check for common PINs
  if (isCommonPin(pin)) {
    return PinStrength.WEAK;
  }
  
  // Check for sequential digits
  if (hasSequentialDigits(pin)) {
    return PinStrength.WEAK;
  }
  
  // Check for repeated digits
  if (hasRepeatedDigits(pin)) {
    return PinStrength.WEAK;
  }
  
  // Check for repeated pairs
  if (hasRepeatedPairs(pin)) {
    return PinStrength.MEDIUM;
  }
  
  // Check for common years
  if (isCommonYear(pin)) {
    return PinStrength.MEDIUM;
  }
  
  // Check for date formats
  if (isDateFormat(pin)) {
    return PinStrength.MEDIUM;
  }
  
  // All checks passed
  return PinStrength.STRONG;
}

/**
 * Validate PIN complexity
 * @param pin PIN to validate
 * @returns Object with validation result and error message
 */
export function validatePinComplexity(pin: string): { isValid: boolean; message?: string } {
  // Check basic format
  if (!pin || pin.length !== 4) {
    return {
      isValid: false,
      message: 'PIN must be exactly 4 digits'
    };
  }
  
  // Check digits only
  if (!/^\d{4}$/.test(pin)) {
    return {
      isValid: false,
      message: 'PIN must contain only digits'
    };
  }
  
  // Check for common PINs
  if (isCommonPin(pin)) {
    return {
      isValid: false,
      message: 'This PIN is too common and easily guessable'
    };
  }
  
  // Check for sequential digits
  if (hasSequentialDigits(pin)) {
    return {
      isValid: false,
      message: 'PIN contains sequential digits (e.g., 1234, 4321)'
    };
  }
  
  // Check for repeated digits
  if (hasRepeatedDigits(pin)) {
    return {
      isValid: false,
      message: 'PIN contains repeated digits (e.g., 1111, 2222)'
    };
  }
  
  return { isValid: true };
}

/**
 * Generate a secure random PIN
 * @returns A secure 4-digit PIN
 */
export function generateSecurePin(): string {
  // Create array of digits 0-9
  const digits = Array.from({ length: 10 }, (_, i) => i.toString());
  
  // Shuffle the array
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  
  // Take first 4 digits as PIN and ensure it's a string
  let pin = digits.slice(0, 4).join('');
  
  // Check if PIN meets criteria, if not, regenerate
  while (
    isCommonPin(pin) ||
    hasSequentialDigits(pin) ||
    hasRepeatedDigits(pin) ||
    hasRepeatedPairs(pin) ||
    isCommonYear(pin) ||
    isDateFormat(pin)
  ) {
    // Reshuffle
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    // Ensure we have a string value
    pin = digits.slice(0, 4).join('');
  }
  
  return pin;
}

/**
 * Get feedback for PIN strength
 * @param pin PIN to evaluate
 * @returns Object with strength level and feedback message
 */
export function getPinStrengthFeedback(pin: string): { 
  strength: PinStrength; 
  message: string;
  suggestions?: string[];
} {
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    return {
      strength: PinStrength.WEAK,
      message: 'PIN must be exactly 4 digits',
      suggestions: ['Enter 4 digits', 'Use only numbers 0-9']
    };
  }
  
  const strength = evaluatePinStrength(pin);
  
  if (strength === PinStrength.WEAK) {
    const reasons = [];
    const suggestions = ['Use a PIN that is not based on patterns', 'Avoid common PINs', 'Use the Generate Secure PIN option'];
    
    if (isCommonPin(pin)) {
      reasons.push('This is a common PIN that appears in data breaches');
    }
    
    if (hasSequentialDigits(pin)) {
      reasons.push('Contains sequential digits (like 1234)');
    }
    
    if (hasRepeatedDigits(pin)) {
      reasons.push('Contains repeated digits (like 1111)');
    }
    
    return {
      strength: PinStrength.WEAK,
      message: `Weak PIN: ${reasons.join('. ')}`,
      suggestions
    };
  }
  
  if (strength === PinStrength.MEDIUM) {
    const reasons = [];
    const suggestions = ['For better security, avoid patterns', 'Try the Generate Secure PIN option'];
    
    if (hasRepeatedPairs(pin)) {
      reasons.push('Contains repeated pairs (like 1212)');
    }
    
    if (isCommonYear(pin)) {
      reasons.push('Resembles a year (1900-2025)');
    }
    
    if (isDateFormat(pin)) {
      reasons.push('Resembles a date format (MM/DD or DD/MM)');
    }
    
    return {
      strength: PinStrength.MEDIUM,
      message: `Medium strength: ${reasons.join('. ')}`,
      suggestions
    };
  }
  
  return {
    strength: PinStrength.STRONG,
    message: 'Strong PIN: Good choice! This PIN is not based on common patterns.'
  };
}

/**
 * Record a failed PIN attempt
 * @param username Username attempting the PIN login
 * @param config Optional custom lockout configuration
 * @returns Updated lockout status
 */
export function recordFailedPinAttempt(
  username: string, 
  config: PinLockoutConfig = DEFAULT_LOCKOUT_CONFIG
): PinLockoutStatus {
  const userKey = `${username}_`;
  const now = Date.now();
  
  // Get current attempt count - safely handle potentially undefined values
  const attemptCountStr = localStorage.getItem(`${userKey}${PIN_ATTEMPT_COUNT_KEY}`) || '0';
  const lastAttemptTimeStr = localStorage.getItem(`${userKey}${PIN_LAST_ATTEMPT_KEY}`) || '0';
  
  const lastAttemptTime = parseInt(lastAttemptTimeStr, 10);
  let attemptCount = parseInt(attemptCountStr, 10);
  
  // Check if we need to reset the counter due to elapsed time
  if (now - lastAttemptTime > config.attemptWindow) {
    // Reset counter if attempt window has passed
    attemptCount = 1;
  } else {
    // Increment counter
    attemptCount += 1;
  }
  
  // Store updated attempt count and time
  localStorage.setItem(`${userKey}${PIN_ATTEMPT_COUNT_KEY}`, attemptCount.toString());
  localStorage.setItem(`${userKey}${PIN_LAST_ATTEMPT_KEY}`, now.toString());
  
  // Check if account should be locked
  if (attemptCount >= config.maxAttempts) {
    let lockoutDuration = config.lockoutDuration;
    
    // Progressive lockout durations if enabled
    if (config.progressiveMode) {
      const lockoutMultiplier = Math.floor(attemptCount / config.maxAttempts);
      
      // Escalate lockout duration based on number of failed attempts
      if (lockoutMultiplier >= 3) {
        lockoutDuration = LockoutDuration.EXTENDED;
      } else if (lockoutMultiplier >= 2) {
        lockoutDuration = LockoutDuration.LONG;
      } else {
        lockoutDuration = LockoutDuration.MEDIUM;
      }
    }
    
    // Calculate lockout end time
    const lockoutEndTime = now + lockoutDuration;
    localStorage.setItem(`${userKey}${PIN_LOCKOUT_TIME_KEY}`, lockoutEndTime.toString());
    
    // Log security event
    logPinSecurityEvent(username, 'PIN_LOCKOUT', `Account locked for ${lockoutDuration / 60000} minutes due to ${attemptCount} failed PIN attempts`);

    // Return lockout status
    return {
      isLocked: true,
      remainingTime: lockoutDuration,
      attempts: attemptCount,
      maxAttempts: config.maxAttempts,
      timeUntilReset: config.attemptWindow - (now - lastAttemptTime)
    };
  }
  
  // Not locked out yet
  return {
    isLocked: false,
    remainingTime: 0,
    attempts: attemptCount,
    maxAttempts: config.maxAttempts,
    timeUntilReset: config.attemptWindow - (now - lastAttemptTime)
  };
}

/**
 * Check if a user account is PIN-locked
 * @param username Username to check
 * @returns Lock status information
 */
export function checkPinLockStatus(username: string): PinLockoutStatus {
  const userKey = `${username}_`;
  const now = Date.now();
  
  // Get lockout information with safe fallbacks for potentially undefined values
  const lockoutTimeStr = localStorage.getItem(`${userKey}${PIN_LOCKOUT_TIME_KEY}`);
  const attemptCountStr = localStorage.getItem(`${userKey}${PIN_ATTEMPT_COUNT_KEY}`) || '0';
  const lastAttemptTimeStr = localStorage.getItem(`${userKey}${PIN_LAST_ATTEMPT_KEY}`) || '0';
  
  const attemptCount = parseInt(attemptCountStr, 10);
  const lastAttemptTime = parseInt(lastAttemptTimeStr, 10);
  
  // If no lockout time is set, account is not locked
  if (!lockoutTimeStr) {
    return {
      isLocked: false,
      remainingTime: 0,
      attempts: attemptCount,
      maxAttempts: DEFAULT_LOCKOUT_CONFIG.maxAttempts,
      timeUntilReset: Math.max(0, DEFAULT_LOCKOUT_CONFIG.attemptWindow - (now - lastAttemptTime))
    };
  }
  
  const lockoutEndTime = parseInt(lockoutTimeStr, 10);
  
  // Check if lockout period has expired
  if (now >= lockoutEndTime) {
    // Clear lockout status
    localStorage.removeItem(`${userKey}${PIN_LOCKOUT_TIME_KEY}`);
    
    return {
      isLocked: false,
      remainingTime: 0,
      attempts: attemptCount,
      maxAttempts: DEFAULT_LOCKOUT_CONFIG.maxAttempts,
      timeUntilReset: Math.max(0, DEFAULT_LOCKOUT_CONFIG.attemptWindow - (now - lastAttemptTime))
    };
  }
  
  // Account is still locked
  return {
    isLocked: true,
    remainingTime: lockoutEndTime - now,
    attempts: attemptCount,
    maxAttempts: DEFAULT_LOCKOUT_CONFIG.maxAttempts,
    timeUntilReset: 0
  };
}

/**
 * Reset PIN lockout status for a user
 * @param username Username to reset
 */
export function resetPinLockout(username: string): void {
  const userKey = `${username}_`;
  
  // Clear all lockout information
  localStorage.removeItem(`${userKey}${PIN_LOCKOUT_TIME_KEY}`);
  localStorage.removeItem(`${userKey}${PIN_ATTEMPT_COUNT_KEY}`);
  localStorage.removeItem(`${userKey}${PIN_LAST_ATTEMPT_KEY}`);
  
  // Log security event
  logPinSecurityEvent(username, 'PIN_LOCKOUT_RESET', 'PIN lockout status reset');
}

/**
 * Track PIN history to prevent reuse
 * @param username Username
 * @param pin New PIN to check and save
 * @param maxHistory Maximum number of previous PINs to remember
 * @returns True if PIN is not in history, false if it is (and should be rejected)
 */
export function checkAndUpdatePinHistory(
  username: string, 
  pin: string, 
  maxHistory: number = 5
): boolean {
  const userKey = `${username}_`;
  const historyKey = `${userKey}${PIN_HISTORY_KEY}`;
  
  // Get current history with safe handling of potentially undefined localStorage values
  const historyStr = localStorage.getItem(historyKey);
  // Parse the history safely with a fallback to empty array
  const history: string[] = historyStr ? JSON.parse(historyStr) : [];
  
  // Check if PIN is in history
  if (history.includes(pin)) {
    return false;
  }
  
  // Add new PIN to history
  history.unshift(pin);
  
  // Limit history size
  if (history.length > maxHistory) {
    history.pop();
  }
  
  // Save updated history
  localStorage.setItem(historyKey, JSON.stringify(history));
  
  return true;
}

/**
 * Format a lockout duration into a human-readable string
 * @param milliseconds Lockout duration in milliseconds
 * @returns Formatted time string (e.g., "5 minutes")
 */
export function formatLockoutDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Log PIN security events for auditing
 * @param username Username related to the event
 * @param eventType Type of security event
 * @param details Event details
 */
export function logPinSecurityEvent(
  username: string,
  eventType: PinSecurityEventType,
  details: string
): void {
  // Create event object
  const event = {
    username,
    eventType,
    details,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('PIN Security Event:', event);
  }
  
  // In production, log to server or analytics
  if (process.env.NODE_ENV === 'production') {
    try {
      fetch('/api/security/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.error('Failed to log security event:', error);
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  // Notify authenticated user about security events
  if (typeof authService.isAuthenticated === 'function' && authService.isAuthenticated()) {
    const securityEvent = new CustomEvent('pin-security-event', {
      detail: event
    });
    
    window.dispatchEvent(securityEvent);
  }
}
