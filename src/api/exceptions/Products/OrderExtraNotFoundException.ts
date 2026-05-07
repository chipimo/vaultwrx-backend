import { NotFoundError } from 'routing-controllers';

export class OrderExtraNotFoundException extends NotFoundError {
  constructor() {
    super('Order Extra not found!');
  }
}
