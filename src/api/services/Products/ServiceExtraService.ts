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

  public async getAll(
    resourceOptions?: object,
    companyId?: string,
    extra?: { category?: string; skip?: number; take?: number }
  ) {
    return await this.serviceExtraRepository.getManyAndCount(resourceOptions, companyId, extra);
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

  /**
   * Delete a service extra and remove it from any price list it was
   * attached to. Without the junction cleanup the price-list detail
   * endpoint would surface dangling rows with null names.
   */
  public async deleteOneById(id: string, companyId?: string) {
    const serviceExtra = companyId
      ? await this.getRequestedServiceExtraOrFail(id, undefined, companyId)
      : null;
    const targetId = serviceExtra?.id ?? id;

    await this.serviceExtraRepository.manager.query(
      `DELETE FROM price_list_extras WHERE service_extra_id = $1`,
      [targetId]
    );

    return await this.serviceExtraRepository.delete(targetId);
  }

  private async getRequestedServiceExtraOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let serviceExtra = await this.serviceExtraRepository.getOneById(id, resourceOptions, companyId);

    if (!serviceExtra) {
      throw new ServiceExtraNotFoundException();
    }

    return serviceExtra;
  }
}

