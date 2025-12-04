import { Photo } from '@api/models/Orders/Photo';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Photo)
export class PhotoRepository extends RepositoryBase<Photo> {
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

