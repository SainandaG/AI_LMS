import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@ai-lms/shared';

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
};
