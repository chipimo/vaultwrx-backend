import { NotFoundError } from 'routing-controllers';

export class OrderExtraChargeNotFoundException extends NotFoundError {
  constructor() {
    super('Order Extra Charge not found!');
  }
}

