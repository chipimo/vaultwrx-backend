import { NotFoundError } from 'routing-controllers';

export class AdminNotFoundException extends NotFoundError {
  constructor() {
    super('Admin not found!');
  }
}

