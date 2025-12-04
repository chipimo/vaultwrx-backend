import { Service } from 'typedi';
import { ServiceExtraRepository } from '@api/repositories/Products/ServiceExtraRepository';
import { ServiceExtraNotFoundException } from '@api/exceptions/Products/ServiceExtraNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class ServiceExtraService {
  constructor(
    @InjectRepository() private serviceExtraRepository: ServiceExtraRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.serviceExtraRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedServiceExtraOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let serviceExtra = await this.serviceExtraRepository.createServiceExtra(data, companyId);

    this.eventDispatcher.dispatch('onServiceExtraCreate', serviceExtra);

    return serviceExtra;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const serviceExtra = await this.getRequestedServiceExtraOrFail(id, undefined, companyId);

    return await this.serviceExtraRepository.updateServiceExtra(serviceExtra, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const serviceExtra = await this.getRequestedServiceExtraOrFail(id, undefined, companyId);
      return await this.serviceExtraRepository.delete(serviceExtra.id);
    }
    return await this.serviceExtraRepository.delete(id);
  }

  private async getRequestedServiceExtraOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let serviceExtra = await this.serviceExtraRepository.getOneById(id, resourceOptions, companyId);

    if (!serviceExtra) {
      throw new ServiceExtraNotFoundException();
    }

    return serviceExtra;
  }
}

