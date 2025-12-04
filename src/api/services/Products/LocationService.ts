import { Service } from 'typedi';
import { LocationRepository } from '@api/repositories/Products/LocationRepository';
import { LocationNotFoundException } from '@api/exceptions/Products/LocationNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class LocationService {
  constructor(
    @InjectRepository() private locationRepository: LocationRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.locationRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedLocationOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let location = await this.locationRepository.createLocation(data, companyId);

    this.eventDispatcher.dispatch('onLocationCreate', location);

    return location;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const location = await this.getRequestedLocationOrFail(id, undefined, companyId);

    return await this.locationRepository.updateLocation(location, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const location = await this.getRequestedLocationOrFail(id, undefined, companyId);
      return await this.locationRepository.delete(location.id);
    }
    return await this.locationRepository.delete(id);
  }

  private async getRequestedLocationOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let location = await this.locationRepository.getOneById(id, resourceOptions, companyId);

    if (!location) {
      throw new LocationNotFoundException();
    }

    return location;
  }
}

