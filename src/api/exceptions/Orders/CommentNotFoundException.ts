import { NotFoundError } from 'routing-controllers';

export class CommentNotFoundException extends NotFoundError {
  constructor() {
    super('Comment not found!');
  }
}

