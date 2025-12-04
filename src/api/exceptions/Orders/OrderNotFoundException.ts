import { NotFoundError } from 'routing-controllers';

export class OrderNotFoundException extends NotFoundError {
  constructor() {
    super('Order not found!');
  }
}

