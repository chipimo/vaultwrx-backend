import { Service } from 'typedi';
import { MapLocationRepository } from '@api/repositories/Products/MapLocationRepository';
import { MapLocationNotFoundException } from '@api/exceptions/Products/MapLocationNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class MapLocationService {
  constructor(
    @InjectRepository() private mapLocationRepository: MapLocationRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.mapLocationRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedMapLocationOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let mapLocation = await this.mapLocationRepository.createMapLocation(data, companyId);

    this.eventDispatcher.dispatch('onMapLocationCreate', mapLocation);

    return mapLocation;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const mapLocation = await this.getRequestedMapLocationOrFail(id, undefined, companyId);

    return await this.mapLocationRepository.updateMapLocation(mapLocation, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const mapLocation = await this.getRequestedMapLocationOrFail(id, undefined, companyId);
      return await this.mapLocationRepository.delete(mapLocation.id);
    }
    return await this.mapLocationRepository.delete(id);
  }

  private async getRequestedMapLocationOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let mapLocation = await this.mapLocationRepository.getOneById(id, resourceOptions, companyId);

    if (!mapLocation) {
      throw new MapLocationNotFoundException();
    }

    return mapLocation;
  }
}
