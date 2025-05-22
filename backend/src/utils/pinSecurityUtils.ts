/**
 * PIN Security Utilities
 *
 * This module provides comprehensive PIN security features for the backend including:
 * - Common PIN detection
 * - PIN complexity validation
 * - Rate limiting for PIN attempts
 */

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
  '2020', '2021', '2022', '2023', '2024', '2025'
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
 * Validate PIN complexity
 * @param pin PIN to validate
 * @returns Object with validation result and error message
 */
export function validatePinComplexity(pin: string): { isValid: boolean; message?: string } {
  // Check if PIN is exactly 4 digits
  if (!/^\d{4}$/.test(pin)) {
    return { isValid: false, message: 'PIN must be exactly 4 digits' };
  }

  // Check if PIN is common
  if (isCommonPin(pin)) {
    return { isValid: false, message: 'This PIN is too common and easily guessed' };
  }

  // Check if PIN has sequential digits
  if (hasSequentialDigits(pin)) {
    return { isValid: false, message: 'PIN should not contain sequential digits' };
  }

  // Check if PIN has repeated digits
  if (hasRepeatedDigits(pin)) {
    return { isValid: false, message: 'PIN should not contain repeated digits' };
  }

  // PIN passes all checks
  return { isValid: true };
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

  // If we got here, the PIN is strong
  return PinStrength.STRONG;
}

/**
 * Generate a secure random PIN
 * @returns A secure 4-digit PIN
 */
export function generateSecurePin(): string {
  let pin: string;

  do {
    // Generate a random 4-digit number
    pin = Math.floor(1000 + Math.random() * 9000).toString();

    // Check if the PIN is secure
    const strength = evaluatePinStrength(pin);

    // Only return PINs that are medium or strong
    if (strength !== PinStrength.WEAK) {
      return pin;
    }

    // Keep trying until we get a secure PIN
  } while (true);
}

/**
 * PIN attempt tracking for rate limiting
 */
interface PinAttemptTracking {
  userId: string;
  attempts: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

// In-memory store for PIN attempts (in production, use Redis or a database)
const pinAttempts = new Map<string, PinAttemptTracking>();

// Constants for PIN attempt rate limiting
const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const PIN_ATTEMPT_RESET_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Record a failed PIN attempt
 * @param userId User ID
 * @returns Object with updated attempt count and lockout information
 */
export function recordFailedPinAttempt(userId: string): {
  attempts: number;
  isLocked: boolean;
  lockedUntil?: Date;
} {
  // Get current attempts for this user
  let userAttempts = pinAttempts.get(userId);

  // If no record exists or last attempt was more than 24 hours ago, create a new record
  if (!userAttempts || (Date.now() - userAttempts.lastAttempt.getTime() > PIN_ATTEMPT_RESET_MS)) {
    userAttempts = {
      userId,
      attempts: 0,
      lastAttempt: new Date()
    };
  }

  // Increment attempt count
  userAttempts.attempts += 1;
  userAttempts.lastAttempt = new Date();

  // Check if account should be locked
  if (userAttempts.attempts >= MAX_PIN_ATTEMPTS) {
    userAttempts.lockedUntil = new Date(Date.now() + PIN_LOCKOUT_DURATION_MS);
  }

  // Update the record
  pinAttempts.set(userId, userAttempts);

  // Return the updated information
  return {
    attempts: userAttempts.attempts,
    isLocked: !!userAttempts.lockedUntil && userAttempts.lockedUntil > new Date(),
    lockedUntil: userAttempts.lockedUntil
  };
}

/**
 * Check if a user's PIN is locked
 * @param userId User ID
 * @returns Object with locked status and remaining lockout time
 */
export function isPinLocked(userId: string): {
  isLocked: boolean;
  attempts: number;
  remainingMs?: number;
  lockedUntil?: Date;
} {
  // Get current attempts for this user
  const userAttempts = pinAttempts.get(userId);

  // If no record exists, not locked
  if (!userAttempts) {
    return { isLocked: false, attempts: 0 };
  }

  // If no lockout or lockout has expired, not locked
  if (!userAttempts.lockedUntil || userAttempts.lockedUntil <= new Date()) {
    return { isLocked: false, attempts: userAttempts.attempts };
  }

  // Calculate remaining lockout time
  const remainingMs = userAttempts.lockedUntil.getTime() - Date.now();

  // Return locked status with remaining time
  return {
    isLocked: true,
    attempts: userAttempts.attempts,
    remainingMs,
    lockedUntil: userAttempts.lockedUntil
  };
}

/**
 * Reset PIN attempts for a user
 * @param userId User ID
 */
export function resetPinAttempts(userId: string): void {
  pinAttempts.delete(userId);
}

/**
 * Clean up expired PIN lockouts (call periodically)
 */
export function cleanupExpiredPinLockouts(): void {
  const now = new Date();

  for (const [userId, userAttempts] of pinAttempts.entries()) {
    // Remove records with expired lockouts
    if (userAttempts.lockedUntil && userAttempts.lockedUntil <= now) {
      pinAttempts.delete(userId);
    }

    // Remove old records (no activity in 24 hours)
    if (now.getTime() - userAttempts.lastAttempt.getTime() > PIN_ATTEMPT_RESET_MS) {
      pinAttempts.delete(userId);
    }
  }
}

// Set up automatic cleanup every hour
setInterval(cleanupExpiredPinLockouts, 60 * 60 * 1000);
