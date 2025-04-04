// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import bcrypt from 'bcryptjs';

/**
 * Constants for password hashing
 */
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * 
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Generate salt
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  
  // Hash password with salt
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 * 
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password
 * @returns True if the passwords match
 */
export const comparePasswords = async (
  plainPassword: string, 
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate a random password of specified length
 * 
 * @param length Password length (default: 12)
 * @returns Random password
 */
export const generateRandomPassword = (length: number = 12): string => {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_-+=<>?';
  
  const allChars = uppercaseLetters + lowercaseLetters + numbers + specialChars;
  
  // Ensure at least one character from each group
  let password = '';
  password += uppercaseLetters.charAt(Math.floor(Math.random() * uppercaseLetters.length));
  password += lowercaseLetters.charAt(Math.floor(Math.random() * lowercaseLetters.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Validate password strength
 * 
 * @param password Password to validate
 * @returns Validation result with score and feedback
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  // Check length
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  // Check for numbers
  if (!/\d/.test(password)) {
    feedback.push('Password should contain at least one number');
  } else {
    score += 1;
  }
  
  // Check for special characters
  if (!/[!@#$%^&*()_\-+=<>?]/.test(password)) {
    feedback.push('Password should contain at least one special character');
  } else {
    score += 1;
  }
  
  // Check for common passwords (this would be more comprehensive in a real implementation)
  const commonPasswords = ['password', 'admin', '123456', 'qwerty', 'welcome'];
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('Password is too common');
    score = 0;
  }
  
  return {
    isValid: score >= 4 && password.length >= 8,
    score,
    feedback
  };
};
