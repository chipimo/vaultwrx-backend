import { NotFoundError } from 'routing-controllers';

export class OrderHistoryNotFoundException extends NotFoundError {
  constructor() {
    super('Order history record not found.');
  }
}
