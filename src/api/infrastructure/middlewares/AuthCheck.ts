import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';

export function AuthCheck(req: Request, res: Response, next: NextFunction): void {
  // TODO: Implement Firebase Auth verification
  // For now, just pass through
  next();
}
