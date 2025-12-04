import { Service } from 'typedi';
import { RetailerRepository } from '@api/repositories/Users/RetailerRepository';
import { RetailerNotFoundException } from '@api/exceptions/Users/RetailerNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class RetailerService {
  constructor(
    @InjectRepository() private retailerRepository: RetailerRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.retailerRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedRetailerOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let retailer = await this.retailerRepository.createRetailer(data);

    this.eventDispatcher.dispatch('onRetailerCreate', retailer);

    return retailer;
  }

  public async updateOneById(id: number, data: object) {
    const retailer = await this.getRequestedRetailerOrFail(id);

    return await this.retailerRepository.updateRetailer(retailer, data);
  }

  public async deleteOneById(id: number) {
    return await this.retailerRepository.delete(id);
  }

  private async getRequestedRetailerOrFail(id: number, resourceOptions?: object) {
    let retailer = await this.retailerRepository.getOneById(id, resourceOptions);

    if (!retailer) {
      throw new RetailerNotFoundException();
    }

    return retailer;
  }
}

