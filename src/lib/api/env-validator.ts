/**
 * Environment Variable Validator
 * 
 * This utility provides functions to validate environment variables
 * and ensure that required configuration is present.
 */

/**
 * Validate that required environment variables are present
 * 
 * @param requiredVars Array of required environment variable names
 * @param env Environment object (defaults to import.meta.env)
 * @returns Object with validation results
 */
export function validateRequiredEnvVars(
  requiredVars: string[],
  env: Record<string, any> = import.meta.env
): { 
  isValid: boolean; 
  missingVars: string[];
  message?: string;
} {
  const missingVars = requiredVars.filter(
    varName => env[varName] === undefined
  );
  
  const isValid = missingVars.length === 0;
  
  return {
    isValid,
    missingVars,
    message: isValid 
      ? undefined 
      : `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please check your .env files or deployment configuration.'
  };
}

/**
 * Get environment-specific required variables
 * 
 * @param env Environment object (defaults to import.meta.env)
 * @returns Array of required environment variable names
 */
export function getRequiredEnvVars(
  env: Record<string, any> = import.meta.env
): string[] {
  const mode = env.MODE;
  const requiredVars = ['VITE_API_VERSION'];
  
  // In production, we need the actual API URL
  if (mode === 'production') {
    requiredVars.push('VITE_API_URL');
  }
  
  return requiredVars;
}

/**
 * Validate environment variables and log any issues
 * 
 * @param env Environment object (defaults to import.meta.env)
 * @returns True if all required variables are present
 */
export function validateEnv(
  env: Record<string, any> = import.meta.env
): boolean {
  const requiredVars = getRequiredEnvVars(env);
  const result = validateRequiredEnvVars(requiredVars, env);
  
  if (!result.isValid) {
    console.error(result.message);
  }
  
  return result.isValid;
}

// Run validation on import
validateEnv();
