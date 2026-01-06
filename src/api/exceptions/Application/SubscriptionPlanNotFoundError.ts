import { NotFoundError } from 'routing-controllers';

export class SubscriptionPlanNotFoundError extends NotFoundError {
  constructor() {
    super('The requested subscription plan was not found.');
  }
}