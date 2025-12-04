import { NotFoundError } from 'routing-controllers';

export class RetailerNotFoundException extends NotFoundError {
  constructor() {
    super('Retailer not found!');
  }
}

