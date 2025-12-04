import { NotFoundError } from 'routing-controllers';

export class PhotoNotFoundException extends NotFoundError {
  constructor() {
    super('Photo not found!');
  }
}

