import { NotFoundError } from 'routing-controllers';

export class ColorNotFoundException extends NotFoundError {
  constructor() {
    super('Color not found!');
  }
}

