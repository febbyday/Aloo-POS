/**
 * Password utilities
 */
import * as bcrypt from 'bcrypt';

/**
 * Generate a random password
 * @param length Length of the password (default: 10)
 * @returns Generated password
 */
export function generatePassword(length: number = 10): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  
  // Ensure at least one character from each category
  password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'); // Uppercase
  password += getRandomChar('abcdefghijklmnopqrstuvwxyz'); // Lowercase
  password += getRandomChar('0123456789'); // Number
  password += getRandomChar('!@#$%^&*()_+'); // Special character
  
  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle the password characters
  return shuffleString(password);
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

/**
 * Compare a password with a hash
 * @param password Plain text password
 * @param hash Hashed password
 * @returns True if the password matches the hash
 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Get a random character from a string
 * @param charset String of characters to choose from
 * @returns Random character from the charset
 */
function getRandomChar(charset: string): string {
  const randomIndex = Math.floor(Math.random() * charset.length);
  return charset[randomIndex];
}

/**
 * Shuffle the characters in a string
 * @param str String to shuffle
 * @returns Shuffled string
 */
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}
