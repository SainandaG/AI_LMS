import { HTTP_STATUS } from '@ai-lms/shared';

// Base application error
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string | undefined;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code?: string) {
    super(message, HTTP_STATUS.BAD_REQUEST, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code?: string) {
    super(message, HTTP_STATUS.UNAUTHORIZED, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code?: string) {
    super(message, HTTP_STATUS.FORBIDDEN, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code?: string) {
    super(message, HTTP_STATUS.NOT_FOUND, code);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code?: string) {
    super(message, HTTP_STATUS.CONFLICT, code);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED');
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR');
  }
}
