import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '@/shared/errors/app-errors';

type ValidateTarget = 'body' | 'query' | 'params';

export const validate =
  (schema: AnyZodObject, target: ValidateTarget = 'body') =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await schema.parseAsync(req[target]);
      req[target] = data; // Replace with parsed+transformed data
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.errors.forEach((e) => {
          const key = e.path.join('.') || 'root';
          if (!errors[key]) errors[key] = [];
          errors[key]!.push(e.message);
        });
        next(new ValidationError('Validation failed', errors));
      } else {
        next(err);
      }
    }
  };
