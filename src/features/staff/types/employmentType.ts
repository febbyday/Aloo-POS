/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */

/**
 * Represents an employment type in the system
 * @interface EmploymentType
 */
export interface EmploymentType {
  /**
   * Unique identifier for the employment type
   */
  id?: string;
  
  /**
   * Name of the employment type (e.g., "Full-time", "Part-time")
   */
  name: string;
  
  /**
   * Description of what this employment type entails
   */
  description: string;
  
  /**
   * Color code for visual representation (hex format)
   */
  color: string;
  
  /**
   * List of benefits associated with this employment type
   */
  benefits: string[];
  
  /**
   * Number of staff members with this employment type
   */
  staffCount?: number;
  
  /**
   * Whether this employment type is active
   */
  isActive?: boolean;
  
  /**
   * Date when this employment type was created
   */
  createdAt?: string;
  
  /**
   * Date when this employment type was last updated
   */
  updatedAt?: string;
}
