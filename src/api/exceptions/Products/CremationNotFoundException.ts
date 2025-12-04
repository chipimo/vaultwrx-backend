import { NotFoundError } from 'routing-controllers';

export class CremationNotFoundException extends NotFoundError {
  constructor() {
    super('Cremation not found!');
  }
}

