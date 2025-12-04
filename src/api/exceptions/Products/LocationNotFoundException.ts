import { NotFoundError } from 'routing-controllers';

export class LocationNotFoundException extends NotFoundError {
  constructor() {
    super('Location not found!');
  }
}

