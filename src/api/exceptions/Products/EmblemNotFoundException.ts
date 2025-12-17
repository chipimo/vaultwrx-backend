import { NotFoundError } from 'routing-controllers';

export class EmblemNotFoundException extends NotFoundError {
  constructor() {
    super('Emblem not found!');
  }
}

