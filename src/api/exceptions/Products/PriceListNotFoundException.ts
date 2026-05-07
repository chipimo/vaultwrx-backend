import { NotFoundError } from 'routing-controllers';

export class PriceListNotFoundException extends NotFoundError {
  constructor() {
    super('Price List not found!');
  }
}
