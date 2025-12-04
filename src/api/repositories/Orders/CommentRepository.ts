import { Comment } from '@api/models/Orders/Comment';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Comment)
export class CommentRepository extends RepositoryBase<Comment> {
  public async getManyAndCount(resourceOptions?: any, orderId?: string) {
    const queryBuilder = this.createQueryBuilder('comment');

    if (orderId) {
      queryBuilder.where('comment.order_id = :orderId', { orderId });
    }

    if (resourceOptions) {
      const { filters, sorts, pagination, relations } = resourceOptions;
      
      if (filters) {
        Object.keys(filters).forEach((key) => {
          queryBuilder.andWhere(`comment.${key} = :${key}`, { [key]: filters[key] });
        });
      }
      
      if (sorts) {
        sorts.forEach((sort: any) => {
          queryBuilder.addOrderBy(`comment.${sort.field}`, sort.order);
        });
      }
      
      if (pagination) {
        queryBuilder.skip(pagination.skip).take(pagination.take);
      }
      
      if (relations) {
        relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`comment.${relation}`, relation);
        });
      }
    }

    const [items, count] = await queryBuilder.getManyAndCount();
    return {
      total_data: count,
      rows: items,
    };
  }

  public async getOneById(id: string, resourceOptions?: any) {
    const queryBuilder = this.createQueryBuilder('comment')
      .where('comment.id = :id', { id });

    if (resourceOptions?.relations) {
      resourceOptions.relations.forEach((relation: string) => {
        queryBuilder.leftJoinAndSelect(`comment.${relation}`, relation);
      });
    }

    return await queryBuilder.getOne();
  }

  public async createComment(data: object) {
    let entity = new Comment();
    Object.assign(entity, data);
    return await this.save(entity);
  }

  public async updateComment(comment: Comment, data: object) {
    Object.assign(comment, data);
    return await this.save(comment);
  }
}

