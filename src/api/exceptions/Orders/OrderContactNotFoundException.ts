import { NotFoundError } from 'routing-controllers';

export class OrderContactNotFoundException extends NotFoundError {
  constructor() {
    super('Order Contact not found!');
  }
}

