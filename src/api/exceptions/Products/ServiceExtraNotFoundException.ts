import { NotFoundError } from 'routing-controllers';

export class ServiceExtraNotFoundException extends NotFoundError {
  constructor() {
    super('Service Extra not found!');
  }
}

