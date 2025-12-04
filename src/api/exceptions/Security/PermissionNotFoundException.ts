import { NotFoundError } from 'routing-controllers';

export class PermissionNotFoundException extends NotFoundError {
  constructor() {
    super('Permission not found!');
  }
}

