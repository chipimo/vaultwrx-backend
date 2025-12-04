import { NotFoundError } from 'routing-controllers';

export class StaffNotFoundException extends NotFoundError {
  constructor() {
    super('Staff not found!');
  }
}

