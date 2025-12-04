import { Service } from 'typedi';
import { OrderExtraChargeRepository } from '@api/repositories/Orders/OrderExtraChargeRepository';
import { OrderExtraChargeNotFoundException } from '@api/exceptions/Orders/OrderExtraChargeNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class OrderExtraChargeService {
  constructor(
    @InjectRepository() private orderExtraChargeRepository: OrderExtraChargeRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.orderExtraChargeRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedOrderExtraChargeOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let orderExtraCharge = await this.orderExtraChargeRepository.createOrderExtraCharge(data);

    this.eventDispatcher.dispatch('onOrderExtraChargeCreate', orderExtraCharge);

    return orderExtraCharge;
  }

  public async updateOneById(id: number, data: object) {
    const orderExtraCharge = await this.getRequestedOrderExtraChargeOrFail(id);

    return await this.orderExtraChargeRepository.updateOrderExtraCharge(orderExtraCharge, data);
  }

  public async deleteOneById(id: number) {
    return await this.orderExtraChargeRepository.delete(id);
  }

  private async getRequestedOrderExtraChargeOrFail(id: number, resourceOptions?: object) {
    let orderExtraCharge = await this.orderExtraChargeRepository.getOneById(id, resourceOptions);

    if (!orderExtraCharge) {
      throw new OrderExtraChargeNotFoundException();
    }

    return orderExtraCharge;
  }
}

