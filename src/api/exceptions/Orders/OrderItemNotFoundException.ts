import { NotFoundError } from 'routing-controllers';

export class OrderItemNotFoundException extends NotFoundError {
  constructor() {
    super('Order Item not found!');
  }
}

