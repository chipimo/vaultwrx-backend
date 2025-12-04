import { Service } from 'typedi';
import { OrderItemRepository } from '@api/repositories/Orders/OrderItemRepository';
import { OrderItemNotFoundException } from '@api/exceptions/Orders/OrderItemNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class OrderItemService {
  constructor(
    @InjectRepository() private orderItemRepository: OrderItemRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.orderItemRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedOrderItemOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let orderItem = await this.orderItemRepository.createOrderItem(data);

    this.eventDispatcher.dispatch('onOrderItemCreate', orderItem);

    return orderItem;
  }

  public async updateOneById(id: number, data: object) {
    const orderItem = await this.getRequestedOrderItemOrFail(id);

    return await this.orderItemRepository.updateOrderItem(orderItem, data);
  }

  public async deleteOneById(id: number) {
    return await this.orderItemRepository.delete(id);
  }

  private async getRequestedOrderItemOrFail(id: number, resourceOptions?: object) {
    let orderItem = await this.orderItemRepository.getOneById(id, resourceOptions);

    if (!orderItem) {
      throw new OrderItemNotFoundException();
    }

    return orderItem;
  }
}

