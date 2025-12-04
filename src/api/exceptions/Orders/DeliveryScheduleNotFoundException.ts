import { NotFoundError } from 'routing-controllers';

export class DeliveryScheduleNotFoundException extends NotFoundError {
  constructor() {
    super('Delivery Schedule not found!');
  }
}

