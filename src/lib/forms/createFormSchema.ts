/**
 * Form Schema Creators
 * 
 * Utilities for creating consistent Zod schemas for form validation.
 * This module provides helper functions to create common schema types with
 * proper error messages and validation rules.
 * 
 * @module forms/createFormSchema
 */

import { z } from 'zod';

/**
 * Common validation error messages
 */
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  min: (min: number) => `Must be at least ${min} characters`,
  max: (max: number) => `Must be at most ${max} characters`,
  minNumber: (min: number) => `Must be at least ${min}`,
  maxNumber: (max: number) => `Must be at most ${max}`,
  integer: 'Must be a whole number',
  positive: 'Must be a positive number',
  negative: 'Must be a negative number',
  nonNegative: 'Must be zero or a positive number',
  nonPositive: 'Must be zero or a negative number',
  pattern: 'Invalid format',
  date: 'Please enter a valid date',
  phone: 'Please enter a valid phone number'
};

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  phone: /^\+?[0-9]{7,15}$/,
  zipCode: /^[0-9]{5}(-[0-9]{4})?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s]+$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

/**
 * Options for string schema creation
 */
interface StringSchemaOptions {
  required?: boolean;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  regex?: RegExp;
  errorMessages?: {
    required?: string;
    min?: string;
    max?: string;
    email?: string;
    url?: string;
    regex?: string;
  };
}

/**
 * Options for number schema creation
 */
interface NumberSchemaOptions {
  required?: boolean;
  min?: number;
  max?: number;
  int?: boolean;
  positive?: boolean;
  negative?: boolean;
  errorMessages?: {
    required?: string;
    min?: string;
    max?: string;
    int?: string;
    positive?: string;
    negative?: string;
    type?: string;
  };
}

/**
 * Options for enum schema creation
 */
interface EnumSchemaOptions {
  required?: boolean;
  errorMessages?: {
    required?: string;
    invalid?: string;
  };
}

/**
 * Options for boolean schema creation
 */
interface BooleanSchemaOptions {
  errorMessages?: {
    type?: string;
  };
}

/**
 * Options for date schema creation
 */
interface DateSchemaOptions {
  required?: boolean;
  min?: Date;
  max?: Date;
  errorMessages?: {
    required?: string;
    min?: string;
    max?: string;
    invalid?: string;
  };
}

/**
 * Options for array schema creation
 */
interface ArraySchemaOptions {
  required?: boolean;
  min?: number;
  max?: number;
  errorMessages?: {
    required?: string;
    min?: string;
    max?: string;
  };
}

/**
 * Type-safe schema creators for common Zod schema types
 */
export const SchemaCreators = {
  /**
   * Create a string schema with common validations
   * 
   * @example
   * const schema = createFormSchema({
   *   name: SchemaCreators.string({ required: true, min: 2 }),
   *   email: SchemaCreators.string({ required: true, email: true })
   * });
   */
  string: (options: StringSchemaOptions = {}) => {
    const {
      required = false,
      min,
      max,
      email = false,
      url = false,
      regex,
      errorMessages = {},
    } = options;

    let schema = z.string();

    if (required) {
      schema = schema.min(1, errorMessages.required || 'This field is required');
    } else {
      schema = schema.optional();
    }

    if (min !== undefined) {
      schema = schema.min(min, errorMessages.min || `Must be at least ${min} characters`);
    }

    if (max !== undefined) {
      schema = schema.max(max, errorMessages.max || `Must be at most ${max} characters`);
    }

    if (email) {
      schema = schema.email(errorMessages.email || 'Invalid email address');
    }

    if (url) {
      schema = schema.url(errorMessages.url || 'Invalid URL');
    }

    if (regex) {
      schema = schema.regex(regex, errorMessages.regex || 'Invalid format');
    }

    return schema;
  },

  /**
   * Create a number schema with common validations
   * 
   * @example
   * const schema = createFormSchema({
   *   age: SchemaCreators.number({ required: true, min: 18 }),
   *   quantity: SchemaCreators.number({ required: true, int: true, positive: true })
   * });
   */
  number: (options: NumberSchemaOptions = {}) => {
    const {
      required = false,
      min,
      max,
      int = false,
      positive = false,
      negative = false,
      errorMessages = {},
    } = options;

    let schema = z.coerce.number(
      { invalid_type_error: errorMessages.type || 'Must be a number' }
    );

    if (required) {
      schema = schema;
    } else {
      schema = schema.optional();
    }

    if (int) {
      schema = schema.int(errorMessages.int || 'Must be an integer');
    }

    if (min !== undefined) {
      schema = schema.min(min, errorMessages.min || `Must be at least ${min}`);
    }

    if (max !== undefined) {
      schema = schema.max(max, errorMessages.max || `Must be at most ${max}`);
    }

    if (positive) {
      schema = schema.positive(errorMessages.positive || 'Must be positive');
    }

    if (negative) {
      schema = schema.negative(errorMessages.negative || 'Must be negative');
    }

    return schema;
  },

  /**
   * Create an enum schema
   * 
   * @example
   * const schema = createFormSchema({
   *   role: SchemaCreators.enum(['admin', 'user', 'guest'] as const, { required: true })
   * });
   */
  enum: <T extends readonly [string, ...string[]]>(
    values: T,
    options: EnumSchemaOptions = {}
  ) => {
    const { required = false, errorMessages = {} } = options;

    let schema = z.enum(values, {
      invalid_type_error: errorMessages.invalid || 'Invalid selection',
    });

    if (!required) {
      schema = schema.optional();
    }

    return schema;
  },

  /**
   * Create a boolean schema
   * 
   * @example
   * const schema = createFormSchema({
   *   agreeToTerms: SchemaCreators.boolean(),
   *   isActive: SchemaCreators.boolean()
   * });
   */
  boolean: (options: BooleanSchemaOptions = {}) => {
    const { errorMessages = {} } = options;

    return z.boolean({
      invalid_type_error: errorMessages.type || 'Must be a boolean',
    }).optional();
  },

  /**
   * Create a date schema with common validations
   * 
   * @example
   * const schema = createFormSchema({
   *   birthDate: SchemaCreators.date({ required: true, max: new Date() }),
   *   appointmentDate: SchemaCreators.date({ required: true, min: new Date() })
   * });
   */
  date: (options: DateSchemaOptions = {}) => {
    const {
      required = false,
      min,
      max,
      errorMessages = {},
    } = options;

    let schema = z.coerce.date({
      invalid_type_error: errorMessages.invalid || 'Invalid date',
    });

    if (required) {
      schema = schema;
    } else {
      schema = schema.optional();
    }

    if (min !== undefined) {
      schema = schema.min(min, errorMessages.min || `Must be after ${min.toLocaleDateString()}`);
    }

    if (max !== undefined) {
      schema = schema.max(max, errorMessages.max || `Must be before ${max.toLocaleDateString()}`);
    }

    return schema;
  },

  /**
   * Create an array schema with common validations
   * 
   * @example
   * const schema = createFormSchema({
   *   tags: SchemaCreators.array(z.string(), { required: true, min: 1 })
   * });
   */
  array: <T extends z.ZodTypeAny>(
    type: T,
    options: ArraySchemaOptions = {}
  ) => {
    const {
      required = false,
      min,
      max,
      errorMessages = {},
    } = options;

    let schema = z.array(type);

    if (required) {
      schema = schema.min(1, errorMessages.required || 'At least one item is required');
    } else {
      schema = schema.optional();
    }

    if (min !== undefined) {
      schema = schema.min(min, errorMessages.min || `Must have at least ${min} items`);
    }

    if (max !== undefined) {
      schema = schema.max(max, errorMessages.max || `Must have at most ${max} items`);
    }

    return schema;
  },

  /**
   * Create a record schema (object with dynamic keys)
   * 
   * @example
   * const schema = createFormSchema({
   *   metadata: SchemaCreators.record(z.string())
   * });
   */
  record: <T extends z.ZodTypeAny>(valueType: T) => {
    return z.record(z.string(), valueType).optional();
  },
};

/**
 * Create a form schema from an object of Zod schemas
 * 
 * @example
 * const userSchema = createFormSchema({
 *   name: SchemaCreators.string({ required: true }),
 *   email: SchemaCreators.string({ required: true, email: true }),
 *   age: SchemaCreators.number({ min: 18 }),
 *   role: SchemaCreators.enum(['admin', 'user'] as const)
 * });
 * 
 * // TypeScript will infer the correct type
 * type UserFormValues = z.infer<typeof userSchema>;
 */
export function createFormSchema<T extends Record<string, z.ZodType<any, any>>>(
  schema: T
): z.ZodObject<T> {
  return z.object(schema);
}

/**
 * Infers the type from a Zod schema
 */
export type InferSchemaType<T extends z.ZodTypeAny> = z.infer<T>;

/**
 * Default export
 */
export default {
  createFormSchema,
  SchemaCreators,
  ValidationMessages,
  ValidationPatterns
}; 