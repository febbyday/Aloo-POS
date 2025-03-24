import { z } from 'zod';

// Common validation patterns
export const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[0-9]{10,15}$/,
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  POSTAL_CODE: /^[0-9]{5}(-[0-9]{4})?$/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA_NUMERIC_SPACE: /^[a-zA-Z0-9 ]+$/,
  ALPHA_ONLY: /^[a-zA-Z]+$/,
  NUMERIC_ONLY: /^[0-9]+$/,
  TAX_ID: /^[0-9]{2}-[0-9]{7}$/,
  CREDIT_CARD: /^[0-9]{13,19}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  UUID: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?$/,
};

// Direct English error messages - no i18n needed
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  URL: 'Please enter a valid URL',
  PASSWORD: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters`,
  EXACT_LENGTH: (length: number) => `Must be exactly ${length} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be at most ${max}`,
  INTEGER: 'Must be a whole number',
  POSITIVE: 'Must be a positive number',
  NEGATIVE: 'Must be a negative number',
  NON_NEGATIVE: 'Must be zero or a positive number',
  ALPHA_NUMERIC: 'Must contain only letters and numbers',
  ALPHA_NUMERIC_SPACE: 'Must contain only letters, numbers, and spaces',
  ALPHA_ONLY: 'Must contain only letters',
  NUMERIC_ONLY: 'Must contain only numbers',
  DATE_FUTURE: 'Date must be in the future',
  DATE_PAST: 'Date must be in the past',
  MATCH: 'Fields do not match',
  POSTAL_CODE: 'Please enter a valid postal code',
  TAX_ID: 'Please enter a valid tax ID',
  CREDIT_CARD: 'Please enter a valid credit card number',
  HEX_COLOR: 'Please enter a valid hex color code',
  UUID: 'Please enter a valid UUID',
  TIME_24H: 'Please enter a valid 24-hour time (HH:MM)',
  DATE_ISO: 'Please enter a valid date (YYYY-MM-DD)',
  DATETIME_ISO: 'Please enter a valid date and time (YYYY-MM-DDTHH:MM:SS)'
};

// Common validation schemas
export const schemas = {
  // String validations
  string: {
    required: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    email: z.string().email(ERROR_MESSAGES.EMAIL),
    phone: z.string().regex(PATTERNS.PHONE, ERROR_MESSAGES.PHONE),
    url: z.string().regex(PATTERNS.URL, ERROR_MESSAGES.URL),
    password: z.string().regex(PATTERNS.PASSWORD, ERROR_MESSAGES.PASSWORD),
    postalCode: z.string().regex(PATTERNS.POSTAL_CODE, ERROR_MESSAGES.POSTAL_CODE),
    alphaNumeric: z.string().regex(PATTERNS.ALPHA_NUMERIC, ERROR_MESSAGES.ALPHA_NUMERIC),
    alphaNumericSpace: z.string().regex(PATTERNS.ALPHA_NUMERIC_SPACE, ERROR_MESSAGES.ALPHA_NUMERIC_SPACE),
    alphaOnly: z.string().regex(PATTERNS.ALPHA_ONLY, ERROR_MESSAGES.ALPHA_ONLY),
    numericOnly: z.string().regex(PATTERNS.NUMERIC_ONLY, ERROR_MESSAGES.NUMERIC_ONLY),
    taxId: z.string().regex(PATTERNS.TAX_ID, ERROR_MESSAGES.TAX_ID),
    creditCard: z.string().regex(PATTERNS.CREDIT_CARD, ERROR_MESSAGES.CREDIT_CARD),
    hexColor: z.string().regex(PATTERNS.HEX_COLOR, ERROR_MESSAGES.HEX_COLOR),
    uuid: z.string().regex(PATTERNS.UUID, ERROR_MESSAGES.UUID),
    time24h: z.string().regex(PATTERNS.TIME_24H, ERROR_MESSAGES.TIME_24H),
    dateIso: z.string().regex(PATTERNS.DATE_ISO, ERROR_MESSAGES.DATE_ISO),
    datetimeIso: z.string().regex(PATTERNS.DATETIME_ISO, ERROR_MESSAGES.DATETIME_ISO),
  },
  
  // Number validations
  number: {
    required: z.number({ required_error: ERROR_MESSAGES.REQUIRED }),
    positive: z.number().positive(ERROR_MESSAGES.POSITIVE),
    negative: z.number().negative(ERROR_MESSAGES.NEGATIVE),
    nonNegative: z.number().nonnegative(ERROR_MESSAGES.NON_NEGATIVE),
    integer: z.number().int(ERROR_MESSAGES.INTEGER),
    price: z.number().nonnegative(ERROR_MESSAGES.NON_NEGATIVE).multipleOf(0.01, 'Price must have at most 2 decimal places'),
    percentage: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage must be at most 100'),
    quantity: z.number().int(ERROR_MESSAGES.INTEGER).nonnegative(ERROR_MESSAGES.NON_NEGATIVE),
  },
  
  // Date validations
  date: {
    required: z.date({ required_error: ERROR_MESSAGES.REQUIRED }),
    future: z.date().min(new Date(), ERROR_MESSAGES.DATE_FUTURE),
    past: z.date().max(new Date(), ERROR_MESSAGES.DATE_PAST),
  },
  
  // Boolean validations
  boolean: {
    required: z.boolean({ required_error: ERROR_MESSAGES.REQUIRED }),
  },
  
  // Array validations
  array: {
    nonEmpty: <T extends z.ZodTypeAny>(schema: T) => 
      z.array(schema).min(1, 'At least one item is required'),
  },
};

// Helper functions for common validation tasks
export const validators = {
  // Create a schema for a required field with min/max length
  createStringSchema: (options?: { 
    required?: boolean; 
    minLength?: number; 
    maxLength?: number;
    pattern?: RegExp;
    patternError?: string;
  }) => {
    let schema = z.string();
    
    if (options?.required) {
      schema = schema.min(1, ERROR_MESSAGES.REQUIRED);
    } else {
      schema = schema.optional();
    }
    
    if (options?.minLength) {
      schema = schema.min(options.minLength, ERROR_MESSAGES.MIN_LENGTH(options.minLength));
    }
    
    if (options?.maxLength) {
      schema = schema.max(options.maxLength, ERROR_MESSAGES.MAX_LENGTH(options.maxLength));
    }
    
    if (options?.pattern && options?.patternError) {
      schema = schema.regex(options.pattern, options.patternError);
    }
    
    return schema;
  },
  
  // Create a schema for a required number field with min/max value
  createNumberSchema: (options?: { 
    required?: boolean; 
    min?: number; 
    max?: number;
    integer?: boolean;
    positive?: boolean;
  }) => {
    let schema = z.number();
    
    if (options?.required) {
      schema = schema.optional().nullable().refine(val => val !== null && val !== undefined, {
        message: ERROR_MESSAGES.REQUIRED
      });
    } else {
      schema = schema.optional().nullable();
    }
    
    if (options?.min !== undefined) {
      schema = schema.refine(val => val === null || val === undefined || val >= options.min!, {
        message: ERROR_MESSAGES.MIN_VALUE(options.min!)
      });
    }
    
    if (options?.max !== undefined) {
      schema = schema.refine(val => val === null || val === undefined || val <= options.max!, {
        message: ERROR_MESSAGES.MAX_VALUE(options.max!)
      });
    }
    
    if (options?.integer) {
      schema = schema.refine(val => val === null || val === undefined || Number.isInteger(val), {
        message: ERROR_MESSAGES.INTEGER
      });
    }
    
    if (options?.positive) {
      schema = schema.refine(val => val === null || val === undefined || val > 0, {
        message: ERROR_MESSAGES.POSITIVE
      });
    }
    
    return schema;
  },
  
  // Create a schema that requires two fields to match (e.g., password confirmation)
  createMatchingFieldsSchema: <T extends z.ZodRawShape>(
    baseSchema: z.ZodObject<T>,
    field1: keyof T,
    field2: keyof T,
    errorMessage: string = ERROR_MESSAGES.MATCH
  ) => {
    return baseSchema.refine((data) => data[field1] === data[field2], {
      message: errorMessage,
      path: [field2 as string],
    });
  },
  
  // Create a schema for an object with conditional required fields
  createConditionalRequiredSchema: <T extends z.ZodRawShape>(
    baseSchema: z.ZodObject<T>,
    conditionalField: keyof T,
    requiredFields: (keyof T)[],
    errorMessage: string = ERROR_MESSAGES.REQUIRED
  ) => {
    return baseSchema.refine(
      (data) => {
        // If the conditional field is truthy, check that all required fields are present
        if (data[conditionalField]) {
          return requiredFields.every(field => !!data[field]);
        }
        return true;
      },
      {
        message: errorMessage,
        path: [requiredFields[0] as string], // Path to the first required field for error display
      }
    );
  },
  
  // Create a schema for a field that must be unique in an array
  createUniqueFieldSchema: <T extends z.ZodRawShape>(
    baseSchema: z.ZodObject<T>,
    field: keyof T,
    items: any[],
    excludeId?: string,
    errorMessage: string = `This ${String(field)} is already in use`
  ) => {
    return baseSchema.refine(
      (data) => {
        const value = data[field];
        return !items.some(item => 
          item[field] === value && 
          (!excludeId || item.id !== excludeId)
        );
      },
      {
        message: errorMessage,
        path: [field as string],
      }
    );
  },
};

// Export a function to create custom error maps
export function createErrorMap(customMessages: Record<string, string>) {
  return (issue: z.ZodIssueBase) => {
    const path = issue.path.join('.');
    if (path in customMessages) {
      return { message: customMessages[path] };
    }
    return { message: issue.message };
  };
}

// Utility function to format validation errors from Zod for React Hook Form
export function formatZodErrors(error: z.ZodError) {
  const formattedErrors: Record<string, { message: string }> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (path) {
      formattedErrors[path] = { message: err.message };
    }
  });
  
  return formattedErrors;
}

// Common validation schemas for business entities
export const businessSchemas = {
  // Product schema
  product: z.object({
    name: schemas.string.required,
    description: z.string().optional(),
    sku: validators.createStringSchema({ required: true, minLength: 3, maxLength: 20 }),
    price: schemas.number.price,
    cost: schemas.number.price,
    quantity: schemas.number.quantity,
    categoryId: z.string().optional(),
    taxRate: schemas.number.percentage.optional(),
    isActive: z.boolean().default(true),
  }),
  
  // Customer schema
  customer: z.object({
    firstName: schemas.string.required,
    lastName: schemas.string.required,
    email: schemas.string.email,
    phone: schemas.string.phone.optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: schemas.string.postalCode.optional(),
      country: z.string().optional(),
    }).optional(),
    taxId: schemas.string.taxId.optional(),
    notes: z.string().optional(),
  }),
  
  // Supplier schema
  supplier: z.object({
    name: schemas.string.required,
    contactPerson: z.string().optional(),
    email: schemas.string.email,
    phone: schemas.string.phone.optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: schemas.string.postalCode.optional(),
      country: z.string().optional(),
    }).optional(),
    taxId: schemas.string.taxId.optional(),
    paymentTerms: z.string().optional(),
    notes: z.string().optional(),
  }),
  
  // Order schema
  order: z.object({
    customerId: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    items: schemas.array.nonEmpty(z.object({
      productId: z.string().min(1, ERROR_MESSAGES.REQUIRED),
      quantity: schemas.number.quantity,
      price: schemas.number.price,
      discount: schemas.number.percentage.optional(),
    })),
    status: z.enum(['draft', 'pending', 'processing', 'completed', 'cancelled']),
    paymentStatus: z.enum(['unpaid', 'partial', 'paid']),
    paymentMethod: z.string().optional(),
    shippingAddress: z.object({
      street: z.string().min(1, ERROR_MESSAGES.REQUIRED),
      city: z.string().min(1, ERROR_MESSAGES.REQUIRED),
      state: z.string().min(1, ERROR_MESSAGES.REQUIRED),
      postalCode: schemas.string.postalCode,
      country: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    }).optional(),
    billingAddress: z.object({
      street: z.string().min(1, ERROR_MESSAGES.REQUIRED),
      city: z.string().min(1, ERROR_MESSAGES.REQUIRED),
      state: z.string().min(1, ERROR_MESSAGES.REQUIRED),
      postalCode: schemas.string.postalCode,
      country: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    }).optional(),
    notes: z.string().optional(),
  }),
  
  // Employee schema
  employee: z.object({
    firstName: schemas.string.required,
    lastName: schemas.string.required,
    email: schemas.string.email,
    phone: schemas.string.phone.optional(),
    position: z.string().min(1, ERROR_MESSAGES.REQUIRED),
    department: z.string().optional(),
    hireDate: schemas.date.required,
    salary: schemas.number.positive.optional(),
    isActive: z.boolean().default(true),
    permissions: z.array(z.string()).optional(),
  }),
};

// Export everything for convenience
export default {
  PATTERNS,
  ERROR_MESSAGES,
  schemas,
  validators,
  createErrorMap,
  formatZodErrors,
  businessSchemas,
};
