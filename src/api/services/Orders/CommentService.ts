import { Service } from 'typedi';
import { CommentRepository } from '@api/repositories/Orders/CommentRepository';
import { CommentNotFoundException } from '@api/exceptions/Orders/CommentNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class CommentService {
  constructor(
    @InjectRepository() private commentRepository: CommentRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, orderId?: string) {
    return await this.commentRepository.getManyAndCount(resourceOptions, orderId);
  }

  public async findOneById(id: string, resourceOptions?: object) {
    return await this.getRequestedCommentOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let comment = await this.commentRepository.createComment(data);

    this.eventDispatcher.dispatch('onCommentCreate', comment);

    return comment;
  }

  public async updateOneById(id: string, data: object) {
    const comment = await this.getRequestedCommentOrFail(id);

    return await this.commentRepository.updateComment(comment, data);
  }

  public async deleteOneById(id: string) {
    const comment = await this.getRequestedCommentOrFail(id);
    return await this.commentRepository.delete(comment.id);
  }

  private async getRequestedCommentOrFail(id: string, resourceOptions?: object) {
    let comment = await this.commentRepository.getOneById(id, resourceOptions);

    if (!comment) {
      throw new CommentNotFoundException();
    }

    return comment;
  }
}

