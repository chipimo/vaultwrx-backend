import { HttpError } from 'routing-controllers';

export class ApplicationException extends HttpError {
  constructor(message: string, statusCode: number = 500) {
    super(statusCode, message);
    this.name = 'ApplicationException';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Access forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad request') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

