import { NotFoundError } from 'routing-controllers';

export class DeceasedNotFoundException extends NotFoundError {
  constructor() {
    super('Deceased not found!');
  }
}

