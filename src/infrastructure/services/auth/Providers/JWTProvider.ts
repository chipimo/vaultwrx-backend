import { authConfig } from '@base/config/auth';
import * as jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

export class JWTProvider {
  public sign(payload: object, dataReturn: object): object {
    const signOptions: SignOptions = {
      expiresIn: authConfig.providers.jwt.expiresIn as SignOptions['expiresIn'],
    };
    return {
      ...dataReturn,
      access_token: jwt.sign(payload, authConfig.providers.jwt.secret, signOptions),
      expires_in: authConfig.providers.jwt.expiresIn,
    };
  }
}