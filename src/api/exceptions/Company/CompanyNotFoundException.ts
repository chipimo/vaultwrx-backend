import { NotFoundError } from 'routing-controllers';

export class CompanyNotFoundException extends NotFoundError {
  constructor() {
    super('Company not found!');
  }
}

