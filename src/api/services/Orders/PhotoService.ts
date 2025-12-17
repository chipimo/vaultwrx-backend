import { Service } from 'typedi';
import { PhotoRepository } from '@api/repositories/Orders/PhotoRepository';
import { PhotoNotFoundException } from '@api/exceptions/Orders/PhotoNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class PhotoService {
  constructor(
    @InjectRepository() private photoRepository: PhotoRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.photoRepository.getManyAndCount(resourceOptions);
  }

  public async getByOrderId(orderId: string, resourceOptions?: object) {
    return await this.photoRepository.getByOrderId(orderId, resourceOptions);
  }

  public async findOneById(id: string, resourceOptions?: object) {
    return await this.getRequestedPhotoOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let photo = await this.photoRepository.createPhoto(data);

    this.eventDispatcher.dispatch('onPhotoCreate', photo);

    return photo;
  }

  public async updateOneById(id: string, data: object) {
    const photo = await this.getRequestedPhotoOrFail(id);

    return await this.photoRepository.updatePhoto(photo, data);
  }

  public async deleteOneById(id: string) {
    return await this.photoRepository.delete(id);
  }

  private async getRequestedPhotoOrFail(id: string, resourceOptions?: object) {
    let photo = await this.photoRepository.getOneById(id as any, resourceOptions);

    if (!photo) {
      throw new PhotoNotFoundException();
    }

    return photo;
  }
}
