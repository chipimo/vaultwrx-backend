// utils/currentUserChecker.ts
import { Action } from 'routing-controllers';
import jwt from 'jsonwebtoken';
import { authConfig } from '@base/config/auth';

export async function currentUserChecker(action: Action) {
  const token = action.request.headers.authorization?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const jwtSecret = authConfig.providers.jwt.secret;
    const user = jwt.verify(token, jwtSecret) as any;

    // Attach user object to request
    action.request.loggedUser = user;
    
    return user; // Now accessible via @CurrentUser
  } catch (error) {
    return null;
  }
}