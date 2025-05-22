import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware that validates incoming request data against a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      // Continue to the next middleware if validation passes
      next();
    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      // Handle unexpected errors
      res.status(500).json({
        success: false,
        error: 'Server error during validation'
      });
      return;
    }
  };
};
