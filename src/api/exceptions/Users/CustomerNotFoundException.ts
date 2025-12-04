import { NotFoundError } from 'routing-controllers';

export class CustomerNotFoundException extends NotFoundError {
  constructor() {
    super('Customer not found!');
  }
}

