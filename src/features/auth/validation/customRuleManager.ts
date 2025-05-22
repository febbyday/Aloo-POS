/**
 * Custom Rule Manager
 * 
 * Provides a system for managing and applying custom validation rules 
 * that go beyond the basic schema validation.
 */

import { ZodIssue } from 'zod';

/**
 * Custom validation rule interface
 * Defines the structure of a custom validation rule
 */
export interface CustomValidationRule<T> {
  name: string;          // Unique name for the rule
  description: string;   // Description of what the rule validates
  category: string;      // Category for grouping rules (e.g., 'user', 'security', 'password')
  validate: (data: T, context?: any) => boolean;  // Validation function
  errorMessage: string;  // Error message to display if validation fails
  errorPath?: string;    // Dot notation path to the field this rule validates
  severity: 'error' | 'warning' | 'info';  // Severity level of the rule
  enabled: boolean;      // Whether the rule is currently active
}

/**
 * RuleSet interface for managing groups of rules
 */
export interface RuleSet<T> {
  id: string;
  name: string;
  description: string;
  rules: CustomValidationRule<T>[];
}

/**
 * Rule application result
 */
export interface RuleResult {
  ruleName: string;
  success: boolean;
  errorMessage?: string;
  errorPath?: string;
  severity: 'error' | 'warning' | 'info';
}

// Store for custom validation rules
const ruleRegistry = new Map<string, CustomValidationRule<any>>();

// Store for rule sets
const ruleSets = new Map<string, RuleSet<any>>();

/**
 * Register a custom validation rule
 * @param rule The rule to register
 */
export function registerRule<T>(rule: CustomValidationRule<T>): void {
  if (ruleRegistry.has(rule.name)) {
    console.warn(`Rule '${rule.name}' already exists and will be overwritten.`);
  }
  ruleRegistry.set(rule.name, rule);
}

/**
 * Unregister a custom validation rule
 * @param ruleName The name of the rule to unregister
 */
export function unregisterRule(ruleName: string): boolean {
  return ruleRegistry.delete(ruleName);
}

/**
 * Get all registered rules
 */
export function getAllRules(): CustomValidationRule<any>[] {
  return Array.from(ruleRegistry.values());
}

/**
 * Get rules by category
 * @param category The category to filter by
 */
export function getRulesByCategory(category: string): CustomValidationRule<any>[] {
  return Array.from(ruleRegistry.values())
    .filter(rule => rule.category === category);
}

/**
 * Create a new rule set
 * @param id Unique identifier for the rule set
 * @param name Display name for the rule set
 * @param description Description of the rule set's purpose
 * @param rules Initial rules to include in the set
 */
export function createRuleSet<T>(
  id: string, 
  name: string, 
  description: string, 
  rules: CustomValidationRule<T>[] = []
): RuleSet<T> {
  const ruleSet: RuleSet<T> = { id, name, description, rules };
  ruleSets.set(id, ruleSet);
  return ruleSet;
}

/**
 * Get a rule set by ID
 * @param id The ID of the rule set to retrieve
 */
export function getRuleSet<T>(id: string): RuleSet<T> | undefined {
  return ruleSets.get(id) as RuleSet<T> | undefined;
}

/**
 * Add a rule to a rule set
 * @param ruleSetId The ID of the rule set
 * @param rule The rule to add
 */
export function addRuleToSet<T>(ruleSetId: string, rule: CustomValidationRule<T>): boolean {
  const ruleSet = ruleSets.get(ruleSetId) as RuleSet<T> | undefined;
  if (!ruleSet) return false;
  
  // Check if rule already exists in the set
  const existingIndex = ruleSet.rules.findIndex(r => r.name === rule.name);
  if (existingIndex >= 0) {
    ruleSet.rules[existingIndex] = rule; // Replace
  } else {
    ruleSet.rules.push(rule); // Add new
  }
  
  // Also register the rule globally
  registerRule(rule);
  return true;
}

/**
 * Remove a rule from a rule set
 * @param ruleSetId The ID of the rule set
 * @param ruleName The name of the rule to remove
 */
export function removeRuleFromSet(ruleSetId: string, ruleName: string): boolean {
  const ruleSet = ruleSets.get(ruleSetId);
  if (!ruleSet) return false;
  
  const initialLength = ruleSet.rules.length;
  ruleSet.rules = ruleSet.rules.filter(rule => rule.name !== ruleName);
  
  return ruleSet.rules.length !== initialLength;
}

/**
 * Apply rules to data and generate validation issues
 * @param data The data to validate
 * @param rules The rules to apply
 * @param context Optional context data for validation
 */
export function applyRules<T>(
  data: T, 
  rules: CustomValidationRule<T>[], 
  context?: any
): RuleResult[] {
  const results: RuleResult[] = [];
  
  for (const rule of rules) {
    if (!rule.enabled) continue;
    
    const isValid = rule.validate(data, context);
    if (!isValid) {
      results.push({
        ruleName: rule.name,
        success: false,
        errorMessage: rule.errorMessage,
        errorPath: rule.errorPath,
        severity: rule.severity
      });
    } else {
      results.push({
        ruleName: rule.name,
        success: true,
        severity: rule.severity
      });
    }
  }
  
  return results;
}

/**
 * Convert rule results to Zod issues for compatibility with Zod validation
 * @param results The rule results to convert
 */
export function ruleResultsToZodIssues(results: RuleResult[]): ZodIssue[] {
  return results
    .filter(result => !result.success && result.severity === 'error')
    .map(result => ({
      code: 'custom',
      path: result.errorPath ? result.errorPath.split('.') : [],
      message: result.errorMessage || `Validation failed for rule: ${result.ruleName}`
    }));
}

/**
 * Create a predefined set of common user validation rules
 */
export function createCommonUserRules(): RuleSet<any> {
  const userRuleSet = createRuleSet(
    'common-user-rules',
    'Common User Validation Rules',
    'A set of common validation rules for user data'
  );
  
  // Username consistency rule
  const usernameConsistencyRule: CustomValidationRule<any> = {
    name: 'username.consistency',
    description: 'Ensures username follows a consistent pattern',
    category: 'user',
    validate: (data) => {
      // Username should use consistent casing (all lowercase)
      return data.username === data.username.toLowerCase();
    },
    errorMessage: 'Username should be all lowercase for consistency',
    errorPath: 'username',
    severity: 'warning',
    enabled: true
  };
  
  // Name capitalization rule
  const nameCapitalizationRule: CustomValidationRule<any> = {
    name: 'name.capitalization',
    description: 'Ensures names are properly capitalized',
    category: 'user',
    validate: (data) => {
      if (!data.firstName || !data.lastName) return true;
      
      const isFirstNameCapitalized = data.firstName[0] === data.firstName[0].toUpperCase();
      const isLastNameCapitalized = data.lastName[0] === data.lastName[0].toUpperCase();
      
      return isFirstNameCapitalized && isLastNameCapitalized;
    },
    errorMessage: 'Names should start with a capital letter',
    errorPath: 'name',
    severity: 'warning',
    enabled: true
  };
  
  // Corporate email domain rule
  const corporateEmailRule: CustomValidationRule<any> = {
    name: 'email.corporateDomain',
    description: 'Validates that staff members use corporate email domains',
    category: 'user',
    validate: (data, context) => {
      // Skip for non-staff users
      if (data.role === 'USER') return true;
      
      const domain = data.email.split('@')[1];
      const allowedDomains = context?.allowedDomains || ['company.com', 'corp.company.com'];
      
      return allowedDomains.includes(domain);
    },
    errorMessage: 'Staff members should use a corporate email domain',
    errorPath: 'email',
    severity: 'error',
    enabled: false // Disabled by default
  };
  
  // Add rules to the set
  addRuleToSet('common-user-rules', usernameConsistencyRule);
  addRuleToSet('common-user-rules', nameCapitalizationRule);
  addRuleToSet('common-user-rules', corporateEmailRule);
  
  return userRuleSet;
}

// Initialize common rule sets
export function initializeDefaultRules(): void {
  createCommonUserRules();
}

// Export type for rule context
export type ValidationContext = Record<string, any>;
