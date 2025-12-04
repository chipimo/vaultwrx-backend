import { NotFoundError } from 'routing-controllers';

export class FuneralDirectorNotFoundException extends NotFoundError {
  constructor() {
    super('Funeral Director not found!');
  }
}

