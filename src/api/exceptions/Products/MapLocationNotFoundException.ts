import { NotFoundError } from 'routing-controllers';

export class MapLocationNotFoundException extends NotFoundError {
  constructor() {
    super('Map location not found!');
  }
}
