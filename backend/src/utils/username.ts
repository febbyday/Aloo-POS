/**
 * Username generation utilities
 */

/**
 * Generate a username from first and last name
 * @param firstName First name
 * @param lastName Last name
 * @returns Generated username
 */
export function generateUsername(firstName: string, lastName: string): string {
  // Remove special characters and spaces
  const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Create base username (first letter of first name + last name)
  let baseUsername = sanitizedFirstName.charAt(0) + sanitizedLastName;
  
  // Add random number to make it more unique
  const randomNum = Math.floor(Math.random() * 1000);
  const username = `${baseUsername}${randomNum}`;
  
  return username;
}
