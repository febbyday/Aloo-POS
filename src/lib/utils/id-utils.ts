/**
 * Generate a unique ID
 * 
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string with optional prefix
 */
export function generateId(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}-${randomStr}`;
}

/**
 * Check if a value is a valid UUID
 * 
 * @param id - The ID to validate
 * @returns True if the ID is a valid UUID, false otherwise
 */
export function isValidUuid(id: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
}

/**
 * Generate a UUID v4
 * 
 * @returns A UUID v4 string
 */
export function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
