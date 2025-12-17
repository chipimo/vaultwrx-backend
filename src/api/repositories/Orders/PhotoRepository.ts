import { Photo } from '@api/models/Orders/Photo';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Photo)
export class PhotoRepository extends RepositoryBase<Photo> {
  public async getByOrderId(orderId: string, resourceOptions?: any) {
    const queryBuilder = this.createQueryBuilder('photo')
      .where('photo.order_id = :orderId', { orderId });

    if (resourceOptions?.relations) {
      resourceOptions.relations.forEach((relation: string) => {
        queryBuilder.leftJoinAndSelect(`photo.${relation}`, relation);
      });
    }

    queryBuilder.orderBy('photo.created_at', 'DESC');

    const [items, count] = await queryBuilder.getManyAndCount();
    return {
      total_data: count,
      rows: items,
    };
  }

  public async createPhoto(data: object) {
    let entity = new Photo();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updatePhoto(photo: Photo, data: object) {
    Object.assign(photo, data);

    return await photo.save(data);
  }
}
